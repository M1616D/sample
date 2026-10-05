import Link from "next/link";
import {
  ArrowRight,
  Check,
  Factory,
  Gauge,
  MapPin,
  Phone,
  Ruler,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProjectCard } from "@/components/portfolio/project-card";
import { CapabilityCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { SocialLinks } from "@/components/layout/social-links";
import { Badge, SectionHeading } from "@/components/ui/primitives";
import { listPublishedProducts } from "@/server/catalogue";
import { listCapabilities, listServices } from "@/server/services";
import { listPublishedProjects } from "@/server/portfolio";
import { getSettings } from "@/server/settings";
import { telHref, telegramHref } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, capabilities, services, machinery, products, projects] = await Promise.all([
    getSettings(),
    listCapabilities(),
    listServices(),
    listPublishedProducts({ kind: "machinery", limit: 3 }),
    listPublishedProducts({ kind: "product", limit: 3 }),
    listPublishedProjects({ featuredOnly: false, limit: 3 }),
  ]);

  const { company, home, social } = settings;
  const addressLine = [company.address, company.city, company.country].filter(Boolean).join(", ");
  const featuredMachinery = machinery.length ? machinery : products;
  const featuredProducts = products.length ? products : machinery;

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="on-dark blueprint relative border-b border-white/10">
        <div className="container grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow">
              <span aria-hidden className="h-px w-8 bg-accent-400" />
              {home.heroEyebrow || company.tagline}
            </p>
            <h1 className="mt-5 text-3xl leading-[1.08] sm:text-4xl lg:text-[3.25rem]">{home.heroTitle}</h1>
            <p className="lead mt-6 max-w-xl">{home.heroSubtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/products" className="btn btn-primary btn-lg">
                Explore Products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/request-quote" className="btn btn-outline btn-lg">
                Request a Quote
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm">
              {company.phone ? (
                <a href={telHref(company.phone)} className="inline-flex items-center gap-2 text-steel-300 hover:text-white">
                  <Phone className="h-4 w-4 text-accent-400" aria-hidden />
                  {company.phone}
                </a>
              ) : null}
              {company.telegram ? (
                <a
                  href={telegramHref(company.telegram, "Hello, I would like to ask about your machinery and manufacturing services.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-steel-300 hover:text-white"
                >
                  <Send className="h-4 w-4 text-accent-400" aria-hidden />
                  Chat on Telegram
                </a>
              ) : null}
              <span className="inline-flex items-center gap-2 text-steel-400">
                <MapPin className="h-4 w-4 text-accent-400" aria-hidden />
                {[company.city, company.country].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <MediaImage
              src={company.heroImage}
              alt={`${company.name} workshop and machinery`}
              aspect="aspect-[4/3]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="border border-white/10"
            />
          </div>
        </div>

        {/* Capability keyword strip — factual, drawn from configured content */}
        {capabilities.length ? (
          <div className="border-t border-white/10">
            <div className="container flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
              {capabilities.slice(0, 6).map((capability) => (
                <span key={capability.id} className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">
                  {capability.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* ====================== COMPANY INTRODUCTION ====================== */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Who we are" title={`${company.name}`} />
            <p className="prose-industrial mt-5">{company.introParagraph}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-dark">
                About the company
              </Link>
              <Link href="/capabilities" className="btn btn-outline">
                Our capabilities
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Factory, title: "Manufacturing", text: "Machines and metal products built in our own workshop." },
                { icon: Ruler, title: "Engineering", text: "Specification, design and layout support before you commit." },
                { icon: Wrench, title: "Fabrication", text: "Cutting, forming, welding, machining and assembly." },
                { icon: ShieldCheck, title: "After-sales", text: "Installation, spare parts, maintenance and technical support." },
              ].map((item) => (
                <div key={item.title} className="card p-5">
                  <item.icon className="h-6 w-6 text-accent-600" aria-hidden />
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CAPABILITIES ========================= */}
      {capabilities.length ? (
        <section className="section bg-steel-50 border-y border-steel-200">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="What we do"
                title="Workshop capabilities"
                description="Our production is organised around the processes below. Each one is backed by dedicated equipment and experienced operators."
              />
              <Link href="/capabilities" className="btn btn-outline hidden sm:inline-flex">
                All capabilities
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.slice(0, 4).map((capability) => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================== FEATURED MACHINERY ====================== */}
      {featuredMachinery.length ? (
        <section className="section">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Machinery"
                title="Machines we build and supply"
                description="Industrial machinery for production, processing and fabrication — supplied with installation and spare-parts support."
              />
              <Link href="/machinery" className="btn btn-outline hidden sm:inline-flex">
                Browse machinery
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMachinery.map((product, index) => (
                <ProductCard key={product.id} product={product} telegram={company.telegram} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ======================= FEATURED PRODUCTS ======================= */}
      {featuredProducts.length ? (
        <section className="section bg-steel-50 border-y border-steel-200">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Products"
                title="Fabricated products and equipment"
                description="Products manufactured to our own designs and to customer specifications."
              />
              <Link href="/products" className="btn btn-outline hidden sm:inline-flex">
                All products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} telegram={company.telegram} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ========================= SERVICES BAND ========================= */}
      {services.length ? (
        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Services"
                title="Support across the machine lifecycle"
                description="From engineering and manufacturing to installation, maintenance and spare parts."
              />
              <Link href="/services" className="btn btn-dark mt-7">
                All services
              </Link>
            </div>
            <div className="lg:col-span-8">
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {services.slice(0, 10).map((service) => (
                  <li key={service.id} className="border-b border-steel-200 py-3.5">
                    <Link href={`/services/${service.slug}`} className="group flex items-baseline justify-between gap-4">
                      <span className="text-sm font-medium text-ink-900 group-hover:text-accent-700">{service.name}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-steel-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-700" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* ======================= FEATURED PROJECTS ======================= */}
      {projects.length ? (
        <section className="section bg-steel-50 border-y border-steel-200">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Projects"
                title="Selected work"
                description="Examples of machines, products and fabrication delivered to our customers."
              />
              <Link href="/projects" className="btn btn-outline hidden sm:inline-flex">
                Project portfolio
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================== INDUSTRIES + WHY US ====================== */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Industries" title="Who we supply" />
            <p className="prose-industrial mt-5">
              Our machines and fabricated products are used across a range of industries. If your requirement is not listed,
              talk to us — custom work is part of what we do.
            </p>
            {home.industries.length ? (
              <ul className="mt-6 grid gap-2.5">
                {home.industries.map((industry) => (
                  <li key={industry} className="flex items-start gap-2.5 text-sm text-steel-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    {industry}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link href="/request-quote" className="btn btn-primary mt-7">
              Discuss your requirement
            </Link>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Why us" title="Why businesses work with us" />
            <div className="mt-8 grid gap-3">
              {home.whyChooseUs.map((item, index) => (
                <div key={item.title} className="flex gap-5 border-t border-steel-200 pt-5">
                  <span className="font-mono text-sm text-accent-600">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-steel-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================== WORKSHOP ========================== */}
      {company.workshopImages.length ? (
        <section className="on-dark blueprint border-y border-white/10">
          <div className="container py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Workshop"
                title="Inside our facility"
                description="Cutting, forming, machining, welding and assembly — under one roof."
              />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {company.workshopImages.slice(0, 4).map((image, index) => (
                <MediaImage
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${company.name} workshop — view ${index + 1}`}
                  aspect="aspect-[4/3]"
                  className="border border-white/10"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* =========================== PROCESS =========================== */}
      {home.process.length ? (
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="How we work"
              title="From enquiry to after-sales support"
              description="A clear process so you know what happens at every stage of your order."
            />
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {home.process.map((step, index) => (
                <li key={step.title} className="border-t-2 border-steel-200 pt-5">
                  <span className="font-mono text-xs text-accent-600">
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ============== STATISTICS (only when real values exist) ============== */}
      {home.stats.length ? (
        <section className="section-tight bg-steel-50 border-y border-steel-200">
          <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="font-mono text-3xl font-semibold text-ink-900">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-ink-800">{stat.label}</p>
                {stat.note ? <p className="mt-1 text-xs text-steel-500">{stat.note}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ========================= LOCATION / MAP ========================= */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Visit us" title="Location & contact" />
            <dl className="mt-6 space-y-4 text-sm">
              {addressLine ? (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Address</dt>
                    <dd className="mt-0.5 text-steel-700">{addressLine}</dd>
                  </div>
                </div>
              ) : null}
              {company.phone ? (
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Phone</dt>
                    <dd className="mt-0.5">
                      <a href={telHref(company.phone)} className="text-steel-700 hover:text-ink-900">
                        {company.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}
              {company.hours.length ? (
                <div className="flex gap-3">
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Working hours</dt>
                    <dd className="mt-1 space-y-1">
                      {company.hours.map((h) => (
                        <span key={h.label} className="flex justify-between gap-6 text-steel-700">
                          <span>{h.label}</span>
                          <span className="font-mono text-xs">{h.value}</span>
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
              <Link href="/contact" className="btn btn-outline">
                Contact page
              </Link>
            </div>

            <SocialLinks social={social} variant="dark" className="mt-7" />
          </div>

          <div className="lg:col-span-7">
            {company.mapEmbedUrl ? (
              <div className="aspect-[16/10] w-full overflow-hidden border border-steel-200">
                <iframe
                  src={company.mapEmbedUrl}
                  title={`Map showing ${company.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="on-dark blueprint flex aspect-[16/10] w-full flex-col items-center justify-center border border-white/10 p-8 text-center">
                <MapPin className="h-8 w-8 text-accent-400" aria-hidden />
                <p className="mt-4 max-w-sm text-sm text-steel-300">
                  An embedded map has not been configured yet. Add a Google Maps embed URL in the admin settings, or open the
                  map link to find us.
                </p>
                {company.mapUrl ? (
                  <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm mt-5">
                    Open in maps
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
