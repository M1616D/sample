"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";

import { TextField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/server/actions/admin";
import { fieldError, initialFormState } from "@/types/forms";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <TextField
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="username"
        error={fieldError(state, "email")}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        error={fieldError(state, "password")}
      />

      <SubmitButton pendingLabel="Signing in…" size="lg" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
