import { Eyebrow } from "@/components/site/eyebrow";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
};

export function PageIntro({ eyebrow, title, description, align = "left", className }: PageIntroProps) {
  return (
    <div className={cn("max-w-3xl space-y-5", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="space-y-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h1>
        <p className="text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">{description}</p>
      </div>
    </div>
  );
}
