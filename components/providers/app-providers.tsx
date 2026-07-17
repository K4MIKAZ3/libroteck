"use client";

import { CartProvider } from "@/components/providers/cart-provider";
import { CountryProvider } from "@/components/providers/country-provider";
import { InboxHubProvider } from "@/components/providers/inbox-hub-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CountryProvider>
      <CartProvider>
        <InboxHubProvider>{children}</InboxHubProvider>
      </CartProvider>
    </CountryProvider>
  );
}
