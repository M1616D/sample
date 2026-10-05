import type { Metadata } from "next";

import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button, EmptyState } from "@/components/ui/primitives";
import { listFaqs } from "@/server/content";
import { getSettings } from "@/server/settings";
import { absoluteUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return {
    title: "Frequently Asked Questions",
    description: `Answers to common questions about ordering, lead times, custom machinery, spare parts, installation and support from ${company.name}.`,
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([listFaqs(), getSettings()]);
  const { company } = settings;

  // Group questions while preserving the order returned from the database.
  const groups: { name: string; items: typeof faqs }[] = [];
  for (const faq of faqs) {
    const name = faq.group.trim() || "General";
    const existing = groups.find((g) => g.name === name);
    if (existing) existing.items.push(faq);
    else groups.push({ name, items: [faq] });
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 30).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      {faqs.length ? (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <PageHeader
        eyebrow="Support"
        title="Frequently asked questions"
        description="How we quote, manufacture, deliver and support our machinery and fabricated products. If your question is not answered here, contact us directly."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        actions={<Button href="/contact" variant="primary">Ask a question</Button>}
      />

      <section className="section">
        <div className="container max-w-4xl">
          {faqs.length === 0 ? (
            <EmptyState
              title="Questions are being prepared"
              description="Our FAQ has not been published yet. Contact us and our team will answer any question about products, delivery or support."
              action={<Button href="/contact" variant="dark">Contact us</Button>}
            />
          ) : (
            <div className="space-y-12">
              {groups.map((group) => (
                <div key={group.name}>
                  <h2 className="text-xl sm:text-2xl">{group.name}</h2>
                  <div className="mt-5 divide-y divide-steel-200 border-y border-steel-200">
                    {group.items.map((faq) => (
                      <details key={faq.id} className="group py-1">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink-900 marker:content-none">
                          {faq.question}
                          <span
                            aria-hidden
                            className="relative h-4 w-4 shrink-0 text-accent-600 transition-transform group-open:rotate-45"
                          >
                            <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                            <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-current" />
                          </span>
                        </summary>
                        <div className="prose-industrial whitespace-pre-line pb-5 pr-8 text-sm">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        settings={settings}
        title={`Still have a question for ${company.name}?`}
        description="Send us your requirement and our technical team will respond with the information you need."
      />
    </>
  );
}
