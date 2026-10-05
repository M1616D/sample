import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Send } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { Badge, Breadcrumbs, Button } from "@/components/ui/primitives";
import { getServiceBySlug, listServices } from "@/server/services";
import { getSettings } from "@/server/settings";
import { telegramHref } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: service.summary || undefined,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, settings, allServices] = await Promise.all([getServiceBySlug(slug), getSettings(), listServices()]);
  if (!service) notFound();

  const others = allServices.filter((item) => item.slug !== service.slug).slice(0, 6);
  const enquiry = `Hello, I would like to enquire about your ${service.name} service.`;

  return (
    <>
      <section className="border-b border-steel-200 bg-steel-50">
        <div className="container py-10 lg:py-14">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
          <h1 className="mt-5 text-3xl leading-tight sm:text-4xl">{service.name}</h1>
          {service.summary ? <p className="lead mt-4 max-w-3xl">{service.summary}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/request-quote?service=${encodeURIComponent(service.slug)}`} variant="primary">
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
                Ask on Telegram
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {service.description ? (
              <div className="prose-industrial whitespace-pre-line">{service.description}</div>
            ) : (
              <p className="prose-industrial">
                Detailed information for this service has not been published yet. Contact us and we will explain how we would
                approach your work.
              </p>
            )}

            {service.features.length ? (
              <div className="mt-10">
                <h2 className="text-xl">What this covers</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-steel-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <MediaImage src={service.image} alt={`${service.name} at ${settings.company.name}`} aspect="aspect-[4/3]" className="border border-steel-200" />

            <div className="card mt-6 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Request this service</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Send us the details and our team will confirm scope, lead time and price.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="neutral">Drawing or sample accepted</Badge>
                <Badge tone="neutral">One-off or repeat batches</Badge>
              </div>
              <Button href={`/request-quote?service=${encodeURIComponent(service.slug)}`} variant="dark" className="mt-5 w-full">
                Request a Quote
              </Button>
            </div>

            {others.length ? (
              <div className="card mt-6 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Other services</h2>
                <ul className="mt-3 divide-y divide-steel-100">
                  {others.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/services/${item.slug}`}
                        className="group flex items-center justify-between gap-3 py-2.5 text-sm text-steel-700 hover:text-ink-900"
                      >
                        {item.name}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-steel-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <CtaBand settings={settings} context={`${service.name} service`} />
    </>
  );
}
