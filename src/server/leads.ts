import "server-only";

import { prisma } from "@/server/db";
import { parseList } from "@/lib/serialize";
import { reference } from "@/lib/utils";
import type {
  ContactMessageDTO,
  CustomerDTO,
  MessageStatus,
  QuoteRequestDTO,
  QuoteStatus,
  ServiceRequestDTO,
  ServiceStatus,
} from "@/types";
import type { ContactInput, QuoteInput, ServiceRequestInput } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Customer resolution (lightweight CRM)                               */
/* ------------------------------------------------------------------ */

/**
 * Find an existing customer by phone or email, or create one.
 * Used when a quote / service request arrives so history accumulates.
 */
export async function resolveCustomer(input: {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  address?: string;
}): Promise<string | null> {
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  try {
    let existing = null;
    if (phone) {
      existing = await prisma.customer.findFirst({ where: { phone } });
    }
    if (!existing && email) {
      existing = await prisma.customer.findFirst({ where: { email } });
    }
    if (existing) {
      // Fill in any newly supplied details without wiping what we already have.
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: existing.name || input.name,
          company: existing.company || (input.company ?? ""),
          email: existing.email || email,
          telegram: existing.telegram || (input.telegram ?? ""),
          address: existing.address || (input.address ?? ""),
        },
      });
      return existing.id;
    }
    const created = await prisma.customer.create({
      data: {
        name: input.name,
        company: input.company ?? "",
        phone,
        email,
        telegram: input.telegram ?? "",
        address: input.address ?? "",
      },
    });
    return created.id;
  } catch {
    // Customer linkage is a convenience; never block a lead from being stored.
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Lead creation (public)                                              */
/* ------------------------------------------------------------------ */

export async function createQuoteRequest(input: QuoteInput): Promise<{ reference: string }> {
  const productId = input.productId?.trim() || null;
  const customerId = await resolveCustomer({
    name: input.fullName,
    company: input.company,
    phone: input.phone,
    email: input.email,
    telegram: input.telegram,
    address: [input.city, input.country].filter(Boolean).join(", "),
  });

  // Validate the product reference so a forged id cannot create a bad relation.
  let validProductId: string | null = null;
  if (productId) {
    try {
      const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
      validProductId = exists?.id ?? null;
    } catch {
      validProductId = null;
    }
  }

  const row = await prisma.quoteRequest.create({
    data: {
      reference: reference("QT"),
      fullName: input.fullName,
      company: input.company ?? "",
      phone: input.phone,
      email: input.email ?? "",
      telegram: input.telegram ?? "",
      country: input.country ?? "",
      city: input.city ?? "",
      productService: input.productService,
      quantity: input.quantity ?? "",
      requirements: input.requirements,
      timeline: input.timeline ?? "",
      preferredContact: input.preferredContact,
      attachmentUrl: input.attachmentUrl ?? "",
      notes: input.notes ?? "",
      source: input.source ?? "",
      productId: validProductId,
      customerId,
    },
  });
  return { reference: row.reference };
}

export async function createContactMessage(input: ContactInput): Promise<void> {
  const customerId = await resolveCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
  });
  await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email ?? "",
      phone: input.phone ?? "",
      subject: input.subject ?? "",
      message: input.message,
    },
  });
  // Link to a customer record if we can, without failing the submission.
  if (customerId) void customerId;
}

export async function createServiceRequest(input: ServiceRequestInput): Promise<{ reference: string }> {
  const customerId = await resolveCustomer({
    name: input.customerName,
    company: input.company,
    phone: input.phone,
    email: input.email,
    address: input.location,
  });
  const photos = (input.photos ?? "")
    .split(/\r?\n|,/)
    .map((p) => p.trim())
    .filter((p) => /^https?:\/\//i.test(p))
    .slice(0, 10);

  const row = await prisma.serviceRequest.create({
    data: {
      reference: reference("SR"),
      customerName: input.customerName,
      company: input.company ?? "",
      phone: input.phone,
      email: input.email ?? "",
      machine: input.machine,
      serialNumber: input.serialNumber ?? "",
      problem: input.problem,
      description: input.description,
      location: input.location ?? "",
      photos: JSON.stringify(photos),
      customerId,
    },
  });
  return { reference: row.reference };
}

/* ------------------------------------------------------------------ */
/* Admin reads                                                         */
/* ------------------------------------------------------------------ */

export interface QuoteFilter {
  status?: string;
  search?: string;
}

function quoteWhere(filter: QuoteFilter) {
  const where: Record<string, unknown> = {};
  if (filter.status && filter.status !== "ALL") where.status = filter.status;
  if (filter.search?.trim()) {
    const term = filter.search.trim();
    where.OR = [
      { fullName: { contains: term } },
      { company: { contains: term } },
      { reference: { contains: term } },
      { productService: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
    ];
  }
  return where;
}

export async function listQuoteRequests(filter: QuoteFilter = {}, take = 50, skip = 0): Promise<QuoteRequestDTO[]> {
  const rows = await prisma.quoteRequest.findMany({
    where: quoteWhere(filter),
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
  return rows.map(toQuoteDTO);
}

export async function countQuoteRequests(filter: QuoteFilter = {}): Promise<number> {
  return prisma.quoteRequest.count({ where: quoteWhere(filter) });
}

export function toQuoteDTO(r: {
  id: string; reference: string; fullName: string; company: string; phone: string; email: string;
  telegram: string; country: string; city: string; productService: string; quantity: string;
  requirements: string; timeline: string; preferredContact: string; attachmentUrl: string;
  notes: string; status: string; assignedTo: string; internalNotes: string; source: string;
  productId: string | null; customerId: string | null; createdAt: Date; updatedAt: Date;
}): QuoteRequestDTO {
  return {
    id: r.id,
    reference: r.reference,
    fullName: r.fullName,
    company: r.company,
    phone: r.phone,
    email: r.email,
    telegram: r.telegram,
    country: r.country,
    city: r.city,
    productService: r.productService,
    quantity: r.quantity,
    requirements: r.requirements,
    timeline: r.timeline,
    preferredContact: r.preferredContact,
    attachmentUrl: r.attachmentUrl,
    notes: r.notes,
    status: r.status as QuoteStatus,
    assignedTo: r.assignedTo,
    internalNotes: r.internalNotes,
    source: r.source,
    productId: r.productId,
    customerId: r.customerId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function getQuoteRequest(id: string): Promise<QuoteRequestDTO | null> {
  const r = await prisma.quoteRequest.findUnique({ where: { id } });
  return r ? toQuoteDTO(r) : null;
}

/* ---------------------------- Contact messages ---------------------------- */

export async function listContactMessages(take = 100): Promise<ContactMessageDTO[]> {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    subject: r.subject,
    message: r.message,
    status: r.status as MessageStatus,
    createdAt: r.createdAt,
  }));
}

/* ---------------------------- Service requests ---------------------------- */

type ServiceRequestRow = {
  id: string; reference: string; customerName: string; company: string; phone: string; email: string;
  machine: string; serialNumber: string; problem: string; description: string; location: string;
  photos: string; status: string; assignedTo: string; internalNotes: string; customerId: string | null;
  createdAt: Date; updatedAt: Date;
};

export function toServiceRequestDTO(r: ServiceRequestRow): ServiceRequestDTO {
  return {
    id: r.id,
    reference: r.reference,
    customerName: r.customerName,
    company: r.company,
    phone: r.phone,
    email: r.email,
    machine: r.machine,
    serialNumber: r.serialNumber,
    problem: r.problem,
    description: r.description,
    location: r.location,
    photos: parseList(r.photos),
    status: r.status as ServiceStatus,
    assignedTo: r.assignedTo,
    internalNotes: r.internalNotes,
    customerId: r.customerId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function listServiceRequests(take = 100): Promise<ServiceRequestDTO[]> {
  const rows = await prisma.serviceRequest.findMany({ orderBy: { createdAt: "desc" }, take });
  return rows.map(toServiceRequestDTO);
}

export async function getServiceRequest(id: string): Promise<ServiceRequestDTO | null> {
  const r = await prisma.serviceRequest.findUnique({ where: { id } });
  return r ? toServiceRequestDTO(r) : null;
}

/* -------------------------------- Customers ------------------------------- */

export async function listCustomers(search?: string): Promise<CustomerDTO[]> {
  const rows = await prisma.customer.findMany({
    where: search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim() } },
            { company: { contains: search.trim() } },
            { phone: { contains: search.trim() } },
            { email: { contains: search.trim() } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { quoteRequests: true, serviceRequests: true } } },
    take: 200,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    company: r.company,
    phone: r.phone,
    email: r.email,
    telegram: r.telegram,
    address: r.address,
    notes: r.notes,
    createdAt: r.createdAt,
    quoteCount: r._count.quoteRequests,
    serviceCount: r._count.serviceRequests,
  }));
}

export async function getCustomer(id: string): Promise<CustomerDTO | null> {
  const r = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { quoteRequests: true, serviceRequests: true } } },
  });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    company: r.company,
    phone: r.phone,
    email: r.email,
    telegram: r.telegram,
    address: r.address,
    notes: r.notes,
    createdAt: r.createdAt,
    quoteCount: r._count.quoteRequests,
    serviceCount: r._count.serviceRequests,
  };
}

/* ------------------------------- Dashboard -------------------------------- */

export interface DashboardMetrics {
  products: number;
  publishedProducts: number;
  projects: number;
  services: number;
  capabilities: number;
  quotes: number;
  newQuotes: number;
  openQuotes: number;
  customers: number;
  messages: number;
  newMessages: number;
  serviceRequests: number;
  openServiceRequests: number;
  media: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    products,
    publishedProducts,
    projects,
    services,
    capabilities,
    quotes,
    newQuotes,
    openQuotes,
    customers,
    messages,
    newMessages,
    serviceRequests,
    openServiceRequests,
    media,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count(),
    prisma.service.count(),
    prisma.capability.count(),
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.quoteRequest.count({ where: { status: { in: ["NEW", "CONTACTED", "QUOTATION_SENT", "NEGOTIATING"] } } }),
    prisma.customer.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({ where: { status: { notIn: ["COMPLETED", "CLOSED"] } } }),
    prisma.mediaAsset.count(),
  ]);
  return {
    products, publishedProducts, projects, services, capabilities, quotes, newQuotes, openQuotes,
    customers, messages, newMessages, serviceRequests, openServiceRequests, media,
  };
}
