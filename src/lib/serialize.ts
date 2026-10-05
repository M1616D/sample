/**
 * Structured fields (gallery, features, specs, ...) are stored as JSON strings
 * so the schema stays portable between SQLite and PostgreSQL.
 *
 * These helpers are the ONLY place that (de)serialises those columns, so a
 * future migration to a native JSON column type touches one file.
 */

export type Spec = { label: string; value: string };

/** Parse a JSON-encoded string list, always returning a string[]. */
export function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => (typeof v === "string" ? v : String(v ?? "")))
      .map((v) => v.trim())
      .filter(Boolean);
  } catch {
    // Tolerate legacy plain-text lists separated by newlines or commas.
    return value
      .split(/\r?\n|,/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
}

/** Serialise a string list for storage. */
export function serializeList(values: unknown): string {
  return JSON.stringify(parseList(values));
}

/** Parse a JSON-encoded array of {label,value} technical specifications. */
export function parseSpecs(value: unknown): Spec[] {
  if (Array.isArray(value)) {
    return (value as unknown[])
      .map((row) => {
        const r = row as Record<string, unknown>;
        return { label: String(r?.label ?? "").trim(), value: String(r?.value ?? "").trim() };
      })
      .filter((s) => s.label || s.value);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    return parseSpecs(JSON.parse(value));
  } catch {
    // Fallback: "Label: value" lines.
    return value
      .split(/\r?\n/)
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return null;
        return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
      })
      .filter((s): s is Spec => Boolean(s && s.label));
  }
}

/** Serialise technical specifications for storage. */
export function serializeSpecs(values: unknown): string {
  return JSON.stringify(parseSpecs(values));
}

/** Parse a JSON value with a typed fallback. */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
