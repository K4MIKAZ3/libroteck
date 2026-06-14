"use client";

import { useState } from "react";
import { ProductPriceDisplay } from "@/components/catalog/product-price-display";
import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
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

export function ProductDetail({
  product,
}: {
  product: ProductWithPrices;
}) {
  const { country } = useCountry();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const price = getPriceForCountry(product.prices, country);

  return (
    <>
      <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Volver al catálogo
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-[#FAF7F2]">
              {product.coverUrl && (
                <CoverImage
                  src={product.coverUrl}
                  alt={product.name}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {PRODUCT_TYPE_LABELS[product.type as ProductType]}
                </Badge>
                {product.isNew && <Badge variant="new">Nuevo</Badge>}
              </div>
              <h1 className="font-heading mt-4 text-3xl font-bold text-[#1E3A5F] sm:text-4xl">
                {product.name}
              </h1>
              <ProductPriceDisplay price={price} size="lg" className="mt-4" />
            </div>

            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="leading-relaxed text-[#1A1A2E]/80">
                  {product.description}
                </p>
                <p className="text-sm text-[#1A1A2E]/60">
                  El pago se completa por WhatsApp de forma externa.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-[#E8E0D5] bg-white">
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
                          name: product.name,
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
