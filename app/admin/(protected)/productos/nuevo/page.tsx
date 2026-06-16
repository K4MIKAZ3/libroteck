import { redirect } from "next/navigation";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ProductForm } from "@/components/admin/product-form";
import { createFormToken } from "@/lib/auth/form-token";
import { getAdminPageContext } from "@/lib/auth/page-context";
import { getStoreContext } from "@/lib/store/context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewProductPage() {
  const { capabilities } = await getAdminPageContext();

  if (!capabilities.canWriteProducts) {
    redirect("/admin/productos");
  }

  const [{ slug, storeId }, saveToken] = await Promise.all([
    getStoreContext(),
    createFormToken("products"),
  ]);

  return (
    <AdminPageShell active="productos" capabilities={capabilities}>
      <ProductForm
        saveToken={saveToken}
        storeSlug={slug}
        storeId={storeId}
      />
    </AdminPageShell>
  );
}
