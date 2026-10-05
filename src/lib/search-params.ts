/** Helpers for reading URL query values in server components. */

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** First value for a key, trimmed, or undefined. */
export function firstParam(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  const single = Array.isArray(value) ? value[0] : value;
  const trimmed = single?.trim();
  return trimmed ? trimmed : undefined;
}

/** Page number clamped to a sane range. */
export function pageParam(params: RawSearchParams, max = 500): number {
  const raw = firstParam(params, "page");
  const parsed = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, max);
}

/** Only allow a value that is in the provided allow-list (defends against junk input). */
export function enumParam(params: RawSearchParams, key: string, allowed: readonly string[]): string | undefined {
  const value = firstParam(params, key);
  return value && allowed.includes(value) ? value : undefined;
}
