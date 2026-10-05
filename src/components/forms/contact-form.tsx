"use client";

import { useActionState, useEffect, useId } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { TextField, TextareaField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { submitContactAction } from "@/server/actions/public";
import { fieldError, initialFormState } from "@/types/forms";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, initialFormState);
  const toast = useToast();
  const formId = useId();

  useEffect(() => {
    if (state.status === "success") toast.success("Message sent", "We will reply as soon as possible.");
  }, [state, toast]);

  if (state.status === "success") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-xl">Message sent</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">{state.message}</p>
        <p className="mt-4 text-xs text-steel-500">
          Need a faster answer? Call us or message us on Telegram using the buttons on this page.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" name="name" required autoComplete="name" error={fieldError(state, "name")} />
        <TextField label="Subject" name="subject" error={fieldError(state, "subject")} />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldError(state, "email")}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={fieldError(state, "phone")}
        />
      </div>

      <TextareaField
        label="Message"
        name="message"
        required
        rows={6}
        placeholder="How can we help?"
        error={fieldError(state, "message")}
      />

      <p className="text-xs text-steel-500">
        Provide an email address or a phone number so we can reply. We never publish or sell your details.
      </p>

      <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
    </form>
  );
}
