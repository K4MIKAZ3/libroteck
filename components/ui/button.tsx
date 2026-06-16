import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#2a4494]/30",
  {
    variants: {
      variant: {
        default:
          "bg-[#2a4494] text-white hover:bg-[#121a2e] shadow-sm",
        accent:
          "bg-[#ffd600] text-[#111] hover:bg-white shadow-[0_8px_20px_rgba(255,214,0,0.3)] hover:-translate-y-0.5",
        secondary:
          "bg-[#2a4494]/10 text-[#2a4494] hover:bg-[#2a4494]/20 border border-[#e0e4ef]",
        outline:
          "border border-[#e0e4ef] bg-white hover:bg-[#f4f6fb] text-[#0b1020]",
        ghost: "hover:bg-[#f4f6fb] text-[#0b1020] rounded-lg",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#1fb855] font-semibold",
        destructive: "bg-red-600 text-white hover:bg-red-700 rounded-lg",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10 rounded-full",
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
