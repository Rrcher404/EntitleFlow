import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function SectionShell({ id, className, children }: SectionShellProps) {
  return (
    <section className={cn("py-20 sm:py-24", className)} id={id}>
      <div className="container-shell">{children}</div>
    </section>
  );
}
