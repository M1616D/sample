import "server-only";

import { prisma } from "@/server/db";
import { parseList, parseSpecs } from "@/lib/serialize";
import type { CategoryDTO, ProductDTO, ProductKind, PublishStatus, SparePartDTO } from "@/types";

/**
 * Catalogue data access.
 *
 * Every public read is wrapped so a database outage degrades to an empty list
 * rather than a 500. Admin reads deliberately do NOT swallow errors — an
 * administrator must see that something is wrong.
 */

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  categoryId: string | null;
  shortDescription: string;
  description: string;
  mainImage: string;
  gallery: string;
  videoUrl: string;
  features: string;
  applications: string;
  benefits: string;
  models: string;
  specs: string;
  availability: string;
  status: string;
  featured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
  category?: { name: string; slug: string } | null;
};

export function toProductDTO(row: ProductRow): ProductDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    kind: (row.kind === "machinery" ? "machinery" : "product") as ProductKind,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    shortDescription: row.shortDescription,
    description: row.description,
    mainImage: row.mainImage,
    gallery: parseList(row.gallery),
    videoUrl: row.videoUrl,
    features: parseList(row.features),
    applications: parseList(row.applications),
    benefits: parseList(row.benefits),
    models: parseList(row.models),
    specs: parseSpecs(row.specs),
    availability: row.availability,
    status: row.status as PublishStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const productInclude = { category: { select: { name: true, slug: true } } } as const;

export interface ProductQuery {
  kind?: ProductKind;
  categorySlug?: string;
  availability?: string;
  search?: string;
  featuredOnly?: boolean;
  sort?: "newest" | "name" | "order";
  limit?: number;
  skip?: number;
}

export async function listPublishedProducts(query: ProductQuery = {}): Promise<ProductDTO[]> {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (query.kind) where.kind = query.kind;
    if (query.featuredOnly) where.featured = true;
    if (query.availability) where.availability = query.availability;
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term } },
        { shortDescription: { contains: term } },
        { description: { contains: term } },
        { features: { contains: term } },
      ];
    }
    const orderBy =
      query.sort === "name"
        ? [{ name: "asc" as const }]
        : query.sort === "newest"
          ? [{ createdAt: "desc" as const }]
          : [{ sortOrder: "asc" as const }, { name: "asc" as const }];

    const rows = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      take: query.limit,
      skip: query.skip,
    });
    return rows.map(toProductDTO);
  } catch {
    return [];
  }
}

export async function countPublishedProducts(query: ProductQuery = {}): Promise<number> {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (query.kind) where.kind = query.kind;
    if (query.featuredOnly) where.featured = true;
    if (query.availability) where.availability = query.availability;
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [{ name: { contains: term } }, { description: { contains: term } }];
    }
    return await prisma.product.count({ where });
  } catch {
    return 0;
  }
}

export async function getProductBySlug(slug: string, kind?: ProductKind): Promise<ProductDTO | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, status: "PUBLISHED", ...(kind ? { kind } : {}) },
      include: productInclude,
    });
    return row ? toProductDTO(row) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a published product by id. Used to render saved relationships
 * (for example a project's "products used" list) defensively, so an item that
 * was later unpublished or deleted simply disappears instead of erroring.
 */
export async function getPublishedProductById(id: string): Promise<ProductDTO | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { id, status: "PUBLISHED" },
      include: productInclude,
    });
    return row ? toProductDTO(row) : null;
  } catch {
    return null;
  }
}

/** Related products: same category first, then same kind, excluding itself. */
export async function getRelatedProducts(product: ProductDTO, limit = 3): Promise<ProductDTO[]> {
  try {
    const rows = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: product.id },
        OR: [
          ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
          { kind: product.kind },
        ],
      },
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map(toProductDTO);
  } catch {
    return [];
  }
}

/** Distinct availability values currently in use, for the filter UI. */
export async function listAvailabilityOptions(kind?: ProductKind): Promise<string[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "PUBLISHED", availability: { not: "" }, ...(kind ? { kind } : {}) },
      select: { availability: true },
      distinct: ["availability"],
      orderBy: { availability: "asc" },
    });
    return rows.map((r) => r.availability).filter(Boolean);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export async function listCategories(kind?: string): Promise<CategoryDTO[]> {
  try {
    const rows = await prisma.category.findMany({
      where: kind ? { kind } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      kind: r.kind,
      sortOrder: r.sortOrder,
    }));
  } catch {
    return [];
  }
}

/** Categories with counts of published products, for the catalogue sidebar. */
export async function listProductCategoriesWithCounts(kind?: ProductKind): Promise<CategoryDTO[]> {
  try {
    const rows = await prisma.category.findMany({
      where: { kind: "product" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED", ...(kind ? { kind } : {}) } } } },
      },
    });
    return rows
      .map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        kind: r.kind,
        sortOrder: r.sortOrder,
        count: r._count.products,
      }))
      .filter((c) => (c.count ?? 0) > 0 || true);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Spare parts                                                         */
/* ------------------------------------------------------------------ */

type SparePartRow = {
  id: string;
  partNumber: string;
  name: string;
  slug: string;
  machine: string;
  description: string;
  image: string;
  availability: string;
  status: string;
  productId: string | null;
};

export function toSparePartDTO(r: SparePartRow): SparePartDTO {
  return {
    id: r.id,
    partNumber: r.partNumber,
    name: r.name,
    slug: r.slug,
    machine: r.machine,
    description: r.description,
    image: r.image,
    availability: r.availability,
    status: r.status as PublishStatus,
    productId: r.productId,
  };
}

export async function getSparePartBySlug(slug: string): Promise<SparePartDTO | null> {
  try {
    const row = await prisma.sparePart.findFirst({ where: { slug, status: "PUBLISHED" } });
    return row ? toSparePartDTO(row) : null;
  } catch {
    return null;
  }
}

export async function listSpareParts(search?: string): Promise<SparePartDTO[]> {
  try {
    const rows = await prisma.sparePart.findMany({
      where: {
        status: "PUBLISHED",
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { partNumber: { contains: search } },
                { machine: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: "asc" }],
      take: 200,
    });
    return rows.map(toSparePartDTO);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Site-wide search                                                    */
/* ------------------------------------------------------------------ */

export interface SearchHit {
  type: "product" | "machinery" | "service" | "project" | "spare-part" | "post";
  title: string;
  href: string;
  description: string;
}

export async function searchSite(term: string, limitPerType = 6): Promise<SearchHit[]> {
  const q = term.trim();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  const [products, services, projects, parts, posts] = await Promise.all([
    listPublishedProducts({ search: q, limit: limitPerType * 2 }),
    (async () => {
      try {
        return await prisma.service.findMany({
          where: { status: "PUBLISHED", OR: [{ name: { contains: q } }, { summary: { contains: q } }, { description: { contains: q } }] },
          take: limitPerType,
        });
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.project.findMany({
          where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { summary: { contains: q } }, { description: { contains: q } }] },
          take: limitPerType,
        });
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.sparePart.findMany({
          where: { status: "PUBLISHED", OR: [{ name: { contains: q } }, { partNumber: { contains: q } }, { machine: { contains: q } }] },
          take: limitPerType,
        });
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.post.findMany({
          where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] },
          take: limitPerType,
        });
      } catch {
        return [];
      }
    })(),
  ]);

  for (const p of products.slice(0, limitPerType)) {
    hits.push({
      type: p.kind === "machinery" ? "machinery" : "product",
      title: p.name,
      href: `/${p.kind === "machinery" ? "machinery" : "products"}/${p.slug}`,
      description: p.shortDescription || p.description.slice(0, 140),
    });
  }
  for (const s of services) {
    hits.push({ type: "service", title: s.name, href: `/services/${s.slug}`, description: s.summary });
  }
  for (const p of projects) {
    hits.push({ type: "project", title: p.title, href: `/projects/${p.slug}`, description: p.summary });
  }
  for (const sp of parts) {
    hits.push({ type: "spare-part", title: sp.name, href: `/spare-parts/${sp.slug}`, description: sp.machine || sp.description.slice(0, 140) });
  }
  for (const post of posts) {
    hits.push({ type: "post", title: post.title, href: `/news/${post.slug}`, description: post.excerpt });
  }
  return hits;
}
