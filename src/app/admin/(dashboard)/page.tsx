import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Images,
  MessageSquare,
  Package,
  Users,
  Wrench,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Badge, statusTone } from "@/components/ui/primitives";
import { getDashboardMetrics, listQuoteRequests } from "@/server/leads";
import { getSession } from "@/server/auth";
import { formatDate, humanize, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const cards = [
  { key: "quotes", label: "Quote requests", icon: FileText, href: "/admin/quotes" },
  { key: "serviceRequests", label: "Service requests", icon: Wrench, href: "/admin/service-requests" },
  { key: "messages", label: "Messages", icon: MessageSquare, href: "/admin/messages" },
  { key: "customers", label: "Customers", icon: Users, href: "/admin/customers" },
  { key: "products", label: "Products & machinery", icon: Package, href: "/admin/products" },
  { key: "media", label: "Media assets", icon: Images, href: "/admin/media" },
] as const;

export default async function AdminDashboardPage() {
  const [session, metrics, recentQuotes] = await Promise.all([
    getSession(),
    getDashboardMetrics(),
    listQuoteRequests({}, 6),
  ]);

  return (
    <>
      <AdminPageHeader
        title={`Welcome${session?.name ? `, ${session.name.split(" ")[0]}` : ""}`}
        description="An overview of enquiries, catalogue health and recent activity."
        actions={
          <>
            <Link href="/admin/products/new" className="btn btn-dark btn-sm">
              Add product
            </Link>
            <Link href="/admin/news/new" className="btn btn-outline btn-sm">
              Write article
            </Link>
          </>
        }
      />

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const value = metrics[card.key];
          const badge =
            card.key === "quotes" && metrics.newQuotes
              ? `${metrics.newQuotes} new`
              : card.key === "messages" && metrics.newMessages
                ? `${metrics.newMessages} new`
                : card.key === "serviceRequests" && metrics.openServiceRequests
                  ? `${metrics.openServiceRequests} open`
                  : card.key === "products" && metrics.publishedProducts
                    ? `${metrics.publishedProducts} published`
                    : null;
          return (
            <Link key={card.key} href={card.href} className="card card-hover flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-ink-900">{value}</p>
                {badge ? (
                  <p className="mt-2">
                    <Badge tone="accent">{badge}</Badge>
                  </p>
                ) : null}
              </div>
              <card.icon className="h-5 w-5 shrink-0 text-steel-300" aria-hidden />
            </Link>
          );
        })}
      </div>

      {/* Pipeline summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Open quotes</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{metrics.openQuotes}</p>
          <p className="mt-1 text-xs text-steel-500">New, contacted, quoted or negotiating</p>
        </div>
        <div className="card p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Projects</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{metrics.projects}</p>
          <p className="mt-1 text-xs text-steel-500">Portfolio case studies</p>
        </div>
        <div className="card p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Catalogue</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{metrics.products}</p>
          <p className="mt-1 text-xs text-steel-500">{metrics.capabilities} capabilities · {metrics.services} services</p>
        </div>
      </div>

      {/* Recent quotes */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-steel-200 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Recent quote requests</h2>
          <Link href="/admin/quotes" className="inline-flex items-center gap-1 text-xs font-medium text-steel-500 hover:text-ink-900">
            View all
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-steel-500">
            No quote requests yet. They will appear here as soon as a customer submits the form.
          </p>
        ) : (
          <ul className="divide-y divide-steel-100">
            {recentQuotes.map((quote) => (
              <li key={quote.id}>
                <Link href={`/admin/quotes/${quote.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-steel-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {quote.fullName}
                      {quote.company ? <span className="text-steel-500"> · {quote.company}</span> : null}
                    </p>
                    <p className="truncate text-xs text-steel-500">
                      {quote.reference} · {truncate(quote.productService, 70)}
                    </p>
                  </div>
                  <Badge tone={statusTone(quote.status)}>{humanize(quote.status)}</Badge>
                  <span className="hidden shrink-0 text-xs text-steel-400 sm:block">{formatDate(quote.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
