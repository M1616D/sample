/**
 * Default site content.
 *
 * IMPORTANT: every value below is PLACEHOLDER content, not a factual claim.
 * Administrators replace it in Admin -> Company / Social / Location / SEO.
 * The database `Setting` rows override these defaults at runtime, so the site
 * renders correctly even before anything has been configured.
 *
 * Deliberate omissions: we do not state years of experience, client counts,
 * certifications, production capacity or partnerships, because none were
 * provided. The homepage statistics block only renders when an administrator
 * enters real values, and the certifications block is not rendered at all.
 */

export interface SiteHours {
  label: string;
  value: string;
}

export interface CompanySettings {
  name: string;
  legalName: string;
  tagline: string;
  shortDescription: string;
  introParagraph: string;
  aboutBody: string;
  history: string;
  development: string;
  futureDirection: string;
  mission: string;
  vision: string;
  values: string[];
  phone: string;
  phoneAlt: string;
  email: string;
  telegram: string;
  whatsapp: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  mapUrl: string;
  mapEmbedUrl: string;
  hours: SiteHours[];
  logo: string;
  heroImage: string;
  workshopImages: string[];
  videoUrl: string;
}

export interface SocialSettings {
  telegram: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
}

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImage: string;
  twitterHandle: string;
}

export interface StatItem {
  label: string;
  value: string;
  note: string;
}

export interface HomeSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroEyebrow: string;
  industries: string[];
  whyChooseUs: { title: string; description: string }[];
  process: { title: string; description: string }[];
  stats: StatItem[];
}

export interface SiteSettings {
  company: CompanySettings;
  social: SocialSettings;
  seo: SeoSettings;
  home: HomeSettings;
}

export const SETTING_KEYS = {
  company: "company",
  social: "social",
  seo: "seo",
  home: "home",
} as const;

/** Clearly-labelled placeholder image, used until real photography is supplied. */
export const PLACEHOLDER_IMAGE = "/images/placeholder-machine.svg";

export const DEFAULT_SETTINGS: SiteSettings = {
  company: {
    name: "Industrial Works",
    legalName: "Industrial Works Manufacturing & Machinery",
    tagline: "Industrial Machinery & Manufacturing Solutions",
    shortDescription:
      "Engineering, manufacturing, fabrication and industrial machinery solutions built for growing businesses.",
    introParagraph:
      "We design, manufacture, import and support industrial machinery and fabricated metal products. From plasma cutting and welding to custom machine building, our workshop delivers equipment and components built to industrial duty standards.",
    aboutBody:
      "We operate a metal fabrication and machinery workshop serving construction, manufacturing, agriculture and infrastructure businesses. Our work covers the full chain: engineering and design, metal cutting, forming, welding, machining, assembly, finishing, installation and after-sales support.\n\nBecause requirements vary from one customer to the next, we build both standard product lines and fully custom machines. Every enquiry is reviewed by our technical team, and every machine is delivered with operating guidance and ongoing spare-parts support.",
    history:
      "The business began as a small metal fabrication workshop serving local construction and manufacturing customers. As demand for machinery grew, we expanded from fabrication into machine design and manufacturing.",
    development:
      "Today our workshop combines cutting, forming, machining, welding and assembly under one roof, which lets us control quality and lead times from raw material through to commissioning.",
    futureDirection:
      "We continue to expand our machinery range, our workshop capacity and our service coverage so that customers can source equipment, spare parts and technical support from a single supplier.",
    mission:
      "To manufacture and supply reliable industrial machinery and fabricated products that help our customers produce more, with support they can depend on.",
    vision:
      "To become a leading industrial machinery and manufacturing partner in the region, known for engineering quality, dependable delivery and long-term customer support.",
    values: [
      "Engineering quality over shortcuts",
      "Honest technical advice",
      "Dependable delivery and lead times",
      "Long-term after-sales support",
      "Safe and disciplined workshop practice",
    ],
    phone: "+251 000 000 000",
    phoneAlt: "",
    email: "info@example.com",
    telegram: "example_company",
    whatsapp: "",
    address: "Workshop address to be configured",
    city: "Addis Ababa",
    region: "",
    country: "Ethiopia",
    postalCode: "",
    mapUrl: "https://maps.google.com/?q=Addis+Ababa,Ethiopia",
    mapEmbedUrl: "",
    hours: [
      { label: "Monday – Friday", value: "8:00 AM – 6:00 PM" },
      { label: "Saturday", value: "8:00 AM – 1:00 PM" },
      { label: "Sunday", value: "Closed" },
    ],
    logo: "",
    heroImage: "/images/hero-workshop.svg",
    workshopImages: [
      "/images/placeholder-fabrication.svg",
      "/images/placeholder-welding.svg",
      "/images/placeholder-machining.svg",
      "/images/placeholder-assembly.svg",
    ],
    videoUrl: "",
  },
  social: {
    facebook: "",
    telegram: "https://t.me/example_company",
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
  },
  seo: {
    defaultTitle: "Industrial Machinery & Manufacturing Solutions",
    titleTemplate: "%s | Industrial Works",
    defaultDescription:
      "Engineering, manufacturing, fabrication and industrial machinery solutions built for growing businesses.",
    keywords: [
      "industrial machinery",
      "metal fabrication",
      "plasma cutting",
      "machinery manufacturing",
      "soap making machine",
      "brick making machine",
      "machining",
      "welding",
    ],
    ogImage: "/images/og-default.svg",
    twitterHandle: "",
  },
  home: {
    heroEyebrow: "Manufacturing & Machinery",
    heroTitle: "Industrial machinery and manufacturing solutions",
    heroSubtitle:
      "We engineer, build and supply industrial machines and fabricated metal products — with installation, spare parts and technical support behind every order.",
    industries: [
      "Construction & Infrastructure",
      "Manufacturing & Processing",
      "Agriculture & Food Processing",
      "Municipal & Public Works",
      "Metal & Steel Fabrication",
      "Warehousing & Logistics",
    ],
    whyChooseUs: [
      {
        title: "In-house manufacturing",
        description:
          "Design, cutting, forming, welding, machining and assembly are handled in our own workshop, so we control quality and lead times.",
      },
      {
        title: "Custom machine building",
        description:
          "Standard machines do not always fit. We engineer and build equipment around your material, capacity and site constraints.",
      },
      {
        title: "Technical consultation",
        description:
          "Tell us what you need to produce and we will recommend a machine specification, capacity and layout that fits.",
      },
      {
        title: "Spare parts & service",
        description:
          "Machines need parts. We supply spares, carry out maintenance and provide technical support after delivery.",
      },
    ],
    process: [
      { title: "Enquiry & consultation", description: "We review your requirement, material and expected output." },
      { title: "Engineering & quotation", description: "Our team prepares a specification and a clear commercial offer." },
      { title: "Manufacturing", description: "Cutting, forming, machining, welding and assembly in our workshop." },
      { title: "Testing & delivery", description: "Machines are assembled and checked before shipment or handover." },
      { title: "Installation & support", description: "Commissioning, operator guidance, spare parts and maintenance." },
    ],
    // Intentionally empty: statistics are only shown once real values exist.
    stats: [],
  },
};
