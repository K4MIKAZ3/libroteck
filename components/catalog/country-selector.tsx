"use client";

import {
  COUNTRIES,
  type CountryCode,
} from "@/lib/pricing/countries";
import { useCountry } from "@/components/providers/country-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CountrySelector({ className }: { className?: string }) {
  const { country, setCountry } = useCountry();

  return (
    <Select value={country} onValueChange={(value) => setCountry(value as CountryCode)}>
      <SelectTrigger className={className ?? "w-[200px]"}>
        <SelectValue placeholder="Selecciona país" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(COUNTRIES) as [CountryCode, (typeof COUNTRIES)[CountryCode]][]).map(
          ([code, meta]) => (
            <SelectItem key={code} value={code}>
              {meta.flag} {meta.label} · {meta.currency}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
