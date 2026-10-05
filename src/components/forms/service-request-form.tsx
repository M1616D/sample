"use client";

import { useActionState, useEffect, useId } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { TextField, TextareaField, FieldGroup } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { submitServiceRequestAction } from "@/server/actions/public";
import { fieldError, initialFormState } from "@/types/forms";

export function ServiceRequestForm({ machines = [] }: { machines?: string[] }) {
  const [state, formAction] = useActionState(submitServiceRequestAction, initialFormState);
  const toast = useToast();
  const formId = useId();

  useEffect(() => {
    if (state.status === "success") toast.success("Service request logged", state.reference ? `Reference ${state.reference}.` : undefined);
  }, [state, toast]);

  if (state.status === "success") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-xl">Service request logged</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">{state.message}</p>
        {state.reference ? (
          <p className="mt-4 inline-block border border-steel-200 bg-steel-50 px-4 py-2 font-mono text-sm text-ink-900">
            Reference: {state.reference}
          </p>
        ) : null}
        <p className="mt-5 text-xs text-steel-500">
          Please quote this reference when you call, so we can find your request immediately.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <FieldGroup title="Contact details" columns={2}>
        <TextField label="Your name" name="customerName" required autoComplete="name" error={fieldError(state, "customerName")} />
        <TextField label="Company" name="company" autoComplete="organization" error={fieldError(state, "company")} />
        <TextField label="Phone number" name="phone" type="tel" required inputMode="tel" autoComplete="tel" error={fieldError(state, "phone")} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={fieldError(state, "email")} />
      </FieldGroup>

      <FieldGroup title="Machine details" columns={2}>
        <TextField
          label="Machine / model"
          name="machine"
          required
          list="machine-options"
          error={fieldError(state, "machine")}
        />
        {machines.length ? (
          <datalist id="machine-options">
            {machines.map((machine) => (
              <option key={machine} value={machine} />
            ))}
          </datalist>
        ) : null}
        <TextField label="Serial number" name="serialNumber" error={fieldError(state, "serialNumber")} />
        <TextField label="Machine location" name="location" placeholder="City / site" error={fieldError(state, "location")} />
        <TextField label="Problem summary" name="problem" required placeholder="e.g. motor will not start" error={fieldError(state, "problem")} />
      </FieldGroup>

      <FieldGroup title="Describe the problem" columns={1}>
        <TextareaField
          label="What is happening?"
          name="description"
          required
          rows={6}
          placeholder="Describe what the machine does, when the problem started, and anything you have already tried."
          error={fieldError(state, "description")}
        />
        <TextareaField
          label="Photo links (optional)"
          name="photos"
          rows={3}
          placeholder="One link per line, e.g. https://…"
          hint="Upload photos to a shared album or drive and paste the links here. File uploads are disabled by default for security."
          error={fieldError(state, "photos")}
        />
      </FieldGroup>

      <SubmitButton pendingLabel="Submitting…" size="lg">
        Submit service request
      </SubmitButton>
    </form>
  );
}
