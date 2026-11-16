"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../general/Button";
import { placements, type PopoverPlacement } from "./Popover";

export interface TooltipProps {
  /** Tooltip text. Defaults to "prompt text" */
  text?: ReactNode;
  /** Placement: TL, Top, TR, LT, Left, LB, RT, Right, RB, BL, Bottom, BR */
  placement?: PopoverPlacement;
  /** Element that shows the tooltip on hover. Defaults to a "Hover" button */
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

// Dark bubble: padding 8, radius 4, Regular/Body, white text
function Bubble({ text, placement, id }: { text: ReactNode; placement: PopoverPlacement; id?: string }) {
  return (
    <div id={id} role="tooltip" className="relative rounded bg-neutral-700 p-2 text-body font-normal text-white shadow-elevation-2">
      {/* Arrow: same position as the popover, bubble color */}
      <span aria-hidden="true" className={cn("absolute size-1.5 rotate-45 bg-neutral-700", placements[placement].arrow)} />
      {text}
    </div>
  );
}

/* ───────── Tooltip: shows on hover and focus, 12 placements ───────── */

export function Tooltip({ text = "prompt text", placement = "top", children, disabled = false, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  // Escape closes the tooltip
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => !disabled && setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div aria-describedby={open ? id : undefined}>
        {children ?? (
          <Button variant="outline" size="md" disabled={disabled}>
            Hover
          </Button>
        )}
      </div>

      {/* The 8px padding on the trigger side leaves room for the arrow */}
      {open && (
        <div className={cn("pointer-events-none absolute z-20 w-max max-w-[240px]", placements[placement].box)}>
          <Bubble text={text} placement={placement} id={id} />
        </div>
      )}
    </div>
  );
}

/* ───────── TooltipSimple: the bubble alone, always shown ───────── */

export function TooltipSimple({ text = "prompt text", placement = "top", className }: Omit<TooltipProps, "children" | "disabled">) {
  return (
    <div className={cn("inline-block w-max max-w-[240px]", className)}>
      <Bubble text={text} placement={placement} />
    </div>
  );
}

/* ───────── Figma variants: the arrow follows the placement ───────── */

type Variant = Omit<TooltipProps, "placement" | "children" | "disabled">;

export const TooltipTop = (props: Variant) => <TooltipSimple placement="top" {...props} />;
export const TooltipLeft = (props: Variant) => <TooltipSimple placement="left" {...props} />;
export const TooltipRight = (props: Variant) => <TooltipSimple placement="right" {...props} />;
export const TooltipBottom = (props: Variant) => <TooltipSimple placement="bottom" {...props} />;