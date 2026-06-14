import { relations, sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type", { enum: ["course", "book", "bundle"] }).notNull(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const productPrices = sqliteTable("product_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  countryCode: text("country_code", {
    enum: ["MX", "CO", "AR", "PE", "INT"],
  }).notNull(),
  currency: text("currency").notNull(),
  amount: real("amount").notNull(),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  whatsappNumber: text("whatsapp_number").notNull().default("5212345678900"),
  storeName: text("store_name").notNull().default("LibroTeck"),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default("Cursos y libros digitales"),
});

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(productPrices),
}));

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, {
    fields: [productPrices.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type ProductPrice = typeof productPrices.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export type ProductWithPrices = Product & { prices: ProductPrice[] };
