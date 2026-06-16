import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { StoreShell } from "@/components/layout/store-shell";
import { PromoBannerFromSettings } from "@/components/marketing/promo-banner";
import { HeroOfferCard } from "@/components/marketing/hero-offer-card";
import { getActiveProducts } from "@/lib/db/queries";
import { getStoreContext } from "@/lib/store/context";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { store, settings, slug } = await getStoreContext();
  const products = await getActiveProducts();

  const welcome = settings.welcomeMessage;

  const isStreaming = slug === "streaming";

  return (
    <StoreShell store={store} settings={settings} storeSlug={slug}>
      <section className="bg-hero-gradient mb-10 grid items-center gap-10 overflow-hidden rounded-[32px] px-6 py-12 text-white shadow-[0_18px_45px_rgba(31,75,255,0.25)] sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd600]">
            {store.heroBadge}
          </p>
          <h1 className="font-heading mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {welcome.includes(" ") ? (
              <>
                {welcome.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-[#ffd600]">
                  {welcome.split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <span className="text-[#ffd600]">{welcome}</span>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#eef2ff]">
            {isStreaming
              ? "Perfiles individuales de streaming — no cuentas completas. Arma tu combo y ahorra hasta 40%."
              : "Elige tu país, revisa los precios en tu moneda y ordena por WhatsApp en un solo clic."}
          </p>
          {isStreaming && (
            <a
              href="#arma-tu-combo"
              className="mt-6 inline-flex rounded-full bg-[#ffd600] px-6 py-3 text-sm font-bold text-[#111] transition hover:bg-[#ffe566]"
            >
              Arma tu combo →
            </a>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="rotate-2 rounded-[30px] border border-white/20 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <HeroOfferCard store={store} />
          </div>
        </div>
      </section>

      <PromoBannerFromSettings
        enabled={settings.promoEnabled}
        title={settings.promoTitle}
        message={settings.promoMessage}
        link={settings.promoLink}
        buttonLabel={settings.promoButtonLabel}
      />

      <CatalogGrid
        products={products}
        storeSlug={slug}
        catalogTitle={store.catalogTitle}
        catalogSubtitle={store.catalogSubtitle}
        searchPlaceholder={store.searchPlaceholder}
      />
    </StoreShell>
  );
}
