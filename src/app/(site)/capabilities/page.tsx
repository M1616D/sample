import type { Metadata } from "next";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { listCapabilities } from "@/server/services";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Workshop capabilities covering plasma cutting, welding, metal bending, machining, fabrication, assembly, engineering and custom machine building.",
  alternates: { canonical: "/capabilities" },
};

export default async function CapabilitiesPage() {
  const [capabilities, settings] = await Promise.all([listCapabilities(), getSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title="What our workshop can do"
        description="Our production is organised around the processes below. Each one is backed by dedicated equipment and experienced operators, and we check dimensions before an item moves to the next stage."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Capabilities" }]}
        actions={
          <>
            <Button href="/services" variant="outline">
              Services
            </Button>
            <Button href="/request-quote" variant="primary">
              Request a quote
            </Button>
          </>
        }
      />

      {/* Jump links */}
      {capabilities.length ? (
        <nav aria-label="Capability sections" className="border-b border-steel-200 bg-white">
          <div className="container flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {capabilities.map((capability) => (
              <a
                key={capability.id}
                href={`#${capability.slug}`}
                className="whitespace-nowrap border border-steel-200 px-3 py-1.5 text-xs font-medium text-steel-600 transition-colors hover:border-ink-900 hover:text-ink-900"
              >
                {capability.name}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <section className="section">
        <div className="container">
          {capabilities.length === 0 ? (
            <EmptyState
              title="Capabilities are being configured"
              description="Capability information has not been published yet. Contact us to discuss the work you need done."
              action={<Button href="/contact" variant="dark">Contact us</Button>}
            />
          ) : (
            <div className="space-y-16 lg:space-y-20">
              {capabilities.map((capability, index) => (
                <article
                  key={capability.id}
                  id={capability.slug}
                  className="scroll-mt-28 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12"
                >
                  <div className={index % 2 === 1 ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"}>
                    <MediaImage
                      src={capability.image}
                      alt={`${capability.name} in our workshop`}
                      aspect="aspect-[4/3]"
                      className="border border-steel-200"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>

                  <div className={index % 2 === 1 ? "lg:col-span-7 lg:order-1" : "lg:col-span-7"}>
                    <p className="font-mono text-xs text-accent-600">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-2 text-2xl uppercase tracking-wide sm:text-3xl">{capability.name}</h2>
                    {capability.description ? (
                      <p className="prose-industrial mt-4">{capability.description}</p>
                    ) : null}

                    <div className="mt-7 grid gap-6 sm:grid-cols-2">
                      {capability.equipment.length ? (
                        <div>
                          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Equipment</h3>
                          <ul className="mt-3 space-y-1.5 text-sm text-steel-700">
                            {capability.equipment.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent-600" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {capability.applications.length ? (
                        <div>
                          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Applications</h3>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {capability.applications.map((item) => (
                              <li key={item}>
                                <Badge tone="neutral">{item}</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button
                        href={`/request-quote?capability=${encodeURIComponent(capability.slug)}`}
                        variant="dark"
                        size="sm"
                      >
                        Request this work
                      </Button>
                      <Button href="/projects" variant="outline" size="sm">
                        See related projects
                      </Button>
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
        title="Have a drawing or a sample?"
        description="Send it to us and we will confirm the process, the lead time and the price."
      />
    </>
  );
}
