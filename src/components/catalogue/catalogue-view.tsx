import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/catalogue/product-card";
import { Button, EmptyState, Pagination } from "@/components/ui/primitives";
import type { CategoryDTO, ProductDTO } from "@/types";

export interface CatalogueParams {
  q?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: string;
}

/**
 * Catalogue listing used by both /products and /machinery.
 *
 * Filtering is a plain GET form, so it works without JavaScript, is
 * shareable/bookmarkable and is crawlable. Chips give one-tap category access
 * on mobile where a select is slower to use.
 */
export function CatalogueView({
  products,
  categories,
  availabilityOptions,
  params,
  basePath,
  total,
  page,
  pageSize,
  telegram,
  searchLabel = "Search the catalogue",
  searchPlaceholder = "Search by name or description…",
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
  availabilityOptions: string[];
  params: CatalogueParams;
  basePath: string;
  total: number;
  page: number;
  pageSize: number;
  telegram?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
}) {
  const categoriesWithCounts = categories.filter((c) => (c.count ?? 0) > 0 || categories.length <= 8);
  const activeCategory = params.category ?? "";
  const activeAvailability = params.availability ?? "";
  const activeSort = params.sort ?? "order";
  const hasFilters = Boolean(params.q || activeCategory || activeAvailability || activeSort !== "order");

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      {/* ------------------------------------------------------- sidebar */}
      <aside className="lg:col-span-3">
        <form method="get" action={basePath} role="search" className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <SlidersHorizontal className="h-4 w-4 text-accent-600" aria-hidden />
            Filter
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="catalogue-q" className="label">
                {searchLabel}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" aria-hidden />
                <input
                  id="catalogue-q"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder={searchPlaceholder}
                  className="field pl-9"
                />
              </div>
            </div>

            {categoriesWithCounts.length ? (
              <div>
                <label htmlFor="catalogue-category" className="label">
                  Category
                </label>
                <select id="catalogue-category" name="category" defaultValue={activeCategory} className="field">
                  <option value="">All categories</option>
                  {categoriesWithCounts.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                      {typeof category.count === "number" ? ` (${category.count})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {availabilityOptions.length ? (
              <div>
                <label htmlFor="catalogue-availability" className="label">
                  Availability
                </label>
                <select id="catalogue-availability" name="availability" defaultValue={activeAvailability} className="field">
                  <option value="">Any availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="catalogue-sort" className="label">
                Sort by
              </label>
              <select id="catalogue-sort" name="sort" defaultValue={activeSort} className="field">
                <option value="order">Recommended</option>
                <option value="name">Name (A–Z)</option>
                <option value="newest">Recently added</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn btn-dark flex-1">
                Apply
              </button>
              {hasFilters ? (
                <Link href={basePath} className="btn btn-outline">
                  Reset
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        {/* Quick category chips */}
        {categoriesWithCounts.length ? (
          <div className="mt-6 hidden lg:block">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-steel-500">Browse by category</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={basePath}
                  className={`flex items-center justify-between px-2.5 py-2 text-sm ${
                    !activeCategory ? "bg-ink-900 text-white" : "text-steel-700 hover:bg-steel-100"
                  }`}
                >
                  All
                  <span className="font-mono text-xs text-current opacity-70">{total}</span>
                </Link>
              </li>
              {categoriesWithCounts.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`${basePath}?category=${encodeURIComponent(category.slug)}`}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 text-sm ${
                      activeCategory === category.slug ? "bg-ink-900 text-white" : "text-steel-700 hover:bg-steel-100"
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    {typeof category.count === "number" ? (
                      <span className="font-mono text-xs opacity-70">{category.count}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      {/* --------------------------------------------------------- results */}
      <div className="lg:col-span-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 pb-4">
          <p className="text-sm text-steel-600">
            <span className="font-semibold text-ink-900">{total}</span> {total === 1 ? "result" : "results"}
            {params.q ? (
              <>
                {" "}
                for <span className="font-medium text-ink-800">“{params.q}”</span>
              </>
            ) : null}
          </p>
          {hasFilters ? (
            <Link href={basePath} className="text-xs font-medium text-steel-500 underline underline-offset-4 hover:text-ink-900">
              Clear all filters
            </Link>
          ) : null}
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No items match your filters"
            description="Try a different search term, or clear the filters to see the full catalogue."
            action={
              <Button href={basePath} variant="dark">
                View everything
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} telegram={telegram} priority={index < 3 && page === 1} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          baseHref={basePath}
          params={{ q: params.q, category: params.category, availability: params.availability, sort: params.sort }}
          className="mt-10"
        />
      </div>
    </div>
  );
}
