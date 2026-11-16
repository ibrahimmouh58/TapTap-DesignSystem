"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface CheckboxProps {
  /** Controlled state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  /** Teal square in the middle (takes priority over `checked`) */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  value?: string;
  /** Accessible name when there is no visible label */
  "aria-label"?: string;
  /** Label on the right (optional) */
  children?: ReactNode;
  className?: string;
}

// Box styles per look and state
const boxStyles = {
  unchecked: {
    enabled: "border-neutral-400 bg-white group-hover:border-brand",
    disabled: "border-neutral-300 bg-neutral-100",
  },
  checked: {
    enabled: "border-brand bg-brand text-white group-hover:border-brand-hover group-hover:bg-brand-hover",
    disabled: "border-neutral-300 bg-neutral-100 text-neutral-400",
  },
  indeterminate: {
    enabled: "border-brand bg-white",
    disabled: "border-neutral-300 bg-neutral-100",
  },
};

export function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  id,
  name,
  value,
  "aria-label": ariaLabel,
  children,
  className,
}: CheckboxProps) {
  const [inner, setInner] = useState(defaultChecked);
  const isChecked = checked ?? inner;
  const inputRef = useRef<HTMLInputElement>(null);

  // "indeterminate" can only be set from JavaScript
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const look = indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked";
  const box = boxStyles[look][disabled ? "disabled" : "enabled"];

  return (
    <label
      className={cn(
        "group inline-flex select-none items-center gap-2 text-body font-normal",
        disabled ? "cursor-default text-neutral-400" : "cursor-pointer text-neutral-600",
        className
      )}
    >
      {/* Real, visually hidden checkbox: keyboard and screen readers work */}
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        name={name}
        value={value}
        aria-label={ariaLabel}
        checked={isChecked}
        disabled={disabled}
        onChange={(e) => {
          if (checked === undefined) setInner(e.target.checked);
          onChange?.(e.target.checked);
        }}
        className="peer sr-only"
      />

      {/* Drawn box: 16px, radius 2 */}
      <span
        aria-hidden="true"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
          box
        )}
      >
        {look === "checked" && <Icon name="check" size={12} />}
        {look === "indeterminate" && <span className={cn("size-2 rounded-[1px]", disabled ? "bg-neutral-400" : "bg-brand")} />}
      </span>

      {children}
    </label>
  );
}
