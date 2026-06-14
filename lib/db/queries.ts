import bcrypt from "bcryptjs";
import { asc, desc, eq, max } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { sortProductsForDisplay } from "@/lib/catalog/product-list";
import type { CountryCode, ProductType } from "@/lib/pricing/countries";
import { getPriceForCountry as resolvePriceForCountry } from "@/lib/pricing/product-price";
import { getDb } from "./index";
import {
  productPrices,
  products,
  settings,
  type ProductWithPrices,
  type Settings,
} from "./schema";

function defaultSettings(): Omit<Settings, "id"> & { id: number } {
  return {
    id: 1,
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
    storeName: "LibroTeck",
    welcomeMessage: "Elige tu país y ordena por WhatsApp",
    adminPasswordHash: null,
    promoEnabled: false,
    promoTitle: "",
    promoMessage: "",
    promoLink: "",
    promoButtonLabel: "Ver promoción",
  };
}

async function getSettingsRow() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(settings)
    .orderBy(asc(settings.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSettings() {
  noStore();
  const row = await getSettingsRow();
  return row ?? defaultSettings();
}

export async function getAdminPasswordHash() {
  noStore();
  const row = await getSettingsRow();
  return row?.adminPasswordHash ?? null;
}

export async function upsertSettings(data: {
  whatsappNumber: string;
  storeName: string;
  welcomeMessage: string;
  promoEnabled?: boolean;
  promoTitle?: string;
  promoMessage?: string;
  promoLink?: string;
  promoButtonLabel?: string;
}) {
  noStore();
  const db = await getDb();
  const existing = await getSettingsRow();

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(settings).values(data).returning();
  return created;
}

export async function updateAdminPassword(newPassword: string) {
  noStore();
  const db = await getDb();
  const hash = await bcrypt.hash(newPassword, 10);
  const existing = await getSettingsRow();

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({ adminPasswordHash: hash })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(settings)
    .values({
      ...defaultSettings(),
      adminPasswordHash: hash,
    })
    .returning();
  return created;
}

export async function getActiveProducts(): Promise<ProductWithPrices[]> {
  const db = await getDb();
  const rows = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { prices: true },
  });
  return sortProductsForDisplay(rows);
}

export async function getAllProducts(): Promise<ProductWithPrices[]> {
  const db = await getDb();
  const rows = await db.query.products.findMany({
    with: { prices: true },
  });
  return sortProductsForDisplay(rows);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithPrices | undefined> {
  const db = await getDb();
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { prices: true },
  });
}

export async function getProductById(
  id: number,
): Promise<ProductWithPrices | undefined> {
  const db = await getDb();
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { prices: true },
  });
}

export function getPriceForCountry(
  product: ProductWithPrices,
  countryCode: CountryCode,
) {
  return resolvePriceForCountry(product.prices, countryCode);
}

export async function createProduct(input: {
  name: string;
  slug: string;
  type: ProductType;
  description: string;
  coverUrl: string;
  isActive: boolean;
  isNew: boolean;
  prices: Array<{
    countryCode: CountryCode;
    currency: string;
    amount: number;
  }>;
}) {
  const db = await getDb();
  const [product] = await db
    .insert(products)
    .values({
      name: input.name,
      slug: input.slug,
      type: input.type,
      description: input.description,
      coverUrl: input.coverUrl,
      isActive: input.isActive,
      isNew: input.isNew,
    })
    .returning();

  if (input.prices.length > 0) {
    await db.insert(productPrices).values(
      input.prices.map((price) => ({
        productId: product.id,
        countryCode: price.countryCode,
        currency: price.currency,
        amount: price.amount,
      })),
    );
  }

  return getProductById(product.id);
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    slug: string;
    type: ProductType;
    description: string;
    coverUrl: string;
    isActive: boolean;
    isNew: boolean;
    prices: Array<{
      countryCode: CountryCode;
      currency: string;
      amount: number;
    }>;
  },
) {
  const db = await getDb();
  await db
    .update(products)
    .set({
      name: input.name,
      slug: input.slug,
      type: input.type,
      description: input.description,
      coverUrl: input.coverUrl,
      isActive: input.isActive,
      isNew: input.isNew,
    })
    .where(eq(products.id, id));

  await db.delete(productPrices).where(eq(productPrices.productId, id));

  if (input.prices.length > 0) {
    await db.insert(productPrices).values(
      input.prices.map((price) => ({
        productId: id,
        countryCode: price.countryCode,
        currency: price.currency,
        amount: price.amount,
      })),
    );
  }

  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  await db.delete(products).where(eq(products.id, id));
}

export async function setProductFeatured(
  id: number,
  isFeatured: boolean,
) {
  noStore();
  const db = await getDb();

  let sortOrder = 0;
  if (isFeatured) {
    const [row] = await db
      .select({ value: max(products.sortOrder) })
      .from(products)
      .where(eq(products.isFeatured, true));
    sortOrder = (row?.value ?? 0) + 1;
  }

  const [updated] = await db
    .update(products)
    .set({ isFeatured, sortOrder })
    .where(eq(products.id, id))
    .returning();

  return updated ?? null;
}

export async function featureAllBundles() {
  noStore();
  const db = await getDb();
  const bundles = await db
    .select()
    .from(products)
    .where(eq(products.type, "bundle"))
    .orderBy(desc(products.createdAt));

  let order = bundles.length;
  for (const bundle of bundles) {
    await db
      .update(products)
      .set({ isFeatured: true, sortOrder: order })
      .where(eq(products.id, bundle.id));
    order--;
  }

  return bundles.length;
}
