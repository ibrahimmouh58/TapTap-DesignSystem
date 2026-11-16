"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface RadioProps {
  /** Controlled state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Same `name` for every radio of a group: only one can be checked */
  name?: string;
  value?: string;
  id?: string;
  disabled?: boolean;
  /** Text on the right (default "text") */
  children?: ReactNode;
  className?: string;
}

/* Normal: white, gray border | checked: teal border and dot
   Hover: teal border | checked: light teal halo
   Disabled: light gray | checked: gray dot
   The look follows the real input state (peer-checked), so in uncontrolled
   groups, checking one radio unchecks the others. */
export function Radio({
  checked,
  defaultChecked = false,
  onChange,
  name,
  value,
  id,
  disabled = false,
  children = "text",
  className,
}: RadioProps) {
  const ring = disabled
    ? "border-neutral-300 bg-neutral-100"
    : cn(
        "border-neutral-400 bg-white group-hover:border-brand group-active:border-brand-pressed",
        "peer-checked:border-brand peer-checked:group-hover:ring-[3px] peer-checked:group-hover:ring-primary-600/20 peer-checked:group-active:ring-[3px] peer-checked:group-active:ring-primary-600/30"
      );

  return (
    <label
      className={cn(
        "group inline-flex select-none items-center gap-2 text-body font-normal",
        disabled ? "cursor-default text-neutral-400" : "cursor-pointer text-neutral-600",
        className
      )}
    >
      {/* Real, visually hidden radio: keyboard and screen readers work */}
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        {...(checked !== undefined ? { checked } : { defaultChecked })}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />

      {/* Drawn 16px circle; the dot shows only when checked */}
      <span
        aria-hidden="true"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
          "peer-checked:*:block",
          ring
        )}
      >
        <span className={cn("hidden size-2 rounded-full", disabled ? "bg-neutral-400" : "bg-brand")} />
      </span>

      {children}
    </label>
  );
}
