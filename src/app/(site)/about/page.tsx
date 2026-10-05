import type { Metadata } from "next";
import { Check, Compass, Eye, Factory, Target } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Badge, Button } from "@/components/ui/primitives";
import { listCapabilities } from "@/server/services";
import { listTeam } from "@/server/content";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "Company history, mission, vision, values, team and workshop — the people and processes behind our machinery and fabrication work.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [settings, team, capabilities] = await Promise.all([getSettings(), listTeam(), listCapabilities()]);
  const { company } = settings;

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title={company.legalName || company.name}
        description={company.introParagraph}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        actions={<Button href="/request-quote" variant="primary">Work with us</Button>}
      />

      {/* Story */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl">Our story</h2>
            <div className="prose-industrial mt-5 whitespace-pre-line">{company.aboutBody}</div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {company.history ? (
                <div className="border-t-2 border-steel-200 pt-5">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-ink-900">How we started</h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel-600">{company.history}</p>
                </div>
              ) : null}
              {company.development ? (
                <div className="border-t-2 border-steel-200 pt-5">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-ink-900">How we developed</h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel-600">{company.development}</p>
                </div>
              ) : null}
              {company.futureDirection ? (
                <div className="border-t-2 border-steel-200 pt-5 sm:col-span-2">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-ink-900">Where we are going</h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel-600">{company.futureDirection}</p>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <MediaImage
              src={company.heroImage}
              alt={`${company.name} workshop`}
              aspect="aspect-[4/3]"
              className="border border-steel-200"
            />
            {company.workshopImages.length ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {company.workshopImages.slice(0, 2).map((image, index) => (
                  <MediaImage
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${company.name} workshop view ${index + 1}`}
                    aspect="aspect-[4/3]"
                    className="border border-steel-200"
                  />
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {/* Mission / vision */}
      <section className="section-tight border-y border-steel-200 bg-steel-50">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div className="card p-7">
            <Target className="h-7 w-7 text-accent-600" aria-hidden />
            <h2 className="mt-4 text-xl">Mission</h2>
            <p className="prose-industrial mt-3">{company.mission}</p>
          </div>
          <div className="card p-7">
            <Eye className="h-7 w-7 text-accent-600" aria-hidden />
            <h2 className="mt-4 text-xl">Vision</h2>
            <p className="prose-industrial mt-3">{company.vision}</p>
          </div>
        </div>
      </section>

      {/* Values + capabilities */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-2xl sm:text-3xl">Our values</h2>
            {company.values.length ? (
              <ul className="mt-6 space-y-3">
                {company.values.map((value) => (
                  <li key={value} className="flex items-start gap-2.5 text-sm text-steel-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-steel-500">Values have not been configured yet.</p>
            )}

            <div className="callout mt-8 flex items-start gap-3 border-l-2 border-accent-600 bg-steel-50 p-4">
              <Compass className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <p className="text-sm text-steel-700">
                We do not claim certifications, partnerships or track records that do not exist. Every figure and credential on
                this site is published by the company itself through the admin panel.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl">Current capabilities</h2>
            <p className="prose-industrial mt-4">
              Our workshop combines several processes under one roof, which lets us control quality from raw material through to
              the finished item.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div key={capability.id} className="card p-4">
                  <div className="flex items-center gap-2.5">
                    <Factory className="h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-900">{capability.name}</h3>
                  </div>
                  {capability.equipment.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {capability.equipment.slice(0, 3).map((item) => (
                        <Badge key={item} tone="neutral">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <Button href="/capabilities" variant="outline" className="mt-6">
              Full capability list
            </Button>
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length ? (
        <section id="team" className="section-tight border-y border-steel-200 bg-steel-50 scroll-mt-28">
          <div className="container">
            <h2 className="text-2xl sm:text-3xl">Our team</h2>
            <p className="prose-industrial mt-4 max-w-3xl">
              The people responsible for production, engineering and after-sales support.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div key={member.id} className="card p-6">
                  {member.image ? (
                    <MediaImage src={member.image} alt={member.name} aspect="aspect-[4/3]" className="mb-4" />
                  ) : (
                    <div className="mb-4 flex h-12 w-12 items-center justify-center border border-steel-200 bg-white">
                      <span aria-hidden className="font-mono text-sm text-accent-600">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="text-base font-semibold text-ink-900">{member.name}</h3>
                  {member.role ? <p className="mt-1 text-xs uppercase tracking-wider text-steel-500">{member.role}</p> : null}
                  {member.bio ? <p className="mt-3 text-sm leading-relaxed text-steel-600">{member.bio}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}
