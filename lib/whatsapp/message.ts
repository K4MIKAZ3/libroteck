import { COUNTRIES, formatPrice, type CountryCode } from "@/lib/pricing/countries";

export type WhatsAppCartItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

export function buildWhatsAppMessage(
  items: WhatsAppCartItem[],
  countryCode: CountryCode,
  storeName = "LibroTeck",
): string {
  const country = COUNTRIES[countryCode];
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} — ${formatPrice(item.unitPrice, item.currency)} x${item.quantity}`,
  );

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return [
    `Hola! Quiero hacer un pedido en ${storeName} 📚`,
    "",
    `País: ${country.label} (${country.currency})`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total, country.currency)}`,
    "",
    "Gracias, quedo atento para el pago.",
  ].join("\n");
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
