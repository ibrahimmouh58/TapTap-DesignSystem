import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps {
  /** Number shown. Above 99: "99+" */
  count?: number;
  /** Free text instead of the number */
  children?: ReactNode;
  className?: string;
}

// Red pill: danger-600 background, white Regular/Caption text
const base = "inline-flex items-center justify-center rounded-full bg-danger-600 text-caption font-normal text-white";

const label = (count: number) => (count > 99 ? "99+" : String(count));

/** One digit: 22px circle */
export function BadgeSingleDigit({ count = 9, children, className }: BadgeProps) {
  return (
    <span role="status" aria-label={`${count} notifications`} className={cn(base, "size-[22px]", className)}>
      {children ?? label(count)}
    </span>
  );
}

/** Two digits: 31 × 22px pill */
export function BadgeDoubleDigit({ count = 99, children, className }: BadgeProps) {
  return (
    <span role="status" aria-label={`${count} notifications`} className={cn(base, "h-[22px] min-w-[31px] px-2", className)}>
      {children ?? label(count)}
    </span>
  );
}

/** Dot: 6px circle, no text */
export function BadgeDot({ className }: { className?: string }) {
  return <span role="status" aria-label="New notification" className={cn("inline-block size-1.5 rounded-full bg-danger-600", className)} />;
}