"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";

export interface ToggleProps {
  /** Controlled state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name (read by screen readers) */
  label?: string;
  id?: string;
  className?: string;
}

/* On: teal (light teal when disabled) | Off: gray (very light gray when disabled).
   The 14px white knob slides right when on. */
function ToggleBase({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label = "Toggle",
  id,
  className,
  withText,
}: ToggleProps & { withText: boolean }) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;

  const track = on ? (disabled ? "bg-primary-400" : "bg-brand") : disabled ? "bg-neutral-100" : "bg-neutral-400";

  // 36px wide without text, 46px with text. The knob travels (width - 18px).
  const width = withText ? "w-[46px]" : "w-9";
  const slide = on ? (withText ? "translate-x-[28px]" : "translate-x-[18px]") : "translate-x-0";

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (checked === undefined) setInner(!on);
        onChange?.(!on);
      }}
      className={cn(
        "relative inline-flex h-[18px] shrink-0 items-center rounded-full p-0.5 transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default",
        width,
        track,
        className
      )}
    >
      {/* ON / OFF text, opposite the knob */}
      {withText && (
        <span aria-hidden="true" className={cn("absolute text-caption font-normal text-white", on ? "left-1.5" : "right-1")}>
          {on ? "ON" : "OFF"}
        </span>
      )}

      <span aria-hidden="true" className={cn("block size-3.5 rounded-full bg-white shadow-elevation-1 transition-transform", slide)} />
    </button>
  );
}

/** Without text */
export const Toggle = (props: ToggleProps) => <ToggleBase withText={false} {...props} />;

/** With "ON" / "OFF" inside */
export const ToggleWithText = (props: ToggleProps) => <ToggleBase withText {...props} />;
