import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#f5d0d0] bg-white px-3 py-2 text-sm text-[#1c0a0a] placeholder:text-[#1c0a0a]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
