import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSettings } from "@/server/settings";

/**
 * Public marketing shell. Settings are read once here and shared with the
 * header and footer so contact details stay consistent site-wide.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        site={{
          name: settings.company.name,
          tagline: settings.company.tagline,
          logo: settings.company.logo,
          phone: settings.company.phone,
          email: settings.company.email,
          telegram: settings.company.telegram,
          whatsapp: settings.company.whatsapp,
        }}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
