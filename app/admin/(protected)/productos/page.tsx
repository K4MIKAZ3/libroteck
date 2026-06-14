import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createFormToken } from "@/lib/auth/form-token";
import { getAllProducts } from "@/lib/db/queries";
import { PRODUCT_TYPE_LABELS, type ProductType } from "@/lib/pricing/countries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, deleteToken] = await Promise.all([
    getAllProducts(),
    createFormToken("products"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2]">
                {product.coverUrl && (
                  <CoverImage src={product.coverUrl} alt={product.name} sizes="80px" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[#1A1A2E]">{product.name}</h2>
                  <Badge variant="secondary">
                    {PRODUCT_TYPE_LABELS[product.type as ProductType]}
                  </Badge>
                  {!product.isActive && <Badge variant="outline">Inactivo</Badge>}
                </div>
                <p className="mt-1 text-sm text-[#1A1A2E]/60">{product.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/productos/${product.id}`}>
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                </Button>
                <DeleteProductButton
                  productId={product.id}
                  deleteToken={deleteToken}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
