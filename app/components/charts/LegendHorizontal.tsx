"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { groupColors } from "./chartColors";

/* Self-contained: does not depend on LegendVertical.tsx */

interface LegendItem {
  name: string;
  /** Marker color. Defaults to the group color, in guideline order */
  color?: string;
}

/** Marker shape: line (line, area), square (columns), dot (donut, pie) */
type LegendMarker = "line" | "square" | "dot";

const sampleItems: LegendItem[] = Array.from({ length: 8 }, (_, i) => ({ name: `Label ${i + 1}` }));

// Markers (estimated): 8 × 1.5px line, 6px square (radius 1), 6px dot
const markers: Record<LegendMarker, string> = {
  line: "h-[1.5px] w-2 rounded-full",
  square: "size-1.5 rounded-[1px]",
  dot: "size-1.5 rounded-full",
};

function Swatch({ marker = "line", color }: { marker?: LegendMarker; color: string }) {
  return <span aria-hidden="true" className={cn("shrink-0", markers[marker])} style={{ backgroundColor: color }} />;
}

/** Paging shared by the legends: current page and shown labels */
function useLegendPages(items: LegendItem[], pageSize: number) {
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
function Pager({ current, pages, onChange }: { current: number; pages: number; onChange: (page: number) => void }) {
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

// 16 labels: 2 pages of 8, like "1/2" in Figma
const manyItems: LegendItem[] = Array.from({ length: 16 }, (_, i) => ({ name: `Label ${i + 1}` }));

export interface LegendHorizontalProps {
  /** Defaults to "Label 1"…"Label 8" */
  items?: LegendItem[];
  /** "line" (default): LineChart | "square": ColumnChart | "dot": PieChart and DonutChart */
  marker?: LegendMarker;
  /** Labels per page. Beyond that, "▲ 1/2 ▼" shows at the end of the row */
  pageSize?: number;
  className?: string;
}

export function LegendHorizontal({ items = sampleItems, marker = "line", pageSize = Infinity, className }: LegendHorizontalProps) {
  const { shown, pages, current, setPage } = useLegendPages(items, pageSize);

  return (
    // 20px between labels and before the pager (estimated)
    <div className={cn("inline-flex items-center gap-5", className)}>
      {/* Labels: marker, 6px, Regular/Caption gray text */}
      <ul aria-label="Legend" className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {shown.map((item) => (
          <li key={item.key} className="flex h-5 items-center gap-1.5 whitespace-nowrap text-caption text-neutral-500">
            <Swatch marker={marker} color={item.color} />
            {item.name}
          </li>
        ))}
      </ul>

      {pages > 1 && <Pager current={current} pages={pages} onChange={setPage} />}
    </div>
  );
}

/* ───────── Figma variants: One Page and Multipage, per chart type ───────── */

type Variant = Omit<LegendHorizontalProps, "marker" | "pageSize">;

/** With LineChart or AreaChart: a line */
export const LegendHorizontalLine = (props: Variant) => <LegendHorizontal marker="line" {...props} />;
export const LegendHorizontalLineMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendHorizontal marker="line" pageSize={8} items={items} {...props} />
);

/** With ColumnChart or StackedColumnChart: a square */
export const LegendHorizontalColumn = (props: Variant) => <LegendHorizontal marker="square" {...props} />;
export const LegendHorizontalColumnMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendHorizontal marker="square" pageSize={8} items={items} {...props} />
);

/** With PieChart or DonutChart: a dot */
export const LegendHorizontalDonut = (props: Variant) => <LegendHorizontal marker="dot" {...props} />;
export const LegendHorizontalDonutMultipage = ({ items = manyItems, ...props }: Variant) => (
  <LegendHorizontal marker="dot" pageSize={8} items={items} {...props} />
);
