"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  /** Replaces the number in the circle (horizontal) */
  icon?: ReactNode;
  /** Forces a status (e.g. "error"). Otherwise it comes from the current step */
  status?: StepStatus;
}

export interface StepsProps {
  /** Defaults to 3 steps: Finished, In Progress, Waiting */
  items?: StepItem[];
  /** Current step, from 0 (controlled). Defaults to the second step */
  current?: number;
  /** Initial step (uncontrolled) */
  defaultCurrent?: number;
  /** When set, steps are clickable */
  onChange?: (current: number) => void;
  /** "horizontal" (default) or "vertical" */
  direction?: "horizontal" | "vertical";
  className?: string;
}

const makeItems = (description: boolean): StepItem[] =>
  ["Finished", "In Progress", "Waiting"].map((title) => ({
    title,
    description: description ? "This is a description." : undefined,
  }));

/* Horizontal: 32px circle | 8px circle-text | 16px on each side of the line
   Vertical: 8px dot (10px for the current step) | 16px dot-text
   Title: Regular/Body | Description: Regular/Caption */

// Circle: finished = pale teal | error = pale red | current = solid teal | waiting = pale gray
const circles: Record<StepStatus, string> = {
  finish: "bg-primary-100 text-brand",
  error: "bg-danger-100 text-danger-600",
  process: "bg-brand text-white",
  wait: "bg-neutral-100 text-neutral-400",
};

// Dot (vertical)
const dots: Record<StepStatus, string> = {
  finish: "bg-primary-300",
  error: "bg-danger-600",
  process: "bg-brand",
  wait: "bg-neutral-400",
};

const titles: Record<StepStatus, string> = {
  finish: "text-neutral-600",
  process: "text-neutral-600",
  wait: "text-neutral-400",
  error: "text-danger-600",
};

export function Steps({
  items = makeItems(false),
  current,
  defaultCurrent = 1,
  onChange,
  direction = "horizontal",
  className,
}: StepsProps) {
  const [inner, setInner] = useState(defaultCurrent);
  const cur = current ?? inner;
  const vertical = direction === "vertical";
  const clickable = !!onChange;

  const go = (i: number) => {
    if (current === undefined) setInner(i);
    onChange?.(i);
  };

  return (
    <ol className={cn("flex", vertical ? "w-fit flex-col" : "w-[720px] max-w-full", className)}>
      {items.map((item, i) => {
        const status: StepStatus = item.status ?? (i < cur ? "finish" : i === cur ? "process" : "wait");
        const last = i === items.length - 1;
        // The line after a finished step is teal, the others gray
        const line = status === "finish" ? "bg-primary-500" : "bg-neutral-200";

        // Clickable only when "onChange" is set
        const interactive = clickable
          ? {
              role: "button" as const,
              tabIndex: 0,
              onClick: () => go(i),
              onKeyDown: (e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go(i)),
            }
          : {};
        const hand = clickable
          ? "hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          : "";

        // Title (Body) and description (Caption)
        const text = (
          <>
            <span className={cn("whitespace-nowrap text-body transition-colors", titles[status])}>{item.title}</span>
            {item.description && <span className="whitespace-nowrap text-caption text-neutral-400">{item.description}</span>}
          </>
        );

        /* ─── Vertical: a dot, a line going down, the text on the right ─── */
        if (vertical) {
          return (
            <li key={i} aria-current={i === cur ? "step" : undefined} className={cn("flex gap-4", !last && "min-h-[76px]")}>
              <div className="flex w-2.5 shrink-0 flex-col items-center">
                {/* The dot is centered on the first title line (22px) */}
                <div className="flex h-[22px] items-center">
                  <span aria-hidden="true" className={cn("rounded-full", status === "process" ? "size-2.5" : "size-2", dots[status])} />
                </div>
                {!last && <span aria-hidden="true" className={cn("my-[7px] w-px flex-1", line)} />}
              </div>
              <div {...interactive} className={cn("flex flex-col self-start text-left", hand)}>
                {text}
              </div>
            </li>
          );
        }

        /* ─── Horizontal: a circle, the text, then a line to the next step ─── */
        return (
          <li key={i} aria-current={i === cur ? "step" : undefined} className={cn("flex items-start", !last && "flex-1")}>
            <div {...interactive} className={cn("flex shrink-0 items-start gap-2", hand)}>
              <span
                aria-hidden="true"
                className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-subtitle transition-colors", circles[status])}
              >
                {item.icon ??
                  (status === "finish" ? <Icon name="check" size={16} /> : status === "error" ? <Icon name="close" size={16} /> : i + 1)}
              </span>
              {/* 5px top: the title is centered on the circle, the description goes below */}
              <span className="mt-[5px] flex flex-col text-left">{text}</span>
            </div>
            {!last && <span aria-hidden="true" className={cn("mx-4 mt-4 h-px min-w-4 flex-1", line)} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── Figma variants ───────── */

/** Base, no description: "✓ Finished ──── ② In Progress ──── ③ Waiting" */
export const StepsBase = (props: StepsProps) => <Steps {...props} />;

/** Base, with description */
export const StepsBaseDescription = ({ items = makeItems(true), ...props }: StepsProps) => <Steps items={items} {...props} />;

/** Vertical, no description: dots joined by a line */
export const StepsVertical = (props: StepsProps) => <Steps direction="vertical" {...props} />;

/** Vertical, with description */
export const StepsVerticalDescription = ({ items = makeItems(true), ...props }: StepsProps) => (
  <Steps direction="vertical" items={items} {...props} />
);