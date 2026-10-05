import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { searchSite, type SearchHit } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { humanize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search products, machinery, spare parts, services, projects and news across the website.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const typeLabel: Record<SearchHit["type"], string> = {
  product: "Product",
  machinery: "Machinery",
  service: "Service",
  project: "Project",
  "spare-part": "Spare part",
  post: "News",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params, "q") ?? "";
  const [settings, hits] = await Promise.all([getSettings(), q.length >= 2 ? searchSite(q, 8) : Promise.resolve([])]);

  // Group results by type, keeping a stable, sensible order.
  const order: SearchHit["type"][] = ["product", "machinery", "spare-part", "service", "project", "post"];
  const grouped = order
    .map((type) => ({ type, items: hits.filter((hit) => hit.type === type) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Search the website"
        description="Find products, machinery, spare parts, services, projects and news."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <section className="section">
        <div className="container max-w-4xl">
          <form method="get" action="/search" role="search" className="flex gap-3">
            <label htmlFor="site-search" className="sr-only">
              Search term
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="e.g. brick making machine, welding, spare part…"
              className="field"
              autoFocus
            />
            <button type="submit" className="btn btn-dark shrink-0">
              <Search className="h-4 w-4" aria-hidden />
              Search
            </button>
          </form>

          <div className="mt-10">
            {!q ? (
              <EmptyState
                title="Start typing to search"
                description="Enter at least two characters. You can search by product name, machine, part number or service."
                icon={<Search className="h-8 w-8" aria-hidden />}
              />
            ) : q.length < 2 ? (
              <EmptyState title="Keep typing" description="Please enter at least two characters to search." />
            ) : hits.length === 0 ? (
              <EmptyState
                title={`No results for “${q}”`}
                description="Try a shorter or more general term, or browse the catalogue directly."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button href="/products" variant="dark">
                      Browse products
                    </Button>
                    <Button href="/contact" variant="outline">
                      Contact us
                    </Button>
                  </div>
                }
              />
            ) : (
              <>
                <p className="text-sm text-steel-600">
                  {hits.length} result{hits.length === 1 ? "" : "s"} for <span className="font-medium text-ink-900">“{q}”</span>
                </p>
                <div className="mt-6 space-y-10">
                  {grouped.map((group) => (
                    <div key={group.type}>
                      <h2 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-steel-500">
                        {humanize(typeLabel[group.type])}
                        <span className="h-px flex-1 bg-steel-200" aria-hidden />
                        <span className="font-mono text-xs text-steel-400">{group.items.length}</span>
                      </h2>
                      <ul className="mt-4 divide-y divide-steel-100 border-y border-steel-200">
                        {group.items.map((hit) => (
                          <li key={`${hit.type}-${hit.href}`}>
                            <Link href={hit.href} className="group flex items-start gap-4 py-4">
                              <Badge tone="neutral" className="mt-0.5 shrink-0">
                                {typeLabel[hit.type]}
                              </Badge>
                              <span className="min-w-0 flex-1">
                                <span className="block font-medium text-ink-900 group-hover:text-accent-700">{hit.title}</span>
                                {hit.description ? (
                                  <span className="mt-1 block line-clamp-2 text-sm text-steel-600">{hit.description}</span>
                                ) : null}
                              </span>
                              <ArrowRight
                                className="mt-1 h-4 w-4 shrink-0 text-steel-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-600"
                                aria-hidden
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <CtaBand settings={settings} title="Could not find what you need?" description="Tell us what you are looking for and we will point you to the right machine, part or service." />
    </>
  );
}
