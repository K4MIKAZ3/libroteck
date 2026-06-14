"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import { ProductSearchBar } from "@/components/catalog/product-search-bar";
import type { ProductWithPrices } from "@/lib/db/schema";
import {
  filterProductsBySearch,
  sortProductsForDisplay,
} from "@/lib/catalog/product-list";
import type { ProductType } from "@/lib/pricing/countries";

export function CatalogGrid({ products }: { products: ProductWithPrices[] }) {
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ProductFilters value={filter} onChange={setFilter} />
        <ProductSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar cursos, packs o libros…"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E8E0D5] bg-white p-12 text-center text-[#1A1A2E]/60">
          {query.trim()
            ? "No hay resultados para tu búsqueda."
            : "No hay productos en esta categoría."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
