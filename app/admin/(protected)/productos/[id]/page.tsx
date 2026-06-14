import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { createFormToken } from "@/lib/auth/form-token";
import { getProductById } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, saveToken] = await Promise.all([
    getProductById(Number(id)),
    createFormToken("products"),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <ProductForm product={product} saveToken={saveToken} />
    </div>
  );
}
