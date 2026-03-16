import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "brand" | "amber" | "outline";
};

export function Eyebrow({ children, className, variant = "outline" }: EyebrowProps) {
  return (
    <Badge className={cn("eyebrow-pill px-3 py-1 text-[11px] uppercase tracking-[0.18em]", className)} variant={variant}>
      {children}
    </Badge>
  );
}
