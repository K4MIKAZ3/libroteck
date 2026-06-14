import * as React from "react";
import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-[#1A1A2E] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
