"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  detectCountryFromLocale,
  type CountryCode,
} from "@/lib/pricing/countries";

type CountryContextValue = {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  currency: string;
  countryLabel: string;
  flag: string;
};

const STORAGE_KEY = "libroteck-country";

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
    if (stored && COUNTRIES[stored]) {
      setCountryState(stored);
    } else {
      const detected = detectCountryFromLocale(navigator.language);
      setCountryState(detected);
    }
    setReady(true);
  }, []);

  const setCountry = useCallback((value: CountryCode) => {
    setCountryState(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const value = useMemo(() => {
    const meta = COUNTRIES[country];
    return {
      country,
      setCountry,
      currency: meta.currency,
      countryLabel: meta.label,
      flag: meta.flag,
    };
  }, [country, setCountry]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf6f6]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dc2626] border-t-transparent" />
      </div>
    );
  }

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
}
