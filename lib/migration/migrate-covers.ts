import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import type { getDb } from "@/lib/db/index";
import { products } from "@/lib/db/schema";

async function migrateCover(url: string, slug: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("svg")
    ? "svg"
    : contentType.includes("jpeg")
      ? "jpg"
      : "png";

  const blob = await put(`covers/${slug}.${ext}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });

  return blob.url;
}

const OLD_BLOB_HOST = "j0r3oovgvivlgleo.public.blob.vercel-storage.com";
const NEW_BLOB_HOST = "fkTVVZ8bjNl5q9kO.public.blob.vercel-storage.com";

export async function migrateCoversToBlob(db: Awaited<ReturnType<typeof getDb>>) {
  const allProducts = await db.select().from(products);
  let updated = 0;
  const errors: string[] = [];

  for (const product of allProducts) {
    if (!product.coverUrl || product.coverUrl.includes(NEW_BLOB_HOST)) {
      continue;
    }

    if (
      product.coverUrl.startsWith("/covers/") &&
      !product.coverUrl.includes(OLD_BLOB_HOST)
    ) {
      continue;
    }

    try {
      const newUrl = await migrateCover(product.coverUrl, product.slug);
      await db
        .update(products)
        .set({ coverUrl: newUrl })
        .where(eq(products.id, product.id));
      updated++;
    } catch (error) {
      errors.push(
        `${product.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return { updated, errors };
}
