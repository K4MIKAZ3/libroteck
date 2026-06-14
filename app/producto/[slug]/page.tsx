import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/product-detail";
import { StoreShell } from "@/components/layout/store-shell";
import { getProductBySlug, getSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <StoreShell settings={settings}>
      <ProductDetail product={product} />
    </StoreShell>
  );
}
