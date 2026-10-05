import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Standard inner-page header. Keeps breadcrumbs, title and intro copy
 * consistent across every public page.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  variant = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  variant?: "light" | "dark";
  className?: string;
}) {
  const dark = variant === "dark";
  return (
    <section className={cn(dark ? "on-dark blueprint border-b border-white/10" : "border-b border-steel-200 bg-steel-50", className)}>
      <div className="container py-10 lg:py-14">
        {breadcrumbs?.length ? (
          <Breadcrumbs
            items={breadcrumbs}
            className={cn("mb-5", dark && "text-steel-400 [&_a:hover]:text-white")}
          />
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="eyebrow">
                <span aria-hidden className="h-px w-6 bg-current opacity-60" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</h1>
            {description ? (
              <div className={cn("mt-4 text-base leading-relaxed", dark ? "text-steel-300" : "text-steel-600")}>
                {description}
              </div>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
