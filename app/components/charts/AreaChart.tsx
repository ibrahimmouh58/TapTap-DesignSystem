import { groupColors } from "./chartColors";
import { ChartFrame } from "./ChartFrame";
import type { LineChartProps, LineSeries } from "./LineChart";

// Same data shape as LineChart: one value per point, spread evenly across the width
export type AreaSeries = LineSeries;
export type AreaChartProps = LineChartProps;

const years = Array.from({ length: 10 }, (_, i) => String(2012 + i));

const oneValue: AreaSeries[] = [{ name: "Value", values: [4, 10, 22, 26, 24, 22, 26, 30, 33, 40] }];

const manyValues: AreaSeries[] = [
  { name: "Series 1", values: [10, 14, 22, 18, 26, 30, 28, 34, 40, 44] },
  { name: "Series 2", values: [30, 38, 34, 44, 50, 46, 56, 60, 58, 66] },
  { name: "Series 3", values: [50, 58, 62, 60, 70, 74, 72, 80, 84, 88] },
];

/** Lines with a light fill down to the x axis (fill: series color at 15%) */
export function AreaChart({ series = oneValue, labels = years, yMax = 100, yStep = 20, unit = "%", className }: AreaChartProps) {
  const colors = groupColors(series.length);

  return (
    <ChartFrame
      mode="point"
      labels={labels}
      yMax={yMax}
      yStep={yStep}
      unit={unit}
      className={className}
      label={`Area chart: ${series.map((s) => s.name).join(", ")}`}
    >
      {({ x, y }) =>
        // Last series first, so smaller areas stay on top
        [...series].reverse().map((s) => {
          const color = s.color ?? colors[series.indexOf(s)];
          const points = s.values.map((v, i) => `${x(i, s.values.length)},${y(v)}`);
          const base = `${x(s.values.length - 1, s.values.length)},${y(0)} ${x(0, s.values.length)},${y(0)}`;

          return (
            <g key={s.name}>
              <polygon points={`${points.join(" ")} ${base}`} fill={color} fillOpacity={0.15} />
              <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })
      }
    </ChartFrame>
  );
}

/** One area: Standard color 1 */
export const AreaChartOneValue = (props: Omit<AreaChartProps, "series">) => <AreaChart series={oneValue} {...props} />;

/** Several areas: colors follow the group order (1, 3, 5…) */
export const AreaChartMultipleValues = (props: Omit<AreaChartProps, "series">) => <AreaChart series={manyValues} {...props} />;
