"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */

// left and right: full border | center: top and bottom only
const positions = ["rounded-l border", "border-y", "rounded-r border"];

const base =
  "relative inline-flex select-none items-center justify-center whitespace-nowrap font-normal transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default";

// One style per state
const states = {
  default:
    "border-neutral-300 bg-white text-neutral-600 enabled:hover:border-brand-hover enabled:hover:text-brand-hover",
  selected: "border-brand bg-primary-100 text-brand",
  disabled: "border-neutral-200 bg-white text-neutral-400",
  selectedDisabled: "border-primary-300 bg-primary-50 text-primary-300",
};

// One style per size: text (padding 16, 12 in small) and square icon
const sizes = {
  text: {
    sm: "h-6 px-3 text-caption",
    md: "h-9 px-4 text-body",
    lg: "h-10 px-4 text-subtitle",
  },
  icon: {
    sm: "size-6 [&>svg]:size-[14px]",
    md: "size-9 [&>svg]:size-[16px]",
    lg: "size-10 [&>svg]:size-[18px]",
  },
};

/* ═══════════════════════════════════════════════════════════
   GROUP: the base component (text or icons)
   ═══════════════════════════════════════════════════════════ */

export interface ButtonGroupItem {
  value: string;
  /** Shown text (accessible name for an icon group) */
  label: string;
  /** Icon (ButtonGroupIcon only) */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  /** Exactly 3 segments (left, center, right). Defaults to the Figma sample */
  items?: [ButtonGroupItem, ButtonGroupItem, ButtonGroupItem];
  /** Controlled values */
  value?: string[];
  /** Uncontrolled initial values */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Several segments can be selected at once (default) */
  multiple?: boolean;
  /** Disables the whole group */
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Figma samples
const textItems: ButtonGroupProps["items"] & {} = [
  { value: "1", label: "Text" },
  { value: "2", label: "Text" },
  { value: "3", label: "Text" },
];
const iconItems: ButtonGroupProps["items"] & {} = [
  { value: "left", label: "Align left", icon: <Icon name="left" /> },
  { value: "center", label: "Align center", icon: <Icon name="more" /> },
  { value: "right", label: "Align right", icon: <Icon name="right" /> },
];

function Group({
  kind,
  items = kind === "icon" ? iconItems : textItems,
  value,
  defaultValue,
  onChange,
  multiple = true,
  disabled = false,
  size = "lg",
  className,
}: ButtonGroupProps & { kind: "text" | "icon" }) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? inner;

  const toggle = (v: string) => {
    const next = multiple
      ? selected.includes(v)
        ? selected.filter((x) => x !== v)
        : [...selected, v]
      : selected.includes(v)
        ? []
        : [v];
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <div role="group" className={cn("inline-flex", className)}>
      {items.map((item, i) => {
        const isSelected = selected.includes(item.value);
        const isDisabled = disabled || item.disabled;
        const state = isSelected
          ? isDisabled ? states.selectedDisabled : states.selected
          : isDisabled ? states.disabled : states.default;

        return (
          <button
            key={item.value}
            type="button"
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={kind === "icon" ? item.label : undefined}
            onClick={() => toggle(item.value)}
            className={`${base} ${positions[i]} ${sizes[kind][size]} ${state}`}
          >
            {kind === "icon" ? item.icon : item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUTTON GROUP BASIC (text) and BUTTON GROUP ICON (icons)
   ═══════════════════════════════════════════════════════════ */

export function ButtonGroupBasic(props: ButtonGroupProps) {
  return <Group kind="text" {...props} />;
}

export function ButtonGroupIcon(props: ButtonGroupProps) {
  return <Group kind="icon" {...props} />;
}