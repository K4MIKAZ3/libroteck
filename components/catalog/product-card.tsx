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
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f6fb]">
          {product.coverUrl ? (
            <CoverImage
              src={product.coverUrl}
              alt={product.name}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#0b1020]/30">
              Sin portada
            </div>
          )}
          {product.isFeatured && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-3 gap-1 bg-[#ffd600] text-[#111]"
            >
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
      <CardContent className="space-y-3 p-5">
        <div>
          <Link href={`/producto/${product.slug}`}>
            <h3 className="line-clamp-2 text-lg font-bold text-[#0b1020] transition-colors hover:text-[#1f4bff]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[#666]">
            {PRODUCT_TYPE_LABELS[product.type as ProductType]}
          </p>
        </div>
        <div className="space-y-3">
          <ProductPriceDisplay price={price} size="sm" />
          <Button
            size="sm"
            className="w-full"
            onClick={handleAdd}
            disabled={!price}
          >
            <ShoppingCart className="size-4" />
            Añadir al carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
