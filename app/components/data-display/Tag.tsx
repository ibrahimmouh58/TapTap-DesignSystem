"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { auditStates, type AuditStatusState } from "../feedback/AuditStatus";

/* ═══════════════════════════════════════════════════════════
   BASIC: default, closable, border
   ═══════════════════════════════════════════════════════════ */

export interface TagBasicProps {
  variant?: "default" | "closable" | "border";
  /** Defaults to "Default" ("Item 1" for closable) */
  children?: ReactNode;
  /** Called by the cross (closable) */
  onClose?: () => void;
  className?: string;
}

const basicStyles = {
  default: "bg-neutral-100 text-neutral-500",
  closable: "bg-neutral-100 text-neutral-600",
  border: "border border-neutral-300 bg-white text-neutral-500",
};

export function TagBasic({ variant = "default", children, onClose, className }: TagBasicProps) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <span className={cn("inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-sm px-2 text-caption font-normal", basicStyles[variant], className)}>
      {children ?? (variant === "closable" ? "Item 1" : "Default")}
      {variant === "closable" && (
        <button
          type="button"
          aria-label="Remove"
          onClick={() => {
            setClosed(true);
            onClose?.();
          }}
          className="flex text-neutral-500 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   COLORFUL: dark (solid) or light (pale) background, any token color
   ═══════════════════════════════════════════════════════════ */

export interface TagColorfulProps {
  variant?: "dark" | "light";
  /** A color token, e.g. "var(--color-info-600)" */
  color?: string;
  /** Defaults to "Amber" */
  children?: ReactNode;
  className?: string;
}

export function TagColorful({ variant = "dark", color = "var(--color-auxiliary-600)", children = "Amber", className }: TagColorfulProps) {
  // Dark: colored background, white text | Light: 15% tint, colored text
  const style =
    variant === "dark"
      ? { backgroundColor: color, color: "var(--color-white)" }
      : { backgroundColor: `color-mix(in srgb, ${color} 15%, var(--color-white))`, color };

  return (
    <span style={style} className={cn("inline-flex h-5 items-center whitespace-nowrap rounded-sm px-2 text-caption font-normal", className)}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHECKABLE: a tag you check (teal corner with a tick)
   ═══════════════════════════════════════════════════════════ */

export interface TagCheckableProps {
  size?: "lg" | "md" | "sm";
  /** Controlled state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Defaults to "tag 1" */
  children?: ReactNode;
  className?: string;
}

// Height, padding, text and corner of each size (estimated)
const checkableSizes = {
  lg: { box: "h-8 px-3 text-body", corner: "size-4", check: "size-2.5" },
  md: { box: "h-7 px-3 text-caption", corner: "size-3.5", check: "size-2" },
  sm: { box: "h-[18px] px-2 text-caption", corner: "size-2.5", check: "size-1.5" },
};

export function TagCheckable({ size = "md", checked, defaultChecked = false, onChange, disabled = false, children = "tag 1", className }: TagCheckableProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const z = checkableSizes[size];

  // Checked: teal | default: gray, light teal on hover | disabled: pale gray
  const look = disabled
    ? "border-neutral-200 bg-neutral-100 text-neutral-400"
    : on
      ? "border-brand bg-white text-brand enabled:hover:border-brand-hover enabled:active:border-brand-pressed"
      : "border-neutral-300 bg-white text-neutral-600 enabled:hover:border-brand-hover enabled:hover:text-brand-hover enabled:active:border-brand-pressed enabled:active:text-brand-pressed";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      disabled={disabled}
      onClick={() => {
        if (checked === undefined) setInner(!on);
        onChange?.(!on);
      }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded border font-normal transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default",
        z.box,
        look,
        className
      )}
    >
      {children}

      {/* Bottom-right corner: triangle with a white tick */}
      {on && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 right-0 flex items-end justify-end [clip-path:polygon(100%_0,100%_100%,0_100%)]",
            z.corner,
            disabled ? "bg-neutral-300" : "bg-brand"
          )}
        >
          <Icon name="check" className={cn("text-white", z.check)} />
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVIEW: a state pill with an icon (same states as AuditStatus)
   ═══════════════════════════════════════════════════════════ */

export type TagReviewState = AuditStatusState;

export interface TagReviewProps {
  state?: TagReviewState;
  size?: "lg" | "md" | "sm";
  /** Defaults to the state's label */
  children?: ReactNode;
  className?: string;
}

// Height, gaps, text and icon of each size (estimated)
const reviewSizes = {
  lg: { box: "h-8 gap-2 pl-1 pr-3 text-body", icon: 24 as const },
  md: { box: "h-6 gap-1.5 pl-[3px] pr-2.5 text-caption", icon: 18 as const },
  sm: { box: "h-5 gap-1 pl-[3px] pr-2 text-caption", icon: 14 as const },
};

export function TagReview({ state = "approved", size = "lg", children, className }: TagReviewProps) {
  const s = auditStates[state];
  const z = reviewSizes[size];

  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full font-normal", z.box, s.soft, s.text, className)}>
      <Icon name={s.icon} variant="filled" size={z.icon} />
      {children ?? s.label}
    </span>
  );
}
