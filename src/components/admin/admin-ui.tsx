import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Trash2, TriangleAlert } from "lucide-react";

/** Consistent page header for every admin screen. */
export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-steel-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl">{title}</h1>
          {description ? <p className="mt-1.5 text-sm text-steel-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

/** Small banner summarising the result of the previous action. */
export function Flash({ saved, deleted, error }: { saved?: boolean; deleted?: boolean; error?: string }) {
  if (!saved && !deleted && !error) return null;

  if (error) {
    const message =
      error === "delete"
        ? "That record could not be deleted. It may still be referenced elsewhere."
        : "Something went wrong. Please try again.";
    return (
      <div role="alert" className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {deleted ? (
        <>
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>Record deleted.</p>
        </>
      ) : (
        <>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>Changes saved.</p>
        </>
      )}
    </div>
  );
}
