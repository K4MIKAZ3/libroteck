import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartView } from "@/components/cart/cart-view";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrito",
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Seguir comprando
          </Link>
        </Button>
        <h1 className="font-heading mb-8 text-3xl font-bold text-[#1E3A5F]">
          Tu carrito
        </h1>
        <CartView whatsappNumber={settings?.whatsappNumber ?? "5212345678900"} />
      </main>
    </div>
  );
}
