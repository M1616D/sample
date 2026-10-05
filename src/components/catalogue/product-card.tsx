import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { Badge } from "@/components/ui/primitives";
import type { ProductDTO } from "@/types";
import { telegramHref } from "@/lib/utils";

export function productHref(product: Pick<ProductDTO, "kind" | "slug">): string {
  return `/${product.kind === "machinery" ? "machinery" : "products"}/${product.slug}`;
}

/**
 * Catalogue card. The whole card links to the detail page; the quote and
 * Telegram actions are separate links so they never trigger the card link.
 */
export function ProductCard({
  product,
  telegram,
  priority = false,
}: {
  product: ProductDTO;
  /** Company Telegram handle, for the context-aware enquiry link. */
  telegram?: string;
  priority?: boolean;
}) {
  const href = productHref(product);
  const enquiry = `Hello, I am interested in the ${product.name}. Please send me more information and a quotation.`;

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link href={href} className="block" tabIndex={-1} aria-hidden={false}>
        <MediaImage
          src={product.mainImage}
          alt={`${product.name}${product.categoryName ? ` — ${product.categoryName}` : ""}`}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {product.categoryName ? <Badge tone="neutral">{product.categoryName}</Badge> : null}
          {product.featured ? <Badge tone="accent">Featured</Badge> : null}
          {product.availability ? <Badge tone="success">{product.availability}</Badge> : null}
        </div>

        <h3 className="text-base font-semibold leading-snug text-ink-900">
          <Link href={href} className="transition-colors hover:text-accent-700">
            {product.name}
          </Link>
        </h3>

        {product.shortDescription ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel-600">{product.shortDescription}</p>
        ) : null}

        {/* Two key specs, when present — gives the card a technical feel. */}
        {product.specs.length ? (
          <dl className="mt-4 space-y-1.5 border-t border-steel-100 pt-3">
            {product.specs.slice(0, 2).map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-3 text-xs">
                <dt className="text-steel-500">{spec.label}</dt>
                <dd className="font-mono text-ink-800">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition-colors hover:text-accent-700"
          >
            View details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
            className="text-sm font-medium text-steel-600 transition-colors hover:text-ink-900"
          >
            Request a quote
          </Link>
          {telegram ? (
            <a
              href={telegramHref(telegram, enquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-steel-600 transition-colors hover:text-ink-900"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              Ask on Telegram
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
