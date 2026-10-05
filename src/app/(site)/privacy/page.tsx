import type { Metadata } from "next";

import { CtaBand } from "@/components/site/cta-band";
import { PageHeader } from "@/components/site/page-header";
import { Notice } from "@/components/ui/primitives";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return {
    title: "Privacy Policy",
    description: `How ${company.name} collects, uses and protects the information you submit through this website.`,
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const [settings] = await Promise.all([getSettings()]);
  const { company } = settings;
  const contactLine = [company.email, company.phone].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="This policy explains what information we collect through this website, why we collect it, and how it is handled."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="section">
        <div className="container max-w-3xl">
          <Notice tone="warning" title="Template content">
            <p>
              This privacy policy is a plain-language template prepared for the website launch. It is not legal advice. The
              company should review and adapt it, and have it approved by a qualified advisor, before relying on it.
            </p>
          </Notice>

          <div className="prose-industrial mt-8 space-y-8">
            <div>
              <h2 className="text-xl">Information we collect</h2>
              <p className="mt-3">
                When you use the quote request, contact or service request forms, we collect the details you enter — such as
                your name, company, phone number, email address, the product or machine concerned, and the description of your
                requirement. We also receive standard technical information that your browser sends, such as your IP address,
                for security and abuse prevention.
              </p>
            </div>

            <div>
              <h2 className="text-xl">How we use your information</h2>
              <p className="mt-3">
                We use your details only to respond to your enquiry, prepare quotations, arrange delivery, installation,
                maintenance or support, and to keep a record of our relationship with you. We do not sell or rent your
                information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Messages and notifications</h2>
              <p className="mt-3">
                Enquiries submitted through this website may be forwarded to the company&apos;s internal notification channel
                (for example a Telegram chat operated by our sales team) so that we can respond quickly. Access to that channel
                is limited to authorised staff.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Cookies and analytics</h2>
              <p className="mt-3">
                The public website sets only the cookies required to operate securely (for example, a session cookie used by
                the administration area). We do not use advertising cookies. If analytics are added in future, this policy will
                be updated to describe them.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Data retention</h2>
              <p className="mt-3">
                We keep enquiry and customer records for as long as needed to provide our products and services and to meet
                our business and legal obligations, after which they are deleted or anonymised.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Your choices</h2>
              <p className="mt-3">
                You may ask us to correct or delete the personal information we hold about you, or to stop contacting you,
                by writing to us using the contact details below.
              </p>
            </div>

            <div>
              <h2 className="text-xl">Contact</h2>
              <p className="mt-3">
                For any question about this policy or your information, contact {company.legalName || company.name}
                {contactLine ? ` at ${contactLine}` : ""}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand settings={settings} title="Questions about your data?" description="Contact us and we will explain how your information is handled." />
    </>
  );
}
