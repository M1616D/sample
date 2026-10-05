import Link from "next/link";
import { ArrowRight, Check, Download, Phone, QrCode, Send, Share2 } from "lucide-react";

import { ProductGallery } from "@/components/catalogue/product-gallery";
import { ProductCard } from "@/components/catalogue/product-card";
import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { Badge, Breadcrumbs, Button } from "@/components/ui/primitives";
import type { SiteSettings } from "@/config/site";
import type { ProductDTO } from "@/types";
import { telHref, telegramHref, whatsappHref } from "@/lib/utils";

/**
 * Product / machinery detail view. Shared by /products/[slug] and
 * /machinery/[slug] so the two catalogues never drift apart.
 */
export function ProductDetail({
  product,
  settings,
  related,
  basePath,
  sectionLabel,
}: {
  product: ProductDTO;
  settings: SiteSettings;
  related: ProductDTO[];
  /** "/products" or "/machinery" */
  basePath: "products" | "machinery";
  sectionLabel: string;
}) {
  const { company, social } = settings;
  const detailHref = `/${basePath}/${product.slug}`;
  const enquiry = `Hello, I am interested in the ${product.name}. Please send me more information, available models and a quotation.`;
  const shareUrl = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}${detailHref}`;

  return (
    <>
      {/* --------------------------------------------------------- header */}
      <section className="border-b border-steel-200 bg-steel-50">
        <div className="container py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: sectionLabel, href: `/${basePath}` },
              ...(product.categoryName && product.categorySlug
                ? [{ label: product.categoryName, href: `/${basePath}?category=${product.categorySlug}` }]
                : []),
              { label: product.name },
            ]}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {product.categoryName ? <Badge tone="neutral">{product.categoryName}</Badge> : null}
            {product.featured ? <Badge tone="accent">Featured</Badge> : null}
            {product.availability ? <Badge tone="success">{product.availability}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          {product.shortDescription ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-steel-600">{product.shortDescription}</p>
          ) : null}
        </div>
      </section>

      {/* ---------------------------------------------------- gallery + buy */}
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.gallery.length ? product.gallery : product.mainImage ? [product.mainImage] : []}
              alt={product.name}
            />
          </div>

          <aside className="lg:col-span-5">
            <div className="card p-6 lg:sticky lg:top-28">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Request information</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Tell us your requirement and our technical team will confirm the specification and prepare a quotation.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <Button href={`/request-quote?product=${encodeURIComponent(product.slug)}`} variant="primary" className="w-full">
                  Request a Quote
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                {company.phone ? (
                  <a href={telHref(company.phone)} className="btn btn-outline w-full">
                    <Phone className="h-4 w-4" aria-hidden />
                    Call {company.phone}
                  </a>
                ) : null}
                {company.telegram ? (
                  <a
                    href={telegramHref(company.telegram, enquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    Ask about this product
                  </a>
                ) : null}
                {company.whatsapp ? (
                  <a
                    href={whatsappHref(company.whatsapp, enquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              {/* Key specifications */}
              {product.specs.length ? (
                <div className="mt-6 border-t border-steel-200 pt-5">
                  <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Key specifications</h2>
                  <dl className="mt-3">
                    {product.specs.slice(0, 4).map((spec) => (
                      <div key={spec.label} className="spec-row">
                        <dt className="spec-label">{spec.label}</dt>
                        <dd className="spec-value">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Share + QR */}
              <div className="mt-6 flex flex-wrap gap-4 border-t border-steel-200 pt-5 text-xs">
                <Link
                  href={`${detailHref}/qr`}
                  className="inline-flex items-center gap-1.5 font-medium text-steel-600 hover:text-ink-900"
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden />
                  QR code &amp; label
                </Link>
                <span className="inline-flex items-center gap-1.5 text-steel-500">
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  <span className="break-all">{shareUrl}</span>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* -------------------------------------------------------- details */}
      <section className="section-tight border-y border-steel-200 bg-steel-50">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {product.description ? (
              <div>
                <h2 className="text-xl">Overview</h2>
                <div className="prose-industrial mt-4 whitespace-pre-line">{product.description}</div>
              </div>
            ) : null}

            {product.features.length ? (
              <div className="mt-10">
                <h2 className="text-xl">Features</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-steel-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.applications.length ? (
              <div className="mt-10">
                <h2 className="text-xl">Applications</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.applications.map((application) => (
                    <li key={application}>
                      <Badge tone="neutral">{application}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.benefits.length ? (
              <div className="mt-10">
                <h2 className="text-xl">Benefits</h2>
                <ul className="mt-4 space-y-2.5">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5 text-sm text-steel-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            {product.specs.length ? (
              <div className="card p-6">
                <h2 className="text-xl">Technical specifications</h2>
                <p className="mt-1.5 text-xs text-steel-500">
                  Specifications are configured to your order. Values marked “configured to order” are confirmed at quotation stage.
                </p>
                <dl className="mt-5">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="spec-row">
                      <dt className="spec-label">{spec.label}</dt>
                      <dd className="spec-value">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {product.models.length ? (
              <div className="card mt-6 p-6">
                <h2 className="text-xl">Available models</h2>
                <ul className="mt-4 space-y-2.5">
                  {product.models.map((model) => (
                    <li key={model} className="flex items-start gap-2.5 text-sm text-steel-700">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent-600" />
                      {model}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-steel-500">
                  Other configurations can be manufactured on request.
                </p>
              </div>
            ) : null}

            {product.videoUrl ? (
              <div className="card mt-6 p-6">
                <h2 className="text-xl">Video</h2>
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline mt-4 w-full"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Watch machine video
                </a>
              </div>
            ) : null}

            <div className="card mt-6 p-6">
              <h2 className="text-xl">Gallery</h2>
              {product.gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {product.gallery.slice(0, 4).map((image, index) => (
                    <div key={`${image}-${index}`} className="border border-steel-200">
                      <MediaImage
                        src={image}
                        alt={`${product.name} — view ${index + 1}`}
                        aspect="aspect-[4/3]"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-steel-500">
                  Additional machine photographs have not been added yet.
                </p>
              )}
            </div>

            {social.telegram || social.facebook || social.instagram || social.youtube || social.linkedin || social.tiktok ? (
              <p className="mt-6 text-xs text-steel-500">
                Follow us for machine demonstrations and workshop updates — see the links in the footer.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- related */}
      {related.length ? (
        <section className="section">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl">Related items</h2>
              <Link href={`/${basePath}`} className="btn btn-outline btn-sm">
                All {sectionLabel.toLowerCase()}
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} telegram={company.telegram} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        settings={settings}
        context={product.name}
        title={`Interested in the ${product.name}?`}
        description="Send your requirement — material, capacity and site conditions — and we will confirm the specification and prepare a quotation."
      />
    </>
  );
}
