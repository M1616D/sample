"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible modal dialog.
 *
 * - Renders inside the viewport (never off-screen) and scrolls internally.
 * - Closes on Escape and on backdrop click.
 * - Locks body scroll while open.
 * - Moves focus into the dialog on open and restores it on close.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      // Simple focus trap.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto">
      <div
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? "modal-description" : undefined}
          tabIndex={-1}
          className={cn(
            "relative z-10 w-full border border-steel-200 bg-white shadow-raised rounded-t-card sm:rounded-card",
            maxWidth,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-steel-200 px-5 py-4">
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-ink-900">
                {title}
              </h2>
              {description ? (
                <p id="modal-description" className="mt-1 text-sm text-steel-600">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 -mt-1 shrink-0 p-1.5 text-steel-400 transition-colors hover:text-ink-900"
            >
              ×
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-steel-200 px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
