import { copyFileSync, mkdirSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import { SALE_AMOUNTS } from "../lib/pricing/countries";
import { slugify } from "../lib/utils";

const NAME = "Sistemas electrónicos y fallas comunes en Chevrolet";
const SLUG = slugify(NAME);

const DESCRIPTION = `Curso virtual sobre sistemas electrónicos y fallas comunes en vehículos Chevrolet.

Sistemas de encendido y carga en Chevrolet:
• Estructura interna del alternador. Procedimiento de localizar fallas en el interior.
• Módulos BCM y ECM que controlan al alternador.`;

const ORIGINAL_COURSE_PRICES = {
  MX: 599,
  CO: 109000,
  AR: 59000,
  PE: 99,
  BO: 69,
  INT: 34.99,
} as const;

const SOURCE_IMAGE = path.join(process.cwd(), "assets", "chevrolet-course-cover.png");

async function uploadCover() {
  const coversDir = path.join(process.cwd(), "public", "covers");
  mkdirSync(coversDir, { recursive: true });

  const localPath = path.join(coversDir, `${SLUG}.png`);
  copyFileSync(SOURCE_IMAGE, localPath);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("No BLOB token, using local cover path");
    return `/covers/${SLUG}.png`;
  }

  const { readFileSync } = await import("fs");
  const buffer = readFileSync(localPath);
  const blob = await put(`covers/${SLUG}.png`, buffer, {
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
        type: "course",
        isActive: true,
      })
      .where(eq(products.id, existing[0].id));

    console.log(`Updated existing product #${existing[0].id}: ${SLUG}`);
    return;
  }

  const [created] = await db
    .insert(products)
    .values({
      name: NAME,
      slug: SLUG,
      type: "course",
      description: DESCRIPTION,
      coverUrl,
      isActive: true,
      isNew: true,
    })
    .returning();

  const sale = SALE_AMOUNTS.course;
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
      compareAtAmount: ORIGINAL_COURSE_PRICES[countryCode],
    })),
  );

  console.log(`Created #${created.id}: ${SLUG}`);
  console.log(`Cover: ${coverUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
