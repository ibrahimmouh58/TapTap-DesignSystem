import { formatNumber, PieChart, sampleSlices, type PieChartProps } from "./PieChart";

export interface DonutChartProps extends Omit<PieChartProps, "innerRadius" | "center"> {
  /** Hole size, from 0 to 1 (default 0.6) */
  innerRadius?: number;
  /** Number in the center. Defaults to the sum of the values */
  total?: number;
  /** Text under the number (default "Total") */
  totalLabel?: string;
}

export function DonutChart({
  data = sampleSlices,
  format = formatNumber,
  innerRadius = 0.6,
  total,
  totalLabel = "Total",
  ...props
}: DonutChartProps) {
  const sum = total ?? data.reduce((s, d) => s + Math.max(d.value, 0), 0);

  return (
    <PieChart
      data={data}
      format={format}
      innerRadius={innerRadius}
      center={
        <>
          {/* Total in bold, "Total" in gray below */}
          <text y={6} className="fill-neutral-700 text-h2 font-bold">
            {format(sum)}
          </text>
          <text y={26} className="fill-neutral-400 text-caption">
            {totalLabel}
          </text>
        </>
      }
      {...props}
    />
  );
}

/** Donut: 4 slices and the total in the center ("20,000 Total") */
export const DonutChartBasic = (props: Omit<DonutChartProps, "data">) => <DonutChart {...props} />;
