import type { Spec } from "@/lib/serialize";

export type { Spec };

/* ------------------------------------------------------------------ */
/* Status unions (mirrors the String columns in prisma/schema.prisma)  */
/* ------------------------------------------------------------------ */

export const PUBLISH_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const QUOTE_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "NEGOTIATING",
  "WON",
  "LOST",
  "CANCELLED",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const SERVICE_STATUSES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "COMPLETED",
  "CLOSED",
] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const PRODUCT_KINDS = ["product", "machinery"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const CATEGORY_KINDS = ["product", "project", "post"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/* ------------------------------------------------------------------ */
/* Read models (parsed, ready for the UI)                              */
/* ------------------------------------------------------------------ */

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: string;
  sortOrder: number;
  count?: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  kind: ProductKind;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  shortDescription: string;
  description: string;
  mainImage: string;
  gallery: string[];
  videoUrl: string;
  features: string[];
  applications: string[];
  benefits: string[];
  models: string[];
  specs: Spec[];
  availability: string;
  status: PublishStatus;
  featured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDTO {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
  status: PublishStatus;
  sortOrder: number;
}

export interface CapabilityDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  equipment: string[];
  applications: string[];
  status: PublishStatus;
  sortOrder: number;
}

export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  client: string;
  location: string;
  date: Date | null;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  result: string;
  images: string[];
  videoUrl: string;
  productIds: string[];
  status: PublishStatus;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  status: PublishStatus;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
  group: string;
  status: PublishStatus;
  sortOrder: number;
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  phone: string;
  status: PublishStatus;
  sortOrder: number;
}

export interface QuoteRequestDTO {
  id: string;
  reference: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  telegram: string;
  country: string;
  city: string;
  productService: string;
  quantity: string;
  requirements: string;
  timeline: string;
  preferredContact: string;
  attachmentUrl: string;
  notes: string;
  status: QuoteStatus;
  assignedTo: string;
  internalNotes: string;
  source: string;
  productId: string | null;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDTO {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  telegram: string;
  address: string;
  notes: string;
  createdAt: Date;
  quoteCount?: number;
  serviceCount?: number;
}

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
}

export interface ServiceRequestDTO {
  id: string;
  reference: string;
  customerName: string;
  company: string;
  phone: string;
  email: string;
  machine: string;
  serialNumber: string;
  problem: string;
  description: string;
  location: string;
  photos: string[];
  status: ServiceStatus;
  assignedTo: string;
  internalNotes: string;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SparePartDTO {
  id: string;
  partNumber: string;
  name: string;
  slug: string;
  machine: string;
  description: string;
  image: string;
  availability: string;
  status: PublishStatus;
  productId: string | null;
}

export interface MediaAssetDTO {
  id: string;
  url: string;
  alt: string;
  title: string;
  kind: string;
  createdAt: Date;
}

/** A generic result used by write actions so the UI can show feedback. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
