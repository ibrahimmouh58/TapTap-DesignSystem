import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../general/Button";
import { Icon, type IconName } from "../../icons/Icon";

export type ResultStatus = "success" | "error" | "warning" | "info";

export interface ResultProps {
  status?: ResultStatus;
  /** Defaults to the status title */
  title?: ReactNode;
  /** Defaults to the status description */
  description?: ReactNode;
  /** Action buttons. Defaults to the Figma ones; pass `null` for none */
  actions?: ReactNode;
  className?: string;
}

// Per status: filled icon, color, title, description and Figma button count
const statuses: Record<ResultStatus, { icon: IconName; color: string; title: string; description: string; buttons: 1 | 2 }> = {
  success: {
    icon: "success",
    color: "text-success-600",
    title: "Submitted successfully",
    description: "Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait.",
    buttons: 2,
  },
  error: {
    icon: "error",
    color: "text-danger-600",
    title: "Submission Failed",
    description: "Please check and modify the following information before resubmitting.",
    buttons: 2,
  },
  warning: {
    icon: "warning",
    color: "text-warning-600",
    title: "There are some problems with your operation.",
    description: "Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait.",
    buttons: 1,
  },
  info: {
    icon: "info",
    color: "text-info-600",
    title: "Your operation has been executed",
    description: "Order number: 2017182818828182881 has been placed.",
    buttons: 1,
  },
};

export function Result({ status = "success", title, description, actions, className }: ResultProps) {
  const s = statuses[status];

  return (
    <section
      role={status === "error" || status === "warning" ? "alert" : "status"}
      className={cn("flex w-full flex-col items-center text-center", className)}
    >
      {/* 72px filled icon, colored through the text color */}
      <Icon name={s.icon} variant="filled" className={cn("size-[72px]", s.color)} />

      {/* 44 under the icon: title (Regular/Body) then description (Regular/Caption) */}
      <h2 className="mt-11 text-body font-normal text-neutral-700">{title ?? s.title}</h2>
      <p className="mt-1 text-caption text-neutral-400">{description ?? s.description}</p>

      {/* 32 under the description: buttons, 16 apart */}
      {actions !== null && (
        <div className="mt-8 flex items-center gap-4">
          {actions ?? (
            <>
              <Button variant="primary" size="md">Text</Button>
              {s.buttons === 2 && <Button variant="outline" size="md">Text</Button>}
            </>
          )}
        </div>
      )}
    </section>
  );
}

/* ───────── The 4 states ───────── */

export const ResultSuccess = (props: Omit<ResultProps, "status">) => <Result status="success" {...props} />;
export const ResultError = (props: Omit<ResultProps, "status">) => <Result status="error" {...props} />;
export const ResultWarning = (props: Omit<ResultProps, "status">) => <Result status="warning" {...props} />;
export const ResultInfo = (props: Omit<ResultProps, "status">) => <Result status="info" {...props} />;