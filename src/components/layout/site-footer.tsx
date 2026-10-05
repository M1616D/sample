import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { SocialLinks } from "@/components/layout/social-links";
import { footerNav } from "@/config/navigation";
import type { SiteSettings } from "@/config/site";
import { telHref, telegramHref } from "@/lib/utils";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { company, social } = settings;
  const year = new Date().getFullYear();
  const addressLine = [company.address, company.city, company.country].filter(Boolean).join(", ");

  const columns = [
    { title: "Company", links: footerNav.company },
    { title: "Catalogue", links: footerNav.catalogue },
    { title: "Support", links: footerNav.support },
  ];

  return (
    <footer className="on-dark blueprint border-t border-white/10">
      <div className="container py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Identity + contact */}
          <div className="lg:col-span-4">
            <Logo name={company.name} logoUrl={company.logo || undefined} variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-steel-400">{company.shortDescription}</p>

            <ul className="mt-6 space-y-3 text-sm">
              {company.phone ? (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                  <a href={telHref(company.phone)} className="hover:text-white">
                    {company.phone}
                  </a>
                </li>
              ) : null}
              {company.email ? (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                  <a href={`mailto:${company.email}`} className="hover:text-white">
                    {company.email}
                  </a>
                </li>
              ) : null}
              {addressLine ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                  <span>{addressLine}</span>
                </li>
              ) : null}
              {company.telegram ? (
                <li className="flex items-start gap-2.5">
                  <Send className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                  <a href={telegramHref(company.telegram)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Message us on Telegram
                  </a>
                </li>
              ) : null}
            </ul>

            <SocialLinks social={social} variant="light" className="mt-6" />
          </div>

          {/* Navigation */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">{column.title}</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-steel-300 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Hours + map link */}
          <div className="lg:col-span-3">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Working hours</h2>
            {company.hours.length ? (
              <ul className="mt-4 space-y-2 text-sm">
                {company.hours.map((h) => (
                  <li key={h.label} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-steel-300">
                      <Clock className="h-3.5 w-3.5 text-accent-400" aria-hidden />
                      {h.label}
                    </span>
                    <span className="font-mono text-xs text-steel-400">{h.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {company.mapUrl ? (
              <a
                href={company.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm mt-5 w-full"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Get directions
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-steel-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName || company.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerNav.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-steel-300">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin/login" className="hover:text-steel-300">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
