import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartView } from "@/components/cart/cart-view";
import { StoreShell } from "@/components/layout/store-shell";
import { Button } from "@/components/ui/button";
import { getStoreContext } from "@/lib/store/context";
import { HOME_PATH } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrito",
};

export default async function CartPage() {
  const { store, settings, slug } = await getStoreContext();

  return (
    <StoreShell store={store} settings={settings} storeSlug={slug}>
      <Button asChild variant="ghost" className="mb-6">
        <Link href={HOME_PATH}>
          <ArrowLeft className="size-4" />
          Seguir comprando
        </Link>
      </Button>
      <h1 className="font-heading mb-8 text-3xl font-black text-[#0b1020]">
        Tu carrito
      </h1>
      <CartView
        whatsappNumber={settings?.whatsappNumber ?? "5212345678900"}
        storeName={settings?.storeName}
        whatsappOrderTemplate={settings?.whatsappOrderTemplate}
      />
    </StoreShell>
  );
}
