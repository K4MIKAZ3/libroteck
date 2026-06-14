"use client";

import { ProductPriceDisplay } from "@/components/catalog/product-price-display";
import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/providers/cart-provider";
import { useCountry } from "@/components/providers/country-provider";
import { getPriceForCountry } from "@/lib/pricing/product-price";
import {
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/pricing/countries";
import type { ProductWithPrices } from "@/lib/db/schema";

export function ProductCard({ product }: { product: ProductWithPrices }) {
  const { country } = useCountry();
  const { addItem } = useCart();
  const price = getPriceForCountry(product.prices, country);

  const handleAdd = () => {
    if (!price) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      type: product.type as ProductType,
      coverUrl: product.coverUrl,
      unitPrice: price.amount,
      currency: price.currency,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
          {product.coverUrl ? (
            <CoverImage
              src={product.coverUrl}
              alt={product.name}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#1A1A2E]/30">
              Sin portada
            </div>
          )}
          {product.isFeatured && (
            <Badge variant="secondary" className="absolute right-3 top-3 gap-1 bg-[#C8956C] text-white">
              <Star className="size-3 fill-current" />
              Top
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="new" className="absolute left-3 top-3 gap-1">
              <Star className="size-3 fill-current" />
              Nuevo
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div>
          <Link href={`/producto/${product.slug}`}>
            <h3 className="line-clamp-2 font-semibold text-[#1A1A2E] transition-colors hover:text-[#1E3A5F]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[#1A1A2E]/60">
            {PRODUCT_TYPE_LABELS[product.type as ProductType]}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ProductPriceDisplay price={price} size="sm" />
          <Button size="sm" onClick={handleAdd} disabled={!price}>
            <ShoppingCart className="size-4" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
