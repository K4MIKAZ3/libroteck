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
    return <span className={cn("text-[#1A1A2E]/50", className)}>Consultar</span>;
  }

  const hasDiscount =
    price.compareAtAmount != null && price.compareAtAmount > price.amount;
  const pct = hasDiscount
    ? discountPercent(price.compareAtAmount!, price.amount)
    : 0;

  const saleSize =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-base"
        : "text-lg";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hasDiscount && (
        <>
          <span className="text-sm text-[#1A1A2E]/45 line-through">
            {formatPrice(price.compareAtAmount!, price.currency)}
          </span>
          <span className="rounded-full bg-[#C8956C]/15 px-2 py-0.5 text-xs font-semibold text-[#C8956C]">
            -{pct}%
          </span>
        </>
      )}
      <span className={cn("font-bold text-[#C8956C]", saleSize)}>
        {formatPrice(price.amount, price.currency)}
      </span>
    </div>
  );
}
