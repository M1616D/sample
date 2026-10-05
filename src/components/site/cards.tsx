import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { Badge } from "@/components/ui/primitives";
import type { CapabilityDTO, ServiceDTO } from "@/types";

export function ServiceCard({ service }: { service: ServiceDTO }) {
  return (
    <article className="card card-hover group flex flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-snug text-ink-900">
          <Link href={`/services/${service.slug}`} className="transition-colors hover:text-accent-700">
            {/* A short rule keeps the card feeling technical, not "card with icon". */}
            {service.name}
          </Link>
        </h3>
        <span aria-hidden className="mt-1.5 h-px w-8 shrink-0 bg-accent-600" />
      </div>
      {service.summary ? (
        <p className="mt-3 text-sm leading-relaxed text-steel-600">{service.summary}</p>
      ) : null}
      {service.features.length ? (
        <ul className="mt-5 space-y-2 text-sm text-steel-700">
          {service.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        href={`/services/${service.slug}`}
        className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink-900 transition-colors hover:text-accent-700"
      >
        Service details
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </article>
  );
}

export function CapabilityCard({ capability }: { capability: CapabilityDTO }) {
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/capabilities#${capability.slug}`} className="block">
        <MediaImage
          src={capability.image}
          alt={capability.name}
          aspect="aspect-[16/9]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold uppercase tracking-wide text-ink-900">{capability.name}</h3>
        {capability.description ? (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-steel-600">{capability.description}</p>
        ) : null}
        {capability.equipment.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {capability.equipment.slice(0, 3).map((item) => (
              <Badge key={item} tone="neutral">
                {item}
              </Badge>
            ))}
          </div>
        ) : null}
        <Link
          href={`/capabilities#${capability.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-900 transition-colors hover:text-accent-700"
        >
          Capability details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
