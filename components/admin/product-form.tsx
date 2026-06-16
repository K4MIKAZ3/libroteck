"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { ProductCard } from "@/components/catalog/product-card";
import { CountryProvider } from "@/components/providers/country-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProductWithPrices } from "@/lib/db/schema";
import {
  COUNTRIES,
  PRODUCT_TYPE_LABELS,
  type CountryCode,
  type ProductType,
} from "@/lib/pricing/countries";
import {
  BOB_PER_USD,
  getExchangeRateSummary,
  pricesFromUsdToForm,
} from "@/lib/pricing/exchange-rates";
import {
  getDefaultProductType,
  getProductTypesForStore,
} from "@/lib/store/product-types";
import type { StoreSlug } from "@/lib/store/context";
import {
  resolveStreamingProductCategory,
  STREAMING_PRODUCT_CATEGORIES,
  type StreamingProductCategory,
} from "@/lib/store/streaming-categories";
import { slugify } from "@/lib/utils";

type PriceForm = Record<CountryCode, string>;

const emptyPrices = (): PriceForm => ({
  MX: "",
  CO: "",
  AR: "",
  PE: "",
  BO: "",
  INT: "",
});

export function ProductForm({
  product,
  saveToken,
  storeSlug,
  storeId,
}: {
  product?: ProductWithPrices;
  saveToken: string;
  storeSlug: StoreSlug;
  storeId: number;
}) {
  const router = useRouter();
  const isStreamingStore = storeSlug === "streaming";
  const productTypes = getProductTypesForStore(storeSlug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formToken, setFormToken] = useState(saveToken);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [type, setType] = useState<ProductType>(
    (product?.type as ProductType) ?? getDefaultProductType(storeSlug),
  );
  const [streamingCategory, setStreamingCategory] =
    useState<StreamingProductCategory>(
      product?.streamingCategory ??
        resolveStreamingProductCategory(
          product ?? {
            slug: "",
            name: "",
            type: "subscription",
            streamingCategory: null,
          },
        ) ??
        "streaming",
    );
  const [description, setDescription] = useState(product?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(product?.coverUrl ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [prices, setPrices] = useState<PriceForm>(() => {
    const initial = emptyPrices();
    product?.prices.forEach((price) => {
      initial[price.countryCode as CountryCode] = String(price.amount);
    });
    return initial;
  });

  function applyPricesFromUsd(usdValue: string) {
    const usd = Number(usdValue);
    if (!usdValue.trim() || Number.isNaN(usd) || usd < 0) {
      return;
    }

    setPrices(pricesFromUsdToForm(usd));
  }

  async function refreshFormToken() {
    const response = await fetch("/api/admin/form-token?purpose=products", {
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { token?: string };
    if (!data.token) {
      return null;
    }

    setFormToken(data.token);
    return data.token;
  }

  const previewProduct: ProductWithPrices = {
    id: product?.id ?? 0,
    storeId: product?.storeId ?? storeId,
    name: name || "Nombre del producto",
    slug: slug || "preview",
    type: isStreamingStore ? "subscription" : type,
    streamingCategory: isStreamingStore ? streamingCategory : null,
    description,
    coverUrl,
    isActive,
    isNew,
    isFeatured: product?.isFeatured ?? false,
    sortOrder: product?.sortOrder ?? 0,
    createdAt: product?.createdAt ?? new Date(),
    prices: (Object.entries(prices) as [CountryCode, string][])
      .filter(([, amount]) => amount.trim() !== "")
      .map(([countryCode, amount], index) => ({
        id: index,
        productId: product?.id ?? 0,
        countryCode,
        currency: COUNTRIES[countryCode].currency,
        amount: Number(amount),
        compareAtAmount: null,
      })),
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    let token = formToken;
    const refreshedToken = await refreshFormToken();
    if (refreshedToken) {
      token = refreshedToken;
    }

    const payload = {
      name,
      slug: slug || slugify(name),
      type: isStreamingStore ? ("subscription" as const) : type,
      ...(isStreamingStore ? { streamingCategory } : {}),
      description,
      coverUrl,
      isActive,
      isNew,
      prices: (Object.entries(prices) as [CountryCode, string][])
        .filter(([, amount]) => amount.trim() !== "")
        .map(([countryCode, amount]) => ({
          countryCode,
          currency: COUNTRIES[countryCode].currency,
          amount: Number(amount),
        })),
      _token: token,
    };

    try {
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401) {
        router.replace(
          `/admin/login?next=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "No se pudo guardar el producto");
      }

      router.replace("/admin/productos");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error al guardar",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Editar producto" : "Nuevo producto"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (!product && !slug) {
                    setSlug(slugify(event.target.value));
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(event) => setSlug(slugify(event.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {isStreamingStore ? (
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={streamingCategory}
                  onValueChange={(value) =>
                    setStreamingCategory(value as StreamingProductCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STREAMING_PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as ProductType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((productType) => (
                      <SelectItem key={productType} value={productType}>
                        {PRODUCT_TYPE_LABELS[productType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsActive(true)}
                >
                  Activo
                </Button>
                <Button
                  type="button"
                  variant={!isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsActive(false)}
                >
                  Inactivo
                </Button>
                <Button
                  type="button"
                  variant={isNew ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsNew(!isNew)}
                >
                  Nuevo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
            />
          </div>

          <ImageUpload
            value={coverUrl}
            onChange={setCoverUrl}
            uploadToken={formToken}
          />

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="price-INT">
                {COUNTRIES.INT.flag} Precio base en dólares (USD)
              </Label>
              <Input
                id="price-INT"
                type="number"
                min="0"
                step="0.01"
                value={prices.INT}
                onChange={(event) => {
                  const value = event.target.value;
                  setPrices((current) => ({ ...current, INT: value }));
                  applyPricesFromUsd(value);
                }}
                placeholder="Ej. 2.10"
              />
              <p className="text-xs leading-relaxed text-[#666]">
                Al escribir el precio en USD se calculan automáticamente los
                demás países según el equivalente en su moneda. Bolivia usa la
                tasa oficial fija Bs {BOB_PER_USD} = US$1.
              </p>
              <p className="text-xs text-[#888]">{getExchangeRateSummary()}</p>
            </div>

            <Label>Precios por país</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                Object.entries(COUNTRIES) as [
                  CountryCode,
                  (typeof COUNTRIES)[CountryCode],
                ][]
              )
                .filter(([code]) => code !== "INT")
                .map(([code, meta]) => (
                  <div key={code} className="space-y-2">
                    <Label htmlFor={`price-${code}`}>
                      {meta.flag} {meta.label} ({meta.currency})
                    </Label>
                    <Input
                      id={`price-${code}`}
                      type="number"
                      min="0"
                      step={code === "CO" || code === "AR" ? "1" : "0.01"}
                      value={prices[code]}
                      onChange={(event) =>
                        setPrices((current) => ({
                          ...current,
                          [code]: event.target.value,
                        }))
                      }
                      placeholder={`Precio en ${meta.currency}`}
                    />
                  </div>
                ))}
            </div>
            {prices.INT.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPricesFromUsd(prices.INT)}
              >
                Recalcular todos desde USD
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Guardar producto
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Vista previa
            <Badge variant="secondary">Catálogo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CountryProvider>
            <ProductCard
              product={previewProduct}
              storeSlug={storeSlug}
            />
          </CountryProvider>
        </CardContent>
      </Card>
    </form>
  );
}
