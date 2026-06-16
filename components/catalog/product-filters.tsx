"use client";

import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/pricing/countries";
import { getCatalogFilters } from "@/lib/store/product-types";
import type { StoreSlug } from "@/lib/store/context";
import { Button } from "@/components/ui/button";

export function ProductFilters({
  storeSlug,
  value,
  onChange,
}: {
  storeSlug: StoreSlug;
  value: "all" | ProductType;
  onChange: (value: "all" | ProductType) => void;
}) {
  const filters = getCatalogFilters(storeSlug);

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={value === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={cn(value === filter.value && "shadow-sm")}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
