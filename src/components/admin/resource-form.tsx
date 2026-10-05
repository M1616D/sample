"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { CheckboxField, SelectField, TextField, TextareaField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { saveResourceAction } from "@/server/actions/admin";
import type { AdminField } from "@/lib/admin-resources";
import { slugify } from "@/lib/utils";
import { fieldError } from "@/types/forms";

/**
 * Generic create/edit form driven by an `AdminResource` descriptor.
 * The server action re-validates with the same zod schema, so a tampered
 * submission is rejected regardless of what the browser sent.
 */
export function ResourceForm({
  resourceKey,
  id,
  singular,
  fields,
  values,
  slugFrom,
}: {
  resourceKey: string;
  /** Empty string means "create". */
  id: string;
  singular: string;
  fields: AdminField[];
  values: Record<string, string>;
  slugFrom?: string;
}) {
  const action = saveResourceAction.bind(null, resourceKey, id);
  const [state, formAction] = useActionState(action, { status: "idle" as const });
  const toast = useToast();
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));

  useEffect(() => {
    if (state.status === "error" && state.message) toast.error("Could not save", state.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onSourceBlur = (value: string) => {
    if (slugTouched) return;
    // The slug input uses its field name as its id (see form-fields.tsx).
    const slugInput = document.getElementById("slug") as HTMLInputElement | null;
    if (slugInput) slugInput.value = slugify(value);
  };

  return (
    <form action={formAction} className="space-y-6" noValidate>
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

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = fieldError(state, field.name);
          const defaultValue = values[field.name] ?? "";
          const wrapperClass = field.full ? "sm:col-span-2" : undefined;

          if (field.type === "checkbox") {
            return (
              <div key={field.name} className={wrapperClass}>
                <CheckboxField label={field.label} name={field.name} error={error} defaultChecked={values[field.name] === "true"} />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <SelectField
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.required}
                error={error}
                hint={field.hint}
                className={wrapperClass}
                options={field.options ?? []}
                placeholder="— Select —"
                defaultValue={defaultValue}
              />
            );
          }

          if (field.type === "textarea" || field.type === "list" || field.type === "specs") {
            return (
              <TextareaField
                key={field.name}
                label={field.label}
                name={field.name}
                required={field.required}
                error={error}
                hint={field.hint ?? (field.type === "list" ? "One per line" : undefined)}
                rows={field.rows ?? 4}
                className={wrapperClass}
                defaultValue={defaultValue}
                placeholder={field.placeholder}
              />
            );
          }

          // text / number / date
          return (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              required={field.required}
              error={error}
              hint={field.hint}
              className={wrapperClass}
              defaultValue={defaultValue}
              placeholder={field.placeholder}
              {...(field.name === "slug" ? { onChange: () => setSlugTouched(true) } : {})}
              {...(slugFrom && field.name === slugFrom
                ? { onBlur: (event: React.FocusEvent<HTMLInputElement>) => onSourceBlur(event.target.value) }
                : {})}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-steel-200 pt-5">
        <SubmitButton pendingLabel="Saving…">{id ? `Save ${singular.toLowerCase()}` : `Create ${singular.toLowerCase()}`}</SubmitButton>
        <a href={`/admin/${resourceKey}`} className="text-sm text-steel-500 hover:text-ink-900">
          Cancel
        </a>
      </div>
    </form>
  );
}
