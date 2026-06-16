import Image from "next/image";
import type { Store } from "@/lib/db/schema";
import { formatHeroOfferTitle } from "@/lib/store/hero-offer";
import { cn } from "@/lib/utils";

type HeroOfferCardProps = {
  store: Pick<
    Store,
    | "heroOfferServiceName"
    | "heroOfferPrice"
    | "heroOfferTitle"
    | "heroOfferSubtitle"
    | "heroOfferBackgroundImageUrl"
  >;
  className?: string;
};

export function HeroOfferCard({ store, className }: HeroOfferCardProps) {
  const backgroundImage = store.heroOfferBackgroundImageUrl.trim();
  const title = formatHeroOfferTitle(store);
  const subtitle = store.heroOfferSubtitle.trim();

  return (
    <div
      className={cn(
        "relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[22px] p-8 text-[#111] shadow-[inset_12px_0_rgba(0,0,0,0.13)]",
        !backgroundImage && "bg-gradient-to-br from-[#ffd600] to-[#ff7b00]",
        className,
      )}
    >
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 420px"
            priority
          />
          <div className="absolute inset-0 bg-black/35" aria-hidden />
        </>
      ) : null}

      <span
        className={cn(
          "relative z-10 w-fit rounded-full px-4 py-2 text-xs font-bold",
          backgroundImage
            ? "bg-white/90 text-[#111]"
            : "bg-[#111] text-white",
        )}
      >
        OFERTA ESPECIAL
      </span>

      <div className="relative z-10">
        <h2
          className={cn(
            "text-3xl font-black leading-tight",
            backgroundImage && "text-white drop-shadow-sm",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "mt-2 font-bold",
              backgroundImage && "text-white/95 drop-shadow-sm",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
