import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import { SALE_AMOUNTS } from "../lib/pricing/countries";
import { slugify } from "../lib/utils";

const NAME = "TF VICTOR, Tomos 18, 19 y 20";
const SLUG = slugify(NAME);

const DESCRIPTION = `Coleccion digital TF VICTOR con manuales tecnicos para motores a gasolina y diesel ligero (motores americanos).

Incluye:
• Edicion 18 - Tomo 1 y Tomo 2
• Edicion 19 - Tomo 1 y Tomo 2
• Edicion 20 - Tomo 1 y Tomo 2
• Apartados tecnicos
• Curso ECU (2 volumenes)

Actualizados, imprimibles y con acceso inmediato tras la compra.`;

const HIGHLIGHTS = ["Actualizados", "Imprimibles", "Acceso inmediato"];

const ORIGINAL_PACK_PRICES = {
  MX: 799,
  CO: 149000,
  AR: 79000,
  PE: 129,
  BO: 110,
  INT: 49.99,
} as const;

async function uploadCover() {
  const coversDir = path.join(process.cwd(), "public", "covers");
  const svgPath = path.join(coversDir, `${SLUG}.svg`);
  const pngPath = path.join(coversDir, `${SLUG}.png`);

  const svg = readFileSync(svgPath);
  const png = await sharp(svg, { density: 200 })
    .png()
    .resize(600, 800, { fit: "cover" })
    .toBuffer();

  writeFileSync(pngPath, png);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return `/covers/${SLUG}.png`;
  }

  const blob = await put(`covers/${SLUG}.png`, png, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });

  return blob.url;
}

async function main() {
  const db = await getDb();
  const coverUrl = await uploadCover();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.slug, SLUG))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(products)
      .set({
        name: NAME,
        description: DESCRIPTION,
        coverUrl,
        type: "bundle",
        isActive: true,
        isNew: true,
      })
      .where(eq(products.id, existing[0].id));

    console.log(`Updated existing product #${existing[0].id}: ${SLUG}`);
    console.log(`Cover: ${coverUrl}`);
    return;
  }

  const [created] = await db
    .insert(products)
    .values({
      name: NAME,
      slug: SLUG,
      type: "bundle",
      description: DESCRIPTION,
      coverUrl,
      isActive: true,
      isNew: true,
    })
    .returning();

  const sale = SALE_AMOUNTS.bundle;
  const countries = ["MX", "CO", "AR", "PE", "BO", "INT"] as const;

  await db.insert(productPrices).values(
    countries.map((countryCode) => ({
      productId: created.id,
      countryCode,
      currency:
        countryCode === "MX"
          ? "MXN"
          : countryCode === "CO"
            ? "COP"
            : countryCode === "AR"
              ? "ARS"
              : countryCode === "PE"
                ? "PEN"
                : countryCode === "BO"
                  ? "BOB"
                  : "USD",
      amount: sale[countryCode],
      compareAtAmount: ORIGINAL_PACK_PRICES[countryCode],
    })),
  );

  console.log(`Created #${created.id}: ${SLUG}`);
  console.log(`Cover: ${coverUrl}`);
  console.log(`Highlights: ${HIGHLIGHTS.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
