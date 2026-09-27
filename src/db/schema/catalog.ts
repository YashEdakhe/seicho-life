import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const productBadge = pgEnum("product_badge", ["new", "bestseller"]);

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Homepage tile image. */
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Shown in the homepage "Shop by category" tiles. */
  isFeatured: boolean("is_featured").notNull().default(false),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    composition: text("composition").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    care: text("care").array().notNull().default(sql`'{}'::text[]`),
    /** Whole rupees. */
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    imageUrl: text("image_url").notNull(),
    hoverImageUrl: text("hover_image_url"),
    /** Display-only swatches; colours are not variants and carry no stock. */
    colors: jsonb("colors").$type<{ name: string; hex: string }[]>().notNull().default([]),
    badge: productBadge("badge"),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isBestseller: boolean("is_bestseller").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_check", sql`${t.price} >= 0`),
    check(
      "products_compare_at_price_check",
      sql`${t.compareAtPrice} is null or ${t.compareAtPrice} > ${t.price}`,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").notNull(),
  },
  (t) => [unique("product_images_product_position_key").on(t.productId, t.position)],
);

/** Stock count per size. Not a variant: no SKU, price or colour of its own. */
export const productStock = pgTable(
  "product_stock",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sizeLabel: text("size_label").notNull(),
    position: integer("position").notNull(),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamps.updatedAt,
  },
  (t) => [
    unique("product_stock_product_size_key").on(t.productId, t.sizeLabel),
    check("product_stock_quantity_check", sql`${t.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  stock: many(productStock),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, { fields: [productStock.productId], references: [products.id] }),
}));
