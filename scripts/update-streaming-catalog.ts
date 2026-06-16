import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { products, stores } from "../lib/db/schema";
import { slugify } from "../lib/utils";

const LEGACY_COMBO_SLUGS = ["combos", "combos-triples"];

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "netflix-mas-meses":
    "Perfil de Netflix con más meses de acceso incluidos. Entrega digital por WhatsApp.",
  paramount:
    "Perfil de Paramount+ con series, películas y deportes en vivo.",
  "flujo-tv": "Perfil de Flujo TV para ver contenido en streaming.",
  netflix:
    "Perfil de Netflix listo para usar. Ideal para series y películas sin cuenta completa.",
  "iptv-smart": "Perfil IPTV Smart con canales y contenido on demand.",
  spotify:
    "Perfil de Spotify Premium sin anuncios. Música ilimitada en tu dispositivo.",
  "disney-plus":
    "Perfil de Disney+ con Marvel, Star Wars, Pixar y más contenido familiar.",
  "prime-video":
    "Perfil de Prime Video con series y películas exclusivas de Amazon.",
  "hbo-max": "Perfil de HBO Max con series premium y estrenos recientes.",
  crunchyroll: "Perfil de Crunchyroll para ver anime sin anuncios.",
  scribd: "Perfil de Scribd con libros, audiolibros y revistas digitales.",
  "nuvia-tv": "Perfil de Nuvia TV con canales y contenido en streaming.",
  vix: "Perfil de ViX con series y novelas en español.",
  "youtube-premium":
    "Perfil de YouTube Premium sin anuncios y con descarga offline.",
  telelatino: "Perfil de Telelatino con canales latinos y variedad de contenido.",
  "panel-iptv":
    "Panel IPTV para revender listas y administrar clientes de forma independiente.",
  "panel-flujotv":
    "Panel Flujotv con acceso administrativo para gestionar cuentas y servicios.",
  "panel-telelatino":
    "Panel Telelatino para administrar y revender accesos de la plataforma.",
  cursos: "Acceso a cursos digitales premium seleccionados.",
  "canva-pro": "Perfil de Canva Pro con plantillas y recursos de diseño premium.",
  duolingo: "Perfil de Duolingo Plus sin anuncios y con funciones extra de estudio.",
  chatgpt:
    "Acceso a ChatGPT Plus con modelos avanzados para texto, código e imágenes.",
  capcut: "Perfil de CapCut Pro para editar video sin marca de agua.",
  "apple-tv-plus": "Perfil de Apple TV+ con series y películas originales.",
  "iptv-mica-play": "Perfil IPTV Mica Play con canales y contenido VOD.",
  "magis-tv-pro": "Perfil Magis TV Pro con deportes y entretenimiento.",
  "canva-edu": "Perfil Canva Edu para estudiantes y docentes.",
  tidal: "Perfil de Tidal con audio de alta calidad y sin anuncios.",
  "premium-hub": "Acceso premium a contenido exclusivo para adultos.",
  deezer: "Perfil de Deezer Premium sin anuncios.",
  "plex-tv": "Perfil Plex TV con películas, series y canales en vivo.",
};

async function main() {
  const db = await getDb();
  const streamingStore = await db.query.stores.findFirst({
    where: eq(stores.slug, "streaming"),
  });

  if (!streamingStore) {
    console.error("Tienda streaming no encontrada.");
    process.exit(1);
  }

  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, streamingStore.id));

  let updatedDescriptions = 0;
  let deactivatedCombos = 0;

  for (const product of allProducts) {
    const slug = product.slug.toLowerCase();

    if (LEGACY_COMBO_SLUGS.includes(slug) || product.type === "bundle") {
      if (product.isActive) {
        await db
          .update(products)
          .set({ isActive: false, isFeatured: false })
          .where(eq(products.id, product.id));
        deactivatedCombos++;
        console.log(`- Desactivado: ${product.name}`);
      }
      continue;
    }

    const description =
      PRODUCT_DESCRIPTIONS[slug] ??
      PRODUCT_DESCRIPTIONS[slugify(product.name)] ??
      product.description.trim();

    if (!description) {
      continue;
    }

    if (description !== product.description) {
      await db
        .update(products)
        .set({ description })
        .where(eq(products.id, product.id));
      updatedDescriptions++;
      console.log(`✓ ${product.name}`);
    }
  }

  await db
    .update(stores)
    .set({
      catalogSubtitle:
        "Streaming, IA y paneles de revendedor. Perfiles individuales donde aplica.",
      searchPlaceholder: "Buscar Netflix, ChatGPT, panel IPTV…",
    })
    .where(eq(stores.id, streamingStore.id));

  const remainingBundles = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.storeId, streamingStore.id),
        inArray(products.slug, LEGACY_COMBO_SLUGS),
      ),
    );

  console.log(
    `\nListo: ${updatedDescriptions} descripciones actualizadas, ${deactivatedCombos} combos desactivados (${remainingBundles.length} legacy en BD).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
