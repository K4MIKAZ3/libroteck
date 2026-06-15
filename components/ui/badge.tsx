import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1f4bff] text-white",
        secondary:
          "border-transparent bg-[#ffd600]/25 text-[#0b1020]",
        outline: "border-[#e8ecff] text-[#0b1020]",
        new: "border-transparent bg-[#111] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
