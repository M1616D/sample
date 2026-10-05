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
  const machines = await listPublishedProducts({ kind: "machinery", limit: 100 });
  return machines.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const machine = await getProductBySlug(slug, "machinery");
  if (!machine) return { title: "Machine not found" };
  const { company } = await getSettings();
  const title = machine.seoTitle || machine.name;
  const description = machine.seoDescription || machine.shortDescription || company.shortDescription;

  return {
    title,
    description,
    alternates: { canonical: `/machinery/${machine.slug}` },
    openGraph: {
      type: "article",
      title: `${title} | ${company.name}`,
      description,
      url: absoluteUrl(`/machinery/${machine.slug}`),
      images: machine.mainImage ? [{ url: absoluteUrl(machine.mainImage) }] : undefined,
    },
  };
}

export default async function MachineryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [machine, settings] = await Promise.all([getProductBySlug(slug, "machinery"), getSettings()]);
  if (!machine) notFound();

  const related = await getRelatedProducts(machine, 3);

  const additionalProperty = [
    ...machine.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
    ...(machine.availability ? [{ "@type": "PropertyValue", name: "Availability", value: machine.availability }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: machine.name,
    description: machine.shortDescription || machine.description.slice(0, 300),
    ...(machine.categoryName ? { category: machine.categoryName } : {}),
    brand: { "@type": "Brand", name: settings.company.name },
    url: absoluteUrl(`/machinery/${machine.slug}`),
    ...(machine.mainImage ? { image: [absoluteUrl(machine.mainImage)] } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={machine} settings={settings} related={related} basePath="machinery" sectionLabel="Machinery" />
    </>
  );
}
