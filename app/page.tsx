import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { PromoBannerFromSettings } from "@/components/marketing/promo-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getActiveProducts, getSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getActiveProducts(),
    getSettings(),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section className="mb-10 rounded-3xl bg-[#1E3A5F] px-6 py-10 text-white sm:px-10">
          <p className="font-literata text-sm uppercase tracking-[0.2em] text-[#C8956C]">
            {settings?.storeName ?? "LibroTeck"}
          </p>
          <h1 className="font-heading mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
            {settings?.welcomeMessage ?? "Cursos y libros digitales"}
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Elige tu país, revisa los precios en tu moneda y ordena por WhatsApp en
            un solo clic.
          </p>
        </section>

        <PromoBannerFromSettings
          enabled={settings.promoEnabled}
          title={settings.promoTitle}
          message={settings.promoMessage}
          link={settings.promoLink}
          buttonLabel={settings.promoButtonLabel}
        />

        <CatalogGrid products={products} />
      </main>
      <SiteFooter />
    </div>
  );
}
