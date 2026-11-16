"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../general/Button";
import { Icon } from "../../icons/Icon";
import { CalendarMonth, EPOCH, fmtDate, pad, parseDate } from "./Calendar";

type Type = "time" | "date" | "datetime";
type Draft = { date: string; time: number[] };

export interface DateTimePickerProps {
  type?: Type;
  /** Controlled value: "00:02:00", "2026-11-12" or "2026-11-12 00:02:00" */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Form field name (sent through a hidden input) */
  name?: string;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

const placeholders = { time: "Select time", date: "Select date", datetime: "Select date and time" };

// "2026-11-12 00:02:00" → { date: "2026-11-12", time: [0, 2, 0] }
const parse = (v: string): Draft => ({
  date: v.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
  time: v.match(/\d{2}:\d{2}:\d{2}/)?.[0].split(":").map(Number) ?? [0, 0, 0],
});

// { date, time } → text for the type
function build(type: Type, { date, time }: Draft) {
  const t = time.map(pad).join(":");
  return type === "time" ? t : type === "date" ? date : date && `${date} ${t}`;
}

/* ───────── Hours / minutes / seconds columns ───────── */

const timeLabels = ["Hours", "Minutes", "Seconds"];

function TimeColumns({ time, onPick, hand }: { time: number[]; onPick: (col: number, n: number) => void; hand: string }) {
  return (
    <div className="flex">
      {[24, 60, 60].map((count, col) => (
        <ul
          key={col}
          aria-label={timeLabels[col]}
          ref={(el) => {
            if (el) el.scrollTop = Math.max(0, (time[col] - 3) * 32); // keep the chosen value in view
          }}
          className="h-[224px] w-14 overflow-y-auto border-r border-neutral-100 last:border-r-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: count }, (_, n) => (
            <li key={n}>
              <button
                type="button"
                aria-pressed={time[col] === n}
                onClick={() => onPick(col, n)}
                className={cn(
                  "h-8 w-full text-body transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                  hand,
                  time[col] === n ? "bg-brand text-white" : "text-neutral-600 hover:bg-primary-100"
                )}
              >
                {pad(n)}
              </button>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/* ───────── Component ───────── */

export function DateTimePicker({
  type = "date",
  value,
  defaultValue = "",
  onChange,
  placeholder,
  name,
  id,
  "aria-label": ariaLabel,
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ date: "", time: [0, 0, 0] });
  const [view, setView] = useState(EPOCH); // real month is set when the panel opens
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Pointer cursor on hover: "time" variant only
  const hand = type === "time" ? "enabled:hover:cursor-pointer enabled:active:cursor-default" : "";

  // Close on outside click and Escape (focus goes back to the field)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const d = parse(current);
      setDraft(d);
      setView(d.date ? parseDate(d.date) : new Date());
    }
    setOpen(!open);
  };

  const commit = (d: Draft) => {
    const v = build(type, d);
    if (value === undefined) setInner(v);
    onChange?.(v);
    setOpen(false);
  };

  const today = () => commit({ ...draft, date: fmtDate(new Date()) });
  const shown = open ? build(type, draft) : current;
  const nav = (dy: number, dm: number) => setView(new Date(view.getFullYear() + dy, view.getMonth() + dm, 1));

  return (
    <div ref={rootRef} className={cn("relative inline-block w-60", className)}>
      {name && <input type="hidden" name={name} value={current} />}

      {/* Field: default, hover, open and filled */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded border bg-white px-4 text-left text-subtitle transition-colors focus-visible:outline-none disabled:cursor-default disabled:bg-neutral-100",
          hand,
          open ? "border-brand" : "border-neutral-300 enabled:hover:border-brand-hover focus-visible:border-brand"
        )}
      >
        <Icon name={type === "time" ? "time" : "calendar"} className="text-neutral-500" />
        <span className={cn("truncate", shown ? "text-neutral-600" : "text-neutral-400")}>{shown || (placeholder ?? placeholders[type])}</span>
      </button>

      {open && (
        <div role="dialog" aria-label={placeholder ?? placeholders[type]} className="absolute left-0 top-full z-10 mt-1 w-max rounded bg-white shadow-elevation-3">
          <div className="flex">
            {type !== "time" && (
              <CalendarMonth
                className="m-3"
                month={view}
                start={draft.date}
                end={draft.date}
                onNav={nav}
                // Date: one click applies. Date and time: Apply button
                onPick={(date) => (type === "date" ? commit({ ...draft, date }) : setDraft({ ...draft, date }))}
              />
            )}
            {type !== "date" && (
              <TimeColumns
                time={draft.time}
                hand={type === "time" ? hand : ""}
                onPick={(col, n) => setDraft({ ...draft, time: draft.time.map((v, i) => (i === col ? n : v)) })}
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-neutral-100 px-3 py-2">
            {type === "date" && (
              <Button variant="link" size="sm" onClick={today}>
                Today
              </Button>
            )}
            {type === "datetime" && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="ml-auto">
                Cancel
              </Button>
            )}
            {type !== "date" && (
              <Button variant="primary" size="sm" onClick={() => commit({ ...draft, date: draft.date || fmtDate(new Date()) })}>
                Apply
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
