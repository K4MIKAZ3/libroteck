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
  type CountryCode,
  type ProductType,
} from "@/lib/pricing/countries";
import { slugify } from "@/lib/utils";

type PriceForm = Record<CountryCode, string>;

const emptyPrices = (): PriceForm => ({
  MX: "",
  CO: "",
  AR: "",
  PE: "",
  INT: "",
});

export function ProductForm({
  product,
}: {
  product?: ProductWithPrices;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [type, setType] = useState<ProductType>(
    (product?.type as ProductType) ?? "course",
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

  const previewProduct: ProductWithPrices = {
    id: product?.id ?? 0,
    name: name || "Nombre del producto",
    slug: slug || "preview",
    type,
    description,
    coverUrl,
    isActive,
    isNew,
    createdAt: product?.createdAt ?? new Date(),
    prices: (Object.entries(prices) as [CountryCode, string][])
      .filter(([, amount]) => amount.trim() !== "")
      .map(([countryCode, amount], index) => ({
        id: index,
        productId: product?.id ?? 0,
        countryCode,
        currency: COUNTRIES[countryCode].currency,
        amount: Number(amount),
      })),
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug: slug || slugify(name),
      type,
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
    };

    try {
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "No se pudo guardar el producto");
      }

      router.push("/admin/productos");
      router.refresh();
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
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as ProductType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Curso</SelectItem>
                  <SelectItem value="book">Libro</SelectItem>
                  <SelectItem value="bundle">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <ImageUpload value={coverUrl} onChange={setCoverUrl} />

          <div className="space-y-3">
            <Label>Precios por país</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(COUNTRIES) as [CountryCode, (typeof COUNTRIES)[CountryCode]][]).map(
                ([code, meta]) => (
                  <div key={code} className="space-y-2">
                    <Label htmlFor={`price-${code}`}>
                      {meta.flag} {meta.label} ({meta.currency})
                    </Label>
                    <Input
                      id={`price-${code}`}
                      type="number"
                      min="0"
                      step="0.01"
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
                ),
              )}
            </div>
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
            <ProductCard product={previewProduct} />
          </CountryProvider>
        </CardContent>
      </Card>
    </form>
  );
}
