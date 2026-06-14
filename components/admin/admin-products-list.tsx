"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Star } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductSearchBar } from "@/components/catalog/product-search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoverImage } from "@/components/catalog/cover-image";
import type { ProductWithPrices } from "@/lib/db/schema";
import {
  filterProductsBySearch,
  sortProductsForDisplay,
} from "@/lib/catalog/product-list";
import { PRODUCT_TYPE_LABELS, type ProductType } from "@/lib/pricing/countries";
import { cn } from "@/lib/utils";

export function AdminProductsList({
  products,
  deleteToken,
  actionToken,
}: {
  products: ProductWithPrices[];
  deleteToken: string;
  actionToken: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return sortProductsForDisplay(filterProductsBySearch(products, query));
  }, [products, query]);

  async function toggleFeatured(product: ProductWithPrices) {
    setTogglingId(product.id);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          isFeatured: !product.isFeatured,
          _token: actionToken,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo actualizar");
      }

      router.refresh();
    } catch {
      // refresh will restore state on failure
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <ProductSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Buscar curso, pack o libro para editar…"
      />

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E8E0D5] bg-white p-10 text-center text-[#1A1A2E]/60">
          No se encontraron productos con esa búsqueda.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((product) => (
            <Card
              key={product.id}
              className={cn(product.isFeatured && "ring-2 ring-[#C8956C]/40")}
            >
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2]">
                  {product.coverUrl && (
                    <CoverImage
                      src={product.coverUrl}
                      alt={product.name}
                      sizes="80px"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#1A1A2E]">{product.name}</h2>
                    <Badge variant="secondary">
                      {PRODUCT_TYPE_LABELS[product.type as ProductType]}
                    </Badge>
                    {product.isFeatured && (
                      <Badge className="gap-1 border-transparent bg-[#C8956C] text-white">
                        <Star className="size-3 fill-current" />
                        Destacado
                      </Badge>
                    )}
                    {!product.isActive && <Badge variant="outline">Inactivo</Badge>}
                  </div>
                  <p className="mt-1 truncate text-sm text-[#1A1A2E]/60">
                    {product.slug}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={product.isFeatured ? "default" : "outline"}
                    disabled={togglingId === product.id}
                    onClick={() => toggleFeatured(product)}
                    title={
                      product.isFeatured
                        ? "Quitar de destacados"
                        : "Mostrar primero en la web"
                    }
                  >
                    {togglingId === product.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Star
                        className={cn(
                          "size-4",
                          product.isFeatured && "fill-current",
                        )}
                      />
                    )}
                    {product.isFeatured ? "Destacado" : "Destacar"}
                  </Button>

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
      )}
    </div>
  );
}
