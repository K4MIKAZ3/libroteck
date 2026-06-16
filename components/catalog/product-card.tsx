"use client";

import { ProductPriceDisplay } from "@/components/catalog/product-price-display";
import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { ShoppingCart, Star, User } from "lucide-react";
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
import type { StoreSlug } from "@/lib/store/context";
import {
  getStreamingDisplayName,
  getStreamingProductSubtitle,
} from "@/lib/store/streaming-labels";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  storeSlug = "libroteck",
}: {
  product: ProductWithPrices;
  storeSlug?: StoreSlug;
}) {
  const isStreaming = storeSlug === "streaming";
  const { country } = useCountry();
  const { addItem } = useCart();
  const price = getPriceForCountry(product.prices, country);
  const displayName =
    isStreaming && product.type === "subscription"
      ? getStreamingDisplayName(product.name)
      : product.name;
  const typeLabel = isStreaming
    ? getStreamingProductSubtitle(product.type)
    : PRODUCT_TYPE_LABELS[product.type as ProductType];

  const handleAdd = () => {
    if (!price) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: displayName,
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
              alt={displayName}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#0b1020]/30">
              Sin portada
            </div>
          )}
          {isStreaming && product.type === "subscription" && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 gap-1 bg-[#111] text-white"
            >
              <User className="size-3" />
              Perfil
            </Badge>
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
            <Badge
              variant="new"
              className={cn(
                "absolute gap-1",
                isStreaming && product.type === "subscription"
                  ? "left-3 top-12"
                  : "left-3 top-3",
              )}
            >
              <Star className="size-3 fill-current" />
              Nuevo
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-5">
        <div>
          <Link href={`/producto/${product.slug}`}>
            <h3 className="line-clamp-2 text-lg font-bold text-[#0b1020] transition-colors hover:text-[#2a4494]">
              {displayName}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[#666]">{typeLabel}</p>
          {isStreaming && product.type === "subscription" && (
            <p className="mt-1 text-xs text-[#888]">No incluye cuenta completa</p>
          )}
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
