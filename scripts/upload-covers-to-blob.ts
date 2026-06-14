import { readFileSync, readdirSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getDb } from "../lib/db/index";
import { products } from "../lib/db/schema";

async function svgToPngBuffer(svgPath: string) {
  const svg = readFileSync(svgPath);
  return sharp(svg, { density: 150 }).png().resize(600, 800, { fit: "cover" }).toBuffer();
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is required.");
    process.exit(1);
  }

  const db = await getDb();
  const allProducts = await db.select().from(products);
  const coversDir = path.join(process.cwd(), "public", "covers");

  let updated = 0;

  for (const product of allProducts) {
    if (!product.coverUrl.startsWith("/covers/")) {
      console.log(`Skip (external): ${product.name}`);
      continue;
    }

    const filename = product.coverUrl.replace("/covers/", "");
    const svgPath = path.join(coversDir, filename);

    if (!filename.endsWith(".svg")) {
      console.log(`Skip (not svg): ${product.name}`);
      continue;
    }

    let pngBuffer: Buffer;
    try {
      pngBuffer = await svgToPngBuffer(svgPath);
    } catch (error) {
      console.error(`Failed to convert ${filename}:`, error);
      continue;
    }

    const pngName = filename.replace(/\.svg$/, ".png");
    const blob = await put(`covers/${pngName}`, pngBuffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/png",
    });

    await db
      .update(products)
      .set({ coverUrl: blob.url })
      .where(eq(products.id, product.id));

    console.log(`Updated #${product.id}: ${blob.url}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} product covers.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
