"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Submit button that confirms first. Used for destructive admin actions so a
 * stray click cannot delete a record. Works without JavaScript becoming a hard
 * requirement for the rest of the form.
 */
export function ConfirmSubmit({
  children,
  message,
  className,
  variant = "ghost",
}: {
  children: ReactNode;
  message: string;
  className?: string;
  variant?: "ghost" | "outline" | "danger";
}) {
  const variantClass = variant === "danger" ? "btn btn-sm bg-red-600 border-red-600 text-white hover:bg-red-700" : variant === "outline" ? "btn btn-outline btn-sm" : "btn btn-ghost btn-sm";

  return (
    <button
      type="submit"
      className={cn(variantClass, className)}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
