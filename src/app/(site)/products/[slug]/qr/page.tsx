import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QrPanel } from "@/components/site/qr-panel";
import { getProductBySlug } from "@/server/catalogue";
import { generateQrDataUrl } from "@/server/qr";
import { absoluteUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, "product");
  return {
    title: product ? `QR code — ${product.name}` : "QR code",
    robots: { index: false, follow: true },
    alternates: { canonical: `/products/${slug}/qr` },
  };
}

export default async function ProductQrPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug, "product");
  if (!product) notFound();

  const url = absoluteUrl(`/products/${product.slug}`);
  const dataUrl = await generateQrDataUrl(url);

  return (
    <QrPanel
      title={product.name}
      url={url}
      dataUrl={dataUrl}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: product.name, href: `/products/${product.slug}` },
        { label: "QR code" },
      ]}
    />
  );
}
