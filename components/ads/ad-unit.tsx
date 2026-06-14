"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseScript({ clientId }: { clientId: string }) {
  if (!clientId) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

type AdUnitProps = {
  clientId: string;
  slotId: string;
  format?: "auto" | "horizontal" | "vertical";
  className?: string;
  minHeight?: number;
};

export function AdSenseUnit({
  clientId,
  slotId,
  format = "auto",
  className,
  minHeight = 90,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!clientId || !slotId || pushed.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense may block in dev or before approval
    }
  }, [clientId, slotId]);

  if (!clientId || !slotId) {
    return null;
  }

  return (
    <div
      className={className}
      style={{ minHeight }}
      aria-label="Publicidad"
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-[#1A1A2E]/35">
        Publicidad
      </p>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={format === "auto" ? "true" : "false"}
      />
    </div>
  );
}
