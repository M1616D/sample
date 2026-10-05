import type { SocialSettings } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Renders only the social accounts an administrator has configured — empty
 * accounts never produce a dead icon.
 */
const ORDER: { key: keyof SocialSettings; label: string; path: string }[] = [
  { key: "telegram", label: "Telegram", path: "M22 3 2 10.5l5.5 2L10 21l3.5-4.5L19 21l3-18Z" },
  { key: "facebook", label: "Facebook", path: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" },
  { key: "instagram", label: "Instagram", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" },
  { key: "tiktok", label: "TikTok", path: "M14 3h3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1.2V14a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1A3 3 0 1 0 14 14V3Z" },
  { key: "youtube", label: "YouTube", path: "M3 8.5A3 3 0 0 1 6 5.5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7Zm7 1.5v4l4-2-4-2Z" },
  { key: "linkedin", label: "LinkedIn", path: "M5 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h4v1.7c.6-1 1.8-1.9 3.6-1.9 2.6 0 4.4 1.6 4.4 5V21h-4v-6.4c0-1.6-.7-2.4-1.9-2.4-1.3 0-2.1.9-2.1 2.4V21h-4V9Z" },
];

export function SocialLinks({
  social,
  variant = "light",
  className,
}: {
  social: SocialSettings;
  variant?: "light" | "dark";
  className?: string;
}) {
  const active = ORDER.filter((entry) => Boolean(social[entry.key]?.trim()));
  if (active.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {active.map((entry) => (
        <li key={entry.key}>
          <a
            href={social[entry.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${entry.label} (opens in a new tab)`}
            className={cn(
              "flex h-9 w-9 items-center justify-center border transition-colors",
              variant === "light"
                ? "border-white/15 text-steel-300 hover:border-white/40 hover:text-white"
                : "border-steel-300 text-steel-500 hover:border-ink-900 hover:text-ink-900",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d={entry.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
