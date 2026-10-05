import type { ZodTypeAny } from "zod";

import {
  capabilitySchema,
  categorySchema,
  customerSchema,
  faqSchema,
  mediaAssetSchema,
  postSchema,
  productSchema,
  projectSchema,
  serviceSchema,
  sparePartSchema,
  teamMemberSchema,
} from "@/lib/validation";
import { CATEGORY_KINDS, PRODUCT_KINDS, PUBLISH_STATUSES } from "@/types";

/**
 * Admin resource registry.
 *
 * The admin panel is driven by these descriptors rather than a hand-written
 * page per model: the list view, the create/edit form and the server action all
 * read the same definition, so adding a field means changing one line here.
 *
 * This module is isomorphic (no server-only imports) because the client-side
 * form renders from the same `fields` array.
 */

export type AdminFieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "list" | "specs" | "date";

export interface AdminField {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** Options are injected at render time from the database (see optionsKey). */
  optionsKey?: "productCategories" | "projectCategories" | "postCategories" | "machinery" | "products";
  hint?: string;
  rows?: number;
  full?: boolean;
  placeholder?: string;
}

export interface AdminColumn {
  name: string;
  label: string;
  type?: "text" | "status" | "date" | "boolean" | "number";
}

export interface AdminResource {
  key: string;
  label: string;
  singular: string;
  group: string;
  description: string;
  /** Field used as the human label for a row. */
  titleField: string;
  /** Field that a slug is derived from when creating. */
  slugFrom?: string;
  /** Prisma model accessor on the client (camelCase). */
  model: string;
  searchFields: string[];
  /** Fields stored as JSON string arrays. */
  listFields: string[];
  /** Fields stored as JSON {label,value} arrays. */
  specFields: string[];
  columns: AdminColumn[];
  fields: AdminField[];
  schema: ZodTypeAny;
  defaultOrder: Record<string, "asc" | "desc">;
}

const publishOptions = PUBLISH_STATUSES.map((value) => ({ value, label: value }));
const kindOptions = PRODUCT_KINDS.map((value) => ({ value, label: value === "product" ? "Product" : "Machinery" }));

export const adminResources: Record<string, AdminResource> = {
  products: {
    key: "products",
    label: "Products & Machinery",
    singular: "Product",
    group: "Catalogue",
    description: "Products and machinery shown in the public catalogue.",
    titleField: "name",
    slugFrom: "name",
    model: "product",
    searchFields: ["name", "slug", "shortDescription"],
    listFields: ["gallery", "features", "applications", "benefits", "models"],
    specFields: ["specs"],
    columns: [
      { name: "name", label: "Name" },
      { name: "kind", label: "Kind" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "updatedAt", label: "Updated", type: "date" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "URL: /products/your-slug" },
      { name: "kind", label: "Kind", type: "select", options: kindOptions, required: true },
      { name: "categoryId", label: "Category", type: "select", optionsKey: "productCategories" },
      { name: "shortDescription", label: "Short description", type: "textarea", rows: 2, full: true },
      { name: "description", label: "Description", type: "textarea", rows: 6, full: true },
      { name: "mainImage", label: "Main image URL", type: "text", full: true },
      { name: "gallery", label: "Gallery image URLs", type: "list", full: true, hint: "One URL per line" },
      { name: "videoUrl", label: "Video URL", type: "text", full: true },
      { name: "features", label: "Features", type: "list", full: true, hint: "One per line" },
      { name: "applications", label: "Applications", type: "list", full: true, hint: "One per line" },
      { name: "benefits", label: "Benefits", type: "list", full: true, hint: "One per line" },
      { name: "models", label: "Models", type: "list", full: true, hint: "One per line" },
      { name: "specs", label: "Technical specifications", type: "specs", full: true, hint: "One per line as “Label: value”" },
      { name: "availability", label: "Availability", type: "text", hint: "e.g. In stock, Made to order" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
      { name: "featured", label: "Featured on the homepage", type: "checkbox" },
      { name: "seoTitle", label: "SEO title", type: "text", full: true },
      { name: "seoDescription", label: "SEO description", type: "textarea", rows: 2, full: true },
    ],
    schema: productSchema,
    defaultOrder: { sortOrder: "asc" },
  },
  categories: {
    key: "categories",
    label: "Categories",
    singular: "Category",
    group: "Catalogue",
    description: "Categories used to group products, projects and news.",
    titleField: "name",
    slugFrom: "name",
    model: "category",
    searchFields: ["name", "slug"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "kind", label: "Kind" },
      { name: "slug", label: "Slug" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "kind",
        label: "Kind",
        type: "select",
        required: true,
        options: CATEGORY_KINDS.map((value) => ({ value, label: value })),
      },
      { name: "description", label: "Description", type: "textarea", rows: 3, full: true },
      { name: "sortOrder", label: "Sort order", type: "number" },
    ],
    schema: categorySchema,
    defaultOrder: { sortOrder: "asc" },
  },
  "spare-parts": {
    key: "spare-parts",
    label: "Spare parts",
    singular: "Spare part",
    group: "Catalogue",
    description: "Spare parts and consumables offered to customers.",
    titleField: "name",
    slugFrom: "name",
    model: "sparePart",
    searchFields: ["name", "partNumber", "machine", "slug"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "partNumber", label: "Part no." },
      { name: "machine", label: "Machine" },
      { name: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "partNumber", label: "Part number", type: "text" },
      { name: "machine", label: "For machine", type: "text" },
      { name: "productId", label: "Linked product", type: "select", optionsKey: "products" },
      { name: "image", label: "Image URL", type: "text", full: true },
      { name: "description", label: "Description", type: "textarea", rows: 4, full: true },
      { name: "availability", label: "Availability", type: "text" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: sparePartSchema,
    defaultOrder: { name: "asc" },
  },
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    group: "Content",
    description: "Services offered: fabrication, machining, installation, support.",
    titleField: "name",
    slugFrom: "name",
    model: "service",
    searchFields: ["name", "slug", "summary"],
    listFields: ["features"],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "status", label: "Status", type: "status" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", rows: 2, full: true },
      { name: "description", label: "Description", type: "textarea", rows: 6, full: true },
      { name: "features", label: "Features", type: "list", full: true, hint: "One per line" },
      { name: "image", label: "Image URL", type: "text", full: true },
      { name: "icon", label: "Icon key", type: "text", hint: "Optional lucide icon name" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: serviceSchema,
    defaultOrder: { sortOrder: "asc" },
  },
  capabilities: {
    key: "capabilities",
    label: "Capabilities",
    singular: "Capability",
    group: "Content",
    description: "Workshop capabilities, equipment and processes.",
    titleField: "name",
    slugFrom: "name",
    model: "capability",
    searchFields: ["name", "slug"],
    listFields: ["equipment", "applications"],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "status", label: "Status", type: "status" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 4, full: true },
      { name: "equipment", label: "Equipment", type: "list", full: true, hint: "One per line" },
      { name: "applications", label: "Applications", type: "list", full: true, hint: "One per line" },
      { name: "image", label: "Image URL", type: "text", full: true },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: capabilitySchema,
    defaultOrder: { sortOrder: "asc" },
  },
  projects: {
    key: "projects",
    label: "Projects",
    singular: "Project",
    group: "Portfolio",
    description: "Portfolio case studies: challenge, solution and result.",
    titleField: "title",
    slugFrom: "title",
    model: "project",
    searchFields: ["title", "slug", "client", "location"],
    listFields: ["images", "productIds"],
    specFields: [],
    columns: [
      { name: "title", label: "Title" },
      { name: "client", label: "Client" },
      { name: "status", label: "Status", type: "status" },
      { name: "date", label: "Date", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "categoryId", label: "Category", type: "select", optionsKey: "projectCategories" },
      { name: "client", label: "Client", type: "text", hint: "Leave blank if not disclosable" },
      { name: "location", label: "Location", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "summary", label: "Summary", type: "textarea", rows: 2, full: true },
      { name: "description", label: "Description", type: "textarea", rows: 6, full: true },
      { name: "challenge", label: "Challenge", type: "textarea", rows: 3, full: true },
      { name: "solution", label: "Solution", type: "textarea", rows: 3, full: true },
      { name: "result", label: "Result", type: "textarea", rows: 3, full: true },
      { name: "images", label: "Image URLs", type: "list", full: true, hint: "One URL per line" },
      { name: "videoUrl", label: "Video URL", type: "text", full: true },
      { name: "productIds", label: "Related product IDs", type: "list", full: true, hint: "One product id per line" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
      { name: "featured", label: "Featured", type: "checkbox" },
    ],
    schema: projectSchema,
    defaultOrder: { sortOrder: "asc" },
  },
  news: {
    key: "news",
    label: "News & updates",
    singular: "Article",
    group: "Content",
    description: "Blog / news articles shown in the newsroom.",
    titleField: "title",
    slugFrom: "title",
    model: "post",
    searchFields: ["title", "slug", "author"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "title", label: "Title" },
      { name: "author", label: "Author" },
      { name: "status", label: "Status", type: "status" },
      { name: "publishedAt", label: "Published", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "author", label: "Author", type: "text" },
      { name: "publishedAt", label: "Published date", type: "date" },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, full: true },
      { name: "content", label: "Content", type: "textarea", rows: 10, full: true },
      { name: "coverImage", label: "Cover image URL", type: "text", full: true },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: postSchema,
    defaultOrder: { publishedAt: "desc" },
  },
  faqs: {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    group: "Content",
    description: "Frequently asked questions grouped by topic.",
    titleField: "question",
    model: "faq",
    searchFields: ["question", "answer", "group"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "question", label: "Question" },
      { name: "group", label: "Group" },
      { name: "status", label: "Status", type: "status" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, full: true },
      { name: "answer", label: "Answer", type: "textarea", rows: 5, required: true, full: true },
      { name: "group", label: "Group", type: "text" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: faqSchema,
    defaultOrder: { sortOrder: "asc" },
  },
  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    group: "Content",
    description: "Team members shown on the about page.",
    titleField: "name",
    model: "teamMember",
    searchFields: ["name", "role"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "status", label: "Status", type: "status" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "bio", label: "Bio", type: "textarea", rows: 3, full: true },
      { name: "image", label: "Image URL", type: "text", full: true },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "status", label: "Status", type: "select", options: publishOptions, required: true },
    ],
    schema: teamMemberSchema,
    defaultOrder: { sortOrder: "asc" },
  },
  media: {
    key: "media",
    label: "Media library",
    singular: "Media asset",
    group: "System",
    description: "Catalogue of images, videos and documents you can reuse.",
    titleField: "url",
    model: "mediaAsset",
    searchFields: ["url", "alt", "title"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "url", label: "URL" },
      { name: "kind", label: "Kind" },
      { name: "alt", label: "Alt text" },
      { name: "createdAt", label: "Added", type: "date" },
    ],
    fields: [
      { name: "url", label: "URL or path", type: "text", required: true, full: true, hint: "e.g. /images/photo.jpg or https://…" },
      { name: "alt", label: "Alt text", type: "text", full: true },
      { name: "title", label: "Title", type: "text" },
      {
        name: "kind",
        label: "Kind",
        type: "select",
        required: true,
        options: [
          { value: "image", label: "Image" },
          { value: "video", label: "Video" },
          { value: "document", label: "Document" },
        ],
      },
    ],
    schema: mediaAssetSchema,
    defaultOrder: { createdAt: "desc" },
  },
  customers: {
    key: "customers",
    label: "Customers",
    singular: "Customer",
    group: "Leads",
    description: "Customer records created from enquiries.",
    titleField: "name",
    model: "customer",
    searchFields: ["name", "company", "phone", "email"],
    listFields: [],
    specFields: [],
    columns: [
      { name: "name", label: "Name" },
      { name: "company", label: "Company" },
      { name: "phone", label: "Phone" },
      { name: "email", label: "Email" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "company", label: "Company", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "telegram", label: "Telegram", type: "text" },
      { name: "address", label: "Address", type: "text", full: true },
      { name: "notes", label: "Notes", type: "textarea", rows: 4, full: true },
    ],
    schema: customerSchema,
    defaultOrder: { updatedAt: "desc" },
  },
};

export function getResource(key: string): AdminResource | null {
  return adminResources[key] ?? null;
}

export function listResourceGroups(): { group: string; resources: AdminResource[] }[] {
  const groups: { group: string; resources: AdminResource[] }[] = [];
  for (const resource of Object.values(adminResources)) {
    const existing = groups.find((g) => g.group === resource.group);
    if (existing) existing.resources.push(resource);
    else groups.push({ group: resource.group, resources: [resource] });
  }
  return groups;
}
