"use client";

import { useActionState, useEffect } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { SelectField, TextField, TextareaField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { updateQuoteAction, updateServiceRequestAction } from "@/server/actions/admin";
import { fieldError } from "@/types/forms";

/**
 * Status / assignment panel for a quote or service request. The same component
 * serves both because the two workflows share the same shape.
 */
export function LeadUpdateForm({
  kind,
  id,
  status,
  assignedTo,
  internalNotes,
  statusOptions,
}: {
  kind: "quote" | "service";
  id: string;
  status: string;
  assignedTo: string;
  internalNotes: string;
  statusOptions: { value: string; label: string }[];
}) {
  const baseAction = kind === "quote" ? updateQuoteAction : updateServiceRequestAction;
  const action = baseAction.bind(null, id);
  const [state, formAction] = useActionState(action, { status: "idle" as const });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "success") toast.success(state.message ?? "Saved");
    if (state.status === "error" && state.message) toast.error("Could not update", state.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}
      {state.status === "success" && state.message ? (
        <div role="status" className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <SelectField label="Status" name="status" options={statusOptions} defaultValue={status} error={fieldError(state, "status")} />
      <TextField label="Assigned to" name="assignedTo" defaultValue={assignedTo} error={fieldError(state, "assignedTo")} />
      <TextareaField
        label="Internal notes"
        name="internalNotes"
        rows={5}
        defaultValue={internalNotes}
        error={fieldError(state, "internalNotes")}
        hint="Not visible to the customer."
      />
      <SubmitButton pendingLabel="Saving…">Update {kind === "quote" ? "quote" : "request"}</SubmitButton>
    </form>
  );
}
