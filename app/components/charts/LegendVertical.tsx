"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { groupColors } from "./chartColors";

export interface LegendItem {
  name: string;
  /** Marker color. Defaults to the group color, in guideline order */
  color?: string;
}

/** Marker shape: line (line, area), square (columns), dot (donut, pie) */
export type LegendMarker = "line" | "square" | "dot";

export interface LegendVerticalProps {
  /** Defaults to "Label 1"…"Label 8" */
  items?: LegendItem[];
  /** "line" (default): LineChart | "square": ColumnChart | "dot": PieChart and DonutChart */
  marker?: LegendMarker;
  /** Labels per page. Beyond that, "▲ 1/2 ▼" shows under the list */
  pageSize?: number;
  className?: string;
}

export const sampleItems: LegendItem[] = Array.from({ length: 8 }, (_, i) => ({ name: `Label ${i + 1}` }));

// Markers (estimated): 8 × 1.5px line, 6px square (radius 1), 6px dot
const markers: Record<LegendMarker, string> = {
  line: "h-[1.5px] w-2 rounded-full",
  square: "size-1.5 rounded-[1px]",
  dot: "size-1.5 rounded-full",
};

/** The marker alone, reusable in other legends */
export function LegendSwatch({ marker = "line", color }: { marker?: LegendMarker; color: string }) {
  return <span aria-hidden="true" className={cn("shrink-0", markers[marker])} style={{ backgroundColor: color }} />;
}

/** Paging shared by the legends: current page and shown labels */
export function useLegendPages(items: LegendItem[], pageSize: number) {
  // 10 guideline colors: start again after that
  const colors = groupColors(Math.min(items.length, 10));
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const [page, setPage] = useState(0);
  const current = Math.min(page, pages - 1); // in case the list got shorter
  const offset = pages > 1 ? current * pageSize : 0;

  const shown = (pages > 1 ? items.slice(offset, offset + pageSize) : items).map((item, i) => ({
    ...item,
    key: `${item.name}-${offset + i}`,
    color: item.color ?? colors[(offset + i) % colors.length],
  }));

  return { shown, pages, current, setPage };
}

/** "▲ 1/2 ▼": arrows turn pale at the ends of the list */
export function LegendPager({ current, pages, onChange }: { current: number; pages: number; onChange: (page: number) => void }) {
  const arrow = (dir: -1 | 1) => {
    const off = dir === -1 ? current === 0 : current === pages - 1;
    return (
      <button
        type="button"
        aria-label={dir === -1 ? "Previous legend page" : "Next legend page"}
        disabled={off}
        onClick={() => onChange(current + dir)}
        className="flex text-neutral-600 transition-colors enabled:hover:cursor-pointer enabled:hover:text-brand-hover enabled:active:cursor-default enabled:active:text-brand-pressed disabled:text-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name={dir === -1 ? "tri-up" : "tri-down"} variant="filled" size={12} />
      </button>
    );
  };

  return (
    <nav aria-label="Legend pages" className="flex shrink-0 items-center gap-1 text-caption text-neutral-600">
      {arrow(-1)}
      <span aria-live="polite">
        {current + 1}/{pages}
      </span>
      {arrow(1)}
    </nav>
  );
}

export function LegendVertical({ items = sampleItems, marker = "line", pageSize = Infinity, className }: LegendVerticalProps) {
  const { shown, pages, current, setPage } = useLegendPages(items, pageSize);

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      {/* Labels: marker, 6px, Regular/Caption gray text */}
      <ul aria-label="Legend" className="flex flex-col">
        {shown.map((item) => (
          <li key={item.key} className="flex h-5 items-center gap-1.5 text-caption text-neutral-500">
            <LegendSwatch marker={marker} color={item.color} />
            <span className="truncate">{item.name}</span>
          </li>
        ))}
      </ul>

      {pages > 1 && <LegendPager current={current} pages={pages} onChange={setPage} />}
    </div>
  );
}

/* ───────── Figma variants: One Page and Multipage, per chart type ───────── */

type Variant = Omit<LegendVerticalProps, "marker" | "pageSize">;

// 16 labels: 2 pages of 8, like "1/2" in Figma
export const manyItems: LegendItem[] = Array.from({ length: 16 }, (_, i) => ({ name: `Label ${i + 1}` }));

/** With LineChart or AreaChart: a line */
export const LegendVerticalLine = (props: Variant) => <LegendVertical marker="line" {...props} />;
export const LegendVerticalLineMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendVertical marker="line" pageSize={8} items={items} {...props} />
);

/** With ColumnChart or StackedColumnChart: a square */
export const LegendVerticalColumn = (props: Variant) => <LegendVertical marker="square" {...props} />;
export const LegendVerticalColumnMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendVertical marker="square" pageSize={8} items={items} {...props} />
);

/** With PieChart or DonutChart: a dot */
export const LegendVerticalDonut = (props: Variant) => <LegendVertical marker="dot" {...props} />;
export const LegendVerticalDonutMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendVertical marker="dot" pageSize={8} items={items} {...props} />
);
