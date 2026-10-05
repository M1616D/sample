import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button, EmptyState } from "@/components/ui/primitives";
import { listPosts } from "@/server/content";
import { getSettings } from "@/server/settings";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Company news, new machinery, workshop updates and technical notes from our engineering and manufacturing team.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const [posts, settings] = await Promise.all([listPosts(), getSettings()]);
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Newsroom"
        title="News & updates"
        description="New machinery, workshop developments and practical notes from our engineering team."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
        actions={<Button href="/request-quote" variant="primary">Request a quote</Button>}
      />

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <EmptyState
              title="No articles published yet"
              description="Company news has not been published. Check back later, or contact us to learn about our latest work."
              action={<Button href="/projects" variant="dark">See our projects</Button>}
            />
          ) : (
            <>
              {/* Featured article */}
              <article className="grid gap-8 border-b border-steel-200 pb-12 lg:grid-cols-12 lg:items-center lg:gap-12">
                <Link href={`/news/${lead.slug}`} className="block lg:col-span-6">
                  <MediaImage
                    src={lead.coverImage}
                    alt={lead.title}
                    aspect="aspect-[16/10]"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="border border-steel-200"
                  />
                </Link>
                <div className="lg:col-span-6">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">
                    {formatDate(lead.publishedAt ?? lead.createdAt, { year: "numeric", month: "long", day: "numeric" })}
                    {lead.author ? ` · ${lead.author}` : ""}
                  </p>
                  <h2 className="mt-3 text-2xl sm:text-3xl">
                    <Link href={`/news/${lead.slug}`} className="hover:text-accent-700">
                      {lead.title}
                    </Link>
                  </h2>
                  {lead.excerpt ? <p className="prose-industrial mt-4">{lead.excerpt}</p> : null}
                  <Link
                    href={`/news/${lead.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-accent-700"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>

              {/* Remaining articles */}
              {rest.length ? (
                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <article key={post.id} className="group flex flex-col">
                      <Link href={`/news/${post.slug}`} className="block">
                        <MediaImage
                          src={post.coverImage}
                          alt={post.title}
                          aspect="aspect-[16/10]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="border border-steel-200"
                        />
                      </Link>
                      <p className="mt-4 text-2xs font-semibold uppercase tracking-wider text-steel-500">
                        {formatDate(post.publishedAt ?? post.createdAt, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-ink-900">
                        <Link href={`/news/${post.slug}`} className="hover:text-accent-700">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-steel-600">{post.excerpt}</p> : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
