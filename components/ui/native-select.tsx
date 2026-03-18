import * as React from "react";

import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-11 w-full rounded-2xl border border-border bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
