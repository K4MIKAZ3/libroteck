"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

export function FloatingCartButton() {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 md:hidden">
      <Button variant="whatsapp" size="lg" className="rounded-full shadow-lg" asChild>
        <Link href="/carrito">
          <ShoppingCart className="size-5" />
          Carrito ({itemCount})
        </Link>
      </Button>
    </div>
  );
}
