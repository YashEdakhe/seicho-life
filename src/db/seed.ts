/*
 * Replaces the catalogue with the sample data in seed-data.ts. Safe to re-run.
 * Runs as one batch (a single transaction on Neon), so a failure leaves the old data in place.
 */

import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, productImages, products, productStock } from "./schema";
import * as data from "./seed-data";

const categoryId = (slug: string) => sql`(select id from ${categories} where slug = ${slug})`;
const productId = (slug: string) => sql`(select id from ${products} where slug = ${slug})`;

async function main() {
  await db.batch([
    // Cascades to product_images and product_stock.
    db.delete(products),
    db.delete(categories),

    db.insert(categories).values(
      data.categories.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        imageUrl: c.image,
        sortOrder: i,
        isFeatured: c.isFeatured,
      })),
    ),

    // Rows get ids in array order; listings sort by id.
    db.insert(products).values(
      data.products.map((p) => ({
        slug: p.slug,
        categoryId: categoryId(p.category),
        name: p.name,
        description: p.description,
        composition: p.composition,
        details: p.details,
        care: p.care,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: p.image,
        hoverImageUrl: p.hoverImage,
        colors: p.colors,
        badge: p.badge,
        isNewArrival: p.isNewArrival ?? false,
        isBestseller: p.isBestseller ?? false,
      })),
    ),

    db.insert(productImages).values(
      data.products.flatMap((p) =>
        p.gallery.map((image, position) => ({
          productId: productId(p.slug),
          url: image.src,
          alt: image.alt,
          position,
        })),
      ),
    ),

    db.insert(productStock).values(
      data.products.flatMap((p) =>
        p.sizes.map((size, position) => ({
          productId: productId(p.slug),
          sizeLabel: size.label,
          position,
          quantity: size.stock,
        })),
      ),
    ),
  ]);

  console.log(`Seeded ${data.categories.length} categories and ${data.products.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
