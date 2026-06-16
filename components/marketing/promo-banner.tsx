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
      className="bg-offer-gradient relative mb-8 overflow-hidden rounded-[32px] p-6 text-center text-white shadow-[0_18px_45px_rgba(31,75,255,0.25)] sm:p-8"
      role="complementary"
      aria-label="Promoción"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Cerrar promoción"
      >
        <X className="size-4" />
      </button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-3 flex justify-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#ffd600]/20 text-[#ffd600]">
            <Megaphone className="size-5" />
          </div>
        </div>
        <h2 className="font-heading text-2xl font-black sm:text-3xl">
          {title.trim() || "Oferta especial"}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--footer-muted)] sm:text-lg">
          {message}
        </p>

        {link?.trim() && (
          <Button asChild variant="accent" className="mt-5">
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
