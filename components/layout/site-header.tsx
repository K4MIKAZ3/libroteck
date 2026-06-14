"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CountrySelector } from "@/components/catalog/country-selector";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E0D5] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-literata text-2xl font-bold text-[#1E3A5F] transition-colors group-hover:text-[#C8956C]">
            LibroTeck
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <CountrySelector className="hidden w-[220px] sm:flex" />
          <Link href="/carrito">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#C8956C] text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      <div className="border-t border-[#E8E0D5] px-4 py-2 sm:hidden">
        <CountrySelector className="w-full" />
      </div>
    </header>
  );
}
