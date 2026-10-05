"use client";

import { useState } from "react";

import { MediaImage } from "@/components/media/media-image";
import { cn } from "@/lib/utils";

/**
 * Product gallery.
 *
 * - Thumbnails are real buttons, so the gallery is keyboard operable.
 * - Arrow keys move between images when a thumbnail has focus.
 * - Falls back to a single image when no gallery is configured.
 */
export function ProductGallery({
  images,
  alt,
  fallback,
}: {
  images: string[];
  alt: string;
  fallback?: string;
}) {
  const slides = images.length ? images : [fallback ?? ""];
  const [active, setActive] = useState(0);
  const current = slides[Math.min(active, slides.length - 1)];

  return (
    <div>
      <div className="border border-steel-200 bg-white">
        <MediaImage
          src={current}
          alt={`${alt} — image ${active + 1} of ${slides.length}`}
          aspect="aspect-[4/3]"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
      </div>

      {slides.length > 1 ? (
        <div
          role="group"
          aria-label="Product images"
          className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") setActive((i) => Math.min(i + 1, slides.length - 1));
            if (event.key === "ArrowLeft") setActive((i) => Math.max(i - 1, 0));
          }}
        >
          {slides.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "border bg-white p-0.5 transition-colors",
                index === active ? "border-accent-600" : "border-steel-200 hover:border-steel-400",
              )}
            >
              <MediaImage
                src={image}
                alt=""
                aspect="aspect-[4/3]"
                sizes="120px"
                className="pointer-events-none"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
