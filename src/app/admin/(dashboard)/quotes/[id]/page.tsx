import { notFound } from "next/navigation";
import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { LeadUpdateForm } from "@/components/admin/lead-update-form";
import { Badge, statusTone } from "@/components/ui/primitives";
import { getQuoteRequest } from "@/server/leads";
import { QUOTE_STATUSES } from "@/types";
import { formatDate, humanize, telHref, telegramHref, whatsappHref } from "@/lib/utils";

const statusOptions = QUOTE_STATUSES.map((value) => ({ value, label: humanize(value) }));

export default async function AdminQuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const quote = await getQuoteRequest(id);
  if (!quote) notFound();

  const rows: { label: string; value: string }[] = [
    { label: "Company", value: quote.company || "—" },
    { label: "Quantity", value: quote.quantity || "—" },
    { label: "Timeline", value: quote.timeline || "—" },
    { label: "Preferred contact", value: humanize(quote.preferredContact || "phone") },
    { label: "Location", value: [quote.city, quote.country].filter(Boolean).join(", ") || "—" },
    { label: "Source", value: quote.source || "Website" },
    { label: "Attachment", value: quote.attachmentUrl || "—" },
  ];

  return (
    <>
      <AdminPageHeader
        title={quote.fullName}
        description={`Reference ${quote.reference} · received ${formatDate(quote.createdAt, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
        back={{ href: "/admin/quotes", label: "All quote requests" }}
        actions={<Badge tone={statusTone(quote.status)}>{humanize(quote.status)}</Badge>}
      />

      <Flash saved={sp.saved === "1"} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <User className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                <span className="text-ink-900">{quote.fullName}</span>
              </li>
              {quote.phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                  <a href={telHref(quote.phone)} className="text-ink-900 hover:text-accent-700">
                    {quote.phone}
                  </a>
                </li>
              ) : null}
              {quote.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                  <a href={`mailto:${quote.email}`} className="break-all text-ink-900 hover:text-accent-700">
                    {quote.email}
                  </a>
                </li>
              ) : null}
              {quote.telegram ? (
                <li className="flex items-center gap-3">
                  <Send className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                  <a
                    href={telegramHref(quote.telegram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-900 hover:text-accent-700"
                  >
                    Telegram profile
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {quote.phone ? (
                <a href={whatsappHref(quote.phone, `Hello ${quote.fullName}, regarding your quotation request ${quote.reference}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Requirement</h2>
            <p className="mt-3 text-sm font-medium text-ink-900">{quote.productService}</p>
            <div className="prose-industrial mt-4 whitespace-pre-line text-sm">{quote.requirements}</div>
            {quote.notes ? (
              <div className="mt-5 border-t border-steel-100 pt-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Customer notes</p>
                <p className="mt-1.5 whitespace-pre-line text-sm text-steel-600">{quote.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="card overflow-hidden">
            <h2 className="border-b border-steel-200 px-5 py-4 text-sm font-semibold uppercase tracking-wide text-steel-500">
              Details
            </h2>
            <dl>
              {rows.map((row) => (
                <div key={row.label} className="spec-row border-b border-steel-100 px-5">
                  <dt className="spec-label">{row.label}</dt>
                  <dd className="spec-value break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Workflow</h2>
            {quote.attachmentUrl ? (
              <p className="mt-2 text-xs text-steel-500">
                <a href={quote.attachmentUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                  Open customer attachment
                </a>
              </p>
            ) : null}
            <div className="mt-4">
              <LeadUpdateForm
                kind="quote"
                id={quote.id}
                status={quote.status}
                assignedTo={quote.assignedTo}
                internalNotes={quote.internalNotes}
                statusOptions={statusOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
