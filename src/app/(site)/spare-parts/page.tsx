import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { listSpareParts } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { telegramHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Spare Parts",
  description:
    "Spare parts, consumables and wear items for the machinery we build and supply. Search by part number or machine, and request a quotation.",
  alternates: { canonical: "/spare-parts" },
};

export default async function SparePartsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params, "q");
  const [settings, parts] = await Promise.all([getSettings(), listSpareParts(q)]);
  const telegram = settings.company.telegram;

  return (
    <>
      <PageHeader
        eyebrow="After-sales"
        title="Spare parts"
        description="Parts, consumables and wear items for the machines we build and supply. Search by part number or machine name, and request a quotation for what you need."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Spare Parts" }]}
        actions={<Button href="/service-request" variant="primary">Request service</Button>}
      />

      <section className="section">
        <div className="container">
          <form method="get" action="/spare-parts" role="search" className="mb-8 flex gap-3 border-b border-steel-200 pb-6 sm:max-w-md">
            <label htmlFor="spare-parts-search" className="sr-only">
              Search spare parts
            </label>
            <input
              id="spare-parts-search"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="Part number, name or machine…"
              className="field"
            />
            <button type="submit" className="btn btn-dark shrink-0">
              Search
            </button>
          </form>

          {parts.length === 0 ? (
            <EmptyState
              title={q ? `No parts match “${q}”` : "Spare parts are being catalogued"}
              description={
                q
                  ? "Try a different part number or machine name, or contact us with a photo of the part."
                  : "Our spare parts list has not been published yet. Contact us with the machine model and we will identify the part you need."
              }
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  {q ? <Button href="/spare-parts" variant="dark">View all parts</Button> : null}
                  <Button href="/contact" variant="outline">
                    Ask about a part
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {parts.map((part) => (
                <article key={part.id} className="card card-hover group flex flex-col overflow-hidden">
                  <Link href={`/spare-parts/${part.slug}`} className="block">
                    <MediaImage
                      src={part.image}
                      alt={part.name}
                      aspect="aspect-[4/3]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {part.partNumber ? <Badge tone="neutral">{part.partNumber}</Badge> : null}
                      {part.availability ? <Badge tone="success">{part.availability}</Badge> : null}
                    </div>
                    <h3 className="text-base font-semibold leading-snug text-ink-900">
                      <Link href={`/spare-parts/${part.slug}`} className="hover:text-accent-700">
                        {part.name}
                      </Link>
                    </h3>
                    {part.machine ? <p className="mt-1.5 text-xs uppercase tracking-wider text-steel-500">For {part.machine}</p> : null}
                    {part.description ? <p className="mt-2 line-clamp-3 text-sm text-steel-600">{part.description}</p> : null}
                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                      <Link
                        href={`/request-quote?part=${encodeURIComponent(part.partNumber || part.slug)}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-accent-700"
                      >
                        Request a quote
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      {telegram ? (
                        <a
                          href={telegramHref(telegram, `Hello, I would like to order the spare part ${part.name}${part.partNumber ? ` (${part.partNumber})` : ""}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-steel-600 hover:text-ink-900"
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden />
                          Telegram
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Cannot find the part you need?"
        description="Send us the machine model, serial number or a photo of the part and we will identify it for you."
      />
    </>
  );
}
