"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CountrySelector } from "@/components/catalog/country-selector";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/routes";

type SiteHeaderProps = {
  brandPrimary: string;
  brandAccent: string;
};

export function SiteHeader({ brandPrimary, brandAccent }: SiteHeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="bg-header-gradient sticky top-0 z-40 shadow-[0_5px_20px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={HOME_PATH} className="group flex items-center gap-1">
          <span className="font-heading text-2xl font-black tracking-wide text-white">
            {brandPrimary}
            <span className="text-[#ffd600]">{brandAccent}</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <CountrySelector className="hidden w-[220px] sm:flex [&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white" />
          <Link href="/carrito">
            <Button
              variant="outline"
              size="icon"
              className="relative border-white/30 bg-white/10 text-white hover:bg-white hover:text-[var(--foreground)]"
            >
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ffd600] text-[10px] font-bold text-[#111]">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-2 sm:hidden">
        <CountrySelector className="w-full [&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white" />
      </div>
    </header>
  );
}
