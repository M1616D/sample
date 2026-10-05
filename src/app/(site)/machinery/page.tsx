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
const BASE_PATH = "/machinery";

export const metadata: Metadata = {
  title: "Machinery",
  description:
    "Industrial machinery manufactured and supplied for production, processing and fabrication — with installation, spare parts and technical support.",
  alternates: { canonical: BASE_PATH },
};

export default async function MachineryPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params, "q");
  const category = firstParam(params, "category");
  const availability = firstParam(params, "availability");
  const sort = enumParam(params, "sort", ["order", "name", "newest"]) ?? "order";
  const page = pageParam(params);

  const query = {
    kind: "machinery" as const,
    search: q,
    categorySlug: category,
    availability,
    sort: sort as "order" | "name" | "newest",
  };

  const [settings, machines, total, categories, availabilityOptions] = await Promise.all([
    getSettings(),
    listPublishedProducts({ ...query, limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    countPublishedProducts(query),
    listProductCategoriesWithCounts("machinery"),
    listAvailabilityOptions("machinery"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Machinery"
        title="Industrial machinery"
        description="Machines we manufacture and supply for production, processing and metal fabrication. Tell us what you need to produce and we will confirm the specification."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Machinery" }]}
        actions={
          <>
            <Button href="/products" variant="outline">
              All products
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
            products={machines}
            categories={categories}
            availabilityOptions={availabilityOptions}
            params={{ q, category, availability, sort, page: String(page) }}
            basePath={BASE_PATH}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            telegram={settings.company.telegram}
            searchLabel="Search machinery"
            searchPlaceholder="Search machines by name or purpose…"
          />
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Need a machine that does not exist yet?"
        description="Custom machine building is part of what we do. Describe the process and output you need, and we will engineer the machine around it."
      />
    </>
  );
}
