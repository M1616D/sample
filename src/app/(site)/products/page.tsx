import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/primitives";
import {
  countPublishedProducts,
  listAvailabilityOptions,
  listProductCategoriesWithCounts,
  listPublishedProducts,
} from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { enumParam, firstParam, pageParam, type RawSearchParams } from "@/lib/search-params";

const PAGE_SIZE = 9;
const BASE_PATH = "/products";

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const category = firstParam(params, "category");
  const { seo } = await getSettings();
  return {
    title: category ? `Products — ${category.replace(/-/g, " ")}` : "Products",
    description:
      "Browse industrial machinery, fabricated products and equipment. Filter by category and availability, and request a quotation for any item.",
    alternates: { canonical: category ? `${BASE_PATH}?category=${category}` : BASE_PATH },
    openGraph: { title: `Products | ${seo.defaultTitle}`, description: seo.defaultDescription },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params, "q");
  const category = firstParam(params, "category");
  const availability = firstParam(params, "availability");
  const sort = enumParam(params, "sort", ["order", "name", "newest"]) ?? "order";
  const page = pageParam(params);

  const query = {
    kind: "product" as const,
    search: q,
    categorySlug: category,
    availability,
    sort: sort as "order" | "name" | "newest",
  };

  const [settings, products, total, categories, availabilityOptions] = await Promise.all([
    getSettings(),
    listPublishedProducts({ ...query, limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    countPublishedProducts(query),
    listProductCategoriesWithCounts("product"),
    listAvailabilityOptions("product"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Industrial machinery, fabricated products and equipment. Every item can be requested for quotation — tell us your requirement and our technical team will respond."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
        actions={
          <>
            <Button href="/machinery" variant="outline">
              View machinery
            </Button>
            <Button href="/request-quote" variant="primary">
              Request a quote
            </Button>
          </>
        }
      />

      <section className="section">
        <div className="container">
          <CatalogueView
            products={products}
            categories={categories}
            availabilityOptions={availabilityOptions}
            params={{ q, category, availability, sort, page: String(page) }}
            basePath={BASE_PATH}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            telegram={settings.company.telegram}
          />
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Not sure which product fits your requirement?"
        description="Describe what you need to produce and our team will recommend a specification, capacity and layout."
      />
    </>
  );
}
