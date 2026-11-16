"use client";

import { cn } from "../../lib/utils";
import { Icon, type IconName } from "../../icons/Icon";

/* ═══════════════════════════════════════════════════════════
   SHARED CALENDAR: used by DateTimePicker, RangePicker and Comparison
   ═══════════════════════════════════════════════════════════ */

export const pad = (n: number) => String(n).padStart(2, "0");

/** Date → "2020-12-15" (local time) */
export const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "2020-12-15" → Date at local midnight */
export const parseDate = (s: string) => new Date(`${s}T00:00:00`);

/** Stable initial date: the real month is set when the panel opens.
    (Next.js rejects `new Date()` during pre-rendering with `cacheComponents`.) */
export const EPOCH = new Date(0);

export interface CalendarStep {
  icon: IconName;
  label: string;
  /** Years and months to add */
  dy: number;
  dm: number;
}

/** Day calendar arrows: previous year, previous month, next month, next year */
export const dayNav: CalendarStep[] = [
  { icon: "double-left", label: "Previous year", dy: -1, dm: 0 },
  { icon: "left", label: "Previous month", dy: 0, dm: -1 },
  { icon: "right", label: "Next month", dy: 0, dm: 1 },
  { icon: "double-right", label: "Next year", dy: 1, dm: 0 },
];

/* ───────── Header: "«  ‹  2020-12  ›  »" ───────── */

export function CalendarHeader({
  title,
  steps = dayNav,
  prev = true,
  next = true,
  onNav,
}: {
  title: string;
  /** 4 arrows: the first 2 on the left, the last 2 on the right */
  steps?: CalendarStep[];
  /** Show the left arrows (false on the 2nd month of a double calendar) */
  prev?: boolean;
  /** Show the right arrows (false on the 1st month of a double calendar) */
  next?: boolean;
  onNav: (dy: number, dm: number) => void;
}) {
  const btn = (s: CalendarStep) => (
    <button
      key={s.label}
      type="button"
      aria-label={s.label}
      onClick={() => onNav(s.dy, s.dm)}
      className="flex h-8 w-7 items-center justify-center rounded text-neutral-400 transition-colors hover:cursor-pointer hover:text-brand active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
    >
      <Icon name={s.icon} size={14} />
    </button>
  );

  return (
    <div className="flex h-8 items-center justify-between">
      <div className="flex w-14">{prev && steps.slice(0, 2).map(btn)}</div>
      <span aria-live="polite" className="text-body font-medium text-neutral-700">
        {title}
      </span>
      <div className="flex w-14 justify-end">{next && steps.slice(2).map(btn)}</div>
    </div>
  );
}

/* ───────── One month: 6 weeks, Monday to Sunday ───────── */

export interface CalendarMonthProps {
  /** Any day of the month to show */
  month: Date;
  /** Selection start ("2020-12-15"). For a single date, start = end */
  start?: string;
  end?: string;
  onPick: (date: string) => void;
  /** Day hover (range preview) */
  onHover?: (date: string) => void;
  onNav: (dy: number, dm: number) => void;
  /** Arrows to show (see CalendarHeader) */
  prev?: boolean;
  next?: boolean;
  className?: string;
}

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function CalendarMonth({ month, start = "", end = "", onPick, onHover, onNav, prev, next, className }: CalendarMonthProps) {
  const [y, m] = [month.getFullYear(), month.getMonth()];
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start on Monday
  const days = Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - offset + i));
  const today = fmtDate(new Date()); // the panel only renders after a click: never pre-rendered

  return (
    <div className={cn("w-[252px]", className)}>
      <CalendarHeader title={`${y}-${pad(m + 1)}`} prev={prev} next={next} onNav={onNav} />

      <div className="mt-1 grid grid-cols-7 text-center text-body">
        {weekDays.map((w) => (
          <span key={w} className="flex h-8 items-center justify-center text-neutral-600">
            {w}
          </span>
        ))}

        {days.map((d) => {
          const s = fmtDate(d);
          const inMonth = d.getMonth() === m;
          const edge = inMonth && (s === start || s === end);
          const band = inMonth && !!start && !!end && s > start && s < end;
          return (
            <div key={s} onMouseEnter={() => onHover?.(s)} className={cn("flex h-8 items-center justify-center", band && "bg-primary-100")}>
              <button
                type="button"
                aria-label={s}
                aria-pressed={edge}
                aria-current={s === today ? "date" : undefined}
                onClick={() => onPick(s)}
                className={cn(
                  "size-7 rounded border text-body transition-colors hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-brand",
                  edge
                    ? "border-brand bg-brand text-white"
                    : s === today
                      ? "border-neutral-500 text-neutral-600"
                      : cn("border-transparent hover:bg-primary-100", inMonth ? "text-neutral-600" : "text-neutral-400")
                )}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
