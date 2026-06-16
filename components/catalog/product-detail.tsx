"use client";

import { useState } from "react";
import { ProductPriceDisplay } from "@/components/catalog/product-price-display";
import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, User, Bot, LayoutDashboard } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCountry } from "@/components/providers/country-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductWithPrices } from "@/lib/db/schema";
import { getPriceForCountry } from "@/lib/pricing/product-price";
import {
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/pricing/countries";
import { HOME_PATH } from "@/lib/routes";
import type { StoreSlug } from "@/lib/store/context";
import { getStreamingCatalogCategory } from "@/lib/store/streaming-categories";
import {
  getStreamingDisplayName,
  getStreamingProductSubtitle,
  STREAMING_PROFILE_NOTE,
} from "@/lib/store/streaming-labels";

export function ProductDetail({
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
  const [quantity, setQuantity] = useState(1);
  const price = getPriceForCountry(product.prices, country);
  const displayName =
    isStreaming && streamingCategory === "streaming"
      ? getStreamingDisplayName(product.name)
      : product.name;
  const typeLabel = isStreaming
    ? getStreamingProductSubtitle(product)
    : PRODUCT_TYPE_LABELS[product.type as ProductType];

  return (
    <>
      <Button asChild variant="ghost" className="mb-6">
        <Link href={HOME_PATH}>
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-[var(--surface)]">
            {product.coverUrl && (
              <CoverImage
                src={product.coverUrl}
                alt={displayName}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{typeLabel}</Badge>
              {streamingCategory === "streaming" && (
                <Badge className="gap-1 bg-[#111] text-white">
                  <User className="size-3" />
                  Perfil individual
                </Badge>
              )}
              {streamingCategory === "panel" && (
                <Badge className="gap-1 bg-[#075e54] text-white">
                  <LayoutDashboard className="size-3" />
                  Panel
                </Badge>
              )}
              {streamingCategory === "ia" && (
                <Badge className="gap-1 bg-[#6b21a8] text-white">
                  <Bot className="size-3" />
                  IA
                </Badge>
              )}
              {product.isNew && <Badge variant="new">Nuevo</Badge>}
            </div>
            <h1 className="font-heading mt-4 text-3xl font-black text-[var(--foreground)] sm:text-4xl">
              {displayName}
            </h1>
            <ProductPriceDisplay price={price} size="lg" className="mt-4" />
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="leading-relaxed text-[#555]">{product.description}</p>
              {streamingCategory === "streaming" && (
                <p className="rounded-xl bg-[var(--surface)] p-3 text-sm text-[#555]">
                  {STREAMING_PROFILE_NOTE}
                </p>
              )}
              {streamingCategory === "streaming" && (
                <p className="text-sm text-[#666]">
                  ¿Quieres varios perfiles? Usa{" "}
                  <a
                    href="/home#arma-tu-combo"
                    className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
                  >
                    Arma tu combo
                  </a>{" "}
                  y ahorra hasta 40%.
                </p>
              )}
              <p className="text-sm text-[#666]">
                El pago se completa por WhatsApp de forma externa.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-[var(--border)] bg-white">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="lg"
                  disabled={!price}
                  onClick={() => {
                    if (!price) return;
                    addItem(
                      {
                        productId: product.id,
                        slug: product.slug,
                        name: displayName,
                        type: product.type as ProductType,
                        coverUrl: product.coverUrl,
                        unitPrice: price.amount,
                        currency: price.currency,
                      },
                      quantity,
                    );
                  }}
                >
                  <ShoppingCart className="size-4" />
                  Añadir al carrito
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
