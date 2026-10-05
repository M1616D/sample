import "server-only";

import { prisma } from "@/server/db";
import {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  type SiteSettings,
} from "@/config/site";

/**
 * Settings service.
 *
 * The `Setting` table stores one row per group ("company", "social", "seo",
 * "home") with a JSON-encoded value. Reads merge stored values over the
 * defaults so a partially-configured site never renders blank.
 *
 * Every setting is read-only from the public site; writes go through admin
 * server actions which re-check the session.
 */

type GroupKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

function mergeGroup<T extends Record<string, unknown>>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    // Ignore unknown keys so malformed stored data cannot pollute the model.
    if (!(key in base)) continue;
    if (value === undefined || value === null) continue;
    // Nested plain objects merge recursively (e.g. nothing today, but keeps the
    // service reusable). Everything else — scalars and arrays — replaces the
    // default, so an administrator can intentionally clear a value.
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = mergeGroup(base[key] as Record<string, unknown>, value);
      continue;
    }
    result[key] = value;
  }
  return result as T;
}

/** Read all settings, merged over defaults. Never throws. */
export async function getSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = DEFAULT_SETTINGS;
  try {
    const rows = await prisma.setting.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    const read = <T extends Record<string, unknown>>(key: GroupKey, base: T): T => {
      const raw = byKey.get(key);
      if (!raw) return base;
      try {
        return mergeGroup(base, JSON.parse(raw));
      } catch {
        return base;
      }
    };
    return {
      company: read(SETTING_KEYS.company, DEFAULT_SETTINGS.company as unknown as Record<string, unknown>) as unknown as SiteSettings["company"],
      social: read(SETTING_KEYS.social, DEFAULT_SETTINGS.social as unknown as Record<string, unknown>) as unknown as SiteSettings["social"],
      seo: read(SETTING_KEYS.seo, DEFAULT_SETTINGS.seo as unknown as Record<string, unknown>) as unknown as SiteSettings["seo"],
      home: read(SETTING_KEYS.home, DEFAULT_SETTINGS.home as unknown as Record<string, unknown>) as unknown as SiteSettings["home"],
    };
  } catch {
    return fallback;
  }
}

/** Write a settings group. Callers must be authenticated administrators. */
export async function saveSettingGroup(key: GroupKey, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value ?? {});
  await prisma.setting.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized },
  });
}
