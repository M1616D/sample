import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { SocialLinks } from "@/components/layout/social-links";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/primitives";
import { getSettings } from "@/server/settings";
import { absoluteUrl, telHref, telegramHref, whatsappHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return {
    title: "Contact",
    description: `Contact ${company.name} — phone, email, Telegram, address and working hours.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const settings = await getSettings();
  const { company, social } = settings;
  const addressLine = [company.address, company.city, company.region, company.country].filter(Boolean).join(", ");

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.shortDescription,
    url: absoluteUrl("/contact"),
    ...(company.email ? { email: company.email } : {}),
    ...(company.phone ? { telephone: company.phone } : {}),
    ...(addressLine
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: company.address || undefined,
            addressLocality: company.city || undefined,
            addressRegion: company.region || undefined,
            addressCountry: company.country || undefined,
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />

      <PageHeader
        eyebrow="Contact"
        title="Talk to our team"
        description="Send us your requirement, call us, or message us on Telegram. For a detailed quotation, use the request form so we capture your specification correctly."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        actions={<Button href="/request-quote" variant="primary">Request a quote</Button>}
      />

      {/* Quick actions */}
      <section className="border-b border-steel-200 bg-white">
        <div className="container grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {company.phone ? (
            <a href={telHref(company.phone)} className="card card-hover flex items-start gap-3 p-5">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <span>
                <span className="block text-2xs font-semibold uppercase tracking-wider text-steel-500">Call us</span>
                <span className="mt-1 block text-sm font-medium text-ink-900">{company.phone}</span>
              </span>
            </a>
          ) : null}
          {company.telegram ? (
            <a
              href={telegramHref(company.telegram, "Hello, I would like to ask about your products and services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover flex items-start gap-3 p-5"
            >
              <Send className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <span>
                <span className="block text-2xs font-semibold uppercase tracking-wider text-steel-500">Telegram</span>
                <span className="mt-1 block text-sm font-medium text-ink-900">Chat with sales</span>
              </span>
            </a>
          ) : null}
          {company.whatsapp ? (
            <a
              href={whatsappHref(company.whatsapp, "Hello, I would like to ask about your products and services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover flex items-start gap-3 p-5"
            >
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <span>
                <span className="block text-2xs font-semibold uppercase tracking-wider text-steel-500">WhatsApp</span>
                <span className="mt-1 block text-sm font-medium text-ink-900">Message us</span>
              </span>
            </a>
          ) : null}
          {company.email ? (
            <a href={`mailto:${company.email}`} className="card card-hover flex items-start gap-3 p-5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <span>
                <span className="block text-2xs font-semibold uppercase tracking-wider text-steel-500">Email</span>
                <span className="mt-1 block break-all text-sm font-medium text-ink-900">{company.email}</span>
              </span>
            </a>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Details */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl">Visit or contact us</h2>

            <dl className="mt-6 space-y-5">
              {addressLine ? (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Address</dt>
                    <dd className="mt-1 text-sm text-steel-700">{addressLine}</dd>
                  </div>
                </div>
              ) : null}

              {company.hours.length ? (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Working hours</dt>
                    <dd className="mt-1.5 space-y-1 text-sm text-steel-700">
                      {company.hours.map((entry) => (
                        <span key={entry.label} className="flex justify-between gap-6">
                          <span>{entry.label}</span>
                          <span className="font-mono text-xs">{entry.value}</span>
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              {company.mapUrl ? (
                <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                  Get directions
                </a>
              ) : null}
              {company.phone ? (
                <a href={telHref(company.phone)} className="btn btn-outline">
                  <Phone className="h-4 w-4" aria-hidden />
                  Call now
                </a>
              ) : null}
            </div>

            <SocialLinks social={social} variant="dark" className="mt-8" />

            {company.mapEmbedUrl ? (
              <div className="mt-8 aspect-[4/3] overflow-hidden border border-steel-200">
                <iframe
                  src={company.mapEmbedUrl}
                  title={`Map showing ${company.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <p className="mt-8 border border-dashed border-steel-300 p-5 text-sm text-steel-500">
                An embedded map has not been configured. An administrator can add a Google Maps embed URL in Admin → Location.
              </p>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8">
              <h2 className="text-2xl">Send a message</h2>
              <p className="mt-2 text-sm text-steel-600">
                For quotations, the <a href="/request-quote" className="link-underline">quote request form</a> captures more
                detail. Use this form for general enquiries.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
