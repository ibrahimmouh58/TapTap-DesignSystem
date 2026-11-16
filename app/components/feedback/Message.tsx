import type { ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon";
import { cn } from "../../lib/utils";

export type MessageType = "info" | "warning" | "error" | "success";

export interface MessageProps {
  type?: MessageType;
  /** Defaults to the type's text */
  children?: ReactNode;
  className?: string;
}

// Per type: filled icon, color and default text
const types: Record<MessageType, { icon: IconName; color: string; text: string }> = {
  info: { icon: "info", color: "text-info-600", text: "This is a normal message" },
  warning: { icon: "warning", color: "text-warning-600", text: "This is a warning message" },
  error: { icon: "error", color: "text-danger-600", text: "This is an error message" },
  success: { icon: "success", color: "text-success-600", text: "This is a success message" },
};

export function Message({ type = "info", children, className }: MessageProps) {
  const t = types[type];

  return (
    // Height 38 | width 300 | side padding 16 | 8px icon-text | Regular/Body
    <div
      role={type === "error" || type === "warning" ? "alert" : "status"}
      className={cn("inline-flex h-[38px] w-[300px] items-center gap-2 rounded bg-white px-4 text-body font-normal text-neutral-600 shadow-elevation-3", className)}
    >
      <Icon name={t.icon} variant="filled" size={18} className={t.color} />
      <span className="whitespace-nowrap">{children ?? t.text}</span>
    </div>
  );
}