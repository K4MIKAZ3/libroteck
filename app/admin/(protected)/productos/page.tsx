import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { createFormToken } from "@/lib/auth/form-token";
import { getAllProducts } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, actionToken] = await Promise.all([
    getAllProducts(),
    createFormToken("products"),
  ]);

  return (
    <AdminPageShell active="productos">
      <AdminProductsList
        products={products}
        deleteToken={actionToken}
        actionToken={actionToken}
      />
    </AdminPageShell>
  );
}
