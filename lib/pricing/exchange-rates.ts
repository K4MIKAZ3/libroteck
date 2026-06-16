import { COUNTRIES, type CountryCode } from "@/lib/pricing/countries";

/** Fecha de referencia de las tasas USD → moneda local */
export const EXCHANGE_RATES_AS_OF = "2026-06-13";

/**
 * Bolivianos por 1 USD — tipo de cambio oficial fijo del BCB (venta).
 * Fuente: cotización oficial BCB 2026.
 */
export const BOB_PER_USD = 6.96;

/** Unidades de moneda local por 1 USD (equivalente en cada país). */
export const LOCAL_CURRENCY_PER_USD: Record<
  Exclude<CountryCode, "INT">,
  number
> = {
  BO: BOB_PER_USD,
  MX: 18.5,
  CO: 4100,
  AR: 1050,
  PE: 3.75,
};

export function roundPriceForCountry(
  countryCode: CountryCode,
  amount: number,
): number {
  if (countryCode === "CO" || countryCode === "AR") {
    return Math.round(amount);
  }

  if (countryCode === "PE" || countryCode === "BO") {
    return Math.round(amount * 100) / 100;
  }

  return Math.round(amount * 100) / 100;
}

export function convertUsdToLocal(
  usd: number,
  countryCode: Exclude<CountryCode, "INT">,
): number {
  return roundPriceForCountry(
    countryCode,
    usd * LOCAL_CURRENCY_PER_USD[countryCode],
  );
}

export function pricesFromUsd(usd: number) {
  if (!Number.isFinite(usd) || usd < 0) {
    return [];
  }

  const countryCodes = Object.keys(COUNTRIES) as CountryCode[];

  return countryCodes.map((countryCode) => {
    const amount =
      countryCode === "INT"
        ? roundPriceForCountry("INT", usd)
        : convertUsdToLocal(usd, countryCode);

    return {
      countryCode,
      currency: COUNTRIES[countryCode].currency,
      amount,
    };
  });
}

export function pricesFromUsdToForm(usd: number): Record<CountryCode, string> {
  const rows = pricesFromUsd(usd);
  const form = {} as Record<CountryCode, string>;

  for (const code of Object.keys(COUNTRIES) as CountryCode[]) {
    form[code] = "";
  }

  for (const row of rows) {
    form[row.countryCode] = String(row.amount);
  }

  return form;
}

export function getExchangeRateSummary(): string {
  const parts = (Object.entries(LOCAL_CURRENCY_PER_USD) as [
    Exclude<CountryCode, "INT">,
    number,
  ][]).map(([code, rate]) => {
    const { currency, label } = COUNTRIES[code];
    return `${label}: ${rate} ${currency}`;
  });

  return `US$1 ≈ ${parts.join(" · ")} (referencia ${EXCHANGE_RATES_AS_OF})`;
}
