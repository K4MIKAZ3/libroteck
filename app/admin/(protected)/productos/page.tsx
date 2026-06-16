import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { createFormToken } from "@/lib/auth/form-token";
import { getAdminPageContext } from "@/lib/auth/page-context";
import { getAllProducts } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const { capabilities } = await getAdminPageContext();
  const [products, actionToken] = await Promise.all([
    getAllProducts(),
    createFormToken("products"),
  ]);

  return (
    <AdminPageShell active="productos" capabilities={capabilities}>
      <AdminProductsList
        products={products}
        deleteToken={actionToken}
        actionToken={actionToken}
        readOnly={!capabilities.canWriteProducts}
      />
    </AdminPageShell>
  );
}
