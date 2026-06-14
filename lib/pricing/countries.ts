export type CountryCode = "MX" | "CO" | "AR" | "PE" | "INT";

export type ProductType = "course" | "book" | "bundle";

export const COUNTRIES: Record<
  CountryCode,
  { label: string; currency: string; flag: string }
> = {
  MX: { label: "México", currency: "MXN", flag: "🇲🇽" },
  CO: { label: "Colombia", currency: "COP", flag: "🇨🇴" },
  AR: { label: "Argentina", currency: "ARS", flag: "🇦🇷" },
  PE: { label: "Perú", currency: "PEN", flag: "🇵🇪" },
  INT: { label: "Internacional", currency: "USD", flag: "🌎" },
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  course: "Curso",
  book: "Libro",
  bundle: "Paquete",
};

export const DEFAULT_COUNTRY: CountryCode = "MX";

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
  return "INT";
}
