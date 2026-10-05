import type { Metadata } from "next";
import { Check, Mail, MapPin, Phone, Send } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { PrintButton } from "@/components/site/print-button";
import { Breadcrumbs, Button } from "@/components/ui/primitives";
import { listProductCategoriesWithCounts } from "@/server/catalogue";
import { listCapabilities, listServices } from "@/server/services";
import { getSettings } from "@/server/settings";
import { telHref, telegramHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return {
    title: "Company Profile",
    description: `A concise profile of ${company.name}: what we do, our capabilities, products and services.`,
    alternates: { canonical: "/company-profile" },
  };
}

export default async function CompanyProfilePage() {
  const [settings, capabilities, services, categories] = await Promise.all([
    getSettings(),
    listCapabilities(),
    listServices(),
    listProductCategoriesWithCounts(),
  ]);
  const { company, social } = settings;
  const addressLine = [company.address, company.city, company.region, company.country].filter(Boolean).join(", ");

  return (
    <>
      {/* Cover */}
      <section className="on-dark blueprint border-b border-white/10 print:bg-white print:text-ink-900">
        <div className="container py-12 lg:py-16">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Company Profile" }]}
            className="text-steel-400 print:hidden [&_a:hover]:text-white"
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow">
                <span aria-hidden className="h-px w-6 bg-current opacity-60" />
                Company Profile
              </p>
              <h1 className="mt-3 text-3xl leading-tight sm:text-4xl print:text-ink-900">{company.legalName || company.name}</h1>
              <p className="lead mt-4 print:text-steel-700">{company.introParagraph}</p>
              <div className="mt-7 flex flex-wrap gap-3 print:hidden">
                <PrintButton />
                <Button href="/request-quote" variant="primary">
                  Request a quote
                </Button>
                <Button href="/about" variant="outline">
                  About us
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <MediaImage
                src={company.heroImage}
                alt={`${company.name} workshop`}
                aspect="aspect-[4/3]"
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="border border-white/10 print:border-steel-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h2 className="text-2xl">Who we are</h2>
            <div className="prose-industrial mt-4 whitespace-pre-line">{company.aboutBody}</div>
          </div>
          <div className="lg:col-span-5">
            <div className="card p-6 print:border-steel-300 print:shadow-none">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Contact</h2>
              <ul className="mt-4 space-y-3 text-sm text-steel-700">
                {addressLine ? (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    <span>{addressLine}</span>
                  </li>
                ) : null}
                {company.phone ? (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    <a href={telHref(company.phone)} className="hover:text-ink-900">
                      {company.phone}
                    </a>
                  </li>
                ) : null}
                {company.email ? (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    <a href={`mailto:${company.email}`} className="break-all hover:text-ink-900">
                      {company.email}
                    </a>
                  </li>
                ) : null}
                {company.telegram ? (
                  <li className="flex gap-3 print:hidden">
                    <Send className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    <a
                      href={telegramHref(company.telegram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink-900"
                    >
                      Telegram
                    </a>
                  </li>
                ) : null}
              </ul>
              {social.telegram || social.facebook || social.linkedin || social.youtube ? (
                <p className="mt-4 border-t border-steel-100 pt-4 text-xs text-steel-500">
                  Social and messaging links are available on our contact page.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="section-tight border-y border-steel-200 bg-steel-50 print:bg-white">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div className="card p-7 print:border-steel-300 print:shadow-none">
            <h2 className="text-lg">Mission</h2>
            <p className="prose-industrial mt-3">{company.mission}</p>
          </div>
          <div className="card p-7 print:border-steel-300 print:shadow-none">
            <h2 className="text-lg">Vision</h2>
            <p className="prose-industrial mt-3">{company.vision}</p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      {capabilities.length ? (
        <section className="section">
          <div className="container">
            <h2 className="text-2xl">Workshop capabilities</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <div key={capability.id} className="card p-5 print:break-inside-avoid print:border-steel-300 print:shadow-none">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-900">{capability.name}</h3>
                  {capability.description ? (
                    <p className="mt-2 line-clamp-4 text-sm text-steel-600">{capability.description}</p>
                  ) : null}
                  {capability.equipment.length ? (
                    <ul className="mt-3 space-y-1 text-xs text-steel-600">
                      {capability.equipment.slice(0, 4).map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent-600" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Products & services */}
      <section className="section-tight border-y border-steel-200 bg-steel-50 print:bg-white">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">Product range</h2>
            {categories.length ? (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between gap-3 border-b border-steel-200 py-2 text-sm text-steel-700">
                    {category.name}
                    <span className="font-mono text-xs text-steel-500">{category.count ?? 0}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-steel-500">Product categories have not been published yet.</p>
            )}
          </div>
          <div>
            <h2 className="text-2xl">Services</h2>
            {services.length ? (
              <ul className="mt-5 space-y-2">
                {services.map((service) => (
                  <li key={service.id} className="border-b border-steel-200 py-2 text-sm text-steel-700">
                    {service.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-steel-500">Services have not been published yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section print:hidden">
        <div className="container text-center">
          <p className="text-sm text-steel-500">
            Use <span className="font-medium text-ink-800">Print / Save as PDF</span> at the top of this page to create a copy
            of this profile to share or attach to a tender.
          </p>
        </div>
      </section>
    </>
  );
}
