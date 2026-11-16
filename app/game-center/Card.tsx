import type { ReactNode } from "react";
import { cn } from "../lib/utils";


export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded bg-white p-4", className)}>
      {title && <h2 className="mb-4 text-subtitle font-medium text-neutral-700">{title}</h2>}
      {children}
    </section>
  );
}