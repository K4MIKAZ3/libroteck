"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
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
import { Button } from "@/components/ui/button";

type CatalogGridProps = {
  products: ProductWithPrices[];
  storeSlug: StoreSlug;
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
};

export function CatalogGrid({
  products,
  storeSlug,
  catalogTitle,
  catalogSubtitle,
  searchPlaceholder,
}: CatalogGridProps) {
  const [filter, setFilter] = useState<"all" | ProductType>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const bySearch = filterProductsBySearch(products, query);
    const sorted = sortProductsForDisplay(bySearch);
    if (filter === "all") {
      return sorted;
    }
    return sorted.filter((product) => product.type === filter);
  }, [products, filter, query]);

  return (
    <div className="space-y-8">
      {storeSlug === "streaming" && (
        <>
          <div className="flex justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href="#arma-tu-combo">
                <Sparkles className="size-4" />
                Arma tu combo
              </a>
            </Button>
          </div>
          <ComboBuilder products={products} />
        </>
      )}

      <div className="text-center">
        <h2 className="font-heading text-3xl font-black text-[#0b1020] sm:text-4xl">
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
        <p className="rounded-3xl border border-dashed border-[#e8ecff] bg-white p-12 text-center text-[#666]">
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
    </div>
  );
}
