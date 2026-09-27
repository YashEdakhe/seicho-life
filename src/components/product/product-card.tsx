import Image from "next/image";
import Link from "next/link";
import { getStockState, type Product } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";
import { discountPercent, ProductPrice } from "./product-price";

type ProductCardProps = {
  product: Product;
  /** `sizes` hint for next/image; defaults to the product grid layout. */
  sizes?: string;
  className?: string;
};

export function ProductCard({
  product,
  sizes = "(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw",
  className,
}: ProductCardProps) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = getStockState(product.sizes) === "out_of_stock";

  return (
    <article className={cn("group relative flex flex-col gap-3", className)}>
      <div className="media-product">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className={cn(
            product.hoverImage && "transition-opacity duration-500 group-hover:opacity-0",
            soldOut && "opacity-70",
          )}
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes={sizes}
            className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1.5 sm:top-3 sm:left-3">
          {soldOut ? (
            <span className="badge badge-dark">Sold out</span>
          ) : (
            <>
              {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
              {product.badge && <span className="badge">{product.badge}</span>}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-meta">{product.category}</p>
        <h3 className="font-sans text-sm leading-snug tracking-normal">
          {/* The link covers the whole card so image and text are one target. */}
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
        {product.colors.length > 0 && (
          <ul className="mt-1 flex gap-1.5" aria-label={`${product.colors.length} colours`}>
            {product.colors.map((color) => (
              <li
                key={color.name}
                title={color.name}
                className="size-2.5 rounded-full ring-1 ring-line-strong"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
