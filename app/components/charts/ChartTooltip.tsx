import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { groupColors } from "./chartColors";

export interface TooltipRow {
  name: string;
  /** Value on the right, already formatted ("30%", "7,500") */
  value: ReactNode;
  /** Dot color. Defaults to the group color, in guideline order */
  color?: string;
}

export interface ChartTooltipProps {
  /** Gray title: the hovered x value ("2021") */
  title?: ReactNode;
  /** One row per series. Defaults to "Label 1"…"Label 8" at 30% */
  rows?: TooltipRow[];
  className?: string;
}

const sampleRows: TooltipRow[] = Array.from({ length: 8 }, (_, i) => ({ name: `Label ${i + 1}`, value: "30%" }));

/* ═══════════════════════════════════════════════════════════
   BASIC: the card alone
   White, radius 4, Elevation 2, padding 8 × 10 (estimated)
   ═══════════════════════════════════════════════════════════ */

export function ChartTooltip({ title = "2021", rows = sampleRows, className }: ChartTooltipProps) {
  // 10 guideline colors: start again after that
  const colors = groupColors(Math.min(rows.length, 10));

  return (
    <div
      role="tooltip"
      className={cn("pointer-events-none inline-flex w-max flex-col gap-0.5 rounded bg-white px-2.5 py-2 shadow-elevation-2", className)}
    >
      {title !== undefined && <div className="text-caption text-neutral-400">{title}</div>}

      <dl className="grid grid-cols-[auto_auto] items-center gap-x-4">
        {rows.map((row, i) => (
          <div key={`${row.name}-${i}`} className="contents">
            <dt className="flex items-center gap-1.5 text-caption text-neutral-500">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? colors[i % colors.length] }}
              />
              {row.name}
            </dt>
            <dd className="text-right text-caption text-neutral-700">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WITH LINE / AREA CHART: vertical line at the hovered x,
   one hollow dot per series, card on the right
   ═══════════════════════════════════════════════════════════ */

export interface ChartTooltipWithLineProps extends ChartTooltipProps {
  /** Height of each dot, in % of the line (0 = bottom). One per row */
  points?: number[];
  /** Line height in px (default 190) */
  height?: number;
}

export function ChartTooltipWithLine({ rows = sampleRows, points, height = 190, className, ...props }: ChartTooltipWithLineProps) {
  const colors = groupColors(Math.min(rows.length, 10));
  // Default: dots from top to bottom, as in Figma
  const ys = points ?? rows.map((_, i) => 80 - (i * 64) / Math.max(rows.length - 1, 1));

  return (
    <div className={cn("relative inline-flex", className)} style={{ height }}>
      {/* Vertical line */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-neutral-300" />

      {/* Hollow dots (6px, 1.5px border) */}
      {ys.map((y, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full border-[1.5px] bg-white"
          style={{ left: 0.5, bottom: `${y}%`, borderColor: rows[i]?.color ?? colors[i % colors.length] }}
        />
      ))}

      <ChartTooltip rows={rows} {...props} className="absolute left-1.5 top-[12%]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WITH COLUMN CHART: pale band on the hovered column,
   card on top, shifted right
   ═══════════════════════════════════════════════════════════ */

export interface ChartTooltipWithColumnProps extends ChartTooltipProps {
  /** Band width in px (default 50) */
  bandWidth?: number;
  /** Band height in px (default 200) */
  height?: number;
}

export function ChartTooltipWithColumn({ bandWidth = 50, height = 200, className, ...props }: ChartTooltipWithColumnProps) {
  return (
    <div className={cn("relative inline-block", className)} style={{ width: bandWidth, height }}>
      {/* Band: Standard color 1 at 10% */}
      <span aria-hidden="true" className="absolute inset-0 bg-chart-1/10" />

      {/* Card starts at two thirds of the band */}
      <div className="absolute top-[16%]" style={{ left: (bandWidth * 2) / 3 }}>
        <ChartTooltip {...props} />
      </div>
    </div>
  );
}

/* To follow the mouse in a chart, absolutely position the card
   inside the chart container, at the hovered column or point. */
