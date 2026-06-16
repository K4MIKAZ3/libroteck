import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { products, stores } from "../lib/db/schema";
import { STREAMING_PROFILE_NOTE } from "../lib/store/streaming-labels";

const PROFILE_PREFIX = "Perfil individual (no cuenta completa). ";

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

  let updated = 0;

  for (const product of allProducts) {
    if (product.type !== "subscription") {
      continue;
    }

    let description = product.description;
    if (!description.startsWith(PROFILE_PREFIX)) {
      description = `${PROFILE_PREFIX}${description}`;
    }
    if (!description.includes(STREAMING_PROFILE_NOTE)) {
      description = `${description} ${STREAMING_PROFILE_NOTE}`;
    }

    await db
      .update(products)
      .set({ description })
      .where(eq(products.id, product.id));

    updated++;
  }

  await db
    .update(stores)
    .set({
      catalogSubtitle:
        "Perfiles individuales de cada plataforma. No son cuentas completas.",
      searchPlaceholder: "Buscar perfil Netflix, Spotify, Disney…",
    })
    .where(eq(stores.id, streamingStore.id));

  console.log(`Actualizados ${updated} productos y textos de tienda streaming.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
