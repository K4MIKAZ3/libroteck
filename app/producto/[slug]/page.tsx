import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/product-detail";
import { StoreShell } from "@/components/layout/store-shell";
import { getProductBySlug } from "@/lib/db/queries";
import { getStoreContext } from "@/lib/store/context";

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
  const [product, { store, settings, slug: storeSlug }] = await Promise.all([
    getProductBySlug(slug),
    getStoreContext(),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <StoreShell store={store} settings={settings} storeSlug={storeSlug}>
      <ProductDetail product={product} />
    </StoreShell>
  );
}
