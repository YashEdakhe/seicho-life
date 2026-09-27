import Image from "next/image";
import type { GalleryImage } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";

/**
 * Mobile: full-bleed, swipeable carousel with a position counter.
 * Desktop: editorial stack; hero image full width, the rest in two columns.
 */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  return (
    <div>
      {/* Mobile / tablet */}
      <ul
        className="hide-scrollbar -mx-(--spacing-gutter) flex snap-x snap-mandatory overflow-x-auto lg:hidden"
        aria-label="Product images"
      >
        {images.map((image, i) => (
          <li key={image.src} className="relative w-full shrink-0 snap-start md:w-3/5">
            <div className="relative aspect-(--aspect-product) bg-sand">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={i === 0}
                sizes="(min-width: 48rem) 60vw, 100vw"
                className="object-cover"
              />
            </div>
            <span className="badge absolute right-3 bottom-3 tabular-nums" aria-hidden="true">
              {i + 1} / {images.length}
            </span>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <ul className="hidden grid-cols-2 gap-2 lg:grid" aria-label="Product images">
        {images.map((image, i) => {
          // An odd count would leave a gap, so the first image spans both columns.
          const featured = i === 0 && images.length % 2 === 1;
          return (
            <li
              key={image.src}
              className={cn(
                "relative overflow-hidden bg-sand",
                featured ? "col-span-2 aspect-4/5" : "aspect-(--aspect-product)",
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={i === 0}
                sizes={featured ? "60vw" : "30vw"}
                className="object-cover"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
