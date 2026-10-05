import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * These primitives are server-safe (no hooks), so they can be used from both
 * server and client components. Interactive primitives live in sibling files
 * marked "use client".
 * ------------------------------------------------------------------------- */

type Variant = "primary" | "dark" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  dark: "btn btn-dark",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
};

const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "className"> {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
}

/** Button that renders as a link when `href` is provided. */
export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  external,
  ...props
}: ButtonProps) {
  const classes = cn(variantClass[variant], sizeClass[size], className);
  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ badges */

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "dark";

const badgeTone: Record<BadgeTone, string> = {
  neutral: "border-steel-300 bg-white text-steel-600",
  accent: "border-accent-600/30 bg-accent-500/10 text-accent-700",
  success: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700",
  warning: "border-amber-600/30 bg-amber-500/10 text-amber-700",
  danger: "border-red-600/30 bg-red-500/10 text-red-700",
  info: "border-sky-600/30 bg-sky-500/10 text-sky-700",
  dark: "border-white/15 bg-white/10 text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={cn("badge", badgeTone[tone], className)}>{children}</span>;
}

/** Maps a workflow status string to a consistent badge tone. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "PUBLISHED":
    case "WON":
    case "COMPLETED":
    case "REPLIED":
      return "success";
    case "NEW":
      return "accent";
    case "CONTACTED":
    case "ASSIGNED":
    case "IN_PROGRESS":
    case "QUOTATION_SENT":
    case "NEGOTIATING":
      return "info";
    case "WAITING_FOR_PARTS":
    case "READ":
      return "warning";
    case "LOST":
    case "CANCELLED":
      return "danger";
    case "ARCHIVED":
    case "CLOSED":
    case "DRAFT":
    default:
      return "neutral";
  }
}

/* --------------------------------------------------------------- headings */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? (
        <div className={cn("mb-3", align === "center" && "flex justify-center")}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2 className="section-title">{title}</h2>
      {description ? (
        <div className={cn("lead mt-4 max-w-3xl", align === "center" && "mx-auto")}>{description}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------- states & feedback */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      {icon ? <div className="mb-4 text-steel-400">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-steel-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("rounded-card border border-red-200 bg-red-50 px-5 py-6 text-center", className)}
    >
      <h3 className="text-base font-semibold text-red-800">{title}</h3>
      {description ? <p className="mt-1.5 text-sm text-red-700">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Neutral inline notice used for degraded/offline states. */
export function Notice({
  title,
  children,
  tone = "info",
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: "info" | "warning";
  className?: string;
}) {
  const styles =
    tone === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-sky-300 bg-sky-50 text-sky-900";
  return (
    <div className={cn("rounded-card border px-4 py-3.5 text-sm", styles, className)}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-card bg-steel-200/70", className)} />;
}

/** Card-shaped loading skeleton for catalogue grids. */
export function CatalogueSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ breadcrumbs */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-steel-500", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.href ?? item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-ink-900 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-ink-800" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden className="text-steel-300">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------- pagination */

export function Pagination({
  page,
  pageSize,
  total,
  baseHref,
  params,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Path such as /products. Any active filters are preserved. */
  baseHref: string;
  /** Current filter values, carried across pages. */
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value && key !== "page") qs.set(key, value);
    }
    qs.set("page", String(p));
    return `${baseHref}?${qs.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-between gap-4", className)}>
      <p className="text-sm text-steel-600">
        Page {page} of {pages} · {total} items
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button href={href(page - 1)} variant="outline" size="sm">
            Previous
          </Button>
        ) : (
          <span className="btn btn-outline btn-sm opacity-50" aria-disabled="true">
            Previous
          </span>
        )}
        {page < pages ? (
          <Button href={href(page + 1)} variant="outline" size="sm">
            Next
          </Button>
        ) : (
          <span className="btn btn-outline btn-sm opacity-50" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
