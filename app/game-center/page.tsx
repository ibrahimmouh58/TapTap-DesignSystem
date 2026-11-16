import { Icon, type IconName } from "../icons/Icon";
import { Select } from "../components/data-entry/Select";
import { RangePicker } from "../components/data-entry/RangePicker";
import { StackedColumnChartBasic } from "../components/charts/StackedColumnChart";
import { LineChartOneValue, LineChartMultipleValues } from "../components/charts/LineChart";
import { DonutChartBasic } from "../components/charts/DonutChart";
import { LegendHorizontal } from "../components/charts/LegendHorizontal";
import { LegendVertical } from "../components/charts/LegendVertical";
import { Card } from "./Card";


type Stat = {
  title: string;
  icon: IconName;
  value: string;
  change: string;
  up: boolean;
  yesterday: [string, string];
  lastWeek: [string, string];
};

const stats: Stat[] = [
  { title: "Total Cost", icon: "file", value: "2,999", change: "26.29%", up: true, yesterday: ["1,011", "(1.99%)"], lastWeek: ["8,289", "(12.65%)"] },
  { title: "Activity", icon: "star", value: "8,399", change: "16.29%", up: true, yesterday: ["2,011", "(12.99%)"], lastWeek: ["16,289", "(12.65%)"] },
  { title: "Total hours", icon: "time", value: "267", change: "20.29%", up: false, yesterday: ["11", "(11.69%)"], lastWeek: ["85", "(15.65%)"] },
  { title: "Rate", icon: "pie-chart", value: "89%", change: "16.29%", up: true, yesterday: ["1,011", "(9.99%)"], lastWeek: ["6,289", "(12.65%)"] },
];

function StatCard({ s }: { s: Stat }) {
  const row = (label: string, [value, pct]: [string, string]) => (
    <div className="flex justify-between text-caption">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-700">
        {value} <span className="text-neutral-400">{pct}</span>
      </span>
    </div>
  );

  return (
    <Card className="flex h-[167px] w-[279px] shrink-0 flex-col">
      <p className="flex items-center gap-1 text-caption text-neutral-500">
        <Icon name={s.icon} size={12} /> {s.title}
      </p>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-number text-h1 font-medium text-neutral-700">{s.value}</span>
        <span className="mb-1 flex items-center gap-0.5 text-caption text-neutral-500">
          {s.change}
          <Icon name={s.up ? "tri-up" : "tri-down"} size={12} label={s.up ? "Up" : "Down"} className={s.up ? "text-success-600" : "text-danger-600"} />
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200 pt-3">
        {row("Yesterday", s.yesterday)}
        {row("Last Week", s.lastWeek)}
      </div>
    </Card>
  );
}

/* ───────── Page (inside layout.tsx: header, menu and padding come from there) ───────── */

const labels = (names: string[]) => names.map((name) => ({ name }));

export default function DataAnalysisPage() {
  return (
    <>
      {/* Key figures: 279 × 167 cards, 24px apart */}
      <div className="flex flex-wrap gap-6">
        {stats.map((s) => (
          <StatCard key={s.title} s={s} />
        ))}
      </div>

      {/* Filters + stacked column chart (1188 × 534) */}
      <Card className="flex h-[534px] flex-col">
        <div className="mb-4 flex shrink-0 items-center gap-6 border-b border-neutral-200 pb-4 text-body text-neutral-600">
          <label className="flex items-center gap-2">
            Filter <Select size="md" placeholder="Select" className="w-40" />
          </label>
          <label className="flex items-center gap-2">
            Filter <Select size="md" placeholder="Select" className="w-40" />
          </label>
          <RangePicker className="ml-auto" />
        </div>
        {/* The chart fills the remaining height and keeps its proportions */}
        <div className="flex min-h-0 flex-1 justify-center">
          <StackedColumnChartBasic className="h-full w-auto max-w-none" />
        </div>
        <LegendHorizontal marker="square" items={labels(["Label 1", "Label 2", "Label 3"])} className="mt-2 w-full shrink-0 justify-center" />
      </Card>

      {/* Two line charts (586 × 417 each, 16px apart) */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Line Chart Title" className="flex h-[417px] flex-col">
          <div className="flex min-h-0 flex-1 justify-center">
            <LineChartOneValue className="h-full w-auto max-w-full" />
          </div>
          <LegendHorizontal items={labels(["Label 1"])} className="mt-2 w-full shrink-0 justify-center" />
        </Card>
        <Card title="Line Chart Title" className="flex h-[417px] flex-col">
          <div className="flex min-h-0 flex-1 justify-center">
            <LineChartMultipleValues className="h-full w-auto max-w-full" />
          </div>
          <LegendHorizontal items={labels(["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6"])} className="mt-2 w-full shrink-0 justify-center" />
        </Card>
      </div>

      {/* Donut chart with its legend on the right (1188 × 400) */}
      <Card title="Donut Chart Title" className="flex h-[400px] flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center gap-8">
          <DonutChartBasic className="h-full w-auto max-w-full" />
          <LegendVertical marker="dot" items={labels(["Label 1", "Label 2", "Label 3", "Label 4"])} className="shrink-0" />
        </div>
      </Card>
    </>
  );
}