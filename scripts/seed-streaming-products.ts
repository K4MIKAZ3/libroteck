import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products, stores } from "../lib/db/schema";
import type { ProductType } from "../lib/pricing/countries";
import { pricesFromUsd } from "../lib/pricing/streaming-prices";
import { slugify } from "../lib/utils";

const DEFAULT_USD = 2;
const COVER = "/covers/streaming/default.svg";

type SeedProduct = {
  name: string;
  usd?: number;
  type: ProductType;
  description?: string;
  isNew?: boolean;
};

const CATALOG: SeedProduct[] = [
  {
    name: "Netflix más meses",
    type: "subscription",
    description: "Cuenta Netflix con más meses de acceso incluidos.",
  },
  {
    name: "Paramount+",
    usd: 1.1,
    type: "subscription",
    description: "Acceso a Paramount+ con series, películas y deportes en vivo.",
  },
  {
    name: "Flujo TV",
    usd: 1.39,
    type: "subscription",
    description: "Servicio Flujo TV para ver contenido en streaming.",
  },
  {
    name: "Netflix",
    usd: 2.1,
    type: "subscription",
    description: "Cuenta Netflix lista para usar. Entrega rápida por WhatsApp.",
    isNew: true,
  },
  {
    name: "IPTV Smart",
    usd: 1.1,
    type: "subscription",
    description: "Lista IPTV Smart con canales y contenido on demand.",
  },
  {
    name: "Spotify",
    usd: 2.1,
    type: "subscription",
    description: "Spotify Premium sin anuncios. Música ilimitada.",
    isNew: true,
  },
  {
    name: "Disney+",
    usd: 1.5,
    type: "subscription",
    description: "Disney+ con películas, series y contenido Marvel y Star Wars.",
  },
  {
    name: "Prime Video",
    usd: 1.1,
    type: "subscription",
    description: "Amazon Prime Video con series y películas exclusivas.",
  },
  {
    name: "HBO Max",
    usd: 1,
    type: "subscription",
    description: "HBO Max con series premium y estrenos.",
  },
  {
    name: "Crunchyroll",
    usd: 1,
    type: "subscription",
    description: "Crunchyroll para anime sin anuncios.",
  },
  {
    name: "Scribd",
    usd: 1,
    type: "subscription",
    description: "Scribd con libros, audiolibros y revistas digitales.",
  },
  {
    name: "Nuvia TV",
    usd: 1.5,
    type: "subscription",
    description: "Nuvia TV con canales y contenido en streaming.",
  },
  {
    name: "ViX",
    usd: 0.5,
    type: "subscription",
    description: "ViX con series y novelas en español.",
  },
  {
    name: "YouTube Premium",
    usd: 1,
    type: "subscription",
    description: "YouTube Premium sin anuncios y con descarga offline.",
  },
  {
    name: "Telelatino",
    usd: 1,
    type: "subscription",
    description: "Telelatino con canales latinos y contenido variado.",
  },
  {
    name: "Panel IPTV",
    usd: 2,
    type: "subscription",
    description: "Panel IPTV para revendedores y uso personal.",
  },
  {
    name: "Panel Flujotv",
    usd: 2,
    type: "subscription",
    description: "Panel Flujotv con acceso administrativo.",
  },
  {
    name: "Panel Telelatino",
    usd: 1,
    type: "subscription",
    description: "Panel Telelatino para gestión de cuentas.",
  },
  {
    name: "Combos",
    type: "bundle",
    description: "Combo de 2 plataformas streaming a precio especial.",
    isNew: true,
  },
  {
    name: "Combos triples",
    type: "bundle",
    description: "Combo de 3 plataformas streaming. Máximo ahorro.",
    isNew: true,
  },
  {
    name: "Cursos",
    type: "subscription",
    description: "Acceso a cursos digitales premium.",
  },
  {
    name: "Canva Pro",
    usd: 0.5,
    type: "subscription",
    description: "Canva Pro con plantillas y recursos premium.",
  },
  {
    name: "Duolingo",
    usd: 1.5,
    type: "subscription",
    description: "Duolingo Plus sin anuncios y con más funciones.",
  },
  {
    name: "ChatGPT",
    usd: 1.5,
    type: "subscription",
    description: "Acceso ChatGPT Plus para IA avanzada.",
    isNew: true,
  },
  {
    name: "CapCut",
    usd: 1.55,
    type: "subscription",
    description: "CapCut Pro para edición de video sin marca de agua.",
  },
  {
    name: "Apple TV+",
    usd: 1,
    type: "subscription",
    description: "Apple TV+ con series y películas originales.",
  },
  {
    name: "IPTV Mica Play",
    usd: 1,
    type: "subscription",
    description: "IPTV Mica Play con canales y VOD.",
  },
  {
    name: "Magis TV Pro",
    usd: 1,
    type: "subscription",
    description: "Magis TV Pro con deportes y entretenimiento.",
  },
  {
    name: "Canva Edu",
    usd: 0.5,
    type: "subscription",
    description: "Canva Edu para estudiantes y educadores.",
  },
  {
    name: "Tidal",
    usd: 1,
    type: "subscription",
    description: "Tidal con audio de alta calidad.",
  },
  {
    name: "Premium Hub",
    usd: 1,
    type: "subscription",
    description: "Acceso premium a contenido exclusivo para adultos.",
  },
  {
    name: "Deezer",
    usd: 1,
    type: "subscription",
    description: "Deezer Premium sin anuncios.",
  },
  {
    name: "Plex TV",
    usd: 1.8,
    type: "subscription",
    description: "Plex TV con películas, series y canales en vivo.",
  },
];

async function main() {
  const db = await getDb();
  const streamingStore = await db.query.stores.findFirst({
    where: eq(stores.slug, "streaming"),
  });

  if (!streamingStore) {
    console.error("Tienda streaming no encontrada. Ejecuta migraciones primero.");
    process.exit(1);
  }

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.storeId, streamingStore.id))
    .limit(1);

  if (existing.length > 0) {
    console.log("La tienda streaming ya tiene productos. Omitiendo seed.");
    return;
  }

  let created = 0;

  for (const item of CATALOG) {
    const usd = item.usd ?? DEFAULT_USD;
    const slug = slugify(item.name);
    const priceRows = pricesFromUsd(usd);

    const [product] = await db
      .insert(products)
      .values({
        storeId: streamingStore.id,
        name: item.name,
        slug,
        type: item.type,
        description: item.description ?? `Cuenta ${item.name} — entrega digital por WhatsApp.`,
        coverUrl: COVER,
        isActive: true,
        isNew: item.isNew ?? false,
        isFeatured: item.type === "bundle",
        sortOrder: item.type === "bundle" ? 10 : 0,
      })
      .returning();

    await db.insert(productPrices).values(
      priceRows.map((price) => ({
        productId: product.id,
        countryCode: price.countryCode,
        currency: price.currency,
        amount: price.amount,
        compareAtAmount: null,
      })),
    );

    console.log(`+ ${item.name} — $${usd} USD`);
    created++;
  }

  console.log(`\n${created} productos creados en XCONDEF (streaming).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
