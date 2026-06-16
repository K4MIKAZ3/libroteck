"use client";

import { ProductPriceDisplay } from "@/components/catalog/product-price-display";
import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { ShoppingCart, Star, User, Bot, LayoutDashboard } from "lucide-react";
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
import { getStreamingCatalogCategory } from "@/lib/store/streaming-categories";
import {
  getStreamingDisplayName,
  getStreamingProductSubtitle,
  getStreamingProductSummary,
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
  const streamingCategory = isStreaming
    ? getStreamingCatalogCategory(product)
    : null;
  const { country } = useCountry();
  const { addItem } = useCart();
  const price = getPriceForCountry(product.prices, country);
  const displayName =
    isStreaming && streamingCategory === "streaming"
      ? getStreamingDisplayName(product.name)
      : product.name;
  const typeLabel = isStreaming
    ? getStreamingProductSubtitle(product)
    : PRODUCT_TYPE_LABELS[product.type as ProductType];
  const summary = isStreaming
    ? getStreamingProductSummary(product.description)
    : product.description.trim();

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
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          {product.coverUrl ? (
            <CoverImage
              src={product.coverUrl}
              alt={displayName}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--foreground)]/30">
              Sin portada
            </div>
          )}
          {streamingCategory === "streaming" && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 gap-1 bg-[#111] text-white"
            >
              <User className="size-3" />
              Perfil
            </Badge>
          )}
          {streamingCategory === "panel" && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 gap-1 bg-[#075e54] text-white"
            >
              <LayoutDashboard className="size-3" />
              Panel
            </Badge>
          )}
          {streamingCategory === "ia" && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 gap-1 bg-[#6b21a8] text-white"
            >
              <Bot className="size-3" />
              IA
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
                isStreaming && streamingCategory === "streaming"
                  ? "left-3 top-12"
                  : isStreaming &&
                      (streamingCategory === "panel" || streamingCategory === "ia")
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
            <h3 className="line-clamp-2 text-lg font-bold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]">
              {displayName}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[#666]">{typeLabel}</p>
          {summary && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#888]">
              {summary}
            </p>
          )}
          {streamingCategory === "streaming" && (
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
