import type { Metadata } from "next";

import { ServiceCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button, EmptyState } from "@/components/ui/primitives";
import { listServices } from "@/server/services";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Metal fabrication, plasma cutting, welding, bending, machining, custom machine manufacturing, installation, maintenance, technical support and spare parts.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([listServices(), getSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Engineering, fabrication and support services"
        description="We support machines and metalwork through their whole lifecycle — from manufacturing and installation to maintenance, spare parts and technical support."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        actions={
          <>
            <Button href="/capabilities" variant="outline">
              Workshop capabilities
            </Button>
            <Button href="/request-quote" variant="primary">
              Request a quote
            </Button>
          </>
        }
      />

      <section className="section">
        <div className="container">
          {services.length === 0 ? (
            <EmptyState
              title="Services are being configured"
              description="Service information has not been published yet. Contact us and we will advise on the work you need."
              action={<Button href="/contact" variant="dark">Contact us</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Tell us what needs to be made or fixed"
        description="Describe the work — material, quantity, drawing or sample — and we will confirm the approach, lead time and price."
      />
    </>
  );
}
