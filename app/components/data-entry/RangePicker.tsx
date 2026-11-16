"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useDismiss } from "../../lib/listbox";
import { Button } from "../general/Button";
import { Icon } from "../../icons/Icon";
import { CalendarHeader, CalendarMonth, EPOCH, fmtDate, pad, parseDate, type CalendarStep } from "./Calendar";

const tabs = ["day", "week", "month", "year"] as const;
type Mode = (typeof tabs)[number];

export type RangeVariant = "basicSingle" | "basicDouble" | "quickSingle" | "quickDouble" | "dateTime" | Mode;

export interface RangePickerProps {
  variant?: RangeVariant;
  /** [start, end]: "2020-12-15", "2020-W50", "2020-12" or "2020" depending on the tab (controlled) */
  value?: [string, string];
  /** Uncontrolled initial value */
  defaultValue?: [string, string];
  onChange?: (value: [string, string]) => void;
  /** Form field name: start and end are sent as `${name}[start]` and `${name}[end]` */
  name?: string;
  disabled?: boolean;
  className?: string;
}

type Draft = { start: string; end: string; st: number[]; et: number[] };

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Date shown for a value of a given tab ("2020-12" → December 1st, 2020)
function toDate(mode: Mode, s: string) {
  if (!s) return new Date();
  return parseDate(mode === "month" ? `${s}-01` : mode === "year" ? `${s}-01-01` : s);
}

/* ───────── ISO weeks (Monday first) ───────── */

// "2020-12-15" → "2020-W51"
function isoWeek(s: string) {
  const d = parseDate(s);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7)); // Thursday of that week
  const j = new Date(t.getFullYear(), 0, 4);
  const w = 1 + Math.round(((+t - +j) / 864e5 - 3 + ((j.getDay() + 6) % 7)) / 7);
  return `${t.getFullYear()}-W${pad(w)}`;
}

// Monday (add = 0) or Sunday (add = 6) of a date's week
function weekDay(s: string, add: number) {
  const d = parseDate(s);
  return fmtDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7) + add));
}

// "2020-W51" → Monday or Sunday of that week
function weekEdge(label: string, end: boolean) {
  const [y, w] = label.split("-W").map(Number);
  const j = new Date(y, 0, 4);
  return fmtDate(new Date(y, 0, 4 - ((j.getDay() + 6) % 7) + (w - 1) * 7 + (end ? 6 : 0)));
}

/* ───────── Shortcuts ───────── */

const quickLabels = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Last month"];

// Range of a shortcut (a number means "Last N days"). Only called on click.
function quickRange(l: string | number): [string, string] {
  const t = new Date();
  const [y, m, d] = [t.getFullYear(), t.getMonth(), t.getDate()];
  const day = (n: number) => fmtDate(new Date(y, m, d + n));
  if (typeof l === "number") return [day(-(l - 1)), day(0)];
  if (l === "Today") return [day(0), day(0)];
  if (l === "Yesterday") return [day(-1), day(-1)];
  if (l === "Last 7 days") return [day(-6), day(0)];
  if (l === "Last 30 days") return [day(-29), day(0)];
  if (l === "This month") return [fmtDate(new Date(y, m, 1)), fmtDate(new Date(y, m + 1, 0))];
  return [fmtDate(new Date(y, m - 1, 1)), fmtDate(new Date(y, m, 0))];
}

// Header arrows of the Month (±1 / ±10 years) and Year (±10 / ±100 years) tabs
const gridNav: Record<"month" | "year", CalendarStep[]> = {
  month: [
    { icon: "double-left", label: "Previous decade", dy: -10, dm: 0 },
    { icon: "left", label: "Previous year", dy: -1, dm: 0 },
    { icon: "right", label: "Next year", dy: 1, dm: 0 },
    { icon: "double-right", label: "Next decade", dy: 10, dm: 0 },
  ],
  year: [
    { icon: "double-left", label: "Previous century", dy: -100, dm: 0 },
    { icon: "left", label: "Previous decade", dy: -10, dm: 0 },
    { icon: "right", label: "Next decade", dy: 10, dm: 0 },
    { icon: "double-right", label: "Next century", dy: 100, dm: 0 },
  ],
};

/* ───────── 3-column grid (Month and Year tabs) ───────── */

type Cell = { value: string; label: string; muted?: boolean };

function Grid({ cells, start, end, onPick, onHover }: { cells: Cell[]; start: string; end: string; onPick: (v: string) => void; onHover: (v: string) => void }) {
  return (
    <div className="mt-1 grid grid-cols-3 py-2">
      {cells.map((c) => {
        const edge = c.value === start || c.value === end;
        const band = !!start && !!end && c.value > start && c.value < end;
        return (
          <div key={c.value} onMouseEnter={() => onHover(c.value)} className={cn("flex h-12 items-center justify-center", band && "bg-primary-100")}>
            <button
              type="button"
              aria-pressed={edge}
              onClick={() => onPick(c.value)}
              className={cn(
                "h-8 w-16 rounded text-body transition-colors hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-brand",
                edge ? "bg-brand text-white" : cn("hover:bg-primary-100", c.muted ? "text-neutral-400" : "text-neutral-600")
              )}
            >
              {c.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Shortcuts panel: 1 column (Single) or 2 columns (Double) ───────── */

function Quick({ selected, onPick, columns }: { selected: string; onPick: (label: string, range: [string, string]) => void; columns: number }) {
  const items = [
    ...quickLabels.map((l) => (
      <button
        key={l}
        type="button"
        aria-pressed={selected === l}
        onClick={() => onPick(l, quickRange(l))}
        className={cn(
          "h-8 rounded text-body transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-brand",
          selected === l ? "bg-brand text-white" : "bg-primary-100 text-neutral-600 hover:bg-primary-200"
        )}
      >
        {l}
      </button>
    )),
    <label key="n" className="flex h-8 items-center rounded border border-neutral-300 text-body text-neutral-600">
      <span className="px-2">Last</span>
      <input
        type="number"
        min={1}
        placeholder="N"
        aria-label="Number of days"
        onChange={(e) => +e.target.value > 0 && onPick(`Last ${e.target.value} days`, quickRange(+e.target.value))}
        className="w-10 border-x border-neutral-300 text-center outline-none placeholder:text-neutral-400 focus-visible:bg-primary-50"
      />
      <span className="px-2">days</span>
    </label>,
  ];

  // Items are spread row by row over the columns
  return (
    <div className="flex">
      {Array.from({ length: columns }, (_, c) => (
        <div key={c} className="flex w-36 flex-col gap-2 border-l border-neutral-100 p-2">
          {items.filter((_, i) => i % columns === c)}
        </div>
      ))}
    </div>
  );
}

/* ───────── Hours / minutes / seconds column (dateTime) ───────── */

function Column({ count, value, label, onPick }: { count: number; value: number; label: string; onPick: (n: number) => void }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = Math.max(0, (value - 3) * 32); // keep the chosen value in view
  }, [value]);

  return (
    <ul ref={ref} aria-label={label} className="h-[256px] w-14 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {Array.from({ length: count }, (_, n) => (
        <li key={n}>
          <button
            type="button"
            aria-pressed={value === n}
            onClick={() => onPick(n)}
            className={cn(
              "h-8 w-full text-body transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
              value === n ? "bg-brand text-white" : "text-neutral-600 hover:bg-primary-100"
            )}
          >
            {pad(n)}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════════════════════════════════════════════
   RANGE PICKER
   ═══════════════════════════════════════════════════════════ */

export function RangePicker({ variant = "basicSingle", value, defaultValue, onChange, name, disabled = false, className }: RangePickerProps) {
  const tabbed = (tabs as readonly string[]).includes(variant);
  const dateTime = variant === "dateTime";

  const [inner, setInner] = useState<[string, string]>(defaultValue ?? ["", ""]);
  const current = value ?? inner;

  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<Mode>(tabbed ? (variant as Mode) : "day"); // tab of the applied value
  const [tab, setTab] = useState<Mode>(applied); // tab shown while the panel is open
  const [active, setActive] = useState<"start" | "end">("start");
  const [draft, setDraft] = useState<Draft>({ start: "", end: "", st: [0, 0, 0], et: [0, 0, 0] });
  const [view, setView] = useState(EPOCH); // real month is set when the panel opens
  const [hover, setHover] = useState("");
  const [quick, setQuick] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  useDismiss(open, () => setOpen(false), rootRef, startRef);

  const mode = open ? tab : applied;
  const double = variant === "basicDouble"; // only Basic Double shows two months
  const withQuick = variant.startsWith("quick") || (tabbed && mode === "day");
  const word = dateTime ? "time" : mode === "day" ? "date" : mode;

  // Displayed text of an internal value
  const text = (d: string, t: number[]) => (mode === "week" ? (d ? isoWeek(d) : "") : dateTime && d ? `${d} ${t.map(pad).join(":")}` : d);

  // Internal value from a text (dateTime: date + time)
  const load = (t: string, end: boolean): [string, number[]] =>
    dateTime
      ? [t.slice(0, 10), t.length > 10 ? t.slice(11).split(":").map(Number) : [0, 0, 0]]
      : [applied === "week" && t ? weekEdge(t, end) : t, [0, 0, 0]];

  const openAt = (which: "start" | "end") => {
    if (!open) {
      const [start, st] = load(current[0], false);
      const [end, et] = load(current[1], true);
      setDraft({ start, end, st, et });
      setView(toDate(applied, start));
      setTab(applied);
      setQuick("");
    }
    setActive(which);
    setOpen(true);
  };

  // Switching tabs starts from an empty selection
  const switchTab = (t: Mode) => {
    setTab(t);
    setDraft({ start: "", end: "", st: [0, 0, 0], et: [0, 0, 0] });
    setActive("start");
    setQuick("");
  };

  // A click on a day, week, month or year: start first, then end
  const pick = (raw: string) => {
    setQuick("");
    const s = mode === "week" ? weekDay(raw, 0) : raw;
    const e = mode === "week" ? weekDay(raw, 6) : raw;
    if (active === "start") {
      setDraft({ ...draft, start: s, end: draft.end && draft.end < s ? "" : draft.end });
      setActive("end");
    } else if (!draft.start || s < draft.start) setDraft({ ...draft, start: s });
    else setDraft({ ...draft, end: e });
  };

  const pickQuick = (label: string, [start, end]: [string, string]) => {
    setQuick(label);
    setDraft({ ...draft, start, end });
    setView(parseDate(start));
  };

  const pickTime = (col: number, n: number) => {
    const next = (active === "start" ? draft.st : draft.et).map((v, i) => (i === col ? n : v));
    setDraft(active === "start" ? { ...draft, st: next } : { ...draft, et: next });
  };

  const apply = () => {
    if (draft.start) {
      const v: [string, string] = [text(draft.start, draft.st), text(draft.end || draft.start, draft.et)];
      if (value === undefined) setInner(v);
      setApplied(tab);
      onChange?.(v);
    }
    setOpen(false);
  };

  // Hover preview while picking the end
  const hv = mode === "week" && hover ? weekDay(hover, 6) : hover;
  const preview = active === "end" && hv && draft.start && hv >= draft.start ? hv : draft.end;

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const months = double ? [first, new Date(first.getFullYear(), first.getMonth() + 1, 1)] : [first];
  const nav = (dy: number, dm: number) => setView(new Date(first.getFullYear() + dy, first.getMonth() + dm, 1));

  // Month and Year grids
  const year = first.getFullYear();
  const decade = Math.floor(year / 10) * 10;
  const cells: Cell[] =
    mode === "month"
      ? monthNames.map((label, i) => ({ value: `${year}-${pad(i + 1)}`, label }))
      : Array.from({ length: 12 }, (_, i) => {
          const n = decade - 1 + i;
          return { value: String(n), label: String(n), muted: n < decade || n > decade + 9 };
        });

  const parts = [
    { which: "start", text: open ? text(draft.start, draft.st) : current[0], placeholder: `Start ${word}` },
    { which: "end", text: open ? text(draft.end, draft.et) : current[1], placeholder: `End ${word}` },
  ] as const;

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {name && (
        <>
          <input type="hidden" name={`${name}[start]`} value={current[0]} />
          <input type="hidden" name={`${name}[end]`} value={current[1]} />
        </>
      )}

      {/* Field: default, hover, focus-start, focus-end and filled */}
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded border px-4 text-subtitle transition-colors",
          dateTime ? "w-[420px]" : "w-[280px]",
          disabled ? "border-neutral-200 bg-neutral-100" : open ? "border-brand bg-white" : "border-neutral-300 bg-white hover:border-brand-hover"
        )}
      >
        <Icon name="calendar" className="text-neutral-500" />

        {parts.map((p, i) => (
          <span key={p.which} className="contents">
            {i === 1 && <Icon name="arrow-right" className="text-neutral-400" />}
            <button
              ref={p.which === "start" ? startRef : undefined}
              type="button"
              disabled={disabled}
              onClick={() => openAt(p.which)}
              aria-expanded={open && active === p.which}
              aria-haspopup="dialog"
              className="relative flex h-full min-w-0 flex-1 items-center text-left outline-none focus-visible:bg-primary-50"
            >
              <span className={cn("truncate", p.text ? "text-neutral-600" : "text-neutral-400")}>{p.text || p.placeholder}</span>
              {/* Teal underline below the active part */}
              {open && active === p.which && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
            </button>
          </span>
        ))}
      </div>

      {open && (
        <div role="dialog" aria-label={`Select ${word} range`} className="absolute left-0 top-full z-10 mt-1 w-max rounded bg-white shadow-elevation-3">
          {/* Tabs: Day, Week, Month, Year */}
          {tabbed && (
            <div role="tablist" className="flex border-b border-neutral-100">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={cn(
                    "h-10 flex-1 border-b-2 px-4 text-body capitalize transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                    tab === t ? "border-brand text-brand" : "border-transparent text-neutral-600 hover:text-brand"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="flex">
            <div className="p-3" onMouseLeave={() => setHover("")}>
              {(mode === "day" || mode === "week") && (
                <div className="flex gap-6">
                  {months.map((m, i) => (
                    <CalendarMonth
                      key={i}
                      month={m}
                      start={draft.start}
                      end={preview}
                      onPick={pick}
                      onHover={setHover}
                      onNav={nav}
                      prev={i === 0}
                      next={i === months.length - 1}
                    />
                  ))}
                </div>
              )}

              {(mode === "month" || mode === "year") && (
                <div className="w-[252px]">
                  <CalendarHeader title={mode === "month" ? String(year) : `${decade}–${decade + 9}`} steps={gridNav[mode]} onNav={nav} />
                  <Grid cells={cells} start={draft.start} end={preview} onPick={pick} onHover={setHover} />
                </div>
              )}
            </div>

            {withQuick && <Quick selected={quick} onPick={pickQuick} columns={variant === "quickSingle" ? 1 : 2} />}

            {dateTime && (
              <div className="flex border-l border-neutral-100">
                {["Hours", "Minutes", "Seconds"].map((label, col) => (
                  <Column
                    key={label}
                    label={label}
                    count={col === 0 ? 24 : 60}
                    value={(active === "start" ? draft.st : draft.et)[col]}
                    onPick={(n) => pickTime(col, n)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-100 px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
