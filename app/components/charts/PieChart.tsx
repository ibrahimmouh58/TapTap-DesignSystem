import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { groupColors } from "./chartColors";

export interface PieSlice {
  name: string;
  /** Slice value (slice size is proportional to the total) */
  value: number;
  /** Slice color. Defaults to the group color, in guideline order */
  color?: string;
}

export interface PieChartProps {
  /** Defaults to 4 sample slices */
  data?: PieSlice[];
  /** Value formatting (default "7,500") */
  format?: (value: number) => string;
  /** Center hole, from 0 (full pie) to 1. Used by DonutChart */
  innerRadius?: number;
  /** Content in the center (the DonutChart total) */
  center?: ReactNode;
  className?: string;
}

// Drawing area (estimated): 520 × 280, 90px radius circle in the center
const W = 520;
const H = 280;
const cx = W / 2;
const cy = H / 2;
const R = 90;

export const sampleSlices: PieSlice[] = [
  { name: "Label 1", value: 7500 },
  { name: "Label 2", value: 5000 },
  { name: "Label 3", value: 5000 },
  { name: "Label 4", value: 2500 },
];

/** 7500 → "7,500" (fixed locale: same on the server and in the browser) */
export const formatNumber = (v: number) => v.toLocaleString("en-US");

// Point at angle a on a circle of radius r (0 = top, clockwise)
const at = (a: number, r: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;

// Outline of a slice from a0 to a1. With an inner radius: a ring segment
function slicePath(a0: number, a1: number, inner: number) {
  const end = Math.min(a1, a0 + 2 * Math.PI - 1e-4); // keep a 100% slice visible
  const large = end - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = at(a0, R);
  const [x1, y1] = at(end, R);

  if (inner <= 0) return `M${cx},${cy} L${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} Z`;

  const [ix1, iy1] = at(end, inner);
  const [ix0, iy0] = at(a0, inner);
  return `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${ix1},${iy1} A${inner},${inner} 0 ${large} 0 ${ix0},${iy0} Z`;
}

export function PieChart({ data = sampleSlices, format = formatNumber, innerRadius = 0, center, className }: PieChartProps) {
  const colors = groupColors(data.length);
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  const inner = Math.min(Math.max(innerRadius, 0), 0.95) * R;

  // Angles of each slice, starting at the top
  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = total > 0 ? (Math.max(d.value, 0) / total) * 2 * Math.PI : 0;
    const slice = { ...d, color: d.color ?? colors[i], a0: angle, a1: angle + sweep };
    angle += sweep;
    return slice;
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${innerRadius > 0 ? "Donut chart" : "Pie chart"} : ${data
        .map((d) => `${d.name} ${format(d.value)}`)
        .join(", ")}`}
      className={cn("h-auto w-full max-w-[560px] bg-white", className)}
    >
      {slices.map((s) =>
        s.a1 > s.a0 ? (
          <path key={s.name} d={slicePath(s.a0, s.a1, inner)} fill={s.color}>
            <title>{`${s.name} : ${format(s.value)}`}</title>
          </path>
        ) : null
      )}

      {/* Labels: an elbow line in the slice color, then name and value */}
      {slices.map((s) => {
        if (s.a1 <= s.a0) return null;
        const mid = (s.a0 + s.a1) / 2;
        const right = Math.sin(mid) >= 0;
        const [x0, y0] = at(mid, R + 2);
        const [x1, y1] = at(mid, R + 16);
        const x2 = x1 + (right ? 16 : -16);
        const tx = x2 + (right ? 4 : -4);

        return (
          <g key={`label-${s.name}`} aria-hidden="true">
            <polyline points={`${x0},${y0} ${x1},${y1} ${x2},${y1}`} fill="none" stroke={s.color} strokeWidth={1} />
            <text x={tx} y={y1 + 3.5} textAnchor={right ? "start" : "end"} className="fill-neutral-500 text-caption">
              {s.name}
            </text>
            <text x={tx} y={y1 + 18} textAnchor={right ? "start" : "end"} className="fill-neutral-500 text-caption">
              {format(s.value)}
            </text>
          </g>
        );
      })}

      {center && (
        <g transform={`translate(${cx} ${cy})`} textAnchor="middle">
          {center}
        </g>
      )}
    </svg>
  );
}

/** Full pie: 4 slices, guideline colors 1, 3, 5 and 7 */
export const PieChartBasic = (props: Omit<PieChartProps, "innerRadius" | "center">) => <PieChart {...props} />;
