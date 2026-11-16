"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

type SliderValue = number | [number, number];

export interface SliderProps {
  /** true: two handles (range) | false: one handle */
  range?: boolean;
  /** Controlled value: a number, or [start, end] for a range */
  value?: SliderValue;
  /** Uncontrolled initial value (default [22, 51] for a range, 51 for one handle) */
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Dark tooltip with the value, always shown (otherwise only while dragging) */
  tooltip?: boolean;
  /** Ticks: true = 5 marks (0, 25, 50, 75, 100), or a list of values */
  marks?: boolean | number[];
  disabled?: boolean;
  className?: string;
}

export function Slider({
  range = true,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  tooltip = false,
  marks = false,
  disabled = false,
  className,
}: SliderProps) {
  const [inner, setInner] = useState<SliderValue>(defaultValue ?? (range ? [22, 51] : 51));
  const current = value ?? inner;
  const vals = Array.isArray(current) ? (range ? current : [current[1]]) : [current];

  const [active, setActive] = useState<number | null>(null); // handle being dragged
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  // Value at the pointer position, rounded to the step
  const valueAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return clamp(parseFloat((Math.round((min + ratio * (max - min) - min) / step) * step + min).toFixed(10)));
  };

  // Set a handle value. If it passes the other one, they swap roles
  // and dragging continues with the other handle.
  // With the keyboard (pointer = false), the focus moves to the other handle instead.
  const setAt = (i: number, n: number, pointer: boolean) => {
    const next = [...vals];
    next[i] = n;
    if (range && next[0] > next[1]) {
      next.reverse();
      if (pointer) setActive(1 - i);
      else handleRefs.current[1 - i]?.focus();
    }
    const out: SliderValue = range ? [next[0], next[1]] : next[0];
    if (value === undefined) setInner(out);
    onChange?.(out);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const n = valueAt(e.clientX);
    // Handle closest to the click
    const i =
      vals.length === 1 ? 0 : vals[0] === vals[1] ? (n < vals[0] ? 0 : 1) : Math.abs(n - vals[0]) <= Math.abs(n - vals[1]) ? 0 : 1;
    setActive(i);
    e.currentTarget.setPointerCapture(e.pointerId);
    setAt(i, n, true);
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const big = Math.max(step, (max - min) / 10);
    const delta = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }[e.key];
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setAt(i, e.key === "Home" ? min : max, false);
      return;
    }
    if (delta === undefined) return;
    e.preventDefault();
    setAt(i, clamp(vals[i] + delta), false);
  };

  const from = range ? pct(vals[0]) : 0;
  const to = pct(vals[vals.length - 1]);
  const ticks = marks === true ? [0, 1, 2, 3, 4].map((k) => min + ((max - min) * k) / 4) : marks || [];

  return (
    // 6px side margins leave room for half a handle at both ends
    <div className={cn("flex w-[400px] max-w-full flex-col px-1.5", className)}>
      {/* Drag area */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => active !== null && setAt(active, valueAt(e.clientX), true)}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
        className={`relative h-6 touch-none ${disabled || active !== null ? "cursor-default" : "hover:cursor-pointer"}`}
      >
        {/* Gray rail */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-200" />

        {/* Filled part: teal (gray when disabled) */}
        <div
          className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${disabled ? "bg-neutral-400" : "bg-brand"}`}
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />

        {vals.map((v, i) => (
          <div key={i} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct(v)}%` }}>
            <div
              ref={(el) => {
                handleRefs.current[i] = el;
              }}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={v}
              aria-label={vals.length === 2 ? (i === 0 ? "Minimum value" : "Maximum value") : "Value"}
              aria-disabled={disabled}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`size-3 rounded-full border-2 bg-white transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                disabled ? "border-neutral-400" : "border-brand hover:ring-4 hover:ring-primary-600/15"
              }`}
            />

            {(tooltip || active === i) && !disabled && (
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 flex h-8 -translate-x-1/2 items-center rounded bg-neutral-700 px-2.5 text-body text-white">
                {v}
                <span aria-hidden="true" className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-neutral-700" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Ticks: a small line with the value below */}
      {ticks.length > 0 && (
        <div className="relative mt-1 h-6" aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${pct(t)}%` }}>
              <span className="h-1 w-px bg-neutral-300" />
              <span className="mt-1 text-caption text-neutral-400">{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** One handle (51 by default): same as <Slider range={false} /> */
export const SliderSingle = (props: Omit<SliderProps, "range">) => <Slider range={false} {...props} />;