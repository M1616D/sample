import type { Metadata, Viewport } from "next";

import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { getSettings } from "@/server/settings";
import { absoluteUrl } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12151a",
};

export async function generateMetadata(): Promise<Metadata> {
  const { company, seo } = await getSettings();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(origin),
    title: {
      default: `${seo.defaultTitle || company.tagline} | ${company.name}`,
      template: seo.titleTemplate?.includes("%s") ? seo.titleTemplate : `%s | ${company.name}`,
    },
    description: seo.defaultDescription || company.shortDescription,
    keywords: seo.keywords,
    applicationName: company.name,
    authors: [{ name: company.name }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: company.name,
      title: `${seo.defaultTitle || company.tagline} | ${company.name}`,
      description: seo.defaultDescription || company.shortDescription,
      url: origin,
      images: [{ url: absoluteUrl(seo.ogImage || "/images/og-default.svg", origin), width: 1200, height: 630, alt: company.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seo.defaultTitle || company.tagline} | ${company.name}`,
      description: seo.defaultDescription || company.shortDescription,
      images: [absoluteUrl(seo.ogImage || "/images/og-default.svg", origin)],
      ...(seo.twitterHandle ? { site: seo.twitterHandle.startsWith("@") ? seo.twitterHandle : `@${seo.twitterHandle}` } : {}),
    },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
