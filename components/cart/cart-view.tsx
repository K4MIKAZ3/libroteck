"use client";

import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/providers/cart-provider";
import { useCountry } from "@/components/providers/country-provider";
import {
  formatPrice,
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/pricing/countries";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/message";
import { HOME_PATH } from "@/lib/routes";

export function CartView({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { country, currency } = useCountry();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg font-bold text-[#0b1020]">Tu carrito está vacío</p>
          <p className="text-sm text-[#666]">
            Explora el catálogo y añade cursos o libros.
          </p>
          <Button asChild>
            <Link href={HOME_PATH}>Ver catálogo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const message = buildWhatsAppMessage(
    items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      currency: item.currency,
    })),
    country,
  );
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex gap-4 p-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#f4f6fb]">
                {item.coverUrl && (
                  <CoverImage
                    src={item.coverUrl}
                    alt={item.name}
                    sizes="96px"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <Link
                    href={`/producto/${item.slug}`}
                    className="font-semibold text-[#0b1020] hover:text-[#1f4bff]"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-[#666]">
                    {PRODUCT_TYPE_LABELS[item.type as ProductType]}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-[#1f4bff]">
                      {formatPrice(item.unitPrice * item.quantity, item.currency)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-600"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[#666]">Total</span>
            <span className="text-2xl font-black text-[#1f4bff]">
              {formatPrice(total, currency)}
            </span>
          </div>
          <Button variant="whatsapp" size="lg" className="w-full" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Ordenar por WhatsApp
            </a>
          </Button>
          <p className="text-center text-xs text-[#666]">
            El pago se completa por WhatsApp de forma externa.
          </p>
          <Button variant="ghost" className="w-full" onClick={clearCart}>
            Vaciar carrito
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
