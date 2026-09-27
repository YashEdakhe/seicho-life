import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { hero } from "@/data/catalog";

/** Full-bleed campaign image with the headline anchored bottom-left. */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-sand text-paper h-[calc(100svh-var(--header-height)-2rem)] max-h-[60rem]">
      <Image
        src={hero.image}
        alt={hero.imageAlt}
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-[center_40%]"
      />
      {/* Scrim keeps text legible on any photograph. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 via-black/15 to-transparent" />

      <div className="page-container-wide pb-12 md:pb-16 lg:pb-20">
        <div className="flex max-w-xl flex-col items-start gap-5">
          <p className="text-label text-paper/85">{hero.eyebrow}</p>
          <h1 className="heading-display text-paper">{hero.title}</h1>
          <p className="max-w-md text-base text-paper/85">{hero.description}</p>
          <div className="mt-2 flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
            <ButtonLink href={hero.primaryCta.href} variant="inverse" size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={hero.secondaryCta.href}
              variant="outline-inverse"
              size="lg"
            >
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
