import "server-only";

import { prisma } from "@/server/db";
import { parseList, parseSpecs, serializeList, serializeSpecs } from "@/lib/serialize";
import type { AdminField, AdminResource } from "@/lib/admin-resources";

/**
 * Generic admin data access.
 *
 * Rather than a hand-written repository per model, an `AdminResource`
 * descriptor names the Prisma model and its structured fields, and the helpers
 * below do the reads and writes. Keeping it here (and not in the actions file)
 * means the same code can be reused by any future API route.
 */

interface AnyModel {
  findMany: (args?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  count: (args?: Record<string, unknown>) => Promise<number>;
}

const models = prisma as unknown as Record<string, AnyModel>;

function model(resource: AdminResource): AnyModel {
  const m = models[resource.model];
  if (!m) throw new Error(`Unknown admin model: ${resource.model}`);
  return m;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

function searchWhere(resource: AdminResource, search?: string): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const term = search?.trim();
  if (term && resource.searchFields.length) {
    where.OR = resource.searchFields.map((field) => ({ [field]: { contains: term } }));
  }
  return where;
}

export async function listResourceRows(
  resource: AdminResource,
  search?: string,
  limit = 100,
  skip = 0,
): Promise<Record<string, unknown>[]> {
  return model(resource).findMany({
    where: searchWhere(resource, search),
    orderBy: resource.defaultOrder,
    take: limit,
    skip,
  });
}

export async function countResourceRows(resource: AdminResource, search?: string): Promise<number> {
  return model(resource).count({ where: searchWhere(resource, search) });
}

export async function getResourceRow(resource: AdminResource, id: string): Promise<Record<string, unknown> | null> {
  return model(resource).findUnique({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/** Build the Prisma `data` payload from validated form values. */
export function buildResourceData(
  resource: AdminResource,
  parsed: Record<string, unknown>,
  isCreate: boolean,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const field of resource.fields) {
    if (field.name === "slug" && isCreate && !parsed.slug) continue;
    if (!(field.name in parsed)) continue;
    let value = parsed[field.name];

    if (resource.specFields.includes(field.name)) {
      value = serializeSpecs(value);
    } else if (resource.listFields.includes(field.name)) {
      value = serializeList(value);
    } else if (field.type === "date") {
      const raw = typeof value === "string" ? value.trim() : "";
      value = raw ? new Date(raw) : null;
    } else if (field.type === "checkbox") {
      value = Boolean(value);
    } else if (field.name === "categoryId" || field.name === "productId") {
      value = typeof value === "string" && value.trim() ? value.trim() : null;
    }

    data[field.name] = value;
  }

  return data;
}

export async function createResourceRow(resource: AdminResource, data: Record<string, unknown>): Promise<{ id: string }> {
  const row = await model(resource).create({ data });
  return { id: String(row.id) };
}

export async function updateResourceRow(
  resource: AdminResource,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await model(resource).update({ where: { id }, data });
}

export async function deleteResourceRow(resource: AdminResource, id: string): Promise<void> {
  await model(resource).delete({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* Form value encoding (DB row -> plain string map)                    */
/* ------------------------------------------------------------------ */

function toDateInput(value: unknown): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/**
 * Convert a database row into the flat string values the form component
 * renders. Structured fields become newline-separated text so an editor can
 * change them without a bespoke widget.
 */
export function rowToFormValues(resource: AdminResource, row: Record<string, unknown> | null): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of resource.fields) {
    const raw = row?.[field.name];
    if (resource.specFields.includes(field.name)) {
      values[field.name] = parseSpecs(raw)
        .map((spec) => `${spec.label}: ${spec.value}`)
        .join("\n");
    } else if (resource.listFields.includes(field.name)) {
      values[field.name] = parseList(raw).join("\n");
    } else if (field.type === "date") {
      values[field.name] = toDateInput(raw);
    } else if (field.type === "checkbox") {
      values[field.name] = raw ? "true" : "";
    } else {
      values[field.name] = raw === null || raw === undefined ? "" : String(raw);
    }
  }
  return values;
}

/* ------------------------------------------------------------------ */
/* Dynamic select options                                              */
/* ------------------------------------------------------------------ */

export async function resolveFieldOptions(optionsKey: AdminField["optionsKey"]): Promise<{ value: string; label: string }[]> {
  if (!optionsKey) return [];
  try {
    if (optionsKey === "productCategories" || optionsKey === "projectCategories" || optionsKey === "postCategories") {
      const kind =
        optionsKey === "productCategories" ? "product" : optionsKey === "projectCategories" ? "project" : "post";
      const rows = await prisma.category.findMany({
        where: { kind },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      });
      return rows.map((c) => ({ value: c.id, label: c.name }));
    }
    const rows = await prisma.product.findMany({
      where: optionsKey === "machinery" ? { kind: "machinery" } : undefined,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 500,
    });
    return rows.map((p) => ({ value: p.id, label: p.name }));
  } catch {
    return [];
  }
}

/** Inject database-backed options into a resource's fields before rendering. */
export async function withResolvedOptions(resource: AdminResource): Promise<AdminResource> {
  const needs = resource.fields.some((f) => f.optionsKey);
  if (!needs) return resource;
  const fields = await Promise.all(
    resource.fields.map(async (field) => {
      if (!field.optionsKey) return field;
      const options = await resolveFieldOptions(field.optionsKey);
      return { ...field, options };
    }),
  );
  return { ...resource, fields };
}
