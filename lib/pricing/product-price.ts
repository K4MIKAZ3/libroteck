import type { CountryCode } from "@/lib/pricing/countries";
import type { ProductPrice } from "@/lib/db/schema";

export function getPriceForCountry(
  prices: ProductPrice[],
  countryCode: CountryCode,
) {
  return (
    prices.find((price) => price.countryCode === countryCode) ??
    prices.find((price) => price.countryCode === "INT")
  );
}
