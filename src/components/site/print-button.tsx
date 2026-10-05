"use client";

import { Printer } from "lucide-react";

/**
 * Trivial client component: the browser's own print dialog is the most reliable
 * way to produce a PDF of the company profile on every platform, with no extra
 * dependency or server work.
 */
export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-outline print:hidden" onClick={() => window.print()}>
      <Printer className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
