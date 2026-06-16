"use client";

import { useMemo, useState } from "react";
import type { ProductWithPrices } from "@/lib/db/schema";
import { ImageUpload } from "@/components/admin/image-upload";
import { HeroOfferCard } from "@/components/marketing/hero-offer-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatHeroOfferTitle } from "@/lib/store/hero-offer";
import { formatPrice } from "@/lib/pricing/countries";
import { getPriceForCountry } from "@/lib/pricing/product-price";
import type { StoreSlug } from "@/lib/store/context";

const CUSTOM_PLATFORM = "custom";
const CUSTOM_SUBTITLE = "custom";

const STREAMING_SUBTITLE_PRESETS = [
  {
    id: "streaming-mix",
    label: "Disney+, HBO Max y más plataformas",
    value: "Disney+, HBO Max y más plataformas",
  },
  {
    id: "streaming-profiles",
    label: "Perfiles individuales — no cuentas completas",
    value: "Perfiles individuales — no cuentas completas",
  },
  {
    id: "streaming-catalog",
    label: "Más de 30 plataformas disponibles",
    value: "Más de 30 plataformas disponibles",
  },
] as const;

const LIBROTECK_SUBTITLE_PRESETS = [
  {
    id: "libroteck-packs",
    label: "Packs completos desde $6.00",
    value: "Packs completos desde $6.00",
  },
  {
    id: "libroteck-courses",
    label: "Cursos digitales al mejor precio",
    value: "Cursos digitales al mejor precio",
  },
] as const;

type HeroOfferEditorProps = {
  products: ProductWithPrices[];
  storeSlug: StoreSlug;
  heroOfferServiceName: string;
  heroOfferPrice: string;
  heroOfferSubtitle: string;
  heroOfferBackgroundImageUrl: string;
  onServiceNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onBackgroundImageChange: (value: string) => void;
  uploadToken: string;
};

function normalizePlatformName(name: string) {
  return name.trim().replace(/^perfil\s+/i, "");
}

function findProductForService(
  products: ProductWithPrices[],
  serviceName: string,
) {
  const target = normalizePlatformName(serviceName).toLowerCase();
  if (!target) {
    return undefined;
  }

  return products.find((product) => {
    const plain = product.name.trim().toLowerCase();
    return plain === target || `perfil ${plain}` === target;
  });
}

function getSuggestedPrice(product: ProductWithPrices) {
  const intPrice = getPriceForCountry(product.prices, "INT");
  if (intPrice) {
    return formatPrice(intPrice.amount, intPrice.currency);
  }

  const mxPrice = getPriceForCountry(product.prices, "MX");
  if (mxPrice) {
    return formatPrice(mxPrice.amount, mxPrice.currency);
  }

  return "";
}

function resolveSubtitlePreset(
  subtitle: string,
  presets: ReadonlyArray<{ id: string; value: string }>,
) {
  const match = presets.find((preset) => preset.value === subtitle.trim());
  return match?.id ?? CUSTOM_SUBTITLE;
}

export function HeroOfferEditor({
  products,
  storeSlug,
  heroOfferServiceName,
  heroOfferPrice,
  heroOfferSubtitle,
  heroOfferBackgroundImageUrl,
  onServiceNameChange,
  onPriceChange,
  onSubtitleChange,
  onBackgroundImageChange,
  uploadToken,
}: HeroOfferEditorProps) {
  const subtitlePresets =
    storeSlug === "streaming"
      ? STREAMING_SUBTITLE_PRESETS
      : LIBROTECK_SUBTITLE_PRESETS;

  const catalogProducts = useMemo(
    () =>
      products
        .filter((product) => product.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [products],
  );

  const matchedProduct = useMemo(
    () => findProductForService(catalogProducts, heroOfferServiceName),
    [catalogProducts, heroOfferServiceName],
  );

  const [platformMode, setPlatformMode] = useState(() =>
    matchedProduct ? String(matchedProduct.id) : CUSTOM_PLATFORM,
  );

  const [subtitleMode, setSubtitleMode] = useState(() =>
    resolveSubtitlePreset(heroOfferSubtitle, subtitlePresets),
  );

  const titlePreview = formatHeroOfferTitle({
    heroOfferServiceName,
    heroOfferPrice,
    heroOfferTitle: "",
  });

  function handlePlatformChange(value: string) {
    setPlatformMode(value);

    if (value === CUSTOM_PLATFORM) {
      return;
    }

    const product = catalogProducts.find(
      (item) => String(item.id) === value,
    );
    if (!product) {
      return;
    }

    onServiceNameChange(normalizePlatformName(product.name));
    const suggestedPrice = getSuggestedPrice(product);
    if (suggestedPrice) {
      onPriceChange(suggestedPrice);
    }
  }

  function handleSubtitlePresetChange(value: string) {
    setSubtitleMode(value);

    if (value === CUSTOM_SUBTITLE) {
      return;
    }

    const preset = subtitlePresets.find((item) => item.id === value);
    if (preset) {
      onSubtitleChange(preset.value);
    }
  }

  return (
    <div className="rounded-xl border border-[#E8E0D5] bg-[#FAF7F2]/60 p-4 space-y-4">
      <div>
        <p className="font-medium text-[var(--primary-hover)]">
          Tarjeta amarilla del banner (oferta destacada)
        </p>
        <p className="mt-1 text-xs text-[#1A1A2E]/60">
          Edita el texto que aparece en la tarjeta del hero, por ejemplo{" "}
          <strong>Netflix desde $3.99</strong> y{" "}
          <strong>Disney+, HBO Max y más plataformas</strong>.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroPlatformSelect">
          Plataforma o producto destacado
        </Label>
        <Select value={platformMode} onValueChange={handlePlatformChange}>
          <SelectTrigger id="heroPlatformSelect">
            <SelectValue placeholder="Elige del catálogo o personaliza" />
          </SelectTrigger>
          <SelectContent>
            {catalogProducts.map((product) => (
              <SelectItem key={product.id} value={String(product.id)}>
                {product.name}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_PLATFORM}>Otro valor personalizado</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-[#1A1A2E]/60">
          Al elegir del catálogo se rellena el nombre y el precio sugerido. Puedes
          ajustarlos abajo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heroOfferServiceName">Nombre en el título</Label>
          <Input
            id="heroOfferServiceName"
            value={heroOfferServiceName}
            onChange={(event) => {
              setPlatformMode(CUSTOM_PLATFORM);
              onServiceNameChange(event.target.value);
            }}
            placeholder="Netflix"
          />
          <p className="text-xs text-[#1A1A2E]/55">
            Primera parte del título grande.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroOfferPrice">Precio en el título</Label>
          <Input
            id="heroOfferPrice"
            value={heroOfferPrice}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder="$3.99"
          />
          <p className="text-xs text-[#1A1A2E]/55">
            Segunda parte: se muestra como &quot;desde $3.99&quot;.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[#E8E0D5] bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[#1A1A2E]/50">
          Título que verá el cliente
        </p>
        <p className="mt-1 text-lg font-black text-[var(--foreground)]">{titlePreview}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroSubtitleSelect">Texto secundario del banner</Label>
        <Select value={subtitleMode} onValueChange={handleSubtitlePresetChange}>
          <SelectTrigger id="heroSubtitleSelect">
            <SelectValue placeholder="Elige un texto o personaliza" />
          </SelectTrigger>
          <SelectContent>
            {subtitlePresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_SUBTITLE}>Otro texto personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroOfferSubtitle">Texto secundario</Label>
        <Input
          id="heroOfferSubtitle"
          value={heroOfferSubtitle}
          onChange={(event) => {
            setSubtitleMode(CUSTOM_SUBTITLE);
            onSubtitleChange(event.target.value);
          }}
          placeholder="Disney+, HBO Max y más plataformas"
        />
        <p className="text-xs text-[#1A1A2E]/55">
          Línea debajo del título, por ejemplo otras plataformas incluidas.
        </p>
      </div>

      <ImageUpload
        label="Fondo del banner (opcional)"
        value={heroOfferBackgroundImageUrl}
        onChange={onBackgroundImageChange}
        uploadToken={uploadToken}
        previewClassName="aspect-[16/10] max-w-[240px]"
        placeholder="Deja vacío para usar el color amarillo/naranja"
        emptyPreviewText="Degradado por defecto"
        allowClear
      />

      <div className="max-w-sm">
        <p className="mb-2 text-xs font-medium text-[#1A1A2E]/60">
          Vista previa de la tarjeta
        </p>
        <HeroOfferCard
          store={{
            heroOfferServiceName,
            heroOfferPrice,
            heroOfferTitle: "",
            heroOfferSubtitle,
            heroOfferBackgroundImageUrl,
          }}
        />
      </div>
    </div>
  );
}
