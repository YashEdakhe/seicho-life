import Image from "next/image";
import Link from "next/link";
import { Container, Section, SectionHeader } from "@/components/ui/container";
import type { Category } from "@/lib/catalog-types";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <Section spacing="sm">
      <Container size="wide">
        <SectionHeader eyebrow="Shop by category" title="Find your fit" />
        <ul className="grid-tiles">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/collections/${category.slug}`} className="group flex flex-col gap-3">
                <div className="relative aspect-(--aspect-tile) overflow-hidden bg-sand">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(min-width: 80rem) 16vw, (min-width: 48rem) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="text-label text-ink">
                  <span className="link-reveal">{category.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
