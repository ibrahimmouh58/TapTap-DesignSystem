import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "../../icons/Icon";

export type AuditStatusState = "rejected" | "underReview" | "approved" | "currentVersion" | "cancel";

/** Icon, colors and default label of each review state. Shared with TagReview. */
export const auditStates: Record<AuditStatusState, { icon: IconName; text: string; dot: string; soft: string; label: string }> = {
  rejected: { icon: "forbid", text: "text-danger-600", dot: "bg-danger-600", soft: "bg-danger-200", label: "Rejected" },
  underReview: { icon: "time", text: "text-warning-600", dot: "bg-warning-600", soft: "bg-warning-200", label: "Under Review" },
  approved: { icon: "success", text: "text-success-600", dot: "bg-success-600", soft: "bg-success-200", label: "Approved" },
  currentVersion: { icon: "info", text: "text-info-600", dot: "bg-info-600", soft: "bg-info-200", label: "Current Version" },
  cancel: { icon: "error", text: "text-neutral-400", dot: "bg-neutral-400", soft: "bg-neutral-200", label: "Cancel" },
};

export interface AuditStatusProps extends HTMLAttributes<HTMLSpanElement> {
  state?: AuditStatusState;
  /** "icon": 16px filled icon (default) | "point": 4px dot */
  type?: "icon" | "point";
}

/** A review state: marker, 8px, label (Regular/Body) */
export function AuditStatus({ state = "approved", type = "icon", className, children, ...props }: AuditStatusProps) {
  const s = auditStates[state];

  return (
    <span className={cn("inline-flex items-center gap-2 text-body font-normal text-neutral-600", className)} {...props}>
      {type === "icon" ? (
        <Icon name={s.icon} variant="filled" size={16} className={s.text} />
      ) : (
        <span aria-hidden="true" className={cn("size-1 shrink-0 rounded-full", s.dot)} />
      )}
      {children ?? s.label}
    </span>
  );
}
