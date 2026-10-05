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
  const machine = await getProductBySlug(slug, "machinery");
  return {
    title: machine ? `QR code — ${machine.name}` : "QR code",
    robots: { index: false, follow: true },
    alternates: { canonical: `/machinery/${slug}/qr` },
  };
}

export default async function MachineryQrPage({ params }: PageProps) {
  const { slug } = await params;
  const machine = await getProductBySlug(slug, "machinery");
  if (!machine) notFound();

  const url = absoluteUrl(`/machinery/${machine.slug}`);
  const dataUrl = await generateQrDataUrl(url);

  return (
    <QrPanel
      title={machine.name}
      url={url}
      dataUrl={dataUrl}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Machinery", href: "/machinery" },
        { label: machine.name, href: `/machinery/${machine.slug}` },
        { label: "QR code" },
      ]}
    />
  );
}
