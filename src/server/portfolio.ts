import "server-only";

import { prisma } from "@/server/db";
import { parseList } from "@/lib/serialize";
import type { ProjectDTO, PublishStatus } from "@/types";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  client: string;
  location: string;
  date: Date | null;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  result: string;
  images: string;
  videoUrl: string;
  productIds: string;
  status: string;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category?: { name: string; slug: string } | null;
};

export function toProjectDTO(r: ProjectRow): ProjectDTO {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    categoryId: r.categoryId,
    categoryName: r.category?.name ?? null,
    client: r.client,
    location: r.location,
    date: r.date,
    summary: r.summary,
    description: r.description,
    challenge: r.challenge,
    solution: r.solution,
    result: r.result,
    images: parseList(r.images),
    videoUrl: r.videoUrl,
    productIds: parseList(r.productIds),
    status: r.status as PublishStatus,
    featured: r.featured,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

const projectInclude = { category: { select: { name: true, slug: true } } } as const;

export interface ProjectQuery {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
}

export async function listPublishedProjects(query: ProjectQuery = {}): Promise<ProjectDTO[]> {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (query.featuredOnly) where.featured = true;
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.search) {
      const term = query.search.trim();
      where.OR = [{ title: { contains: term } }, { summary: { contains: term } }, { description: { contains: term } }];
    }
    const rows = await prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }, { createdAt: "desc" }],
      take: query.limit,
    });
    return rows.map(toProjectDTO);
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  try {
    const row = await prisma.project.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: projectInclude,
    });
    return row ? toProjectDTO(row) : null;
  } catch {
    return null;
  }
}

export async function listProjectCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    return await prisma.category.findMany({
      where: { kind: "project" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });
  } catch {
    return [];
  }
}
