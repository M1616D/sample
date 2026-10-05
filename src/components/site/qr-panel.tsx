import { Breadcrumbs, Button } from "@/components/ui/primitives";

/**
 * Printable QR panel. Used for machine labels, brochures and showroom
 * displays — scanning opens the public product page.
 */
export function QrPanel({
  title,
  url,
  dataUrl,
  breadcrumbs,
  printHint = true,
}: {
  title: string;
  url: string;
  dataUrl: string | null;
  breadcrumbs: { label: string; href?: string }[];
  printHint?: boolean;
}) {
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        <h1 className="text-2xl sm:text-3xl">QR code — {title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">
          This code points to the product page. Print it for machine labels, business cards, brochures, printed catalogues or
          showroom displays.
        </p>

        <div className="card mt-8 p-8 text-center">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL, not a remote asset
            <img
              src={dataUrl}
              alt={`QR code linking to ${title}`}
              width={320}
              height={320}
              className="mx-auto h-auto w-full max-w-[320px]"
            />
          ) : (
            <p className="text-sm text-steel-600">
              The QR code could not be generated. Use the link below instead.
            </p>
          )}
          <p className="mt-6 break-all font-mono text-xs text-steel-500">{url}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={url} variant="dark">
            Open the product page
          </Button>
          {printHint ? (
            <span className="btn btn-outline cursor-default">Use your browser&apos;s print function to print this page</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
