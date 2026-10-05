/** Result returned by public form server actions and consumed by useActionState. */
export interface FormState {
  status: "idle" | "success" | "error";
  /** A human-readable summary shown at the top of the form. */
  message?: string;
  /** Field-level validation errors, keyed by input name. */
  fieldErrors?: Record<string, string[]>;
  /** Reference number for successfully stored submissions. */
  reference?: string;
}

export const initialFormState: FormState = { status: "idle" };

/** First error message for a field, for inline display. */
export function fieldError(state: FormState, name: string): string | undefined {
  return state.fieldErrors?.[name]?.[0];
}
