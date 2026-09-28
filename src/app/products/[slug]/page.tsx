import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRailSection } from "@/components/home/product-sections";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPrice } from "@/components/product/product-price";
import { ProductPurchase } from "@/components/product/product-purchase";
import { StockStatus } from "@/components/product/stock-status";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/data/products";
import { getStockState, type Product } from "@/lib/catalog-types";

// Re-query price and stock at most every 5 minutes. Products added after the build
// render on first request; unknown slugs 404 via notFound().
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const stockState = getStockState(product.sizes);
  const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
  const { categorySlug } = product;
  const relatedProducts = await getRelatedProducts(product, 6);

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so catalogue text can never close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, stockState)).replace(/</g, "\\u003c"),
        }}
      />

      <Container size="wide" className="pt-4 pb-(--spacing-section-sm) lg:pt-6">
        <Breadcrumbs
          className="mb-4 lg:mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: product.category, href: `/collections/${categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 xl:gap-20">
          <ProductGallery images={product.gallery} />

          <div className="flex flex-col gap-7 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <header className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Link href={`/collections/${categorySlug}`} className="text-label link-reveal text-muted">
                  {product.category}
                </Link>
                {product.badge && <span className="badge border border-line">{product.badge}</span>}
              </div>
              <h1 className="text-h2 leading-(--text-h2--line-height)">{product.name}</h1>
              <ProductPrice
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
              <p className="text-meta">Inclusive of all taxes</p>
              <StockStatus
                state={stockState}
                detail={stockState === "low_stock" ? `only ${totalStock} left` : undefined}
                className="mt-1"
              />
            </header>

            <p className="text-ink-soft">{product.description}</p>

            <ProductPurchase productId={product.id} colors={product.colors} sizes={product.sizes} />

            <div>
              <ul className="grid gap-3 border-t border-line py-5 text-sm">
                <li className="flex justify-between gap-4">
                  <span className="text-label text-ink">Delivery</span>
                  <span className="text-right text-muted">
                    {product.price >= 999 ? "Free, " : ""}3–5 working days
                  </span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-label text-ink">Returns</span>
                  <span className="text-right text-muted">Free within 15 days</span>
                </li>
              </ul>
  
              <div className="divide-y divide-line border-y border-line">
                <Disclosure title="Details" defaultOpen>
                  <ul className="list-disc space-y-1.5 pl-5">
                    {product.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </Disclosure>
                <Disclosure title="Composition & care">
                  <p className="mb-3">{product.composition}</p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    {product.care.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </Disclosure>
                <Disclosure title="Delivery & returns">
                  <p>
                    Free shipping on orders over ₹999, delivered across India in 3–5 working days.
                    Unworn items can be returned or exchanged within 15 days of delivery.
                  </p>
                </Disclosure>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-line">
        <ProductRailSection
          eyebrow="Complete the look"
          title="You may also like"
          href={`/collections/${categorySlug}`}
          products={relatedProducts}
        />
      </div>
    </>
  );
}

/** Native <details> accordion: accessible and works without JavaScript. */
function Disclosure({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="text-label flex cursor-pointer list-none items-center justify-between py-5 text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="relative size-3 before:absolute before:top-1/2 before:left-0 before:h-px before:w-3 before:bg-current after:absolute after:top-0 after:left-1/2 after:h-3 after:w-px after:bg-current after:transition-transform group-open:after:scale-y-0"
        />
      </summary>
      <div className="pb-5 text-sm text-ink-soft">{children}</div>
    </details>
  );
}

function productJsonLd(product: Product, stockState: ReturnType<typeof getStockState>) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.gallery.map((image) => image.src),
    category: product.category,
    brand: { "@type": "Brand", name: "Seicho Life" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        stockState === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : stockState === "low_stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
    },
  };
}
