import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Product } from "@/lib/catalog-types";

type CollectionListingProps = {
  title: string;
  eyebrow: string;
  description: string;
  products: Product[];
};

/** Full-page product listing: breadcrumbs, heading with piece count, then the product grid. */
export function CollectionListing({ title, eyebrow, description, products }: CollectionListingProps) {
  return (
    <Container size="wide" className="pt-4 pb-(--spacing-section-sm) lg:pt-6">
      <Breadcrumbs className="mb-4 lg:mb-6" items={[{ label: "Home", href: "/" }, { label: title }]} />

      <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-xl flex-col gap-3">
          <p className="text-label text-muted">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="text-ink-soft">{description}</p>
        </div>
        {products.length > 0 && (
          <p className="text-meta">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        )}
      </header>

      {products.length > 0 ? (
        <ul className="grid-products">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-5 border-t border-line py-16 text-center">
          <p className="text-label text-muted">Nothing here just yet</p>
          <p className="max-w-md text-muted">
            New pieces are on their way. In the meantime, see what&apos;s just landed.
          </p>
          <ButtonLink href="/collections/new-in" variant="secondary">
            Shop new in
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
