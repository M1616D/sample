"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Submit button wired to the surrounding <form> via useFormStatus, so it
 * automatically disables and shows a spinner while the action is in flight.
 * This is what prevents double submissions.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
  size = "md",
  disabled,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "dark"
        ? "btn-dark"
        : variant === "outline"
          ? "btn-outline"
          : variant === "danger"
            ? "btn bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700"
            : "btn-ghost";
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={cn("btn", variantClass, sizeClass, className)}
    >
      {pending ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
