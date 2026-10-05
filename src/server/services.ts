import "server-only";

import { prisma } from "@/server/db";
import { parseList } from "@/lib/serialize";
import type { CapabilityDTO, PublishStatus, ServiceDTO } from "@/types";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  image: string;
  icon: string;
  features: string;
  status: string;
  sortOrder: number;
};

type CapabilityRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  equipment: string;
  applications: string;
  status: string;
  sortOrder: number;
};

export function toServiceDTO(r: ServiceRow): ServiceDTO {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    summary: r.summary,
    description: r.description,
    image: r.image,
    icon: r.icon,
    features: parseList(r.features),
    status: r.status as PublishStatus,
    sortOrder: r.sortOrder,
  };
}

export function toCapabilityDTO(r: CapabilityRow): CapabilityDTO {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image: r.image,
    equipment: parseList(r.equipment),
    applications: parseList(r.applications),
    status: r.status as PublishStatus,
    sortOrder: r.sortOrder,
  };
}

export async function listServices(): Promise<ServiceDTO[]> {
  try {
    const rows = await prisma.service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map(toServiceDTO);
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceDTO | null> {
  try {
    const row = await prisma.service.findFirst({ where: { slug, status: "PUBLISHED" } });
    return row ? toServiceDTO(row) : null;
  } catch {
    return null;
  }
}

export async function listCapabilities(): Promise<CapabilityDTO[]> {
  try {
    const rows = await prisma.capability.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map(toCapabilityDTO);
  } catch {
    return [];
  }
}

export async function getCapabilityBySlug(slug: string): Promise<CapabilityDTO | null> {
  try {
    const row = await prisma.capability.findFirst({ where: { slug, status: "PUBLISHED" } });
    return row ? toCapabilityDTO(row) : null;
  } catch {
    return null;
  }
}
