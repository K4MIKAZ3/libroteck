import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <ProductForm />
    </div>
  );
}
