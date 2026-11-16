"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface FilterItemProps {
  /** Item text. Defaults to "Filter item" */
  children?: ReactNode;
  /** md (36px, default) or sm (24px) */
  size?: "md" | "sm";
  /** Called by the cross (the item then disappears) */
  onRemove?: () => void;
  className?: string;
}

interface BaseProps extends FilterItemProps {
  /** Drag handle (grip) before the text */
  drag?: boolean;
  /** Props for the handle, to plug in a drag-and-drop library */
  dragHandleProps?: HTMLAttributes<HTMLSpanElement>;
  /** Icon before the text */
  icon?: ReactNode;
}

/* Medium (Figma): height 36 | padding 12 left, 8 right | Regular/Body
   Small (estimated): height 24 | padding 8 left, 4 right | Regular/Caption */
const sizes = {
  md: { box: "h-9 w-40 pl-3 pr-2 text-body", icon: 16 },
  sm: { box: "h-6 w-32 pl-2 pr-1 text-caption", icon: 12 },
} as const;

function Base({ children = "Filter item", size = "md", onRemove, className, drag, dragHandleProps, icon }: BaseProps) {
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  const z = sizes[size];

  return (
    <div className={cn("inline-flex items-center gap-2 rounded bg-neutral-100 text-neutral-600", z.box, className)}>
      {/* Handle: grab cursor, grabbing while dragging */}
      {drag && (
        <span
          {...dragHandleProps}
          aria-label="Drag to reorder"
          className="flex shrink-0 cursor-grab items-center text-neutral-400 transition-colors hover:text-neutral-500 active:cursor-grabbing"
        >
          <Icon name="drag" size={z.icon} />
        </span>
      )}

      {icon && <span aria-hidden="true" className="flex shrink-0 items-center text-neutral-500">{icon}</span>}

      <span className="min-w-0 flex-1 truncate">{children}</span>

      {/* Cross: gray, darker on hover */}
      <button
        type="button"
        aria-label="Remove"
        onClick={() => {
          setRemoved(true);
          onRemove?.();
        }}
        className="flex shrink-0 items-center text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="close" size={z.icon === 16 ? 14 : 12} />
      </button>
    </div>
  );
}

/* ───────── Variants ───────── */

/** Basic: "Filter item ✕" */
export const FilterItemBasic = (props: FilterItemProps) => <Base {...props} />;

/** With a drag handle: "⠿ Filter item ✕" */
export const FilterItemWithDrag = (props: FilterItemProps & { dragHandleProps?: HTMLAttributes<HTMLSpanElement> }) => (
  <Base drag {...props} />
);

/** With handle and icon: "⠿ 👤 Filter item ✕" (user icon by default) */
export const FilterItemWithIcon = ({
  icon,
  size = "md",
  ...props
}: FilterItemProps & { icon?: ReactNode; dragHandleProps?: HTMLAttributes<HTMLSpanElement> }) => (
  <Base drag size={size} icon={icon ?? <Icon name="user" size={sizes[size].icon} />} {...props} />
);