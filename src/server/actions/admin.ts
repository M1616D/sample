"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodTypeAny } from "zod";

import { getResource } from "@/lib/admin-resources";
import {
  companySettingsSchema,
  fieldErrors,
  homeSettingsSchema,
  loginSchema,
  messageUpdateSchema,
  quoteUpdateSchema,
  seoSettingsSchema,
  serviceRequestUpdateSchema,
  socialSettingsSchema,
} from "@/lib/validation";
import { saveSettingGroup } from "@/server/settings";
import { prisma } from "@/server/db";
import {
  buildResourceData,
  createResourceRow,
  deleteResourceRow,
  updateResourceRow,
} from "@/server/admin/data";
import { authenticate, createSession, destroySession, requireAdmin } from "@/server/auth";
import type { FormState } from "@/types/forms";

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    // Deliberately generic: never reveal whether the account exists.
    return { status: "error", message: "Those credentials were not recognised." };
  }

  await createSession(user);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Generic resource CRUD                                               */
/* ------------------------------------------------------------------ */

/** Flatten a resource's fields out of a FormData instance. */
function readFormData(resourceKey: string, formData: FormData): Record<string, string> {
  const resource = getResource(resourceKey);
  if (!resource) return {};
  const raw: Record<string, string> = {};
  for (const field of resource.fields) {
    const value = formData.get(field.name);
    if (field.type === "checkbox") {
      raw[field.name] = value ? "on" : "";
    } else {
      raw[field.name] = typeof value === "string" ? value : "";
    }
  }
  return raw;
}

/**
 * Save (create or update) a resource row.
 *
 * Bound to the resource key and row id by the client form, so the same action
 * serves every model. Validation reuses the shared zod schema on the server.
 */
export async function saveResourceAction(
  resourceKey: string,
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const resource = getResource(resourceKey);
  if (!resource) return { status: "error", message: "Unknown record type." };

  const raw = readFormData(resourceKey, formData);
  const parsed = resource.schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const isCreate = !id;
  const data = buildResourceData(resource, parsed.data as Record<string, unknown>, isCreate);

  try {
    if (isCreate) {
      await createResourceRow(resource, data);
    } else {
      await updateResourceRow(resource, id, data);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // A duplicate slug is the most common failure — report it clearly.
    const friendly = /unique|duplicate/i.test(message)
      ? "That slug is already in use. Choose a different one."
      : "The record could not be saved. Please try again.";
    return { status: "error", message: friendly };
  }

  revalidatePath(`/admin/${resourceKey}`);
  revalidatePath("/");
  redirect(`/admin/${resourceKey}?saved=1`);
}

export async function deleteResourceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const resourceKey = String(formData.get("resourceKey") ?? "");
  const id = String(formData.get("id") ?? "");
  const resource = getResource(resourceKey);
  if (!resource || !id) redirect(`/admin/${resourceKey}`);

  try {
    await deleteResourceRow(resource, id);
  } catch {
    redirect(`/admin/${resourceKey}?error=delete`);
  }

  revalidatePath(`/admin/${resourceKey}`);
  revalidatePath("/");
  redirect(`/admin/${resourceKey}?deleted=1`);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function nonEmptyLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitPairs(value: string, separator = "|"): string[][] {
  return nonEmptyLines(value).map((line) => line.split(separator).map((part) => part.trim()));
}

/** Decode the flat settings form back into the nested settings shapes. */
function readSettingsGroup(group: string, formData: FormData): Record<string, unknown> {
  const str = (name: string) => String(formData.get(name) ?? "").trim();

  if (group === "social") {
    return {
      telegram: str("telegram"),
      facebook: str("facebook"),
      instagram: str("instagram"),
      tiktok: str("tiktok"),
      youtube: str("youtube"),
      linkedin: str("linkedin"),
    };
  }

  if (group === "seo") {
    return {
      defaultTitle: str("defaultTitle"),
      titleTemplate: str("titleTemplate"),
      defaultDescription: str("defaultDescription"),
      twitterHandle: str("twitterHandle"),
      ogImage: str("ogImage"),
      keywords: nonEmptyLines(str("keywords")),
    };
  }

  if (group === "home") {
    return {
      heroEyebrow: str("heroEyebrow"),
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      industries: nonEmptyLines(str("industries")),
      whyChooseUs: splitPairs(str("whyChooseUs")).map((parts) => ({ title: parts[0] ?? "", description: parts[1] ?? "" })),
      process: splitPairs(str("process")).map((parts) => ({ title: parts[0] ?? "", description: parts[1] ?? "" })),
      stats: splitPairs(str("stats")).map((parts) => ({ label: parts[0] ?? "", value: parts[1] ?? "", note: parts[2] ?? "" })),
    };
  }

  return {
    name: str("name"),
    legalName: str("legalName"),
    tagline: str("tagline"),
    shortDescription: str("shortDescription"),
    introParagraph: str("introParagraph"),
    aboutBody: str("aboutBody"),
    history: str("history"),
    development: str("development"),
    futureDirection: str("futureDirection"),
    mission: str("mission"),
    vision: str("vision"),
    values: nonEmptyLines(str("values")),
    phone: str("phone"),
    phoneAlt: str("phoneAlt"),
    email: str("email"),
    telegram: str("telegram"),
    whatsapp: str("whatsapp"),
    address: str("address"),
    city: str("city"),
    region: str("region"),
    country: str("country"),
    postalCode: str("postalCode"),
    mapUrl: str("mapUrl"),
    mapEmbedUrl: str("mapEmbedUrl"),
    hours: splitPairs(str("hours")).map((parts) => ({ label: parts[0] ?? "", value: parts[1] ?? "" })),
    logo: str("logo"),
    heroImage: str("heroImage"),
    workshopImages: nonEmptyLines(str("workshopImages")),
    videoUrl: str("videoUrl"),
  };
}

const settingsSchemas: Record<string, ZodTypeAny> = {
  company: companySettingsSchema,
  social: socialSettingsSchema,
  seo: seoSettingsSchema,
  home: homeSettingsSchema,
};

export async function saveSettingsAction(group: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const schema = settingsSchemas[group];
  if (!schema) return { status: "error", message: "Unknown settings group." };

  const parsed = schema.safeParse(readSettingsGroup(group, formData));
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await saveSettingGroup(group as "company" | "social" | "seo" | "home", parsed.data);
  } catch {
    return { status: "error", message: "Settings could not be saved. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/settings?group=${group}&saved=1`);
}

/* ------------------------------------------------------------------ */
/* Lead workflow updates                                               */
/* ------------------------------------------------------------------ */

export async function updateQuoteAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = quoteUpdateSchema.safeParse({
    status: formData.get("status"),
    assignedTo: formData.get("assignedTo"),
    internalNotes: formData.get("internalNotes"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await prisma.quoteRequest.update({ where: { id }, data: parsed.data });
  } catch {
    return { status: "error", message: "The quote could not be updated." };
  }
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  return { status: "success", message: "Quote updated." };
}

export async function updateServiceRequestAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = serviceRequestUpdateSchema.safeParse({
    status: formData.get("status"),
    assignedTo: formData.get("assignedTo"),
    internalNotes: formData.get("internalNotes"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await prisma.serviceRequest.update({ where: { id }, data: parsed.data });
  } catch {
    return { status: "error", message: "The service request could not be updated." };
  }
  revalidatePath("/admin/service-requests");
  revalidatePath(`/admin/service-requests/${id}`);
  return { status: "success", message: "Service request updated." };
}

export async function updateMessageAction(id: string, status: string): Promise<void> {
  await requireAdmin();
  const parsed = messageUpdateSchema.safeParse({ status });
  if (parsed.success) {
    try {
      await prisma.contactMessage.update({ where: { id }, data: { status: parsed.data.status } });
    } catch {
      /* ignore — the list will simply show the previous status */
    }
  }
  revalidatePath("/admin/messages");
}
