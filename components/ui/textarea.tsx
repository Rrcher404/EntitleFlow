import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-3xl border border-border bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
