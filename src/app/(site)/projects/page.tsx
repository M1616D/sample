import type { Metadata } from "next";
import Link from "next/link";

import { ProjectCard } from "@/components/portfolio/project-card";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button, EmptyState } from "@/components/ui/primitives";
import { listProjectCategories, listPublishedProjects } from "@/server/portfolio";
import { getSettings } from "@/server/settings";
import { firstParam, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected machines, products and fabrication work delivered by our workshop — with the challenge, the solution and the result.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const category = firstParam(params, "category");
  const q = firstParam(params, "q");

  const [settings, projects, categories] = await Promise.all([
    getSettings(),
    listPublishedProjects({ categorySlug: category, search: q }),
    listProjectCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Examples of machines, products and fabrication delivered to our customers. Client names are shown only where they have agreed to be identified."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        actions={<Button href="/request-quote" variant="primary">Discuss a project</Button>}
      />

      <section className="section">
        <div className="container">
          {/* Filters: plain GET form + category chips (no JS required) */}
          <div className="mb-8 flex flex-col gap-4 border-b border-steel-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            {categories.length ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/projects"
                  className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                    !category ? "border-ink-900 bg-ink-900 text-white" : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
                  }`}
                >
                  All projects
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/projects?category=${encodeURIComponent(cat.slug)}`}
                    className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                      category === cat.slug
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <form method="get" action="/projects" role="search" className="flex gap-2 lg:max-w-xs">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label htmlFor="project-search" className="sr-only">
                Search projects
              </label>
              <input
                id="project-search"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="Search projects…"
                className="field"
              />
              <button type="submit" className="btn btn-dark shrink-0">
                Search
              </button>
            </form>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title={q || category ? "No projects match your filters" : "Projects are being added"}
              description={
                q || category
                  ? "Try a different search term or clear the filters."
                  : "Project case studies have not been published yet. Contact us to discuss similar work."
              }
              action={<Button href="/projects" variant="dark">View all projects</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Have a similar requirement?"
        description="Tell us what you need built, fabricated or supplied and we will confirm the approach."
      />
    </>
  );
}
