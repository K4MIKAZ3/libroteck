"use client";

import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/pricing/countries";
import { Button } from "@/components/ui/button";

const FILTERS: Array<{ value: "all" | ProductType; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "course", label: "Cursos" },
  { value: "book", label: "Libros" },
  { value: "bundle", label: "Paquetes" },
];

export function ProductFilters({
  value,
  onChange,
}: {
  value: "all" | ProductType;
  onChange: (value: "all" | ProductType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={value === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={cn(
            value === filter.value && "shadow-sm",
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
