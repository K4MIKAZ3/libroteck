"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import type { ProductWithPrices } from "@/lib/db/schema";
import type { ProductType } from "@/lib/pricing/countries";

export function CatalogGrid({ products }: { products: ProductWithPrices[] }) {
  const [filter, setFilter] = useState<"all" | ProductType>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((product) => product.type === filter);
  }, [products, filter]);

  return (
    <div className="space-y-8">
      <ProductFilters value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E8E0D5] bg-white p-12 text-center text-[#1A1A2E]/60">
          No hay productos en esta categoría.
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
