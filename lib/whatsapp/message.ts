import { COUNTRIES, formatPrice, type CountryCode } from "@/lib/pricing/countries";

export type WhatsAppCartItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  isCombo?: boolean;
  comboLines?: Array<{ name: string; unitPrice: number }>;
  comboDiscountPercent?: number;
  comboSubtotal?: number;
};

export const DEFAULT_WHATSAPP_ORDER_TEMPLATE = `Hola! Quiero hacer un pedido en {storeName}

País: {country} ({currency})

{items}

Total: {total}

Gracias, quedo atento para el pago.`;

export const WHATSAPP_TEMPLATE_PLACEHOLDERS = [
  "{storeName}",
  "{country}",
  "{currency}",
  "{items}",
  "{total}",
] as const;

function formatWhatsAppItems(items: WhatsAppCartItem[]): string {
  const lines: string[] = [];
  let index = 1;

  for (const item of items) {
    if (item.isCombo && item.comboLines?.length) {
      lines.push(`${index}. ${item.name} (-${item.comboDiscountPercent}%):`);
      for (const profile of item.comboLines) {
        lines.push(
          `   - ${profile.name} — ${formatPrice(profile.unitPrice, item.currency)}`,
        );
      }
      if (item.comboSubtotal != null && item.comboDiscountPercent != null) {
        lines.push(
          `   Subtotal: ${formatPrice(item.comboSubtotal, item.currency)} -> Total: ${formatPrice(item.unitPrice, item.currency)}`,
        );
      } else {
        lines.push(
          `   Total combo: ${formatPrice(item.unitPrice, item.currency)}`,
        );
      }
      index++;
      continue;
    }

    lines.push(
      `${index}. ${item.name} — ${formatPrice(item.unitPrice, item.currency)} x${item.quantity}`,
    );
    index++;
  }

  return lines.join("\n");
}

export function buildWhatsAppMessage(
  items: WhatsAppCartItem[],
  countryCode: CountryCode,
  storeName = "LibroTeck",
  template = DEFAULT_WHATSAPP_ORDER_TEMPLATE,
): string {
  const country = COUNTRIES[countryCode];
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const resolvedTemplate = template.trim() || DEFAULT_WHATSAPP_ORDER_TEMPLATE;

  return resolvedTemplate
    .replaceAll("{storeName}", storeName)
    .replaceAll("{country}", country.label)
    .replaceAll("{currency}", country.currency)
    .replaceAll("{items}", formatWhatsAppItems(items))
    .replaceAll("{total}", formatPrice(total, country.currency));
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
