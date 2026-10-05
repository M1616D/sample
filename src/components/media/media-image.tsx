"use client";

import Image from "next/image";
import { useState } from "react";

import { PLACEHOLDER_IMAGE } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * MediaImage
 *
 * A single place where catalogue/site imagery is rendered, so lazy loading,
 * aspect ratios, alt text and the "broken image" fallback stay consistent.
 *
 * - Falls back to a clearly-labelled placeholder when no source is configured
 *   or when a remote source fails to load (handled client-side via onError).
 * - Always reserves layout space (width/height) to avoid layout shift.
 */
export function MediaImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  aspect = "aspect-[4/3]",
  priority = false,
  fill = true,
  fallback = PLACEHOLDER_IMAGE,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  /** Tailwind aspect class applied to the wrapper (fill mode only). */
  aspect?: string;
  priority?: boolean;
  fill?: boolean;
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = src && src.trim() ? src.trim() : fallback;
  const finalSrc = failed ? fallback : resolved;

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-900", aspect, className)}>
        <Image
          src={finalSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={1200}
      height={800}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
