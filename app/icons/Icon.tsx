import { cn } from "../lib/utils";
import { icons } from "./icons.generated";

export type IconName = keyof typeof icons;
export type IconVariant = "line" | "filled";

// Size scale (px)
const sizes = { 12: "size-3", 14: "size-3.5", 16: "size-4", 18: "size-[18px]", 20: "size-5", 24: "size-6" } as const;

export interface IconProps {
  name: IconName;
  /** "line": outline (default) | "filled": solid */
  variant?: IconVariant;
  size?: keyof typeof sizes;
  /** Accessible name: without it the icon is decorative */
  label?: string;
  className?: string;
}

export function Icon({ name, variant = "line", size = 16, label, className }: IconProps) {
  const { viewBox, inner } = icons[name][variant];

  return (
    <svg
      viewBox={viewBox}
      fill="currentColor"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0", sizes[size], className)}
      // The content comes from the project's own SVG files, not from user input
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}