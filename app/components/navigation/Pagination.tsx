"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { SelectWithoutOutline } from "../data-entry/Select";
export interface PaginationProps {
  /** Total number of items */
  total?: number;
  /** Items per page */
  pageSize?: number;
  /** Current page (controlled) */
  current?: number;
  /** Initial page (uncontrolled) */
  defaultCurrent?: number;
  onChange?: (page: number, pageSize: number) => void;
  disabled?: boolean;
  className?: string;
}

export interface PaginationListProps extends PaginationProps {
  /** Choices in the "10/page" select */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

/* ───────── Page numbers to show ───────── */

// Always the first and last pages, plus two neighbors on each side of the current one.
// Near the edges, fill up to 5 numbers. A one-page gap is filled,
// a larger gap becomes "…".
function pagesToShow(current: number, count: number): (number | "…")[] {
  const keep = new Set<number>([1, count]);
  for (let p = current - 2; p <= current + 2; p++) keep.add(p);
  if (current <= 3) for (let p = 1; p <= 5; p++) keep.add(p);
  if (current >= count - 2) for (let p = count - 4; p <= count; p++) keep.add(p);

  const sorted = [...keep].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  return sorted.flatMap((p, i): (number | "…")[] => {
    const gap = i === 0 ? 1 : p - sorted[i - 1];
    return gap === 1 ? [p] : gap === 2 ? [p - 1, p] : ["…", p];
  });
}

/* ───────── Number field: "Go to" and the Simple version page ───────── */

function PageInput({ value, onCommit, label, disabled, className }: {
  value: string;
  onCommit: (page: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null); // text while typing

  const commit = () => {
    const n = parseInt(draft ?? "", 10);
    if (!Number.isNaN(n)) onCommit(n);
    setDraft(null);
  };

  return (
    <input
      inputMode="numeric"
      aria-label={label}
      disabled={disabled}
      value={draft ?? value}
      onChange={(e) => /^\d*$/.test(e.target.value) && setDraft(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      onBlur={() => draft !== null && commit()}
      className={cn(
        "h-6 rounded border border-neutral-300 bg-white px-1 text-center text-body text-neutral-600 outline-none transition-colors",
        // pointer on hover, text cursor while typing
        "hover:border-brand-hover enabled:hover:cursor-pointer focus:cursor-text focus:border-brand",
        "disabled:cursor-default disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
        className
      )}
    />
  );
}

/* ───────── Base of the 5 components ───────── */

const btn =
  "flex shrink-0 items-center justify-center rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default";

function Core({
  kind,
  list = false,
  total = 100,
  pageSize = 10,
  current,
  defaultCurrent = 1,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  disabled = false,
  className,
}: PaginationListProps & { kind: "simple" | "pages"; list?: boolean }) {
  const [innerPage, setInnerPage] = useState(defaultCurrent);
  const [innerSize, setInnerSize] = useState(pageSize);
  const size = list ? innerSize : pageSize;
  const count = Math.max(1, Math.ceil(total / size));
  const page = Math.min(count, Math.max(1, current ?? innerPage));

  const go = (p: number) => {
    const next = Math.min(count, Math.max(1, p));
    if (next === page) return;
    if (current === undefined) setInnerPage(next);
    onChange?.(next, size);
  };

  const changeSize = (n: number) => {
    setInnerSize(n);
    onPageSizeChange?.(n);
    onChange?.(Math.min(page, Math.max(1, Math.ceil(total / n))), n);
  };

  // Previous or next arrow: 24px white square
  const arrow = (dir: "left" | "right") => {
    const off = disabled || (dir === "left" ? page === 1 : page === count);
    return (
      <button
        type="button"
        aria-label={dir === "left" ? "Previous page" : "Next page"}
        disabled={off}
        onClick={() => go(dir === "left" ? page - 1 : page + 1)}
        className={cn(btn, "size-6 bg-white text-neutral-500 enabled:hover:text-brand-hover enabled:active:text-brand-pressed disabled:text-neutral-400")}
      >
        <Icon name={dir} size={14} />
      </button>
    );
  };

  /* Simple: "‹ [22] / 124 ›" */
  const simple = (
    <nav aria-label="Pagination" className="inline-flex items-center gap-2 text-body text-neutral-500">
      {arrow("left")}
      <PageInput label="Page" value={String(page)} onCommit={go} disabled={disabled} className="w-8" />
      <span>/ {count}</span>
      {arrow("right")}
    </nav>
  );

  /* Basic, Advanced and List: "‹ 1 [2] 3 4 5 › Go to [ ]" */
  const pages = (
    <nav aria-label="Pagination" className="inline-flex items-center gap-3">
      <ul className="flex items-center gap-2">
        <li>{arrow("left")}</li>
        {pagesToShow(page, count).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="flex h-6 min-w-6 items-center justify-center text-neutral-400">
              <Icon name="more" size={16} />
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => go(p)}
                className={cn(
                  btn,
                  "h-6 min-w-6 px-1 text-body",
                  // current page: very light teal background | others: gray text, teal on hover and press
                  p === page
                    ? "bg-primary-100 text-brand disabled:text-primary-300"
                    : "text-neutral-600 enabled:hover:text-brand-hover enabled:active:text-brand-pressed disabled:text-neutral-400"
                )}
              >
                {p}
              </button>
            </li>
          )
        )}
        <li>{arrow("right")}</li>
      </ul>

      <label className="flex items-center gap-2 text-body text-neutral-600">
        Go to
        <PageInput value="" onCommit={go} disabled={disabled} className="w-11" />
      </label>
    </nav>
  );

  if (!list) return <div className={cn("inline-block", className)}>{kind === "simple" ? simple : pages}</div>;

  /* List: "1–10 of 85 items  10/page ⌄" on the left, pages on the right */
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className={cn("flex h-[50px] w-[775px] max-w-full items-center justify-between gap-6 rounded bg-white px-5", className)}>
      <div className="flex items-center gap-3 text-body text-neutral-500">
        <span className="whitespace-nowrap">
          {from}–{to} of {total} items
        </span>
        <SelectWithoutOutline
          size="md"
          disabled={disabled}
          options={pageSizeOptions.map((n) => ({ value: String(n), label: `${n}/page` }))}
          value={String(size)}
          onChange={(v) => changeSize(Number(v))}
        />
      </div>
      {pages}
    </div>
  );
}

/* ───────── The 5 components ───────── */

/** "‹ [22] / 124 ›" */
export const PaginationSimple = ({ total = 1240, defaultCurrent = 22, ...p }: PaginationProps) => (
  <Core kind="simple" total={total} defaultCurrent={defaultCurrent} {...p} />
);

/** 5 pages: "‹ 1 [2] 3 4 5 › Go to" */
export const PaginationBasic = ({ total = 50, defaultCurrent = 2, ...p }: PaginationProps) => (
  <Core kind="pages" total={total} defaultCurrent={defaultCurrent} {...p} />
);

/** 50 pages with "···": "‹ 1 ··· 5 6 [7] 8 9 ··· 50 › Go to" */
export const PaginationAdvanced = ({ total = 500, defaultCurrent = 7, ...p }: PaginationProps) => (
  <Core kind="pages" total={total} defaultCurrent={defaultCurrent} {...p} />
);

/** List, open on page 2: "1–10 of 500 items  10/page ⌄ ... 1 [2] 3 4 5 ··· 50" */
export const PaginationListBasic = ({ total = 500, defaultCurrent = 2, ...p }: PaginationListProps) => (
  <Core kind="pages" list total={total} defaultCurrent={defaultCurrent} {...p} />
);

/** List, open on page 7: "... 1 ··· 5 6 [7] 8 9 ··· 50" */
export const PaginationListAdvanced = ({ total = 500, defaultCurrent = 7, ...p }: PaginationListProps) => (
  <Core kind="pages" list total={total} defaultCurrent={defaultCurrent} {...p} />
);  