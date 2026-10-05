import "server-only";

import { prisma } from "@/server/db";
import type { FaqDTO, MediaAssetDTO, PostDTO, PublishStatus, TeamMemberDTO } from "@/types";

/* -------------------------------- News -------------------------------- */

export async function listPosts(limit?: number): Promise<PostDTO[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.coverImage,
      author: r.author,
      status: r.status as PublishStatus,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostDTO | null> {
  try {
    const r = await prisma.post.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.coverImage,
      author: r.author,
      status: r.status as PublishStatus,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
    };
  } catch {
    return null;
  }
}

/* -------------------------------- FAQ --------------------------------- */

export async function listFaqs(): Promise<FaqDTO[]> {
  try {
    const rows = await prisma.faq.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      group: r.group,
      status: r.status as PublishStatus,
      sortOrder: r.sortOrder,
    }));
  } catch {
    return [];
  }
}

/* -------------------------------- Team -------------------------------- */

export async function listTeam(): Promise<TeamMemberDTO[]> {
  try {
    const rows = await prisma.teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      bio: r.bio,
      image: r.image,
      email: r.email,
      phone: r.phone,
      status: r.status as PublishStatus,
      sortOrder: r.sortOrder,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------- Media -------------------------------- */

export async function listMedia(): Promise<MediaAssetDTO[]> {
  try {
    const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      alt: r.alt,
      title: r.title,
      kind: r.kind,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}
