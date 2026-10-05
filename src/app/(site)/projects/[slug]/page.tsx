import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { ProductCard } from "@/components/catalogue/product-card";
import { CtaBand } from "@/components/site/cta-band";
import { Badge, Breadcrumbs, Button } from "@/components/ui/primitives";
import { listPublishedProjects } from "@/server/portfolio";
import { getPublishedProductById } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await listPublishedProjects({});
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projects = await listPublishedProjects({});
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary || undefined,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [projects, settings] = await Promise.all([listPublishedProjects({}), getSettings()]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  // Resolve related products by id, skipping any that were later unpublished.
  const relatedProducts = (await Promise.all(project.productIds.map((id) => getPublishedProductById(id)))).filter(
    (product): product is NonNullable<typeof product> => Boolean(product),
  );

  const dateLabel = formatDate(project.date, { year: "numeric", month: "long" });
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: project.title },
  ];

  return (
    <>
      <section className="border-b border-steel-200 bg-steel-50">
        <div className="container py-10 lg:py-14">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {project.categoryName ? <Badge tone="neutral">{project.categoryName}</Badge> : null}
            {project.client ? <Badge tone="info">{project.client}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{project.title}</h1>
          {project.summary ? <p className="lead mt-4 max-w-3xl">{project.summary}</p> : null}
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-steel-600">
            {dateLabel ? (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent-600" aria-hidden />
                <dt className="sr-only">Date</dt>
                <dd>{dateLabel}</dd>
              </div>
            ) : null}
            {project.location ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-600" aria-hidden />
                <dt className="sr-only">Location</dt>
                <dd>{project.location}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* Main image */}
      <section className="pt-10">
        <div className="container">
          <MediaImage
            src={project.images[0]}
            alt={project.title}
            aspect="aspect-[16/9]"
            priority
            sizes="100vw"
            className="border border-steel-200"
          />
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {project.description ? <p className="prose-industrial text-lg">{project.description}</p> : null}

            <div className="mt-10 space-y-8">
              {[
                { title: "The challenge", body: project.challenge },
                { title: "Our solution", body: project.solution },
                { title: "The result", body: project.result },
              ]
                .filter((section) => Boolean(section.body))
                .map((section) => (
                  <div key={section.title} className="border-t border-steel-200 pt-6">
                    <h2 className="text-xl">{section.title}</h2>
                    <p className="prose-industrial mt-3 whitespace-pre-line">{section.body}</p>
                  </div>
                ))}
            </div>

            {project.videoUrl ? (
              <div className="mt-8">
                <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Watch project video
                </a>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            {project.images.length > 1 ? (
              <div className="card p-4">
                <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Project images</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {project.images.slice(1, 5).map((image, index) => (
                    <MediaImage
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${project.title} — image ${index + 2}`}
                      aspect="aspect-[4/3]"
                      sizes="200px"
                      className="border border-steel-200"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="card mt-6 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Similar requirement?</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                We can prepare a specification and quotation for work like this.
              </p>
              <Button href="/request-quote" variant="dark" className="mt-4 w-full">
                Request a Quote
              </Button>
              <Link href="/projects" className="btn btn-ghost mt-2 w-full">
                All projects
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="section-tight border-y border-steel-200 bg-steel-50">
          <div className="container">
            <h2 className="text-2xl">Products &amp; machines used</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} telegram={settings.company.telegram} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand settings={settings} context={project.title} />
    </>
  );
}
