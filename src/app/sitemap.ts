import type { MetadataRoute } from "next";

import { listPublishedProducts, listSpareParts } from "@/server/catalogue";
import { listPosts } from "@/server/content";
import { listPublishedProjects } from "@/server/portfolio";
import { listServices } from "@/server/services";
import { absoluteUrl } from "@/lib/utils";

/** Only routes that are meaningful destinations for a search engine. */
const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/machinery", priority: 0.9, changeFrequency: "weekly" },
  { path: "/spare-parts", priority: 0.7, changeFrequency: "weekly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/capabilities", priority: 0.7, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/company-profile", priority: 0.6, changeFrequency: "monthly" },
  { path: "/news", priority: 0.6, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/request-quote", priority: 0.8, changeFrequency: "yearly" },
  { path: "/service-request", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [products, parts, services, projects, posts] = await Promise.all([
    listPublishedProducts(),
    listSpareParts(),
    listServices(),
    listPublishedProjects(),
    listPosts(),
  ]);

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const product of products) {
    entries.push({
      url: absoluteUrl(`/${product.kind === "machinery" ? "machinery" : "products"}/${product.slug}`),
      lastModified: product.updatedAt ?? product.createdAt ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const part of parts) {
    entries.push({
      url: absoluteUrl(`/spare-parts/${part.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const service of services) {
    entries.push({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const project of projects) {
    entries.push({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt ?? project.createdAt ?? now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    entries.push({
      url: absoluteUrl(`/news/${post.slug}`),
      lastModified: post.publishedAt ?? post.createdAt ?? now,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  return entries;
}
