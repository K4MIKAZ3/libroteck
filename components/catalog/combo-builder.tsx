"use client";

import { useMemo, useState } from "react";
import { Check, ChevronUp, Package, ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCountry } from "@/components/providers/country-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductWithPrices } from "@/lib/db/schema";
import { getPriceForCountry } from "@/lib/pricing/product-price";
import {
  calculateComboTotal,
  COMBO_DISCOUNT_RULES,
  COMBO_MAX_PROFILES,
  COMBO_MIN_PROFILES,
  formatComboSummary,
} from "@/lib/pricing/custom-combo";
import { formatPrice } from "@/lib/pricing/countries";
import {
  getStreamingDisplayName,
  isComboEligibleProduct,
  STREAMING_PROFILE_NOTE,
} from "@/lib/store/streaming-labels";
import { cn } from "@/lib/utils";

type ComboBuilderProps = {
  products: ProductWithPrices[];
  onMinimize?: () => void;
};

export function ComboBuilder({ products, onMinimize }: ComboBuilderProps) {
  const { country, currency } = useCountry();
  const { addItem } = useCart();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [added, setAdded] = useState(false);

  const eligible = useMemo(
    () => products.filter(isComboEligibleProduct),
    [products],
  );

  const selectedProducts = useMemo(
    () => eligible.filter((product) => selectedIds.includes(product.id)),
    [eligible, selectedIds],
  );

  const pricedProfiles = useMemo(
    () =>
      selectedProducts
        .map((product) => {
          const price = getPriceForCountry(product.prices, country);
          if (!price) return null;
          return {
            product,
            amount: price.amount,
            currency: price.currency,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null),
    [selectedProducts, country],
  );

  const combo = useMemo(() => {
    if (pricedProfiles.length < COMBO_MIN_PROFILES) {
      return null;
    }
    return calculateComboTotal(
      pricedProfiles.map((row) => row.amount),
      pricedProfiles[0]?.currency ?? currency,
    );
  }, [pricedProfiles, currency]);

  function toggleProduct(productId: number) {
    setAdded(false);
    setSelectedIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (current.length >= COMBO_MAX_PROFILES) {
        return current;
      }
      return [...current, productId];
    });
  }

  function handleAddCombo() {
    if (!combo || pricedProfiles.length === 0) {
      return;
    }

    const profileNames = pricedProfiles.map((row) =>
      getStreamingDisplayName(row.product.name),
    );
    const comboId = -Date.now();

    addItem({
      productId: comboId,
      slug: `combo-${comboId}`,
      name: `Combo personalizado (${combo.profileCount} perfiles)`,
      type: "bundle",
      coverUrl: "/covers/streaming/default.svg",
      unitPrice: combo.total,
      currency: combo.currency,
      isCombo: true,
      comboLines: pricedProfiles.map((row) => ({
        name: getStreamingDisplayName(row.product.name),
        unitPrice: row.amount,
      })),
      comboDiscountPercent: combo.discountPercent,
      comboSubtotal: combo.subtotal,
    });

    setSelectedIds([]);
    setAdded(true);
  }

  return (
    <section className="rounded-[32px] border border-[#e0e4ef] bg-white p-6 shadow-[0_12px_40px_rgba(18,26,46,0.06)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge className="mb-3 gap-1 bg-[#ffd600] text-[#111] hover:bg-[#ffd600]">
            <Sparkles className="size-3" />
            Arma tu combo
          </Badge>
          <h2 className="font-heading text-2xl font-black text-[#0b1020] sm:text-3xl">
            Crea tu combo de perfiles
          </h2>
          <p className="mt-2 max-w-2xl text-[#555]">
            Elige entre {COMBO_MIN_PROFILES} y {COMBO_MAX_PROFILES} perfiles.
            Cada ítem es un <strong>perfil individual</strong>, no cuenta
            completa. El descuento se aplica al total del combo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {COMBO_DISCOUNT_RULES.map((rule) => (
              <span
                key={rule.count}
                className="rounded-full bg-[#f4f6fb] px-3 py-1 text-xs font-bold text-[#2a4494]"
              >
                {rule.count} perfiles → {rule.percent}% OFF
              </span>
            ))}
          </div>
          {onMinimize ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMinimize}
              className="gap-1"
            >
              <ChevronUp className="size-4" />
              Minimizar
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm text-[#666]">{STREAMING_PROFILE_NOTE}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {eligible.map((product) => {
            const price = getPriceForCountry(product.prices, country);
            const isSelected = selectedIds.includes(product.id);
            const isDisabled =
              !isSelected && selectedIds.length >= COMBO_MAX_PROFILES;

            return (
              <button
                key={product.id}
                type="button"
                disabled={!price || isDisabled}
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-[#2a4494] bg-[#e8ecf5] shadow-sm"
                    : "border-[#e0e4ef] bg-white hover:border-[#2a4494]/40",
                  isDisabled && "cursor-not-allowed opacity-50",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0b1020]">
                    {getStreamingDisplayName(product.name)}
                  </p>
                  <p className="text-xs text-[#666]">Perfil individual</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {price && (
                    <span className="text-sm font-bold text-[#2a4494]">
                      {formatPrice(price.amount, price.currency)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-[#2a4494] bg-[#2a4494] text-white"
                        : "border-[#c8d0e4] bg-white",
                    )}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Card className="h-fit border-[#e0e4ef] lg:sticky lg:top-28">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-[#2a4494]" />
              Tu combo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-[#666]">
                Selecciona al menos {COMBO_MIN_PROFILES} perfiles para ver el
                precio con descuento.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {pricedProfiles.map((row) => (
                  <li
                    key={row.product.id}
                    className="flex justify-between gap-2 text-[#555]"
                  >
                    <span className="truncate">
                      {getStreamingDisplayName(row.product.name)}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatPrice(row.amount, row.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {combo ? (
              <div className="space-y-1 rounded-2xl bg-[#f4f6fb] p-4">
                <div className="flex justify-between text-sm text-[#666]">
                  <span>Subtotal</span>
                  <span>{formatPrice(combo.subtotal, combo.currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#e50914]">
                  <span>Descuento ({combo.discountPercent}%)</span>
                  <span>−{formatPrice(combo.discountAmount, combo.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-[#e0e4ef] pt-2 text-lg font-black text-[#2a4494]">
                  <span>Total combo</span>
                  <span>{formatPrice(combo.total, combo.currency)}</span>
                </div>
                <p className="text-xs text-[#666]">
                  {formatComboSummary(
                    combo.subtotal,
                    combo.discountPercent,
                    combo.total,
                    combo.currency,
                  )}
                </p>
              </div>
            ) : selectedProducts.length === 1 ? (
              <p className="text-sm text-[#666]">
                Agrega 1 perfil más para activar el 40% de descuento.
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              disabled={!combo}
              onClick={handleAddCombo}
            >
              <ShoppingCart className="size-4" />
              Añadir combo al carrito
            </Button>

            {added && (
              <p className="text-center text-sm font-medium text-green-600">
                Combo añadido al carrito.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
