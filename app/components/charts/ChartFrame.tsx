import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

// Drawing area (estimated): 520 × 240
export const W = 520;
export const H = 240;
export const pad = { top: 12, right: 16, bottom: 28, left: 44 };

/** What the frame gives the chart to draw with */
export interface FrameHelpers {
  /** X position of point i among `count` */
  x: (i: number, count: number) => number;
  /** Y position of a value */
  y: (v: number) => number;
  /** Column width ("band" mode) among `count` */
  band: (count: number) => number;
}

export interface ChartFrameProps {
  labels: string[];
  yMax: number;
  yStep: number;
  unit: string;
  /** "point": first and last points on the edges (lines) | "band": one column per label (bars) */
  mode: "point" | "band";
  label: string;
  className?: string;
  children: (helpers: FrameHelpers) => ReactNode;
}

export function ChartFrame({ labels, yMax, yStep, unit, mode, label, className, children }: ChartFrameProps) {
  const w = W - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;

  const x = (i: number, count: number) =>
    mode === "band" ? pad.left + ((i + 0.5) * w) / count : pad.left + (count === 1 ? w / 2 : (i / (count - 1)) * w);
  const y = (v: number) => pad.top + h - (Math.min(Math.max(v, 0), yMax) / yMax) * h;
  const band = (count: number) => w / count;

  const ticks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={cn("h-auto w-full max-w-[560px] bg-white", className)}>
      {/* Y ticks and grid lines */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-neutral-200"
            strokeWidth={1}
            strokeDasharray={t === 0 ? undefined : "2 3"}
          />
          <text x={pad.left - 10} y={y(t) + 3.5} textAnchor="end" className="fill-neutral-400 text-caption">
            {t}
            {unit}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {labels.map((l, i) => (
        <text key={i} x={x(i, labels.length)} y={H - 8} textAnchor="middle" className="fill-neutral-400 text-caption">
          {l}
        </text>
      ))}

      {children({ x, y, band })}
    </svg>
  );
}