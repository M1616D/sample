import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/catalogue/product-detail";
import { getProductBySlug, getRelatedProducts, listPublishedProducts } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { absoluteUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Pre-render the catalogue at build time; new items render on demand.
  const products = await listPublishedProducts({ kind: "product", limit: 100 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, "product");
  if (!product) return { title: "Product not found" };
  const { company } = await getSettings();
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.shortDescription || company.shortDescription;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "article",
      title: `${title} | ${company.name}`,
      description,
      url: absoluteUrl(`/products/${product.slug}`),
      images: product.mainImage ? [{ url: absoluteUrl(product.mainImage) }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug, "product"), getSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 3);

  // Product structured data. Only fields we genuinely have are emitted.
  // No `offers`/price: prices are quoted per order, and inventing one would
  // misrepresent the business.
  const additionalProperty = [
    ...product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
    ...(product.availability ? [{ "@type": "PropertyValue", name: "Availability", value: product.availability }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description.slice(0, 300),
    ...(product.categoryName ? { category: product.categoryName } : {}),
    brand: { "@type": "Brand", name: settings.company.name },
    url: absoluteUrl(`/products/${product.slug}`),
    ...(product.mainImage ? { image: [absoluteUrl(product.mainImage)] } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} settings={settings} related={related} basePath="products" sectionLabel="Products" />
    </>
  );
}
