import bcrypt from "bcryptjs";
import { and, asc, desc, eq, max } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { sortProductsForDisplay } from "@/lib/catalog/product-list";
import type { CountryCode, ProductType } from "@/lib/pricing/countries";
import { getPriceForCountry as resolvePriceForCountry } from "@/lib/pricing/product-price";
import {
  getStoreContext,
  getStoreSlugFromRequest,
  type StoreSlug,
} from "@/lib/store/context";
import { getDb } from "./index";
import {
  productPrices,
  products,
  settings,
  stores,
  type ProductWithPrices,
  type Settings,
} from "./schema";

async function getStoreIdForRequest(request?: Request) {
  const db = await getDb();

  if (request) {
    const slug = getStoreSlugFromRequest(request);
    const store = await db.query.stores.findFirst({
      where: eq(stores.slug, slug),
    });
    if (!store) {
      throw new Error(`Tienda no encontrada: ${slug}`);
    }
    return store.id;
  }

  const { storeId } = await getStoreContext();
  return storeId;
}

async function getSettingsRow(storeId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.storeId, storeId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSettings(request?: Request) {
  noStore();
  const storeId = await getStoreIdForRequest(request);
  const row = await getSettingsRow(storeId);
  if (row) {
    return row;
  }

  const slug = request
    ? getStoreSlugFromRequest(request)
    : (await getStoreContext()).slug;

  return {
    id: storeId,
    storeId,
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
    storeName: slug === "streaming" ? "XCONDEF" : "LibroTeck",
    welcomeMessage:
      slug === "streaming"
        ? "Cuentas premium de streaming al mejor precio"
        : "Elige tu país y ordena por WhatsApp",
    whatsappOrderTemplate: "",
    adminPasswordHash: null,
    promoEnabled: false,
    promoTitle: "",
    promoMessage: "",
    promoLink: "",
    promoButtonLabel: "Ver promoción",
    adsEnabled: false,
    adsenseClientId: "",
    adSlotTop: "",
    adSlotLeft: "",
    adSlotRight: "",
  } satisfies Omit<Settings, "id"> & { id: number };
}

export async function getAdminPasswordHash(request?: Request) {
  noStore();
  const storeId = await getStoreIdForRequest(request);
  const row = await getSettingsRow(storeId);
  return row?.adminPasswordHash ?? null;
}

export async function upsertSettings(
  data: {
    whatsappNumber: string;
    storeName: string;
    welcomeMessage: string;
    whatsappOrderTemplate?: string;
    promoEnabled?: boolean;
    promoTitle?: string;
    promoMessage?: string;
    promoLink?: string;
    promoButtonLabel?: string;
    adsEnabled?: boolean;
    adsenseClientId?: string;
    adSlotTop?: string;
    adSlotLeft?: string;
    adSlotRight?: string;
  },
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);
  const existing = await getSettingsRow(storeId);

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(settings)
    .values({ ...data, storeId })
    .returning();
  return created;
}

export async function updateAdminPassword(
  newPassword: string,
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);
  const hash = await bcrypt.hash(newPassword, 10);
  const existing = await getSettingsRow(storeId);

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({ adminPasswordHash: hash })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  const slug = request
    ? getStoreSlugFromRequest(request)
    : (await getStoreContext()).slug;

  const [created] = await db
    .insert(settings)
    .values({
      storeId,
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
      storeName: slug === "streaming" ? "XCONDEF" : "LibroTeck",
      welcomeMessage:
        slug === "streaming"
          ? "Cuentas premium de streaming al mejor precio"
          : "Elige tu país y ordena por WhatsApp",
      adminPasswordHash: hash,
    })
    .returning();
  return created;
}

export async function getStoreRecord(request?: Request) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });

  if (!store) {
    throw new Error("Tienda no encontrada");
  }

  return store;
}

export async function updateStoreHeroOffer(
  data: {
    heroOfferServiceName: string;
    heroOfferPrice: string;
    heroOfferSubtitle: string;
    heroOfferBackgroundImageUrl: string;
  },
  request?: Request,
) {
  noStore();
  const db = await getDb();
  const storeId = await getStoreIdForRequest(request);

  const service = data.heroOfferServiceName.trim();
  const price = data.heroOfferPrice.trim();
  const heroOfferTitle =
    service && price ? `${service} desde ${price}` : service || price;

  const [updated] = await db
    .update(stores)
    .set({
      heroOfferServiceName: service,
      heroOfferPrice: price,
      heroOfferSubtitle: data.heroOfferSubtitle.trim(),
      heroOfferBackgroundImageUrl: data.heroOfferBackgroundImageUrl.trim(),
      heroOfferTitle,
    })
    .where(eq(stores.id, storeId))
    .returning();

  if (!updated) {
    throw new Error("No se pudo actualizar el banner");
  }

  return updated;
}

export async function getActiveProducts(
  request?: Request,
): Promise<ProductWithPrices[]> {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  const rows = await db.query.products.findMany({
    where: and(eq(products.storeId, storeId), eq(products.isActive, true)),
    with: { prices: true },
  });
  return sortProductsForDisplay(rows);
}

export async function getAllProducts(
  request?: Request,
): Promise<ProductWithPrices[]> {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  const rows = await db.query.products.findMany({
    where: eq(products.storeId, storeId),
    with: { prices: true },
  });
  return sortProductsForDisplay(rows);
}

export async function getProductBySlug(
  slug: string,
  request?: Request,
): Promise<ProductWithPrices | undefined> {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  return db.query.products.findFirst({
    where: and(eq(products.storeId, storeId), eq(products.slug, slug)),
    with: { prices: true },
  });
}

export async function getProductById(
  id: number,
  request?: Request,
): Promise<ProductWithPrices | undefined> {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  return db.query.products.findFirst({
    where: and(eq(products.storeId, storeId), eq(products.id, id)),
    with: { prices: true },
  });
}

export function getPriceForCountry(
  product: ProductWithPrices,
  countryCode: CountryCode,
) {
  return resolvePriceForCountry(product.prices, countryCode);
}

export async function createProduct(
  input: {
    name: string;
    slug: string;
    type: ProductType;
    streamingCategory?: "streaming" | "ia" | "panel" | null;
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
  request?: Request,
) {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  const [product] = await db
    .insert(products)
    .values({
      storeId,
      name: input.name,
      slug: input.slug,
      type: input.type,
      streamingCategory: input.streamingCategory ?? null,
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

  return getProductById(product.id, request);
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    slug: string;
    type: ProductType;
    streamingCategory?: "streaming" | "ia" | "panel" | null;
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
  request?: Request,
) {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  await db
    .update(products)
    .set({
      name: input.name,
      slug: input.slug,
      type: input.type,
      streamingCategory: input.streamingCategory ?? null,
      description: input.description,
      coverUrl: input.coverUrl,
      isActive: input.isActive,
      isNew: input.isNew,
    })
    .where(and(eq(products.id, id), eq(products.storeId, storeId)));

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

  return getProductById(id, request);
}

export async function deleteProduct(id: number, request?: Request) {
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.storeId, storeId)));
}

export async function setProductFeatured(
  id: number,
  isFeatured: boolean,
  request?: Request,
) {
  noStore();
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();

  let sortOrder = 0;
  if (isFeatured) {
    const [row] = await db
      .select({ value: max(products.sortOrder) })
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.isFeatured, true)));
    sortOrder = (row?.value ?? 0) + 1;
  }

  const [updated] = await db
    .update(products)
    .set({ isFeatured, sortOrder })
    .where(and(eq(products.id, id), eq(products.storeId, storeId)))
    .returning();

  return updated ?? null;
}

export async function featureAllBundles(request?: Request) {
  noStore();
  const storeId = await getStoreIdForRequest(request);
  const db = await getDb();
  const bundleList = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.type, "bundle")))
    .orderBy(desc(products.createdAt));

  let order = bundleList.length;
  for (const bundle of bundleList) {
    await db
      .update(products)
      .set({ isFeatured: true, sortOrder: order })
      .where(eq(products.id, bundle.id));
    order--;
  }

  return bundleList.length;
}

export async function getCurrentStoreSlug(request?: Request): Promise<StoreSlug> {
  if (request) {
    return getStoreSlugFromRequest(request);
  }
  const { slug } = await getStoreContext();
  return slug;
}
