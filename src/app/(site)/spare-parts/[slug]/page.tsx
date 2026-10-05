import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { Badge, Breadcrumbs, Button, EmptyState } from "@/components/ui/primitives";
import { getPublishedProductById, getSparePartBySlug, listSpareParts } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { telegramHref } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const parts = await listSpareParts();
  return parts.map((part) => ({ slug: part.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const part = await getSparePartBySlug(slug);
  if (!part) return { title: "Spare part not found" };
  return {
    title: `${part.name}${part.partNumber ? ` (${part.partNumber})` : ""}`,
    description: part.description || `Spare part ${part.name}${part.machine ? ` for ${part.machine}` : ""}.`,
    alternates: { canonical: `/spare-parts/${part.slug}` },
  };
}

export default async function SparePartDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [part, settings] = await Promise.all([getSparePartBySlug(slug), getSettings()]);
  if (!part) notFound();

  const machine = part.productId ? await getPublishedProductById(part.productId) : null;
  const others = (await listSpareParts()).filter((item) => item.slug !== part.slug).slice(0, 6);
  const enquiry = `Hello, I would like to order the spare part ${part.name}${part.partNumber ? ` (${part.partNumber})` : ""}.`;

  return (
    <>
      <section className="border-b border-steel-200 bg-steel-50">
        <div className="container py-10 lg:py-14">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Spare Parts", href: "/spare-parts" },
              { label: part.name },
            ]}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {part.partNumber ? <Badge tone="neutral">{part.partNumber}</Badge> : null}
            {part.availability ? <Badge tone="success">{part.availability}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{part.name}</h1>
          {part.machine ? <p className="lead mt-3">For {part.machine}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/request-quote?part=${encodeURIComponent(part.partNumber || part.slug)}`} variant="primary">
              Request a quote
            </Button>
            {settings.company.telegram ? (
              <a
                href={telegramHref(settings.company.telegram, enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Send className="h-4 w-4" aria-hidden />
                Order on Telegram
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <MediaImage
              src={part.image}
              alt={part.name}
              aspect="aspect-[4/3]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="border border-steel-200"
            />
          </div>

          <div className="lg:col-span-6">
            <h2 className="text-xl">Part details</h2>
            <dl className="mt-4 divide-y divide-steel-100 border-y border-steel-200">
              {part.partNumber ? (
                <div className="spec-row">
                  <dt className="spec-label">Part number</dt>
                  <dd className="spec-value">{part.partNumber}</dd>
                </div>
              ) : null}
              {part.machine ? (
                <div className="spec-row">
                  <dt className="spec-label">Machine</dt>
                  <dd className="spec-value">{part.machine}</dd>
                </div>
              ) : null}
              {part.availability ? (
                <div className="spec-row">
                  <dt className="spec-label">Availability</dt>
                  <dd className="spec-value">{part.availability}</dd>
                </div>
              ) : null}
            </dl>

            {part.description ? <div className="prose-industrial mt-6 whitespace-pre-line">{part.description}</div> : null}

            {machine ? (
              <div className="card mt-6 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Fits</h2>
                <Link
                  href={`/${machine.kind === "machinery" ? "machinery" : "products"}/${machine.slug}`}
                  className="mt-2 flex items-center justify-between gap-3 text-sm font-medium text-ink-900 hover:text-accent-700"
                >
                  {machine.name}
                  <ArrowRight className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                </Link>
              </div>
            ) : null}

            <p className="mt-6 text-xs text-steel-500">
              Always quote the part number and, where available, your machine model and serial number so we can confirm the
              correct component.
            </p>
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="section-tight border-y border-steel-200 bg-steel-50">
          <div className="container">
            <h2 className="text-xl">Other spare parts</h2>
            {others.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((item) => (
                  <article key={item.id} className="card card-hover flex flex-col p-5">
                    <p className="font-mono text-2xs uppercase tracking-wider text-steel-500">{item.partNumber}</p>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-ink-900">
                      <Link href={`/spare-parts/${item.slug}`} className="hover:text-accent-700">
                        {item.name}
                      </Link>
                    </h3>
                    {item.machine ? <p className="mt-1 text-xs text-steel-500">For {item.machine}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No other parts listed" />
            )}
          </div>
        </section>
      ) : null}

      <CtaBand settings={settings} context={`spare part ${part.name}`} />
    </>
  );
}
