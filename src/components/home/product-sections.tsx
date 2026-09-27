import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { Container, Section, SectionHeader } from "@/components/ui/container";
import type { Product } from "@/lib/catalog-types";

type ProductSectionProps = {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
};

function ViewAll({ href }: { href: string }) {
  return (
    <Link href={href} className="text-label inline-flex items-center gap-2 self-start text-ink md:self-auto">
      <span className="link-reveal">View all</span>
      <ArrowRightIcon width={16} height={16} />
    </Link>
  );
}

/** Responsive product grid: 2 → 3 → 4 columns. */
export function ProductGridSection({ eyebrow, title, href, products }: ProductSectionProps) {
  return (
    <Section>
      <Container size="wide">
        <SectionHeader eyebrow={eyebrow} title={title} action={<ViewAll href={href} />} />
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Horizontally scrolling product rail with scroll-snap. */
export function ProductRailSection({ eyebrow, title, href, products }: ProductSectionProps) {
  return (
    <Section>
      <Container size="wide">
        <SectionHeader eyebrow={eyebrow} title={title} action={<ViewAll href={href} />} />
        {/* Bleed to the viewport edge on mobile so the next card peeks in. */}
        <ul className="scroll-rail -mr-(--spacing-gutter) pr-(--spacing-gutter) md:mr-0 md:pr-0">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 72vw"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
