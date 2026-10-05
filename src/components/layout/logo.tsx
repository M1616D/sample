import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Brand mark. Uses the configured logo image when one is set, otherwise falls
 * back to a typographic wordmark so the header never renders an empty box.
 */
export function Logo({
  name,
  logoUrl,
  variant = "dark",
  className,
}: {
  name: string;
  logoUrl?: string;
  /** "dark" = for light backgrounds, "light" = for dark backgrounds. */
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${name} — home`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos have unknown intrinsic size
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-9 w-auto max-w-[180px] object-contain"
          width={180}
          height={36}
        />
      ) : (
        <>
          <span
            aria-hidden
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center border",
              variant === "dark" ? "border-ink-900 bg-ink-900" : "border-white/25 bg-white/10",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M4 18h16" stroke="#f97316" strokeWidth="1.8" strokeLinecap="square" />
              <path d="M7 18V8h10v10" stroke={variant === "dark" ? "#ffffff" : "#ffffff"} strokeWidth="1.8" strokeLinecap="square" />
              <path d="M12 8V4" stroke="#f97316" strokeWidth="1.8" strokeLinecap="square" />
              <circle cx="12" cy="13" r="2.4" stroke="#f97316" strokeWidth="1.6" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "text-[15px] font-bold uppercase tracking-[0.11em]",
                variant === "dark" ? "text-ink-900" : "text-white",
              )}
            >
              {name}
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
