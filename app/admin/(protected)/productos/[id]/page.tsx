import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ProductForm } from "@/components/admin/product-form";
import { createFormToken } from "@/lib/auth/form-token";
import { getAdminPageContext } from "@/lib/auth/page-context";
import { getProductById } from "@/lib/db/queries";
import { getStoreContext } from "@/lib/store/context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { capabilities } = await getAdminPageContext();
  const [{ storeId, slug }, product, saveToken] = await Promise.all([
    getStoreContext(),
    getProductById(Number(id)),
    createFormToken("products"),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminPageShell active="productos" capabilities={capabilities}>
      <ProductForm
        product={product}
        saveToken={saveToken}
        storeSlug={slug}
        storeId={storeId}
        readOnly={!capabilities.canWriteProducts}
      />
    </AdminPageShell>
  );
}
