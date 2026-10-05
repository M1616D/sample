"use client";

import { useActionState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { SelectField, TextField, TextareaField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { saveSettingsAction } from "@/server/actions/admin";
import type { AdminField } from "@/lib/admin-resources";
import { fieldError } from "@/types/forms";

/**
 * Settings editor. Settings groups contain nested arrays (hours, statistics),
 * which are edited as pipe-separated lines and parsed back on the server — far
 * simpler and more robust than a bespoke repeatable-widget implementation.
 */
export function SettingsForm({
  group,
  fields,
  values,
}: {
  group: string;
  fields: AdminField[];
  values: Record<string, string>;
}) {
  const action = saveSettingsAction.bind(null, group);
  const [state, formAction] = useActionState(action, { status: "idle" as const });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "error" && state.message) toast.error("Could not save settings", state.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = fieldError(state, field.name);
          const defaultValue = values[field.name] ?? "";
          const wrapperClass = field.full ? "sm:col-span-2" : undefined;

          if (field.type === "select") {
            return (
              <SelectField
                key={field.name}
                label={field.label}
                name={field.name}
                error={error}
                hint={field.hint}
                className={wrapperClass}
                options={field.options ?? []}
                placeholder="— Select —"
                defaultValue={defaultValue}
              />
            );
          }

          if (field.type === "textarea") {
            return (
              <TextareaField
                key={field.name}
                label={field.label}
                name={field.name}
                error={error}
                hint={field.hint}
                rows={field.rows ?? 4}
                className={wrapperClass}
                defaultValue={defaultValue}
              />
            );
          }

          return (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type === "date" ? "date" : "text"}
              error={error}
              hint={field.hint}
              className={wrapperClass}
              defaultValue={defaultValue}
            />
          );
        })}
      </div>

      <div className="border-t border-steel-200 pt-5">
        <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
      </div>
    </form>
  );
}
