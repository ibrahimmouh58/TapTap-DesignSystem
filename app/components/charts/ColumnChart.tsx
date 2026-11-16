import { groupColors } from "./chartColors";
import { ChartFrame } from "./ChartFrame";

export interface ColumnSeries {
  name: string;
  /** One value per column (or group), from 0 to `yMax` */
  values: number[];
  /** Bar color. Defaults to the group color, in guideline order */
  color?: string;
}

export interface ColumnChartProps {
  /** Defaults to a sample series */
  series?: ColumnSeries[];
  /** One label per column (or group). Defaults to 2012–2021 */
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

const oneValue: ColumnSeries[] = [{ name: "Value", values: [71, 44, 59, 75, 57, 61, 63, 53, 71, 55] }];

const manyLabels = ["2015", "2016", "2017", "2018", "2019", "2020", "2021"];
const manyValues: ColumnSeries[] = [
  { name: "Series 1", values: [70, 37, 36, 67, 48, 49, 45] },
  { name: "Series 2", values: [35, 47, 78, 26, 66, 84, 69] },
  { name: "Series 3", values: [42, 63, 42, 53, 29, 66, 42] },
];

export function ColumnChart({ series = oneValue, labels = years, yMax = 100, yStep = 20, unit = "%", className }: ColumnChartProps) {
  const colors = groupColors(series.length);

  return (
    <ChartFrame
      mode="band"
      labels={labels}
      yMax={yMax}
      yStep={yStep}
      unit={unit}
      className={className}
      label={`Column chart: ${series.map((s) => s.name).join(", ")}`}
    >
      {({ x, y, band }) => {
        const count = labels.length;
        // Bars of a group touch: 60% of the column shared by the series, 18px max
        const barW = Math.min(18, (band(count) * 0.6) / series.length);

        return series.map((s, si) =>
          s.values.map((v, i) => (
            <rect
              key={`${s.name}-${i}`}
              x={x(i, count) - (barW * series.length) / 2 + si * barW}
              y={y(v)}
              width={barW}
              height={y(0) - y(v)}
              fill={s.color ?? colors[si]}
            />
          ))
        );
      }}
    </ChartFrame>
  );
}

/** One series: Standard color 1 */
export const ColumnChartOneValue = (props: Omit<ColumnChartProps, "series">) => <ColumnChart series={oneValue} {...props} />;

/** Three grouped series: guideline colors 1, 3 and 5 */
export const ColumnChartMultipleValues = ({ labels = manyLabels, ...props }: Omit<ColumnChartProps, "series">) => (
  <ColumnChart series={manyValues} labels={labels} {...props} />
);