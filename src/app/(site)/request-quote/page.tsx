import type { Metadata } from "next";
import { FileText, Phone, Send, ShieldCheck } from "lucide-react";

import { QuoteForm } from "@/components/forms/quote-form";
import { PageHeader } from "@/components/site/page-header";
import { getProductBySlug, listPublishedProducts } from "@/server/catalogue";
import { listCapabilities, listServices } from "@/server/services";
import { getSettings } from "@/server/settings";
import { telHref, telegramHref } from "@/lib/utils";
import { firstParam, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a quotation for industrial machinery, fabricated products, fabrication services or spare parts. Tell us your requirement and our technical team will respond.",
  alternates: { canonical: "/request-quote" },
};

/**
 * The quote page is the primary conversion point. When a visitor arrives from a
 * product page (?product=slug) the product is pre-filled, so they never have to
 * type it again.
 */
export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const productSlug = firstParam(params, "product");
  const serviceSlug = firstParam(params, "service");
  const capabilitySlug = firstParam(params, "capability");

  const [settings, products, services, capabilities] = await Promise.all([
    getSettings(),
    listPublishedProducts({ limit: 200, sort: "name" }),
    listServices(),
    listCapabilities(),
  ]);

  const selectedProduct = productSlug ? await getProductBySlug(productSlug) : null;
  const selectedService = serviceSlug ? services.find((s) => s.slug === serviceSlug) : null;
  const selectedCapability = capabilitySlug ? capabilities.find((c) => c.slug === capabilitySlug) : null;

  const productOptions = [
    ...products.map((product) => ({
      value: product.kind === "machinery" ? `Machine: ${product.name}` : `Product: ${product.name}`,
      label: product.kind === "machinery" ? `Machinery — ${product.name}` : `Product — ${product.name}`,
    })),
    ...services.map((service) => ({ value: `Service: ${service.name}`, label: `Service — ${service.name}` })),
    ...capabilities.map((capability) => ({
      value: `Capability: ${capability.name}`,
      label: `Capability — ${capability.name}`,
    })),
    { value: "Spare parts", label: "Spare parts" },
    { value: "Other / not listed", label: "Other / not listed" },
  ];

  const defaultProductService = selectedProduct
    ? `${selectedProduct.kind === "machinery" ? "Machine" : "Product"}: ${selectedProduct.name}`
    : selectedService
      ? `Service: ${selectedService.name}`
      : selectedCapability
        ? `Capability: ${selectedCapability.name}`
        : "";

  return (
    <>
      <PageHeader
        eyebrow="Quotation"
        title="Request a quote"
        description={
          selectedProduct
            ? `You are requesting a quotation for ${selectedProduct.name}. Add your requirement and we will confirm the specification and price.`
            : "Tell us what you need to buy, build or fabricate. The more detail you provide, the more accurate our quotation will be."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          ...(selectedProduct
            ? [
                { label: "Products", href: selectedProduct.kind === "machinery" ? "/machinery" : "/products" },
                {
                  label: selectedProduct.name,
                  href: `/${selectedProduct.kind === "machinery" ? "machinery" : "products"}/${selectedProduct.slug}`,
                },
              ]
            : []),
          { label: "Request a Quote" },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <QuoteForm
              productOptions={productOptions}
              defaultProductService={defaultProductService}
              defaultProductId={selectedProduct?.id ?? ""}
              defaultProductSlug={selectedProduct?.slug ?? ""}
              source={selectedProduct ? `product:${selectedProduct.slug}` : "request-quote"}
            />
          </div>

          {/* Aside */}
          <aside className="lg:col-span-4">
            <div className="card p-6 lg:sticky lg:top-28">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">What happens next</h2>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  "We review your requirement and may ask one or two clarifying questions.",
                  "Our technical team prepares a specification and a clear commercial offer.",
                  "You receive the quotation with lead time, terms and any available options.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-mono text-xs text-accent-600">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-steel-700">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 border-t border-steel-200 pt-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Prefer to talk?</h2>
                <div className="mt-3 flex flex-col gap-2">
                  {settings.company.phone ? (
                    <a href={telHref(settings.company.phone)} className="btn btn-outline btn-sm w-full">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {settings.company.phone}
                    </a>
                  ) : null}
                  {settings.company.telegram ? (
                    <a
                      href={telegramHref(
                        settings.company.telegram,
                        selectedProduct
                          ? `Hello, I am interested in the ${selectedProduct.name}.`
                          : "Hello, I would like to request a quotation.",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm w-full"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden />
                      Message on Telegram
                    </a>
                  ) : null}
                </div>
              </div>

              <ul className="mt-6 space-y-3 border-t border-steel-200 pt-5 text-xs text-steel-600">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden />
                  Your details are used only to answer this enquiry.
                </li>
                <li className="flex items-start gap-2.5">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden />
                  Have a drawing? Paste a link to it in the form.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
