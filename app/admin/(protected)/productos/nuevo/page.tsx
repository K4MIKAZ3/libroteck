import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { createFormToken } from "@/lib/auth/form-token";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewProductPage() {
  const saveToken = await createFormToken("products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <ProductForm saveToken={saveToken} />
    </div>
  );
}
