"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PromoBannerProps = {
  title: string;
  message: string;
  link?: string;
  buttonLabel?: string;
};

function promoStorageKey(title: string, message: string) {
  return `libroteck-promo-${title}-${message}`.slice(0, 120);
}

export function PromoBanner({
  title,
  message,
  link,
  buttonLabel = "Ver promoción",
}: PromoBannerProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = promoStorageKey(title, message);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    setVisible(!dismissed);
  }, [storageKey]);

  if (!visible || !message.trim()) {
    return null;
  }

  function dismiss() {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  }

  const isExternal = link?.startsWith("http");

  return (
    <aside
      className="relative mb-8 overflow-hidden rounded-2xl border border-[#C8956C]/25 bg-gradient-to-r from-[#FAF7F2] to-white p-5 shadow-sm sm:p-6"
      role="complementary"
      aria-label="Promoción"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-[#1A1A2E]/40 transition-colors hover:bg-[#1E3A5F]/5 hover:text-[#1A1A2E]"
        aria-label="Cerrar promoción"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F]">
            <Megaphone className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8956C]">
              {title.trim() || "Promoción"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#1A1A2E]/80 sm:text-base">
              {message}
            </p>
          </div>
        </div>

        {link?.trim() && (
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-center">
            {isExternal ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                {buttonLabel}
              </a>
            ) : (
              <Link href={link}>{buttonLabel}</Link>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
}

export function PromoBannerFromSettings({
  enabled,
  title,
  message,
  link,
  buttonLabel,
}: {
  enabled: boolean;
  title: string;
  message: string;
  link: string;
  buttonLabel: string;
}) {
  if (!enabled || !message.trim()) {
    return null;
  }

  return (
    <PromoBanner
      title={title}
      message={message}
      link={link || undefined}
      buttonLabel={buttonLabel}
    />
  );
}
