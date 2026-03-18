import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
