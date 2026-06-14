import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]/30",
  {
    variants: {
      variant: {
        default: "bg-[#1E3A5F] text-white hover:bg-[#162d4a]",
        secondary:
          "bg-[#C8956C]/15 text-[#1E3A5F] hover:bg-[#C8956C]/25 border border-[#E8E0D5]",
        outline:
          "border border-[#E8E0D5] bg-white hover:bg-[#FAF7F2] text-[#1A1A2E]",
        ghost: "hover:bg-[#FAF7F2] text-[#1A1A2E]",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#1fb855] font-semibold",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
