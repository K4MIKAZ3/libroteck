import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ProductSearchBar({
  value,
  onChange,
  placeholder = "Buscar por nombre, palabra clave o tipo…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#0b1020]/40" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-[#e8ecff] bg-white pl-10"
        aria-label="Buscar productos"
      />
    </div>
  );
}
