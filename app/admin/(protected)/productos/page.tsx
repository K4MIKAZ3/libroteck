import { AdminNav } from "@/components/admin/admin-nav";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <AdminProductsList
        products={products}
        deleteToken={actionToken}
        actionToken={actionToken}
      />
    </div>
  );
}
