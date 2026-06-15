import {
  discountPercent,
  formatPrice,
} from "@/lib/pricing/countries";
import type { ProductPrice } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type ProductPriceDisplayProps = {
  price: ProductPrice | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ProductPriceDisplay({
  price,
  size = "md",
  className,
}: ProductPriceDisplayProps) {
  if (!price) {
    return <span className={cn("text-[#0b1020]/50", className)}>Consultar</span>;
  }

  const hasDiscount =
    price.compareAtAmount != null && price.compareAtAmount > price.amount;
  const pct = hasDiscount
    ? discountPercent(price.compareAtAmount!, price.amount)
    : 0;

  const saleSize =
    size === "lg"
      ? "text-3xl"
      : size === "sm"
        ? "text-xl"
        : "text-2xl";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hasDiscount && (
        <>
          <span className="text-sm text-[#666] line-through">
            {formatPrice(price.compareAtAmount!, price.currency)}
          </span>
          <span className="rounded-full bg-[#fff3b0] px-2.5 py-0.5 text-xs font-black text-[#111]">
            -{pct}%
          </span>
        </>
      )}
      <span className={cn("font-black text-[#1f4bff]", saleSize)}>
        {formatPrice(price.amount, price.currency)}
      </span>
    </div>
  );
}
