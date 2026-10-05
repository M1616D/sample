/**
 * Site navigation. Kept in one place so header, footer, mobile menu and the
 * sitemap all agree on the information architecture.
 */

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  href: string;
  /** Optional mega-menu children. */
  children?: NavItem[];
}

export const primaryNav: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "All Products", href: "/products", description: "Complete product catalogue" },
      { label: "Machinery", href: "/machinery", description: "Machines we build and supply" },
      { label: "Spare Parts", href: "/spare-parts", description: "Parts and consumables" },
      { label: "Categories", href: "/products#categories", description: "Browse by category" },
    ],
  },
  {
    label: "Capabilities",
    href: "/capabilities",
    children: [
      { label: "Our Capabilities", href: "/capabilities", description: "Workshop processes and equipment" },
      { label: "Services", href: "/services", description: "Fabrication, machining and support" },
      { label: "Projects", href: "/projects", description: "Selected completed work" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Capabilities", href: "/capabilities" },
    { label: "Projects", href: "/projects" },
    { label: "Careers", href: "/about#team" },
    { label: "News", href: "/news" },
  ],
  catalogue: [
    { label: "Products", href: "/products" },
    { label: "Machinery", href: "/machinery" },
    { label: "Spare Parts", href: "/spare-parts" },
    { label: "Company Profile", href: "/company-profile" },
    { label: "Search", href: "/search" },
  ],
  support: [
    { label: "Services", href: "/services" },
    { label: "Service Request", href: "/service-request" },
    { label: "Request a Quote", href: "/request-quote" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Business", href: "/terms" },
  ],
};

/** Routes that render the public marketing shell. */
export const publicRoutes = ["/", "/about", "/products", "/machinery", "/services", "/capabilities", "/projects", "/contact", "/request-quote", "/faq", "/news", "/privacy", "/terms", "/company-profile", "/search", "/spare-parts", "/service-request"];
