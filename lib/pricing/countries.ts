export type CountryCode = "MX" | "CO" | "AR" | "PE" | "BO" | "INT";

export type ProductType = "course" | "book" | "bundle";

export const COUNTRIES: Record<
  CountryCode,
  { label: string; currency: string; flag: string }
> = {
  MX: { label: "México", currency: "MXN", flag: "🇲🇽" },
  CO: { label: "Colombia", currency: "COP", flag: "🇨🇴" },
  AR: { label: "Argentina", currency: "ARS", flag: "🇦🇷" },
  PE: { label: "Perú", currency: "PEN", flag: "🇵🇪" },
  BO: { label: "Bolivia", currency: "BOB", flag: "🇧🇴" },
  INT: { label: "Internacional", currency: "USD", flag: "🌎" },
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  course: "Curso",
  book: "Libro",
  bundle: "Paquete",
};

export const DEFAULT_COUNTRY: CountryCode = "MX";

/** Precio de oferta por tipo de producto y país */
export const SALE_AMOUNTS: Record<
  "course" | "bundle",
  Record<CountryCode, number>
> = {
  course: {
    INT: 3.99,
    MX: 69,
    CO: 15900,
    AR: 3990,
    PE: 15,
    BO: 28,
  },
  bundle: {
    INT: 6,
    MX: 110,
    CO: 25000,
    AR: 5500,
    PE: 22,
    BO: 42,
  },
};

/** Precio anterior (tachado) por tier y país */
export const COMPARE_AT_AMOUNTS: Record<
  "course" | "bundle" | "mega",
  Record<CountryCode, number>
> = {
  course: {
    INT: 34.99,
    MX: 599,
    CO: 109000,
    AR: 59000,
    PE: 99,
    BO: 69,
  },
  bundle: {
    INT: 49.99,
    MX: 799,
    CO: 149000,
    AR: 79000,
    PE: 129,
    BO: 110,
  },
  mega: {
    INT: 79.99,
    MX: 1499,
    CO: 279000,
    AR: 149000,
    PE: 249,
    BO: 552,
  },
};

/** Packs con precio mega (antes del descuento a $6) */
export const MEGA_BUNDLE_SLUGS = new Set([
  "biblioteca-online-automotriz-300-gb",
  "pack-completo-24-000-libros-cursos-y-manuales-automotrices",
]);

export function getCompareAtAmount(
  type: ProductType,
  country: CountryCode,
  slug?: string,
): number | null {
  if (type === "course") {
    return COMPARE_AT_AMOUNTS.course[country];
  }
  if (type === "bundle") {
    const tier = slug && MEGA_BUNDLE_SLUGS.has(slug) ? "mega" : "bundle";
    return COMPARE_AT_AMOUNTS[tier][country];
  }
  return null;
}

export function formatPrice(amount: number, currency: string): string {
  const locale =
    currency === "USD"
      ? "en-US"
      : currency === "MXN"
        ? "es-MX"
        : currency === "COP"
          ? "es-CO"
          : currency === "ARS"
            ? "es-AR"
            : currency === "BOB"
              ? "es-BO"
              : "es-PE";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" || currency === "ARS" ? 0 : 2,
    maximumFractionDigits: currency === "COP" || currency === "ARS" ? 0 : 2,
  }).format(amount);
}

export function detectCountryFromLocale(locale: string): CountryCode {
  const lower = locale.toLowerCase();
  if (lower.includes("mx")) return "MX";
  if (lower.includes("co")) return "CO";
  if (lower.includes("ar")) return "AR";
  if (lower.includes("pe")) return "PE";
  if (lower.includes("bo")) return "BO";
  return "INT";
}

export function discountPercent(compareAt: number, amount: number): number {
  if (compareAt <= amount) return 0;
  return Math.round(((compareAt - amount) / compareAt) * 100);
}
