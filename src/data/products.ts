/*
 * Catalogue queries. The only API pages should depend on for product and category data.
 * Server-only: client components import types from @/lib/catalog-types instead.
 */

import "server-only";

import { and, asc, desc, eq, isNotNull, ne, sql, type SQL } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { Category, Product } from "@/lib/catalog-types";

const productWith = {
  category: true,
  images: { orderBy: (image, { asc }) => [asc(image.position)] },
  stock: { orderBy: (stock, { asc }) => [asc(stock.position)] },
} satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>["with"];

function findProducts(where?: SQL, options: { orderBy?: SQL[]; limit?: number } = {}) {
  return db.query.products.findMany({
    where: and(eq(products.isActive, true), where),
    with: productWith,
    orderBy: options.orderBy ?? [asc(products.id)],
    limit: options.limit,
  });
}

type ProductRow = Awaited<ReturnType<typeof findProducts>>[number];

const badgeLabel = { new: "New", bestseller: "Bestseller" } as const;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category.name,
    categorySlug: row.category.slug,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    image: row.imageUrl,
    hoverImage: row.hoverImageUrl ?? undefined,
    gallery: row.images.map((image) => ({ src: image.url, alt: image.alt })),
    colors: row.colors,
    sizes: row.stock.map((s) => ({ label: s.sizeLabel, stock: s.quantity })),
    badge: row.badge ? badgeLabel[row.badge] : undefined,
    description: row.description,
    details: row.details,
    composition: row.composition,
    care: row.care,
  };
}

export async function getProductSlugs() {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.isActive, true));
  return rows.map((row) => row.slug);
}

/** Cached per request so generateMetadata and the page share one query. */
export const getProduct = cache(async (slug: string) => {
  const [row] = await findProducts(eq(products.slug, slug), { limit: 1 });
  return row ? toProduct(row) : undefined;
});

export async function getNewArrivals(limit = 8) {
  return (await findProducts(eq(products.isNewArrival, true), { limit })).map(toProduct);
}

export async function getBestSellers(limit = 6) {
  return (await findProducts(eq(products.isBestseller, true), { limit })).map(toProduct);
}

/** Same-category products first, then the rest of the catalogue. */
export async function getRelatedProducts(product: Product, limit = 4) {
  const rows = await findProducts(ne(products.id, product.id), {
    orderBy: [
      desc(sql`${products.categoryId} = (select id from ${categories} where slug = ${product.categorySlug})`),
      asc(products.id),
    ],
    limit,
  });
  return rows.map(toProduct);
}

/** Categories shown as homepage tiles. */
export async function getFeaturedCategories(): Promise<Category[]> {
  const rows = await db
    .select({ slug: categories.slug, name: categories.name, image: categories.imageUrl })
    .from(categories)
    .where(and(eq(categories.isFeatured, true), isNotNull(categories.imageUrl)))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return rows.map((row) => ({ ...row, image: row.image! }));
}
