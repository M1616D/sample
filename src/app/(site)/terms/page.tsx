import type { Metadata } from "next";

import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Notice } from "@/components/ui/primitives";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return {
    title: "Terms of Business",
    description: `The general terms on which ${company.name} quotes for, manufactures and supplies machinery, fabricated products and spare parts.`,
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const [settings] = await Promise.all([getSettings()]);
  const { company } = settings;
  const contactLine = [company.email, company.phone].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Business"
        description="The general basis on which we prepare quotations and supply machinery, fabricated products and spare parts."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Business" }]}
      />

      <section className="section">
        <div className="container max-w-3xl">
          <Notice tone="warning" title="Template content">
            <p>
              These terms are a plain-language template prepared for the website launch and are not legal advice. The final
              terms applicable to any order are those stated in the accepted quotation or contract. The company should have
              this document reviewed by a qualified advisor.
            </p>
          </Notice>

          <div className="prose-industrial mt-8 space-y-8">
            <div>
              <h2 className="text-xl">Quotations</h2>
              <p className="mt-3">
                A quotation is an offer to supply the described goods or services at the stated price and is valid for the
                period noted on it. Custom machinery is quoted on the basis of the specification and drawings agreed with you,
                and changes to that specification may change the price and lead time.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Orders and acceptance</h2>
              <p className="mt-3">
                An order is accepted when we confirm it in writing. Where a deposit is required, production commences once the
                deposit is received and the agreed drawings or specification are approved.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Lead times and delivery</h2>
              <p className="mt-3">
                Lead times are estimates given in good faith. They may be affected by material availability, transport and
                circumstances outside our reasonable control. Delivery terms, risk and unloading responsibilities are as stated
                in the quotation.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Payment</h2>
              <p className="mt-3">
                Payment terms are as stated in the accepted quotation. Amounts not paid when due may affect further supply and
                support until the account is settled.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Warranty</h2>
              <p className="mt-3">
                Unless the quotation states otherwise, machinery and fabricated products are supplied with a warranty against
                defects in materials and workmanship for the period stated on the quotation. The warranty does not cover normal
                wear, consumable parts, damage from misuse, incorrect installation by others, or failure to follow the operating
                and maintenance guidance provided. Spare parts and consumables are excluded unless expressly stated.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Site work and installation</h2>
              <p className="mt-3">
                Where we install or commission equipment, the customer is responsible for providing safe site access, suitable
                power and civil works, and a safe working environment in line with applicable regulations.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Intellectual property</h2>
              <p className="mt-3">
                Designs, drawings and technical documents prepared by us remain our property unless otherwise agreed in writing,
                and are supplied for the operation and maintenance of the equipment purchased.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Liability</h2>
              <p className="mt-3">
                Our liability in connection with an order is limited to the value of that order, except where liability cannot
                lawfully be limited. We are not liable for indirect or consequential loss, including loss of production or
                profit.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Governing terms</h2>
              <p className="mt-3">
                Where these general terms differ from the terms stated in an accepted quotation or signed contract, the
                quotation or contract prevails. Questions may be directed to {company.legalName || company.name}
                {contactLine ? ` at ${contactLine}` : ""}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand settings={settings} title="Need specific terms for a contract?" description="Talk to our team and we will set out the terms for your particular order." />
    </>
  );
}
