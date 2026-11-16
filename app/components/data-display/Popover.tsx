"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "../general/Button";
import { cn } from "../../lib/utils";

export type PopoverPlacement =
  | "topLeft" | "top" | "topRight"
  | "leftTop" | "left" | "leftBottom"
  | "rightTop" | "right" | "rightBottom"
  | "bottomLeft" | "bottom" | "bottomRight";

export interface PopoverProps {
  /** Placement: TL, Top, TR, LT, Left, LB, RT, Right, RB, BL, Bottom, BR */
  placement?: PopoverPlacement;
  title?: ReactNode;
  content?: ReactNode;
  className?: string;
}

export interface PopoverTriggerProps extends PopoverProps {
  /** Defaults to a "Click" or "Hover" button */
  children?: ReactNode;
  disabled?: boolean;
}

/* box: popover position around the trigger. The 8px padding on the trigger side
        leaves room for the arrow and keeps hover alive between trigger and card.
   arrow: small white square rotated 45°, on the card edge. */
export const placements: Record<PopoverPlacement, { box: string; arrow: string }> = {
  topLeft:     { box: "bottom-full left-0 pb-2",                    arrow: "-bottom-[3px] left-4" },
  top:         { box: "bottom-full left-1/2 -translate-x-1/2 pb-2", arrow: "-bottom-[3px] left-1/2 -translate-x-1/2" },
  topRight:    { box: "bottom-full right-0 pb-2",                   arrow: "-bottom-[3px] right-4" },

  bottomLeft:  { box: "top-full left-0 pt-2",                       arrow: "-top-[3px] left-4" },
  bottom:      { box: "top-full left-1/2 -translate-x-1/2 pt-2",    arrow: "-top-[3px] left-1/2 -translate-x-1/2" },
  bottomRight: { box: "top-full right-0 pt-2",                      arrow: "-top-[3px] right-4" },

  leftTop:     { box: "right-full top-0 pr-2",                      arrow: "-right-[3px] top-4" },
  left:        { box: "right-full top-1/2 -translate-y-1/2 pr-2",   arrow: "-right-[3px] top-1/2 -translate-y-1/2" },
  leftBottom:  { box: "right-full bottom-0 pr-2",                   arrow: "-right-[3px] bottom-4" },

  rightTop:    { box: "left-full top-0 pl-2",                       arrow: "-left-[3px] top-4" },
  right:       { box: "left-full top-1/2 -translate-y-1/2 pl-2",    arrow: "-left-[3px] top-1/2 -translate-y-1/2" },
  rightBottom: { box: "left-full bottom-0 pl-2",                    arrow: "-left-[3px] bottom-4" },
};

/* ═══════════════════════════════════════════════════════════
   CARD: padding 12 | radius 4 | title Medium/Body | 4px | content Regular/Body
   ═══════════════════════════════════════════════════════════ */

function PopoverCard({
  placement = "top",
  title = "Title",
  content = (
    <>
      <p>content</p>
      <p>content</p>
    </>
  ),
}: PopoverProps) {
  return (
    <div className="relative rounded bg-white p-3 text-left shadow-elevation-3">
      <span aria-hidden="true" className={`absolute size-1.5 rotate-45 bg-white ${placements[placement].arrow}`} />
      <div className="text-body font-medium text-neutral-700">{title}</div>
      <div className="mt-1 text-body font-normal text-neutral-600">{content}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPOVER SIMPLE: always shown, no hover or click.
   The arrow follows `placement` (top = arrow at the bottom, etc.)
   ═══════════════════════════════════════════════════════════ */

export function PopoverSimple({ className, ...props }: PopoverProps) {
  return (
    <div className={cn("inline-block w-max max-w-[320px]", className)}>
      <PopoverCard {...props} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BASE: popover with a trigger (used by Click and Hover)
   ═══════════════════════════════════════════════════════════ */

function PopoverBase({
  trigger,
  children,
  placement = "top",
  disabled = false,
  className,
  ...card
}: PopoverTriggerProps & { trigger: "hover" | "click" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const hover = trigger === "hover" && !disabled;
  const click = trigger === "click" && !disabled;

  // Close on outside click (click mode) and Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (click && !rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, click]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={hover ? () => setOpen(true) : undefined}
      onMouseLeave={hover ? () => setOpen(false) : undefined}
      onFocus={hover ? () => setOpen(true) : undefined}
      onBlur={hover ? () => setOpen(false) : undefined}
    >
      <div
        aria-describedby={open ? id : undefined}
        aria-expanded={click ? open : undefined}
        onClick={click ? () => setOpen((o) => !o) : undefined}
      >
        {children ?? (
          <Button variant="outline" size="md" disabled={disabled}>
            {trigger === "click" ? "Click" : "Hover"}
          </Button>
        )}
      </div>

      {open && (
        <div
          id={id}
          role={hover ? "tooltip" : "dialog"}
          className={`absolute z-20 w-max max-w-[320px] ${placements[placement].box}`}
        >
          <PopoverCard placement={placement} {...card} />
        </div>
      )}
    </div>
  );
}

export const PopoverClick = (props: PopoverTriggerProps) => <PopoverBase trigger="click" {...props} />;
export const PopoverHover = (props: PopoverTriggerProps) => <PopoverBase trigger="hover" {...props} />;