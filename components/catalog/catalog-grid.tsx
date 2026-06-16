"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { ComboBuilder } from "@/components/catalog/combo-builder";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import { ProductSearchBar } from "@/components/catalog/product-search-bar";
import type { ProductWithPrices } from "@/lib/db/schema";
import {
  filterProductsBySearch,
  sortProductsForDisplay,
} from "@/lib/catalog/product-list";
import type { ProductType } from "@/lib/pricing/countries";
import type { StoreSlug } from "@/lib/store/context";

type CatalogGridProps = {
  products: ProductWithPrices[];
  storeSlug: StoreSlug;
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
};

function openComboFromHash() {
  return window.location.hash === "#arma-tu-combo";
}

export function CatalogGrid({
  products,
  storeSlug,
  catalogTitle,
  catalogSubtitle,
  searchPlaceholder,
}: CatalogGridProps) {
  const [filter, setFilter] = useState<"all" | ProductType>("all");
  const [query, setQuery] = useState("");
  const [comboOpen, setComboOpen] = useState(false);

  const filtered = useMemo(() => {
    const bySearch = filterProductsBySearch(products, query);
    const sorted = sortProductsForDisplay(bySearch);
    if (filter === "all") {
      return sorted;
    }
    return sorted.filter((product) => product.type === filter);
  }, [products, filter, query]);

  useEffect(() => {
    if (storeSlug !== "streaming") {
      return;
    }

    function syncFromHash() {
      if (openComboFromHash()) {
        setComboOpen(true);
        requestAnimationFrame(() => {
          document
            .getElementById("arma-tu-combo")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [storeSlug]);

  function handleOpenCombo() {
    setComboOpen(true);
    window.history.replaceState(null, "", "#arma-tu-combo");
    requestAnimationFrame(() => {
      document
        .getElementById("arma-tu-combo")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleCloseCombo() {
    setComboOpen(false);
    if (window.location.hash === "#arma-tu-combo") {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-black text-[var(--foreground)] sm:text-4xl">
          {catalogTitle}
        </h2>
        <p className="mt-2 text-lg text-[#555]">{catalogSubtitle}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ProductFilters storeSlug={storeSlug} value={filter} onChange={setFilter} />
        <ProductSearchBar
          value={query}
          onChange={setQuery}
          placeholder={searchPlaceholder}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[var(--border)] bg-white p-12 text-center text-[#666]">
          {query.trim()
            ? "No hay resultados para tu búsqueda."
            : "No hay productos en esta categoría."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
          ))}
        </div>
      )}

      {storeSlug === "streaming" && (
        <div id="arma-tu-combo" className="scroll-mt-28">
          {comboOpen ? (
            <ComboBuilder
              products={products}
              onMinimize={handleCloseCombo}
            />
          ) : (
            <button
              type="button"
              onClick={handleOpenCombo}
              className="flex w-full items-center justify-between gap-4 rounded-[28px] border border-[var(--border)] bg-white p-5 text-left shadow-[0_8px_28px_rgba(18,26,46,0.06)] transition hover:border-[var(--primary)]/30 hover:shadow-[0_12px_32px_rgba(18,26,46,0.08)] sm:p-6"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffd600] text-[#111]">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="font-heading text-lg font-black text-[var(--foreground)] sm:text-xl">
                    Arma tu combo
                  </p>
                  <p className="mt-1 text-sm text-[#666]">
                    2 perfiles 40% off · 3 perfiles 30% off · 4 perfiles 20% off
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">
                Abrir
                <ChevronDown className="size-4" />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
