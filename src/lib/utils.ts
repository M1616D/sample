/**
 * Small, dependency-free helpers shared across the app.
 */

/** Merge conditional class names. Keeps markup readable without a utility dep. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** URL-safe slug from arbitrary text. Handles unicode, punctuation & repeats. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Absolute URL builder against the configured site origin. */
export function absoluteUrl(path: string, origin?: string): string {
  const base = (origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  if (!path) return base;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Format a date for display; returns "" for missing/invalid values. */
export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", opts ?? { year: "numeric", month: "short", day: "numeric" });
}

/** Truncate to a word-ish boundary. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/** Human-readable label from a SCREAMING_SNAKE status/enum value. */
export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Turn a free-form phone number into a `tel:` href.
 * Keeps a leading + and digits only.
 */
export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/** WhatsApp deep link from a phone number and optional prefilled text. */
export function whatsappHref(phone: string, text?: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}

/** Normalise a Telegram handle ("@name", "name", full URL) into a full URL. */
export function telegramHref(handle: string, text?: string): string {
  if (!handle) return "";
  let base: string;
  if (handle.startsWith("http")) {
    base = handle;
  } else {
    const name = handle.replace(/^@/, "").trim();
    base = `https://t.me/${name}`;
  }
  // t.me/<user>?text=... prefills for some clients; ?start is not applicable to users.
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Generate a short human-friendly reference such as QT-8F3K2A. */
export function reference(prefix: string): string {
  const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${out}`;
}

/** Clamp a number into a range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
