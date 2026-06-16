import { formatPrice } from "@/lib/pricing/countries";

export const COMBO_MIN_PROFILES = 2;
export const COMBO_MAX_PROFILES = 4;

/** Descuento según cantidad de perfiles en el combo personalizado */
export const COMBO_DISCOUNT_BY_COUNT: Record<number, number> = {
  2: 40,
  3: 30,
  4: 20,
};

export function getComboDiscountPercent(profileCount: number): number | null {
  if (profileCount < COMBO_MIN_PROFILES || profileCount > COMBO_MAX_PROFILES) {
    return null;
  }
  return COMBO_DISCOUNT_BY_COUNT[profileCount] ?? null;
}

export function calculateComboTotal(
  unitPrices: number[],
  currency: string,
): {
  profileCount: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  currency: string;
} | null {
  const profileCount = unitPrices.length;
  const discountPercent = getComboDiscountPercent(profileCount);
  if (discountPercent === null) {
    return null;
  }

  const subtotal = unitPrices.reduce((sum, price) => sum + price, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const total = Math.round((subtotal - discountAmount) * 100) / 100;

  return {
    profileCount,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    currency,
  };
}

export function formatComboSummary(
  subtotal: number,
  discountPercent: number,
  total: number,
  currency: string,
): string {
  return `${formatPrice(subtotal, currency)} − ${discountPercent}% = ${formatPrice(total, currency)}`;
}

export const COMBO_DISCOUNT_RULES = [
  { count: 2, percent: 40 },
  { count: 3, percent: 30 },
  { count: 4, percent: 20 },
] as const;
