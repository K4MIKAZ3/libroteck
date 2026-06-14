import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllProducts } from "@/lib/db/queries";
import { PRODUCT_TYPE_LABELS, type ProductType } from "@/lib/pricing/countries";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2]">
                {product.coverUrl && (
                  <Image
                    src={product.coverUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
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
                <form action={`/api/admin/products/${product.id}`} method="post">
                  <input type="hidden" name="_method" value="DELETE" />
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    formAction={`/api/admin/products/${product.id}/delete`}
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
