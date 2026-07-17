"use client";

import { CoverImage } from "@/components/catalog/cover-image";
import Link from "next/link";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/providers/cart-provider";
import { useCountry } from "@/components/providers/country-provider";
import { useInboxHub } from "@/components/providers/inbox-hub-provider";
import {
  formatPrice,
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/pricing/countries";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/message";
import { HOME_PATH } from "@/lib/routes";

export function CartView({
  whatsappNumber,
  storeName = "LibroTeck",
  whatsappOrderTemplate,
  onlineCheckoutEnabled = false,
}: {
  whatsappNumber: string;
  storeName?: string;
  whatsappOrderTemplate?: string;
  onlineCheckoutEnabled?: boolean;
}) {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { country, currency } = useCountry();
  const inboxHub = useInboxHub();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg font-bold text-[var(--foreground)]">Tu carrito está vacío</p>
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
      isCombo: item.isCombo,
      comboLines: item.comboLines,
      comboDiscountPercent: item.comboDiscountPercent,
      comboSubtotal: item.comboSubtotal,
    })),
    country,
    storeName,
    whatsappOrderTemplate,
  );
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);
  const productSummary = items
    .map((item) =>
      item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name,
    )
    .join(", ");

  function orderOnline() {
    inboxHub.openWithOrder({
      productSummary: productSummary.slice(0, 180),
      message,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex gap-4 p-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]">
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
                  {item.isCombo ? (
                    <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
                  ) : (
                    <Link
                      href={`/producto/${item.slug}`}
                      className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                    >
                      {item.name}
                    </Link>
                  )}
                  {item.isCombo && item.comboLines ? (
                    <ul className="mt-2 space-y-1 text-xs text-[#666]">
                      {item.comboLines.map((line) => (
                        <li key={line.name}>
                          {line.name} — {formatPrice(line.unitPrice, item.currency)}
                        </li>
                      ))}
                      {item.comboDiscountPercent != null && (
                        <li className="font-medium text-[#e50914]">
                          Descuento combo: {item.comboDiscountPercent}%
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#666]">
                      {PRODUCT_TYPE_LABELS[item.type as ProductType]}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {item.isCombo ? (
                    <span className="text-sm text-[#666]">1 combo</span>
                  ) : (
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
                  )}
                  <div className="flex items-center gap-3">
                    <p className="font-black text-[var(--primary)]">
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
            <span className="text-2xl font-black text-[var(--primary)]">
              {formatPrice(total, currency)}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#666]">
              Cómo quieres pagar
            </p>
            {onlineCheckoutEnabled && (
              <Button
                size="lg"
                className="w-full"
                type="button"
                onClick={orderOnline}
              >
                <MessageCircle className="size-5" />
                Ordenar en línea
              </Button>
            )}
            <Button variant="whatsapp" size="lg" className="w-full" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Ordenar por WhatsApp
              </a>
            </Button>
          </div>

          <p className="text-center text-xs text-[#666]">
            {onlineCheckoutEnabled
              ? "En línea: te atendemos por chat para validar el pago. WhatsApp: mismo pedido por mensaje."
              : "El pago se completa por WhatsApp de forma externa."}
          </p>
          <Button variant="ghost" className="w-full" onClick={clearCart}>
            Vaciar carrito
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
