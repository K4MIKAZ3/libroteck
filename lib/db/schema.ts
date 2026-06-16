import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  brandPrimary: text("brand_primary").notNull(),
  brandAccent: text("brand_accent").notNull(),
  footerTagline: text("footer_tagline").notNull().default(""),
  heroBadge: text("hero_badge").notNull().default(""),
  heroOfferTitle: text("hero_offer_title").notNull().default(""),
  heroOfferSubtitle: text("hero_offer_subtitle").notNull().default(""),
  heroOfferBackgroundImageUrl: text("hero_offer_background_image_url")
    .notNull()
    .default(""),
  heroOfferServiceName: text("hero_offer_service_name").notNull().default(""),
  heroOfferPrice: text("hero_offer_price").notNull().default(""),
  catalogTitle: text("catalog_title").notNull().default("Catálogo destacado"),
  catalogSubtitle: text("catalog_subtitle").notNull().default(""),
  searchPlaceholder: text("search_placeholder").notNull().default(""),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type", {
      enum: ["course", "book", "bundle", "subscription"],
    }).notNull(),
    streamingCategory: text("streaming_category", {
      enum: ["streaming", "ia", "panel"],
    }),
    description: text("description").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    isNew: boolean("is_new").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("products_store_slug_unique").on(table.storeId, table.slug),
  ],
);

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

export const settings = pgTable(
  "settings",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    whatsappNumber: text("whatsapp_number").notNull().default("5212345678900"),
    storeName: text("store_name").notNull().default("LibroTeck"),
    welcomeMessage: text("welcome_message")
      .notNull()
      .default("Elige tu país y ordena por WhatsApp"),
    whatsappOrderTemplate: text("whatsapp_order_template")
      .notNull()
      .default(""),
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
  },
  (table) => [uniqueIndex("settings_store_id_unique").on(table.storeId)],
);

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  settings: many(settings),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  prices: many(productPrices),
}));

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, {
    fields: [productPrices.productId],
    references: [products.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  store: one(stores, {
    fields: [settings.storeId],
    references: [stores.id],
  }),
}));

export type Store = typeof stores.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductPrice = typeof productPrices.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export type ProductWithPrices = Product & { prices: ProductPrice[] };
