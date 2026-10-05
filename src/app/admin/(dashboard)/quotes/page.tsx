import Link from "next/link";
import { Search } from "lucide-react";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { Badge, Pagination, statusTone } from "@/components/ui/primitives";
import { countQuoteRequests, listQuoteRequests } from "@/server/leads";
import { QUOTE_STATUSES } from "@/types";
import { firstParam, pageParam, type RawSearchParams } from "@/lib/search-params";
import { formatDate, humanize, truncate } from "@/lib/utils";

const PAGE_SIZE = 25;

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const sp = await searchParams;
  const status = firstParam(sp, "status");
  const q = firstParam(sp, "q");
  const page = pageParam(sp);

  const filter = { status: status && QUOTE_STATUSES.includes(status as never) ? status : undefined, search: q };

  const [quotes, total] = await Promise.all([
    listQuoteRequests(filter, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countQuoteRequests(filter),
  ]);

  return (
    <>
      <AdminPageHeader title="Quote requests" description="Enquiries submitted through the quote form." />
      <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} error={firstParam(sp, "error")} />

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/quotes"
          className={`border px-3 py-1.5 text-xs font-medium ${
            !filter.status ? "border-ink-900 bg-ink-900 text-white" : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
          }`}
        >
          All
        </Link>
        {QUOTE_STATUSES.map((option) => (
          <Link
            key={option}
            href={`/admin/quotes?status=${option}`}
            className={`border px-3 py-1.5 text-xs font-medium ${
              filter.status === option
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
            }`}
          >
            {humanize(option)}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form method="get" action="/admin/quotes" role="search" className="flex gap-2">
          {filter.status ? <input type="hidden" name="status" value={filter.status} /> : null}
          <label htmlFor="quote-search" className="sr-only">
            Search quotes
          </label>
          <input
            id="quote-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Name, company, reference…"
            className="field max-w-xs"
          />
          <button type="submit" className="btn btn-dark btn-sm shrink-0">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </form>
        <p className="text-xs text-steel-500">
          {total} request{total === 1 ? "" : "s"}
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-base font-semibold text-ink-900">No quote requests found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">
            Requests submitted through the public form will appear here together with their reference number.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <caption className="sr-only">Quote requests</caption>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Requirement</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="align-top font-mono text-xs">
                      <Link href={`/admin/quotes/${quote.id}`} className="text-ink-900 hover:text-accent-700">
                        {quote.reference}
                      </Link>
                    </td>
                    <td className="align-top">
                      <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-ink-900 hover:text-accent-700">
                        {quote.fullName}
                      </Link>
                      <p className="text-xs text-steel-500">
                        {[quote.company, quote.phone].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="align-top text-steel-600">{truncate(quote.productService, 60)}</td>
                    <td className="align-top">
                      <Badge tone={statusTone(quote.status)}>{humanize(quote.status)}</Badge>
                    </td>
                    <td className="align-top whitespace-nowrap text-xs text-steel-500">{formatDate(quote.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        baseHref="/admin/quotes"
        params={{ status: filter.status, q }}
        className="mt-6"
      />
    </>
  );
}
