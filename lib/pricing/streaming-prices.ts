import type { CountryCode } from "@/lib/pricing/countries";

/** Convierte precio base USD a las monedas del catálogo */
export function pricesFromUsd(usd: number) {
  const rows: Array<{
    countryCode: CountryCode;
    currency: string;
    amount: number;
  }> = [
    { countryCode: "INT", currency: "USD", amount: usd },
    {
      countryCode: "MX",
      currency: "MXN",
      amount: Math.round(usd * 18 * 100) / 100,
    },
    {
      countryCode: "CO",
      currency: "COP",
      amount: Math.round(usd * 4000),
    },
    {
      countryCode: "AR",
      currency: "ARS",
      amount: Math.round(usd * 1000),
    },
    {
      countryCode: "PE",
      currency: "PEN",
      amount: Math.round(usd * 3.7 * 10) / 10,
    },
    {
      countryCode: "BO",
      currency: "BOB",
      amount: Math.round(usd * 7 * 10) / 10,
    },
  ];

  return rows;
}
