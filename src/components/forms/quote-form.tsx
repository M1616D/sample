"use client";

import { useActionState, useEffect, useId } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { TextField, TextareaField, SelectField, FieldGroup } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { submitQuoteAction } from "@/server/actions/public";
import { initialFormState, fieldError } from "@/types/forms";

/**
 * Quote request form.
 *
 * - When opened from a product page the product is passed in and pre-selected,
 *   so the customer never has to retype it. The product id is submitted as a
 *   hidden field and re-validated on the server.
 * - Validation errors, a loading state, a success state with a reference number
 *   and an error state with retry are all handled here.
 */
export function QuoteForm({
  productOptions,
  defaultProductService = "",
  defaultProductId = "",
  defaultProductSlug = "",
  source = "",
  compact = false,
}: {
  productOptions: { value: string; label: string }[];
  defaultProductService?: string;
  defaultProductId?: string;
  defaultProductSlug?: string;
  source?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(submitQuoteAction, initialFormState);
  const toast = useToast();
  const formId = useId();

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Quote request sent", state.reference ? `Your reference is ${state.reference}.` : undefined);
    } else if (state.status === "error" && state.message && !state.fieldErrors) {
      toast.error("Could not send request", state.message);
    }
  }, [state, toast]);

  if (state.status === "success") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-xl">Request received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-steel-600">{state.message}</p>
        {state.reference ? (
          <p className="mt-4 inline-block border border-steel-200 bg-steel-50 px-4 py-2 font-mono text-sm text-ink-900">
            Reference: {state.reference}
          </p>
        ) : null}
        <p className="mt-5 text-xs text-steel-500">
          Keep this reference when you contact us by phone or Telegram so we can find your request quickly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Honeypot: hidden from users, filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="productId" value={defaultProductId} />
      <input type="hidden" name="source" value={source || defaultProductSlug || "request-quote"} />

      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{state.message}</p>
            <p className="mt-1 text-xs text-red-700">
              Nothing was charged or submitted twice — you can safely correct the fields and try again.
            </p>
          </div>
        </div>
      ) : null}

      <FieldGroup title="Your details" columns={2}>
        <TextField
          label="Full name"
          name="fullName"
          required
          autoComplete="name"
          error={fieldError(state, "fullName")}
        />
        <TextField
          label="Company name"
          name="company"
          autoComplete="organization"
          error={fieldError(state, "company")}
        />
        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+251 …"
          error={fieldError(state, "phone")}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldError(state, "email")}
        />
        <TextField label="Telegram" name="telegram" placeholder="@username" error={fieldError(state, "telegram")} />
        <SelectField
          label="Preferred contact method"
          name="preferredContact"
          defaultValue="phone"
          options={[
            { value: "phone", label: "Phone call" },
            { value: "email", label: "Email" },
            { value: "telegram", label: "Telegram" },
            { value: "whatsapp", label: "WhatsApp" },
          ]}
          error={fieldError(state, "preferredContact")}
        />
      </FieldGroup>

      <FieldGroup title="Location" columns={1}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Country" name="country" autoComplete="country-name" error={fieldError(state, "country")} />
          <TextField label="City" name="city" autoComplete="address-level2" error={fieldError(state, "city")} />
        </div>
      </FieldGroup>

      <FieldGroup title="What do you need?" columns={1}>
        {productOptions.length ? (
          <SelectField
            label="Product or service"
            name="productService"
            required
            placeholder="Select a product or service"
            defaultValue={defaultProductService}
            options={productOptions}
            hint="Choose the closest match. You can add detail in the requirements box below."
            error={fieldError(state, "productService")}
          />
        ) : (
          <TextField
            label="Product or service"
            name="productService"
            required
            defaultValue={defaultProductService}
            hint="Tell us the machine, product or service you need."
            error={fieldError(state, "productService")}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Quantity"
            name="quantity"
            placeholder="e.g. 1 machine, 500 units"
            error={fieldError(state, "quantity")}
          />
          <TextField
            label="Expected timeline"
            name="timeline"
            placeholder="e.g. within 2 months"
            error={fieldError(state, "timeline")}
          />
        </div>

        <TextareaField
          label="Requirements"
          name="requirements"
          required
          rows={compact ? 4 : 6}
          placeholder="Describe the material, capacity, output, site conditions or any other detail that helps us quote accurately."
          error={fieldError(state, "requirements")}
        />

        <TextField
          label="Attachment link (optional)"
          name="attachmentUrl"
          type="url"
          placeholder="https://…"
          hint="Paste a link to a drawing or document. File uploads are disabled by default for security — share a link instead."
          error={fieldError(state, "attachmentUrl")}
        />

        <TextareaField
          label="Additional notes"
          name="notes"
          rows={3}
          error={fieldError(state, "notes")}
        />
      </FieldGroup>

      <div className="flex flex-col gap-3 border-t border-steel-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-steel-500">
          We use your details only to respond to this enquiry. See our privacy policy for how your data is handled.
        </p>
        <SubmitButton pendingLabel="Sending…" size="lg">
          Send request
        </SubmitButton>
      </div>
    </form>
  );
}
