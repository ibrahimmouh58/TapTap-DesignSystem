import { groupColors } from "./chartColors";
import { ChartFrame } from "./ChartFrame";

export interface LineSeries {
  name: string;
  /** One value per point, from 0 to `yMax`, spread evenly across the width */
  values: number[];
  /** Line color. Defaults to the group color, in guideline order */
  color?: string;
}

export interface LineChartProps {
  /** Defaults to one sample line */
  series?: LineSeries[];
  /** X axis labels. Defaults to 2012–2021 */
  labels?: string[];
  /** Max of the y axis (default 100) */
  yMax?: number;
  /** Gap between two ticks (default 20) */
  yStep?: number;
  /** Text after the ticks (default "%") */
  unit?: string;
  className?: string;
}

const years = Array.from({ length: 10 }, (_, i) => String(2012 + i));

const oneValue: LineSeries[] = [{ name: "Value", values: [40, 29, 44, 42, 40, 51, 59, 55, 74, 65] }];

const manyValues: LineSeries[] = [
  { name: "Series 1", values: [4, 7, 4, 7, 4, 7, 7, 11, 5, 10] },
  { name: "Series 2", values: [9, 12, 16, 12, 19, 16, 16, 23, 16, 23] },
  { name: "Series 3", values: [21, 15, 25, 29, 25, 25, 31, 31, 39, 31] },
  { name: "Series 4", values: [30, 31, 35, 37, 43, 47, 41, 49, 45, 51] },
  { name: "Series 5", values: [43, 43, 43, 48, 48, 57, 52, 63, 65, 69] },
  { name: "Series 6", values: [55, 56, 71, 62, 67, 71, 95, 98, 92, 89] },
];

export function LineChart({ series = oneValue, labels = years, yMax = 100, yStep = 20, unit = "%", className }: LineChartProps) {
  const colors = groupColors(series.length);

  return (
    <ChartFrame
      mode="point"
      labels={labels}
      yMax={yMax}
      yStep={yStep}
      unit={unit}
      className={className}
      label={`Line chart: ${series.map((s) => s.name).join(", ")}`}
    >
      {({ x, y }) =>
        series.map((s, si) => (
          <polyline
            key={s.name}
            fill="none"
            stroke={s.color ?? colors[si]}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.values.map((v, i) => `${x(i, s.values.length)},${y(v)}`).join(" ")}
          />
        ))
      }
    </ChartFrame>
  );
}

/** One line: Standard color 1 */
export const LineChartOneValue = (props: Omit<LineChartProps, "series">) => <LineChart series={oneValue} {...props} />;

/** Several lines: colors follow the group order (1, 3, 5, 7, 9, 2) */
export const LineChartMultipleValues = (props: Omit<LineChartProps, "series">) => <LineChart series={manyValues} {...props} />;