"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Button } from "../general/Button";
import { Icon, type IconName } from "../../icons/Icon";

const alertVariants = cva("flex w-[505px] max-w-full rounded border", {
  variants: {
    // Background and border of each status
    status: {
      info: "border-info-300 bg-info-100",
      success: "border-success-300 bg-success-100",
      warning: "border-warning-300 bg-warning-100",
      error: "border-danger-300 bg-danger-100",
    },
    // Side padding
    size: {
      basic: "px-4",
      small: "px-3",
    },
    // One line or several lines
    layout: {
      single: "items-center",
      multi: "items-start",
    },
  },
  // Height (single) or vertical padding (multi), by size
  compoundVariants: [
    { size: "basic", layout: "single", class: "h-[34px]" },
    { size: "basic", layout: "multi", class: "pb-4 pt-3" },
    { size: "small", layout: "single", class: "h-7" },
    { size: "small", layout: "multi", class: "pb-3 pt-2" },
  ],
  defaultVariants: { status: "info", size: "basic", layout: "single" },
});

type AlertStatus = NonNullable<VariantProps<typeof alertVariants>["status"]>;

// Filled icon, color and default text of each status
const statuses: Record<AlertStatus, { icon: IconName; color: string; text: string }> = {
  info: { icon: "info", color: "text-info-600", text: "Info Text" },
  success: { icon: "success", color: "text-success-600", text: "Success Text" },
  warning: { icon: "warning", color: "text-warning-600", text: "Warning Text" },
  error: { icon: "error", color: "text-danger-600", text: "Error Text" },
};

/* Figma (multi):
   basic: top 12 | bottom 16 | sides 16 | icon 18 | 12 icon-text | 16 text-cross | Body
   small: top 8  | bottom 12 | sides 12 | icon 16 | 8 icon-text  | 12 text-cross | Caption
   Radius 4, 14px cross. Single heights are estimated. */
const parts = {
  basic: { icon: 18, iconGap: "mr-3", iconTop: "mt-[3px]", close: "ml-4", closeTop: "mt-[5px]", gap: "mt-3", text: "text-body" },
  small: { icon: 16, iconGap: "mr-2", iconTop: "mt-0.5", close: "ml-3", closeTop: "mt-[3px]", gap: "mt-2", text: "text-caption" },
} as const;

const lorem =
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.";

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  /** "none" | "link" (teal text) | "button" (primary button) */
  action?: "none" | "link" | "button";
  actionText?: string;
  onAction?: () => void;
  /** Title ("multi" layout only) */
  title?: React.ReactNode;
  /** Shows the close cross */
  closable?: boolean;
  onClose?: () => void;
}

export function Alert({
  status = "info",
  size = "basic",
  layout = "single",
  action = "none",
  actionText = "Text",
  onAction,
  title = "Title",
  closable = true,
  onClose,
  className,
  children,
  ...props
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  const s = statuses[status!];
  const p = parts[size!];
  const multi = layout === "multi";

  const actionButton =
    action === "link" ? (
      <Button variant="link" size="sm" onClick={onAction} className="min-w-0 px-0">
        {actionText}
      </Button>
    ) : action === "button" ? (
      <Button variant="primary" size="sm" onClick={onAction}>
        {actionText}
      </Button>
    ) : null;

  return (
    <div
      role={status === "error" || status === "warning" ? "alert" : "status"}
      className={cn(alertVariants({ status, size, layout }), className)}
      {...props}
    >
      {/* Filled status icon, colored through the text color */}
      <Icon name={s.icon} variant="filled" size={p.icon} className={cn(s.color, p.iconGap, multi && p.iconTop)} />

      {/* Text (and the action below it in multi) */}
      <div className={cn("min-w-0 flex-1 text-neutral-600", p.text)}>
        {multi ? (
          <>
            <div className="font-medium text-neutral-700">{title}</div>
            <div>{children ?? lorem}</div>
            {actionButton && <div className={cn("flex", p.gap)}>{actionButton}</div>}
          </>
        ) : (
          <span className="block truncate">{children ?? s.text}</span>
        )}
      </div>

      {/* Action on the right in single */}
      {!multi && actionButton && <div className="ml-3 shrink-0">{actionButton}</div>}

      {/* 14px cross */}
      {closable && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className={cn(
            "flex size-[14px] shrink-0 items-center justify-center text-neutral-500 transition-colors enabled:hover:cursor-pointer enabled:hover:text-neutral-600 enabled:active:cursor-default focus-visible:outline-2 focus-visible:outline-brand",
            p.close,
            multi && p.closeTop
          )}
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}