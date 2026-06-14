"use client";

import { CartProvider } from "@/components/providers/cart-provider";
import { CountryProvider } from "@/components/providers/country-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CountryProvider>
      <CartProvider>{children}</CartProvider>
    </CountryProvider>
  );
}
