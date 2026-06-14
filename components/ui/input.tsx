import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#E8E0D5] bg-white px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#1A1A2E]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
