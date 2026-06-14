import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type", { enum: ["course", "book", "bundle"] }).notNull(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  isNew: boolean("is_new").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productPrices = pgTable("product_prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  countryCode: text("country_code", {
    enum: ["MX", "CO", "AR", "PE", "BO", "INT"],
  }).notNull(),
  currency: text("currency").notNull(),
  amount: doublePrecision("amount").notNull(),
  compareAtAmount: doublePrecision("compare_at_amount"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number").notNull().default("5212345678900"),
  storeName: text("store_name").notNull().default("LibroTeck"),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default("Elige tu país y ordena por WhatsApp"),
  adminPasswordHash: text("admin_password_hash"),
  promoEnabled: boolean("promo_enabled").notNull().default(false),
  promoTitle: text("promo_title").notNull().default(""),
  promoMessage: text("promo_message").notNull().default(""),
  promoLink: text("promo_link").notNull().default(""),
  promoButtonLabel: text("promo_button_label")
    .notNull()
    .default("Ver promoción"),
  adsEnabled: boolean("ads_enabled").notNull().default(false),
  adsenseClientId: text("adsense_client_id").notNull().default(""),
  adSlotTop: text("ad_slot_top").notNull().default(""),
  adSlotLeft: text("ad_slot_left").notNull().default(""),
  adSlotRight: text("ad_slot_right").notNull().default(""),
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
