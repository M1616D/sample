import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { Breadcrumbs, Button } from "@/components/ui/primitives";
import { getPostBySlug, listPosts } from "@/server/content";
import { getSettings } from "@/server/settings";
import { absoluteUrl, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [{ url: absoluteUrl(post.coverImage) }] : undefined,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [post, settings, allPosts] = await Promise.all([getPostBySlug(slug), getSettings(), listPosts()]);
  if (!post) notFound();

  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const dateLabel = formatDate(post.publishedAt ?? post.createdAt, { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <article>
        <section className="border-b border-steel-200 bg-steel-50">
          <div className="container max-w-3xl py-10 lg:py-14">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "News", href: "/news" },
                { label: post.title },
              ]}
            />
            <p className="mt-5 text-2xs font-semibold uppercase tracking-wider text-steel-500">
              {dateLabel}
              {post.author ? ` · ${post.author}` : ""}
            </p>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{post.title}</h1>
            {post.excerpt ? <p className="lead mt-4">{post.excerpt}</p> : null}
          </div>
        </section>

        <div className="container max-w-3xl py-10 lg:py-14">
          {post.coverImage ? (
            <MediaImage
              src={post.coverImage}
              alt={post.title}
              aspect="aspect-[16/9]"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="mb-10 border border-steel-200"
            />
          ) : null}

          <div className="prose-industrial whitespace-pre-line">{post.content}</div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-steel-200 pt-8">
            <Link href="/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-accent-700">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All news
            </Link>
            <Button href="/request-quote" variant="primary" size="sm" className="ml-auto">
              Request a quote
            </Button>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="section-tight border-t border-steel-200 bg-steel-50">
          <div className="container">
            <h2 className="text-xl">More from the newsroom</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((item) => (
                <article key={item.id} className="card card-hover flex flex-col p-5">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">
                    {formatDate(item.publishedAt ?? item.createdAt, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-ink-900">
                    <Link href={`/news/${item.slug}`} className="hover:text-accent-700">
                      {item.title}
                    </Link>
                  </h3>
                  {item.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-steel-600">{item.excerpt}</p> : null}
                  <Link
                    href={`/news/${item.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-900 hover:text-accent-700"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}
