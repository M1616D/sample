import type { ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible form controls. Pure presentational components (no hooks) so they
 * can be rendered from both server and client components.
 *
 * Every control wires up: a real <label>, aria-invalid, aria-describedby for
 * hints and errors, and a visible error message with an alert role.
 */

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  hideLabel?: boolean;
}

function FieldShell({
  label,
  name,
  error,
  hint,
  required,
  className,
  hideLabel,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={name} className={cn("label", hideLabel && "sr-only")}>
        {label}
        {required ? (
          <span className="ml-1 text-accent-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, hint?: string, error?: string) {
  const ids = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export interface TextFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className"> {
  type?: string;
}

export function TextField({ label, name, error, hint, required, className, hideLabel, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className} hideLabel={hideLabel}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        aria-required={required || undefined}
        className={cn("field", error && "field-error")}
        {...props}
      />
    </FieldShell>
  );
}

export interface TextareaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className"> {}

export function TextareaField({ label, name, error, hint, required, className, hideLabel, ...props }: TextareaFieldProps) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className} hideLabel={hideLabel}>
      <textarea
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        aria-required={required || undefined}
        className={cn("field", error && "field-error")}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "className"> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  className,
  hideLabel,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className} hideLabel={hideLabel}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        aria-required={required || undefined}
        className={cn("field pr-8", error && "field-error")}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  error,
  defaultChecked,
}: {
  label: ReactNode;
  name: string;
  error?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex items-start gap-2.5 text-sm text-steel-700">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          className="checkbox mt-0.5"
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p role="alert" className="error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Groups a set of fields under a titled section with consistent spacing. */
export function FieldGroup({
  title,
  description,
  children,
  columns = 2,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="border-0 p-0">
      {title ? (
        <legend className="mb-1 text-sm font-semibold text-ink-900">{title}</legend>
      ) : null}
      {description ? <p className="mb-4 text-xs text-steel-500">{description}</p> : null}
      <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>{children}</div>
    </fieldset>
  );
}
