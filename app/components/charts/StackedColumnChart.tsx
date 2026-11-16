import { groupColors } from "./chartColors";
import { ChartFrame } from "./ChartFrame";

export interface StackedSeries {
  name: string;
  /** One value per stacked column. Grouped: columns of group 1, then group 2, etc. */
  values: number[];
  /** Segment color. Defaults to the group color, in guideline order */
  color?: string;
}

export interface StackedColumnChartProps {
  /** Defaults to three sample series. The first series is at the bottom */
  series?: StackedSeries[];
  /** One label per column (or group). Defaults to "Label" × 10 */
  labels?: string[];
  /** Stacked columns per label (default 1; more = Group Stacked) */
  perGroup?: number;
  /** Every column scaled to 100% (Percent Stacked) */
  percent?: boolean;
  /** Max of the y axis (default 5000, 100 in percent mode) */
  yMax?: number;
  /** Gap between two ticks (default 1000, 20 in percent mode) */
  yStep?: number;
  /** Text after the ticks (none by default, "%" in percent mode) */
  unit?: string;
  className?: string;
}

const labelsOf = (n: number) => Array.from({ length: n }, () => "Label");

/* Basic Stacked: 10 columns, 3 series */
const basicValues: StackedSeries[] = [
  { name: "Series 1", values: [550, 520, 1350, 200, 1600, 320, 1100, 1450, 650, 420] },
  { name: "Series 2", values: [550, 500, 1350, 200, 1600, 900, 900, 400, 650, 900] },
  { name: "Series 3", values: [1300, 500, 500, 1150, 500, 300, 900, 450, 220, 1150] },
];

/* Percent Stacked: 7 columns, 5 series (raw values, scaled to 100% when drawn) */
const percentValues: StackedSeries[] = [
  { name: "Series 1", values: [23, 28, 18, 8, 6, 21, 7] },
  { name: "Series 2", values: [5, 27, 18, 22, 6, 30, 25] },
  { name: "Series 3", values: [22, 8, 28, 24, 30, 7, 28] },
  { name: "Series 4", values: [23, 28, 18, 24, 30, 15, 15] },
  { name: "Series 5", values: [27, 9, 18, 22, 28, 27, 25] },
];

/* Group Stacked: 5 groups of 3 columns, 3 series */
const groupValues: StackedSeries[] = [
  { name: "Series 1", values: [600, 250, 950, 750, 900, 1150, 1300, 450, 1150, 900, 250, 1000, 900, 250, 650] },
  { name: "Series 2", values: [600, 1350, 900, 750, 900, 1100, 700, 850, 1100, 850, 1700, 900, 850, 1200, 1500] },
  { name: "Series 3", values: [1800, 500, 1000, 850, 950, 1300, 850, 500, 1300, 1250, 150, 1000, 1250, 650, 1550] },
];

export function StackedColumnChart({
  series = basicValues,
  labels = labelsOf(10),
  perGroup = 1,
  percent = false,
  yMax = percent ? 100 : 5000,
  yStep = percent ? 20 : 1000,
  unit = percent ? "%" : "",
  className,
}: StackedColumnChartProps) {
  const colors = groupColors(series.length);
  const gap = 3;

  return (
    <ChartFrame
      mode="band"
      labels={labels}
      yMax={yMax}
      yStep={yStep}
      unit={unit}
      className={className}
      label={`Stacked column chart${percent ? " (100%)" : ""}: ${series.map((s) => s.name).join(", ")}`}
    >
      {({ x, y, band }) => {
        const count = labels.length;
        // Single: 50% of the column, 18px max | Grouped: 75% of the column shared, 3px apart
        const barW =
          perGroup === 1 ? Math.min(18, band(count) * 0.5) : Math.min(14, (band(count) * 0.75 - gap * (perGroup - 1)) / perGroup);
        const groupW = perGroup * barW + (perGroup - 1) * gap;

        return Array.from({ length: count * perGroup }, (_, c) => {
          const g = Math.floor(c / perGroup);
          const left = x(g, count) - groupW / 2 + (c % perGroup) * (barW + gap);
          const total = series.reduce((sum, s) => sum + (s.values[c] ?? 0), 0);
          const scale = percent && total > 0 ? 100 / total : 1;

          // First series at the bottom, the next ones stacked above
          let acc = 0;
          return series.map((s, si) => {
            const v = (s.values[c] ?? 0) * scale;
            const rect = (
              <rect
                key={`${s.name}-${c}`}
                x={left}
                y={y(acc + v)}
                width={barW}
                height={y(acc) - y(acc + v)}
                fill={s.color ?? colors[si]}
              />
            );
            acc += v;
            return rect;
          });
        });
      }}
    </ChartFrame>
  );
}

/** Basic Stacked: three stacked series, guideline colors 1, 3 and 5 */
export const StackedColumnChartBasic = (props: Omit<StackedColumnChartProps, "series" | "percent" | "perGroup">) => (
  <StackedColumnChart series={basicValues} {...props} />
);

/** Percent Stacked: every column at 100%, five series (colors 1, 3, 5, 7, 9) */
export const StackedColumnChartPercent = ({
  labels = labelsOf(7),
  ...props
}: Omit<StackedColumnChartProps, "series" | "percent" | "perGroup">) => (
  <StackedColumnChart series={percentValues} labels={labels} percent {...props} />
);

/** Group Stacked: three stacked columns per label */
export const StackedColumnChartGroup = ({
  labels = labelsOf(5),
  ...props
}: Omit<StackedColumnChartProps, "series" | "percent" | "perGroup">) => (
  <StackedColumnChart series={groupValues} labels={labels} perGroup={3} {...props} />
);