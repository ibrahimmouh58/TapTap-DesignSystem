"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useDismiss } from "../../lib/listbox";
import { Button } from "../general/Button";
import { Icon } from "../../icons/Icon";
import { CalendarMonth, EPOCH, fmtDate, parseDate } from "./Calendar";

export interface ComparisonProps {
  /** Reference period [start, end]. Defaults to the last 7 days */
  base?: [string, string];
  /** [start, end] as "2020-12-11" (controlled) */
  value?: [string, string];
  /** Uncontrolled initial value */
  defaultValue?: [string, string];
  /** Called with the chosen period, or ["", ""] when cleared */
  onChange?: (value: [string, string]) => void;
  disabled?: boolean;
  className?: string;
}

type Range = [string, string];

/* ───────── Date helpers ───────── */

const addDays = (s: string, n: number) => {
  const d = parseDate(s);
  return fmtDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
const addYears = (s: string, n: number) => {
  const d = parseDate(s);
  return fmtDate(new Date(d.getFullYear() + n, d.getMonth(), d.getDate()));
};
const days = (a: string, b: string) => Math.round((+parseDate(b) - +parseDate(a)) / 864e5) + 1;

// Same length just before, and the same period one year earlier
const preceding = ([s, e]: Range): Range => [addDays(s, -days(s, e)), addDays(s, -1)];
const lastYear = ([s, e]: Range): Range => [addYears(s, -1), addYears(e, -1)];

/* ═══════════════════════════════════════════════════════════
   COMPARISON: "+ Compare to" → menu → calendar with shortcuts
   ═══════════════════════════════════════════════════════════ */

export function Comparison({ base, value, defaultValue, onChange, disabled = false, className }: ComparisonProps) {
  const [inner, setInner] = useState<Range>(defaultValue ?? ["", ""]);
  const current = value ?? inner;
  const filled = !!current[0];

  const [panel, setPanel] = useState<"none" | "menu" | "calendar">("none");
  const [draft, setDraft] = useState<Range>(["", ""]);
  const [view, setView] = useState(EPOCH); // real month is set when the calendar opens
  const [hover, setHover] = useState("");
  const [quick, setQuick] = useState("");
  const [picking, setPicking] = useState<"start" | "end">("start");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss(panel !== "none", () => setPanel("none"), rootRef, triggerRef);

  // Read the clock only on interaction (never while pre-rendering)
  const reference = (): Range => {
    if (base) return base;
    const today = fmtDate(new Date());
    return [addDays(today, -6), today];
  };

  const commit = (r: Range) => {
    if (value === undefined) setInner(r);
    onChange?.(r);
    setPanel("none");
  };

  const openCalendar = () => {
    setDraft(current);
    setView(parseDate(current[0] || reference()[0]));
    setPicking("start");
    setQuick("");
    setPanel("calendar");
  };

  // First click picks the start, the next ones the end
  const pick = (d: string) => {
    setQuick("");
    if (picking === "start") {
      setDraft([d, draft[1] && draft[1] < d ? "" : draft[1]]);
      setPicking("end");
    } else if (!draft[0] || d < draft[0]) setDraft([d, draft[1]]);
    else setDraft([draft[0], d]);
  };

  const pickQuick = (label: string, r: Range) => {
    setQuick(label);
    setDraft(r);
    setView(parseDate(r[0]));
  };

  // Hover preview while picking the end
  const preview = picking === "end" && hover && draft[0] && hover >= draft[0] ? hover : draft[1];
  const nav = (dy: number, dm: number) => setView(new Date(view.getFullYear() + dy, view.getMonth() + dm, 1));

  const menu = [
    { label: "Preceding period", run: () => commit(preceding(reference())) },
    { label: "Same time last year", run: () => commit(lastYear(reference())) },
    { label: "Custom", run: openCalendar },
  ];

  const open = panel !== "none";

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {filled ? (
        /* Filled: the period, and a round button to clear it */
        <div
          className={cn(
            "flex h-10 w-[360px] items-center gap-3 rounded border bg-white px-4 text-subtitle transition-colors",
            disabled ? "border-neutral-200 bg-neutral-100" : panel === "calendar" ? "border-brand" : "border-neutral-300 hover:border-brand-hover"
          )}
        >
          <Icon name="calendar" className="text-neutral-500" />
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={openCalendar}
            aria-expanded={panel === "calendar"}
            aria-haspopup="dialog"
            className="flex flex-1 items-center justify-between rounded text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span>{current[0]}</span>
            <Icon name="arrow-right" className="text-neutral-400" />
            <span>{current[1]}</span>
          </button>
          <button
            type="button"
            aria-label="Clear"
            disabled={disabled}
            onClick={() => commit(["", ""])}
            className="flex shrink-0 items-center justify-center text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-500 active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="error" variant="filled" />
          </button>
        </div>
      ) : (
        /* Default, hover and open (teal border and text) */
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setPanel(panel === "menu" ? "none" : "menu")}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "flex h-10 items-center gap-2 rounded border bg-white px-4 text-subtitle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:bg-neutral-100 disabled:text-neutral-400",
            open
              ? "border-brand text-brand"
              : "border-neutral-300 text-neutral-600 enabled:hover:border-brand-hover enabled:hover:text-brand-hover enabled:active:border-brand enabled:active:text-brand"
          )}
        >
          <Icon name="plus" size={20} />
          Compare to
        </button>
      )}

      {/* Menu: 3 choices */}
      {panel === "menu" && (
        <ul role="menu" className="absolute left-0 top-full z-10 mt-1 w-[200px] rounded bg-white p-1.5 shadow-elevation-3">
          {menu.map((item) => (
            <li key={item.label} role="none" className="border-b border-neutral-100 py-px last:border-b-0">
              <button
                type="button"
                role="menuitem"
                onClick={item.run}
                className="flex h-11 w-full items-center rounded px-2.5 text-left text-subtitle text-neutral-600 transition-colors hover:cursor-pointer hover:bg-neutral-100 active:cursor-default focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Calendar, shortcuts, Cancel and Apply */}
      {panel === "calendar" && (
        <div role="dialog" aria-label="Compare to" className="absolute left-0 top-full z-10 mt-1 w-max rounded bg-white shadow-elevation-3">
          <div className="flex">
            <div className="p-3" onMouseLeave={() => setHover("")}>
              <CalendarMonth month={view} start={draft[0]} end={preview} onPick={pick} onHover={setHover} onNav={nav} />
            </div>

            <div className="flex w-44 flex-col gap-2 border-l border-neutral-100 p-2">
              {(
                [
                  ["Preceding period", preceding(reference())],
                  ["Preceding year", lastYear(reference())],
                ] as [string, Range][]
              ).map(([label, r]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={quick === label}
                  onClick={() => pickQuick(label, r)}
                  className={cn(
                    "h-8 rounded text-body transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-brand",
                    quick === label ? "bg-brand text-white" : "bg-primary-100 text-neutral-600 hover:bg-primary-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-100 px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => setPanel("none")}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => draft[0] && commit([draft[0], draft[1] || draft[0]])}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
