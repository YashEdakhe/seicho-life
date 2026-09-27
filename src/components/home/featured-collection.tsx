import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { featuredCollection as fc } from "@/data/catalog";

/** Editorial split: large portrait image, with copy and a smaller detail image alongside. */
export function FeaturedCollection() {
  return (
    <Section tone="canvas">
      <Container size="wide" className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
        <div className="relative aspect-4/5 overflow-hidden bg-sand">
          <Image
            src={fc.image}
            alt={fc.imageAlt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-8 md:py-8">
          <div className="flex max-w-md flex-col items-start gap-4">
            <p className="text-label text-muted">{fc.eyebrow}</p>
            <h2 className="text-h1 leading-(--text-h1--line-height)">{fc.title}</h2>
            <p className="text-muted">{fc.description}</p>
            <ButtonLink href={fc.cta.href} variant="secondary" className="mt-2">
              {fc.cta.label}
            </ButtonLink>
          </div>
          <div className="relative hidden aspect-3/2 w-3/4 self-end overflow-hidden bg-sand md:block">
            <Image
              src={fc.detailImage}
              alt={fc.detailImageAlt}
              fill
              sizes="30vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
