"use server";

import { revalidatePath } from "next/cache";

import { contactSchema, fieldErrors, quoteSchema, serviceRequestSchema } from "@/lib/validation";
import { createContactMessage, createQuoteRequest, createServiceRequest } from "@/server/leads";
import { formatQuoteNotification, notifyTelegram } from "@/server/telegram";
import type { FormState } from "@/types/forms";

/**
 * Public form server actions.
 *
 * Validation runs server-side on the same zod schema the client uses, so a
 * tampered request cannot bypass it. Database failures are reported to the user
 * as a retryable error rather than leaking a stack trace.
 */

const DB_ERROR: FormState = {
  status: "error",
  message: "We could not save your request right now. Please try again, or contact us directly by phone or Telegram.",
};

export async function submitQuoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    telegram: formData.get("telegram"),
    country: formData.get("country"),
    city: formData.get("city"),
    productService: formData.get("productService"),
    quantity: formData.get("quantity"),
    requirements: formData.get("requirements"),
    timeline: formData.get("timeline"),
    preferredContact: formData.get("preferredContact") ?? "phone",
    attachmentUrl: formData.get("attachmentUrl"),
    notes: formData.get("notes"),
    productId: formData.get("productId"),
    source: formData.get("source"),
    website: formData.get("website"),
  };

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    const { reference } = await createQuoteRequest(parsed.data);

    // Best effort — never blocks or fails the customer's submission.
    void notifyTelegram(
      formatQuoteNotification({
        reference,
        fullName: parsed.data.fullName,
        company: parsed.data.company ?? "",
        phone: parsed.data.phone,
        email: parsed.data.email ?? "",
        productService: parsed.data.productService,
        quantity: parsed.data.quantity ?? "",
        timeline: parsed.data.timeline ?? "",
        city: parsed.data.city ?? "",
        country: parsed.data.country ?? "",
        requirements: parsed.data.requirements,
      }),
    );

    revalidatePath("/admin");
    revalidatePath("/admin/quotes");
    return {
      status: "success",
      message: "Your request has been received. Our team will contact you shortly.",
      reference,
    };
  } catch (error) {
    console.error("[quote] failed to store request", error instanceof Error ? error.message : error);
    return DB_ERROR;
  }
}

export async function submitContactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await createContactMessage(parsed.data);
    revalidatePath("/admin/messages");
    return { status: "success", message: "Thank you — your message has been sent." };
  } catch (error) {
    console.error("[contact] failed to store message", error instanceof Error ? error.message : error);
    return DB_ERROR;
  }
}

export async function submitServiceRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = serviceRequestSchema.safeParse({
    customerName: formData.get("customerName"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    machine: formData.get("machine"),
    serialNumber: formData.get("serialNumber"),
    problem: formData.get("problem"),
    description: formData.get("description"),
    location: formData.get("location"),
    photos: formData.get("photos"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    const { reference } = await createServiceRequest(parsed.data);
    revalidatePath("/admin/service-requests");
    return {
      status: "success",
      message: "Your service request has been logged. Our technical team will contact you.",
      reference,
    };
  } catch (error) {
    console.error("[service-request] failed to store request", error instanceof Error ? error.message : error);
    return DB_ERROR;
  }
}
