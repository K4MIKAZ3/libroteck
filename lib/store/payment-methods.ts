import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import type { StoreSlug } from "@/lib/store/context";

export const LIBROTECK_PAYMENTS = [
  { name: "Binance", description: "USDT y criptomonedas", icon: Wallet },
  { name: "PayPal", description: "Pagos internacionales", icon: CreditCard },
  { name: "Bancos de Bolivia", description: "Transferencia bancaria", icon: Landmark },
  { name: "Nequi", description: "Colombia", icon: Wallet },
  { name: "Bancolombia", description: "Colombia", icon: Landmark },
] as const;

export const STREAMING_PAYMENTS = [
  { name: "Perú", description: "BCP y Yape", icon: Smartphone },
  { name: "Bolivia", description: "Tigo Money y QR", icon: Wallet },
  { name: "Venezuela", description: "Banca móvil", icon: Smartphone },
  { name: "Ecuador", description: "Transferencia", icon: Landmark },
  { name: "Brasil", description: "PIX", icon: Wallet },
  { name: "México", description: "OXXO y Banorte", icon: Landmark },
  { name: "Argentina", description: "Banco local", icon: Landmark },
  { name: "Chile", description: "Banco de Chile", icon: Landmark },
  { name: "Colombia", description: "Nequi y Bancolombia", icon: Wallet },
] as const;

export function getPaymentMethods(slug: StoreSlug) {
  return slug === "streaming" ? STREAMING_PAYMENTS : LIBROTECK_PAYMENTS;
}
