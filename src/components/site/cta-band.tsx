import Link from "next/link";
import { ArrowRight, Mail, Phone, Send } from "lucide-react";

import type { SiteSettings } from "@/config/site";
import { telHref, telegramHref, whatsappHref } from "@/lib/utils";

/**
 * Reusable contact band. Placed at the end of most public pages so a visitor
 * always has an immediate way to reach the company.
 */
export function CtaBand({
  settings,
  title = "Ready to discuss your requirement?",
  description = "Send us your specification and our technical team will prepare a quotation. You can also call or message us directly.",
  context,
}: {
  settings: SiteSettings;
  title?: string;
  description?: string;
  /** Adds context to the Telegram message, e.g. a product name. */
  context?: string;
}) {
  const { company } = settings;
  const telegramText = context
    ? `Hello, I would like to discuss: ${context}.`
    : "Hello, I would like to discuss a machinery or fabrication requirement.";

  return (
    <section className="on-dark blueprint border-y border-white/10">
      <div className="container py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight">{title}</h2>
            <p className="lead mt-4 max-w-2xl">{description}</p>
          </div>
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/request-quote" className="btn btn-primary btn-lg w-full sm:flex-1 lg:w-full">
                Request a Quote
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              {company.phone ? (
                <a href={telHref(company.phone)} className="btn btn-outline w-full sm:flex-1 lg:w-full">
                  <Phone className="h-4 w-4" aria-hidden />
                  Call {company.phone}
                </a>
              ) : null}
              {company.telegram ? (
                <a
                  href={telegramHref(company.telegram, telegramText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full sm:flex-1 lg:w-full"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Talk to sales on Telegram
                </a>
              ) : null}
              {company.whatsapp ? (
                <a
                  href={whatsappHref(company.whatsapp, telegramText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full sm:flex-1 lg:w-full"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
            {company.email ? (
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-steel-400 lg:justify-start">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
