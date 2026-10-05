import Link from "next/link";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { Notice } from "@/components/ui/primitives";
import { getSettings } from "@/server/settings";
import { enumParam, firstParam, type RawSearchParams } from "@/lib/search-params";
import type { AdminField } from "@/lib/admin-resources";

const GROUPS = ["company", "home", "social", "seo"] as const;

const companyFields: AdminField[] = [
  { name: "name", label: "Company name", type: "text" },
  { name: "legalName", label: "Legal name", type: "text" },
  { name: "tagline", label: "Tagline", type: "text", full: true },
  { name: "shortDescription", label: "Short description", type: "textarea", rows: 2, full: true },
  { name: "introParagraph", label: "Intro paragraph", type: "textarea", rows: 3, full: true },
  { name: "aboutBody", label: "About body", type: "textarea", rows: 6, full: true },
  { name: "history", label: "History", type: "textarea", rows: 3, full: true },
  { name: "development", label: "Development", type: "textarea", rows: 3, full: true },
  { name: "futureDirection", label: "Future direction", type: "textarea", rows: 3, full: true },
  { name: "mission", label: "Mission", type: "textarea", rows: 2, full: true },
  { name: "vision", label: "Vision", type: "textarea", rows: 2, full: true },
  { name: "values", label: "Values", type: "textarea", rows: 4, full: true, hint: "One value per line" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "phoneAlt", label: "Alternative phone", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "whatsapp", label: "WhatsApp number", type: "text" },
  { name: "telegram", label: "Telegram (handle or link)", type: "text" },
  { name: "address", label: "Street address", type: "text", full: true },
  { name: "city", label: "City", type: "text" },
  { name: "region", label: "Region", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "postalCode", label: "Postal code", type: "text" },
  { name: "mapUrl", label: "Map link URL", type: "text", full: true },
  { name: "mapEmbedUrl", label: "Map embed URL", type: "text", full: true, hint: "Google Maps embed src URL" },
  {
    name: "hours",
    label: "Working hours",
    type: "textarea",
    rows: 4,
    full: true,
    hint: "One per line as “Label | Value”",
  },
  { name: "logo", label: "Logo URL", type: "text", full: true },
  { name: "heroImage", label: "Hero image URL", type: "text", full: true },
  { name: "workshopImages", label: "Workshop images", type: "textarea", rows: 4, full: true, hint: "One URL per line" },
  { name: "videoUrl", label: "Video URL", type: "text", full: true },
];

const homeFields: AdminField[] = [
  { name: "heroEyebrow", label: "Hero eyebrow", type: "text" },
  { name: "heroTitle", label: "Hero title", type: "text" },
  { name: "heroSubtitle", label: "Hero subtitle", type: "textarea", rows: 3, full: true },
  { name: "industries", label: "Industries served", type: "textarea", rows: 4, full: true, hint: "One per line" },
  {
    name: "whyChooseUs",
    label: "Why choose us",
    type: "textarea",
    rows: 5,
    full: true,
    hint: "One per line as “Title | Description”",
  },
  {
    name: "process",
    label: "Process steps",
    type: "textarea",
    rows: 5,
    full: true,
    hint: "One per line as “Title | Description”",
  },
  {
    name: "stats",
    label: "Statistics",
    type: "textarea",
    rows: 4,
    full: true,
    hint: "One per line as “Label | Value | Note”. Leave empty to hide the block — never publish unverified figures.",
  },
];

const socialFields: AdminField[] = [
  { name: "telegram", label: "Telegram", type: "text", full: true },
  { name: "facebook", label: "Facebook", type: "text", full: true },
  { name: "instagram", label: "Instagram", type: "text", full: true },
  { name: "tiktok", label: "TikTok", type: "text", full: true },
  { name: "youtube", label: "YouTube", type: "text", full: true },
  { name: "linkedin", label: "LinkedIn", type: "text", full: true },
];

const seoFields: AdminField[] = [
  { name: "defaultTitle", label: "Default title", type: "text", full: true },
  { name: "titleTemplate", label: "Title template", type: "text", full: true, hint: "Use %s for the page title" },
  { name: "defaultDescription", label: "Default description", type: "textarea", rows: 3, full: true },
  { name: "keywords", label: "Keywords", type: "textarea", rows: 4, full: true, hint: "One keyword per line" },
  { name: "ogImage", label: "Social share image URL", type: "text", full: true },
  { name: "twitterHandle", label: "Twitter/X handle", type: "text" },
];

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const sp = await searchParams;
  const group = enumParam(sp, "group", GROUPS) ?? "company";
  const saved = firstParam(sp, "saved");
  const settings = await getSettings();

  // Encode the current values into the flat string map the form renders.
  const values: Record<string, string> = {};
  if (group === "company") {
    const c = settings.company;
    Object.assign(values, {
      name: c.name, legalName: c.legalName, tagline: c.tagline, shortDescription: c.shortDescription,
      introParagraph: c.introParagraph, aboutBody: c.aboutBody, history: c.history, development: c.development,
      futureDirection: c.futureDirection, mission: c.mission, vision: c.vision, values: c.values.join("\n"),
      phone: c.phone, phoneAlt: c.phoneAlt, email: c.email, whatsapp: c.whatsapp, telegram: c.telegram,
      address: c.address, city: c.city, region: c.region, country: c.country, postalCode: c.postalCode,
      mapUrl: c.mapUrl, mapEmbedUrl: c.mapEmbedUrl, hours: c.hours.map((h) => `${h.label} | ${h.value}`).join("\n"),
      logo: c.logo, heroImage: c.heroImage, workshopImages: c.workshopImages.join("\n"), videoUrl: c.videoUrl,
    });
  } else if (group === "home") {
    const h = settings.home;
    Object.assign(values, {
      heroEyebrow: h.heroEyebrow, heroTitle: h.heroTitle, heroSubtitle: h.heroSubtitle,
      industries: h.industries.join("\n"),
      whyChooseUs: h.whyChooseUs.map((item) => `${item.title} | ${item.description}`).join("\n"),
      process: h.process.map((item) => `${item.title} | ${item.description}`).join("\n"),
      stats: h.stats.map((item) => `${item.label} | ${item.value} | ${item.note}`).join("\n"),
    });
  } else if (group === "social") {
    Object.assign(values, settings.social);
  } else {
    const s = settings.seo;
    Object.assign(values, {
      defaultTitle: s.defaultTitle, titleTemplate: s.titleTemplate, defaultDescription: s.defaultDescription,
      ogImage: s.ogImage, twitterHandle: s.twitterHandle, keywords: s.keywords.join("\n"),
    });
  }

  const fields = group === "company" ? companyFields : group === "home" ? homeFields : group === "social" ? socialFields : seoFields;

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Company details, homepage content, social links and SEO defaults. Changes appear on the public site immediately."
      />
      <Flash saved={saved === "1"} error={firstParam(sp, "error")} />

      {/* Group tabs */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-steel-200 pb-4">
        {GROUPS.map((option) => (
          <Link
            key={option}
            href={`/admin/settings?group=${option}`}
            aria-current={group === option ? "page" : undefined}
            className={`border px-3.5 py-2 text-sm font-medium capitalize ${
              group === option
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
            }`}
          >
            {option === "seo" ? "SEO" : option}
          </Link>
        ))}
      </div>

      {group === "home" ? (
        <Notice tone="warning" className="mb-5">
          Only enter statistics and claims the company can substantiate. The statistics block is hidden entirely while it is
          empty, which is the correct default until real figures exist.
        </Notice>
      ) : null}

      <div className="card p-5 sm:p-7">
        <SettingsForm group={group} fields={fields} values={values} />
      </div>
    </>
  );
}
