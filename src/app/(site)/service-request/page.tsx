import type { Metadata } from "next";
import { Clock, ShieldCheck, Wrench } from "lucide-react";

import { ServiceRequestForm } from "@/components/forms/service-request-form";
import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/primitives";
import { listPublishedProducts } from "@/server/catalogue";
import { getSettings } from "@/server/settings";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Service Request",
  description:
    "Report a machine fault or request maintenance, repair, installation or spare parts. Log a request and our technical team will respond.",
  alternates: { canonical: "/service-request" },
};

export default async function ServiceRequestPage() {
  const [settings, machinery] = await Promise.all([getSettings(), listPublishedProducts({ kind: "machinery" })]);
  const { company } = settings;
  const machineNames = machinery.map((machine) => machine.name);

  return (
    <>
      <PageHeader
        eyebrow="After-sales"
        title="Service request"
        description="Report a fault, request maintenance or installation, or order spare parts. Tell us the machine and the problem, and our technical team will respond with the next step."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Service Request" }]}
        actions={
          company.phone ? (
            <Button href={telHref(company.phone)} variant="outline">
              Call {company.phone}
            </Button>
          ) : undefined
        }
      />

      <section className="border-b border-steel-200 bg-white">
        <div className="container grid gap-4 py-8 sm:grid-cols-3">
          {[
            { icon: Wrench, title: "Repairs & maintenance", text: "Machines built by us or supplied by us." },
            { icon: Clock, title: "Fast triage", text: "We review the problem and confirm the approach." },
            { icon: ShieldCheck, title: "Genuine parts", text: "Correct components for your machine model." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-steel-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8">
              <h2 className="text-2xl">Log a service request</h2>
              <p className="mt-2 text-sm text-steel-600">
                Provide as much detail as you can. Fields marked with an asterisk are required.
              </p>
              <div className="mt-6">
                <ServiceRequestForm machines={machineNames} />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">To help us respond quickly</h2>
              <ul className="mt-4 space-y-3 text-sm text-steel-700">
                {[
                  "The machine model and serial number, if you have them",
                  "When the problem started and what the machine does now",
                  "Any error messages, unusual noise, vibration or leaks",
                  "Photo or video links so we can see the condition",
                  "Your site location, so we can plan a visit if needed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card mt-6 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Already have a reference?</h2>
              <p className="mt-2 text-sm text-steel-600">
                If you have already logged a request, quote your reference when you call or message us so we can find it
                immediately.
              </p>
              <Button href="/contact" variant="outline" className="mt-4 w-full">
                Contact our team
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand
        settings={settings}
        title="Machine down and need help now?"
        description="Call us directly for urgent breakdowns, or send the details through Telegram for a fast response."
      />
    </>
  );
}
