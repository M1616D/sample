import { z } from "zod";

import { CATEGORY_KINDS, PRODUCT_KINDS, PUBLISH_STATUSES } from "@/types";

/**
 * Shared validation schemas. The same schema is used by the client form
 * (progressive enhancement) and the server action / route handler, so the
 * server never trusts client-side validation alone.
 */

const optionalString = (max = 400) => z.string().trim().max(max).optional().default("");

/** Accepts "", a bare handle, a t.me link or an https URL. */
const telegramField = z
  .string()
  .trim()
  .max(200)
  .refine((v) => !v || /^(@?[\w.]{2,64}|https?:\/\/.+)$/i.test(v), "Enter a Telegram username or link")
  .optional()
  .default("");

const phoneField = z
  .string()
  .trim()
  .min(6, "Enter a reachable phone number")
  .max(40, "Phone number is too long")
  .regex(/^[+()\-\s\d]+$/, "Phone number may only contain digits, spaces and + ( ) -");

const emailField = z.string().trim().email("Enter a valid email address").max(200);

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address")
  .optional()
  .default("");

/* ------------------------------------------------------------------ */
/* Lead generation                                                     */
/* ------------------------------------------------------------------ */

export const quoteSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  company: optionalString(160),
  phone: phoneField,
  email: optionalEmail,
  telegram: telegramField,
  country: optionalString(80),
  city: optionalString(80),
  productService: z.string().trim().min(2, "Tell us which product or service you need").max(200),
  quantity: optionalString(60),
  requirements: z.string().trim().min(10, "Describe your requirement in a little more detail").max(4000),
  timeline: optionalString(120),
  preferredContact: z.enum(["phone", "email", "telegram", "whatsapp"]).default("phone"),
  attachmentUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Enter a valid link")
    .optional()
    .default(""),
  notes: optionalString(2000),
  productId: z.string().trim().max(64).optional().default(""),
  source: z.string().trim().max(200).optional().default(""),
  // Honeypot: real users never fill this. Bots do.
  website: z.string().max(0, "Submission rejected").optional().default(""),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: optionalEmail,
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => !v || /^[+()\-\s\d]+$/.test(v), "Phone number may only contain digits, spaces and + ( ) -")
    .optional()
    .default(""),
  subject: optionalString(160),
  message: z.string().trim().min(10, "Please write a short message").max(4000),
  website: z.string().max(0, "Submission rejected").optional().default(""),
}).refine((v) => Boolean(v.email) || Boolean(v.phone), {
  message: "Provide an email address or a phone number so we can reply",
  path: ["email"],
});

export type ContactInput = z.infer<typeof contactSchema>;

export const serviceRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name").max(120),
  company: optionalString(160),
  phone: phoneField,
  email: optionalEmail,
  machine: z.string().trim().min(2, "Enter the machine or model").max(160),
  serialNumber: optionalString(80),
  problem: z.string().trim().min(3, "Summarise the problem").max(200),
  description: z.string().trim().min(10, "Describe the problem in a little more detail").max(4000),
  location: optionalString(200),
  photos: z.string().trim().max(1000).optional().default(""),
  website: z.string().max(0, "Submission rejected").optional().default(""),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(200),
});

/* ------------------------------------------------------------------ */
/* Admin: content models                                               */
/* ------------------------------------------------------------------ */

const slugField = z
  .string()
  .trim()
  .min(1, "A URL slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(160),
  slug: slugField,
  kind: z.enum(PRODUCT_KINDS).default("product"),
  categoryId: z.string().trim().max(64).optional().default(""),
  shortDescription: z.string().trim().max(400).optional().default(""),
  description: z.string().trim().max(20000).optional().default(""),
  mainImage: optionalString(500),
  gallery: optionalString(4000),
  videoUrl: optionalString(500),
  features: optionalString(6000),
  applications: optionalString(6000),
  benefits: optionalString(6000),
  models: optionalString(2000),
  specs: optionalString(8000),
  availability: optionalString(120),
  status: z.enum(PUBLISH_STATUSES).default("DRAFT"),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  seoTitle: optionalString(200),
  seoDescription: optionalString(400),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Project title is required").max(160),
  slug: slugField,
  categoryId: z.string().trim().max(64).optional().default(""),
  client: optionalString(160),
  location: optionalString(160),
  date: optionalString(40),
  summary: optionalString(400),
  description: optionalString(20000),
  challenge: optionalString(6000),
  solution: optionalString(6000),
  result: optionalString(6000),
  images: optionalString(6000),
  videoUrl: optionalString(500),
  productIds: optionalString(2000),
  status: z.enum(PUBLISH_STATUSES).default("DRAFT"),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Service name is required").max(160),
  slug: slugField,
  summary: optionalString(400),
  description: optionalString(20000),
  image: optionalString(500),
  icon: optionalString(60),
  features: optionalString(6000),
  status: z.enum(PUBLISH_STATUSES).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const capabilitySchema = z.object({
  name: z.string().trim().min(2, "Capability name is required").max(160),
  slug: slugField,
  description: optionalString(20000),
  image: optionalString(500),
  equipment: optionalString(6000),
  applications: optionalString(6000),
  status: z.enum(PUBLISH_STATUSES).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(120),
  slug: slugField,
  description: optionalString(400),
  kind: z.enum(CATEGORY_KINDS).default("product"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const postSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  slug: slugField,
  excerpt: optionalString(500),
  content: optionalString(50000),
  coverImage: optionalString(500),
  author: optionalString(120),
  status: z.enum(PUBLISH_STATUSES).default("DRAFT"),
  publishedAt: optionalString(40),
});

export const faqSchema = z.object({
  question: z.string().trim().min(4, "Question is required").max(300),
  answer: z.string().trim().min(4, "Answer is required").max(4000),
  group: optionalString(80),
  status: z.enum(PUBLISH_STATUSES).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  role: optionalString(120),
  bio: optionalString(1000),
  image: optionalString(500),
  email: optionalEmail,
  phone: optionalString(40),
  status: z.enum(PUBLISH_STATUSES).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const sparePartSchema = z.object({
  partNumber: optionalString(80),
  name: z.string().trim().min(2, "Part name is required").max(160),
  slug: slugField,
  machine: optionalString(160),
  description: optionalString(4000),
  image: optionalString(500),
  availability: optionalString(80),
  status: z.enum(PUBLISH_STATUSES).default("DRAFT"),
  productId: optionalString(64),
});

export const mediaAssetSchema = z.object({
  url: z.string().trim().min(1, "A URL or path is required").max(1000),
  alt: optionalString(300),
  title: optionalString(200),
  kind: z.enum(["image", "video", "document"]).default("image"),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required").max(160),
  company: optionalString(160),
  phone: optionalString(40),
  email: optionalEmail,
  telegram: telegramField,
  address: optionalString(300),
  notes: optionalString(4000),
});

/* ------------------------------------------------------------------ */
/* Admin: settings                                                     */
/* ------------------------------------------------------------------ */

const stringList = z.array(z.string().max(400)).max(60).default([]);

export const companySettingsSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(160),
  legalName: optionalString(200),
  tagline: optionalString(200),
  shortDescription: optionalString(600),
  introParagraph: optionalString(2000),
  aboutBody: optionalString(20000),
  history: optionalString(10000),
  development: optionalString(10000),
  futureDirection: optionalString(10000),
  mission: optionalString(2000),
  vision: optionalString(2000),
  values: stringList,
  phone: optionalString(60),
  phoneAlt: optionalString(60),
  email: optionalEmail,
  telegram: optionalString(200),
  whatsapp: optionalString(60),
  address: optionalString(300),
  city: optionalString(120),
  region: optionalString(120),
  country: optionalString(120),
  postalCode: optionalString(30),
  mapUrl: optionalString(500),
  mapEmbedUrl: optionalString(1000),
  hours: z.array(z.object({ label: z.string().max(80), value: z.string().max(120) })).max(14).default([]),
  logo: optionalString(500),
  heroImage: optionalString(500),
  workshopImages: z.array(z.string().max(500)).max(40).default([]),
  videoUrl: optionalString(500),
});

export const socialSettingsSchema = z.object({
  telegram: optionalString(300),
  facebook: optionalString(300),
  instagram: optionalString(300),
  tiktok: optionalString(300),
  youtube: optionalString(300),
  linkedin: optionalString(300),
});

export const seoSettingsSchema = z.object({
  defaultTitle: optionalString(200),
  titleTemplate: optionalString(200),
  defaultDescription: optionalString(400),
  keywords: z.array(z.string().max(80)).max(40).default([]),
  ogImage: optionalString(500),
  twitterHandle: optionalString(60),
});

export const homeSettingsSchema = z.object({
  heroEyebrow: optionalString(120),
  heroTitle: z.string().trim().min(1, "Hero title is required").max(200),
  heroSubtitle: optionalString(600),
  industries: z.array(z.string().max(120)).max(24).default([]),
  whyChooseUs: z
    .array(z.object({ title: z.string().max(120), description: z.string().max(600) }))
    .max(12)
    .default([]),
  process: z
    .array(z.object({ title: z.string().max(120), description: z.string().max(600) }))
    .max(12)
    .default([]),
  stats: z
    .array(z.object({ label: z.string().max(80), value: z.string().max(40), note: z.string().max(120) }))
    .max(8)
    .default([]),
});

export const quoteUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTATION_SENT", "NEGOTIATING", "WON", "LOST", "CANCELLED"]),
  assignedTo: optionalString(160),
  internalNotes: optionalString(6000),
});

export const serviceRequestUpdateSchema = z.object({
  status: z.enum(["NEW", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "CLOSED"]),
  assignedTo: optionalString(160),
  internalNotes: optionalString(6000),
});

export const messageUpdateSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
});

/**
 * Flatten a ZodError into { field: [messages] } for form rendering.
 */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] = out[key] ? [...out[key], issue.message] : [issue.message];
  }
  return out;
}
