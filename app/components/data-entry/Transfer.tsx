"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { Button } from "../general/Button";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface TransferOption {
  value: string;
  label: string;
  /** Grayed option: cannot be checked, unchecked or removed */
  disabled?: boolean;
}

export interface TransferGroup {
  /** Group title ("Content 1") */
  title: string;
  options: TransferOption[];
}

export interface TransferProps {
  /** Small: 400px, one column of boxes | Medium: 600px, groups on two columns, "Setting" link */
  size?: "small" | "medium";
  /** Column widths: 5:5 (equal) or 6:4 (wider "All") */
  proportion?: "5:5" | "6:4";
  title?: ReactNode;
  /** Flat list (Small). Defaults to 5 "Label" options */
  options?: TransferOption[];
  /** Grouped list (Medium). Takes priority over `options` */
  groups?: TransferGroup[];
  /** Selected values, in right-column order (controlled) */
  value?: string[];
  /** Uncontrolled initial values */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Max selections: beyond it, other boxes are grayed and a red message shows */
  max?: number;
  /** Initial search text */
  defaultSearch?: string;
  searchPlaceholder?: string;
  /** "Apply" button: receives the selection */
  onApply?: (value: string[]) => void;
  onCancel?: () => void;
  /** Top-right cross */
  onClose?: () => void;
  /** Bottom-left "Setting" link. Shown in Medium or when `onSetting` is set */
  onSetting?: () => void;
  className?: string;
}


/* ═══════════════════════════════════════════════════════════
   SIZES (Figma "Space")
   Small: 400px | padding 16 | 8 between title, search, columns | 16 around the buttons
   Medium: 600px | padding 24 | 16 between title and search | 200px search
   Columns 8px apart. Radius 4.
   ═══════════════════════════════════════════════════════════ */

const sizes = {
  small: {
    box: "w-[400px] p-4",
    title: "text-subtitle",
    gap: "mt-2",
    search: "w-full",
    columns: "mt-2 h-[236px]",
    head: "h-7 px-2 text-caption",
    text: "text-caption",
    list: "px-2 py-1.5",
    row: "h-[21px]",
    chip: "h-6 text-caption",
    footer: "mt-4",
  },
  medium: {
    box: "w-[600px] p-6",
    title: "text-title",
    gap: "mt-4",
    search: "w-[200px]",
    columns: "mt-4 h-[300px]",
    head: "h-9 px-3 text-body",
    text: "text-body",
    list: "px-3 py-2",
    row: "h-6",
    chip: "h-7 text-body",
    footer: "mt-4",
  },
};

const defaultOptions: TransferOption[] = Array.from({ length: 5 }, (_, i) => ({ value: `label-${i + 1}`, label: "Label" }));

const defaultGroups: TransferGroup[] = Array.from({ length: 4 }, (_, g) => ({
  title: `Content ${g + 1}`,
  options: Array.from({ length: 4 }, (_, i) => ({ value: `content-${g + 1}-${i + 1}`, label: "Label" })),
}));

/* ───────── Empty state illustration: a gray box outline ───────── */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-caption text-neutral-400">
      <svg aria-hidden="true" viewBox="0 0 48 48" className="size-10" fill="none" stroke="currentColor" strokeWidth={1}>
        <path d="M24 10 38 17v16l-14 7-14-7V17Z" strokeDasharray="2 2" />
        <path d="m10 17 14 7 14-7M24 24v16" />
        <circle cx="21" cy="5" r="1" fill="var(--color-brand)" stroke="none" />
        <circle cx="27" cy="3" r="1.5" fill="var(--color-brand)" stroke="none" />
        <circle cx="31" cy="8" r="1" fill="var(--color-brand)" stroke="none" />
      </svg>
      {text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRANSFER
   ═══════════════════════════════════════════════════════════ */

export function Transfer({
  size = "small",
  proportion = "5:5",
  title = "Title",
  options,
  groups,
  value,
  defaultValue = [],
  onChange,
  max,
  defaultSearch = "",
  searchPlaceholder = "Search...",
  onApply,
  onCancel,
  onClose,
  onSetting,
  className,
}: TransferProps) {
  const z = sizes[size];
  const medium = size === "medium";

  // Groups: the given ones, else a flat list (no title), else the Figma samples
  const allGroups: TransferGroup[] = groups ?? (options ? [{ title: "", options }] : medium ? defaultGroups : [{ title: "", options: defaultOptions }]);
  const byValue = new Map(allGroups.flatMap((g) => g.options).map((o) => [o.value, o]));

  const [inner, setInner] = useState<string[]>(defaultValue);
  const selected = value ?? inner;
  const [search, setSearch] = useState(defaultSearch);
  const [dragged, setDragged] = useState<number | null>(null);

  const full = max !== undefined && selected.length >= max;

  const update = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const toggle = (o: TransferOption, on: boolean) => update(on ? [...selected, o.value] : selected.filter((v) => v !== o.value));

  // "Clear" removes everything except grayed options
  const clear = () => update(selected.filter((v) => byValue.get(v)?.disabled));

  // Drag and drop to reorder the right column
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...selected];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  // Case-insensitive search on the label. Empty groups are hidden
  const query = search.trim().toLowerCase();
  const visible = allGroups
    .map((g) => ({ ...g, options: g.options.filter((o) => !query || o.label.toLowerCase().includes(query)) }))
    .filter((g) => g.options.length > 0);

  const chosen = selected.map((v) => byValue.get(v)).filter((o): o is TransferOption => !!o);

  return (
    <section
      aria-label={typeof title === "string" ? title : "Transfer"}
      className={cn("flex flex-col rounded bg-white shadow-elevation-3", z.box, className)}
    >
      <header className="flex items-center justify-between">
        <h2 className={`font-medium text-neutral-700 ${z.title}`}>{title}</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Icon name="close" size={14} />
        </button>
      </header>

      {/* Search: teal border while typing, clear button, search icon */}
      <div className={z.gap}>
        <Input
          size="sm"
          placeholder={searchPlaceholder}
          value={search}
          onChange={setSearch}
          rightIcon={<Icon name="search" />}
          className={z.search}
        />
      </div>

      {/* Two columns: All | Selected */}
      <div className={cn("grid gap-2", proportion === "6:4" ? "grid-cols-[3fr_2fr]" : "grid-cols-2", z.columns)}>
        {/* ─── All: checkboxes ─── */}
        <div className="flex min-h-0 flex-col rounded border border-neutral-200">
          <div className={`flex shrink-0 items-center border-b border-neutral-200 text-neutral-700 ${z.head}`}>All</div>

          {visible.length === 0 ? (
            <EmptyState text="No data" />
          ) : (
            <div className={cn("min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]", z.list)}>
              {visible.map((g) => (
                <fieldset key={g.title || "options"} className="mb-2 last:mb-0">
                  {g.title && <legend className={`mb-1 text-neutral-700 ${z.text}`}>{g.title}</legend>}
                  <div className={cn("grid", medium ? "grid-cols-2 gap-x-4" : "grid-cols-1")}>
                    {g.options.map((o) => {
                      const on = selected.includes(o.value);
                      return (
                        <div key={o.value} className={cn("flex min-w-0 items-center", z.row)}>
                          <Checkbox checked={on} disabled={o.disabled || (!on && full)} onChange={(c) => toggle(o, c)}>
                            <span title={o.label} className={cn("block truncate", z.text, medium ? "max-w-[100px]" : "max-w-[140px]")}>
                              {o.label}
                            </span>
                          </Checkbox>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </div>

        {/* ─── Selected: gray chips, removable with the cross ─── */}
        <div className="flex min-h-0 flex-col rounded border border-neutral-200">
          <div className={`flex shrink-0 items-center justify-between border-b border-neutral-200 text-neutral-700 ${z.head}`}>
            Selected
            <button
              type="button"
              onClick={clear}
              disabled={chosen.every((o) => o.disabled)}
              className="text-caption text-neutral-400 transition-colors enabled:hover:cursor-pointer enabled:hover:text-brand-hover enabled:active:cursor-default enabled:active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-brand"
            >
              Clear
            </button>
          </div>

          {chosen.length === 0 ? (
            <EmptyState text="Not selected" />
          ) : (
            <div className={cn("min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]", z.list)}>
              <ul className="flex flex-col gap-1.5">
                {chosen.map((o, i) => (
                  <li
                    key={o.value}
                    draggable={!medium}
                    onDragStart={() => setDragged(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dragged !== null && move(dragged, i)}
                    onDragEnd={() => setDragged(null)}
                    className={[
                      "flex items-center gap-1 rounded bg-neutral-100 px-2",
                      z.chip,
                      o.disabled ? "text-neutral-400" : "text-neutral-600",
                      dragged === i ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    {/* Handle (Small): drag to reorder */}
                    {!medium && (
                      <span aria-hidden="true" className="flex shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing">
                        <Icon name="drag" size={12} />
                      </span>
                    )}
                    <span title={o.label} className="min-w-0 flex-1 truncate">
                      {o.label}
                    </span>
                    {!o.disabled && (
                      <button
                        type="button"
                        aria-label={`Remove ${o.label}`}
                        onClick={() => toggle(o, false)}
                        className="flex shrink-0 text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <Icon name="close" size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Limit reached */}
              {full && (
                <p role="alert" className="mt-2 text-center text-caption text-danger-600">
                  Reached the upper limit
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Setting on the left (Medium), Cancel and Apply on the right */}
      <footer className={cn("flex items-center gap-2", z.footer)}>
        {(medium || onSetting) && (
          <button
            type="button"
            onClick={onSetting}
            className="flex items-center gap-1 text-caption text-neutral-600 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="setting" size={14} />
            Setting
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" className="w-[98px]" onClick={() => onApply?.(selected)}>
            Apply
          </Button>
        </div>
      </footer>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FIGMA VARIANTS
   ═══════════════════════════════════════════════════════════ */

type Variant = Omit<TransferProps, "size" | "proportion">;

/** Small, equal columns (5:5) */
export const TransferSmall = (props: Variant) => <Transfer size="small" proportion="5:5" {...props} />;
/** Small, wider "All" (6:4) */
export const TransferSmall64 = (props: Variant) => <Transfer size="small" proportion="6:4" {...props} />;
/** Medium: "Content 1…" groups on two columns, "Setting" link, equal columns (5:5) */
export const TransferMedium = (props: Variant) => <Transfer size="medium" proportion="5:5" {...props} />;
/** Medium, wider "All" (6:4) */
export const TransferMedium64 = (props: Variant) => <Transfer size="medium" proportion="6:4" {...props} />;

/* ───────── Figma states: Selected, Disabled, With / No Search Result ───────── */

const items = (labels: string[], disabled: string[] = []): TransferOption[] =>
  labels.map((label, i) => ({ value: `${label}-${i}`, label, disabled: disabled.includes(label) }));

const stateOptions = items(["Item 1", "Label", "Item 3", "Item 4", "Label 6"]);
const disabledOptions = items(["Item 1", "Label", "Item 3", "Item 4", "Label 6"], ["Item 1", "Item 3"]);

/** Selected: items 1, 3 and 4 checked */
export const TransferSmallSelected = (props: Variant) => (
  <Transfer options={stateOptions} defaultValue={["Item 1-0", "Item 3-2", "Item 4-3"]} {...props} />
);

/** Disabled: items 1 and 3 grayed (checked, not removable) */
export const TransferSmallDisabled = (props: Variant) => (
  <Transfer options={disabledOptions} defaultValue={["Item 1-0", "Item 3-2", "Item 4-3"]} {...props} />
);

/** With Search Result: "6" finds "Label 6" */
export const TransferSmallSearch = (props: Variant) => (
  <Transfer options={stateOptions} defaultValue={["Item 1-0", "Item 3-2", "Item 4-3"]} defaultSearch="6" {...props} />
);

/** No Search Result: "666" finds nothing */
export const TransferSmallNoResult = (props: Variant) => (
  <Transfer options={stateOptions} defaultValue={["Item 1-0", "Item 3-2", "Item 4-3"]} defaultSearch="666" {...props} />
);

/** Medium with a 6-item limit reached: other boxes grayed, red message */
export const TransferMediumLimit = (props: Variant) => (
  <Transfer
    size="medium"
    max={6}
    defaultValue={["content-1-1", "content-1-3", "content-2-1", "content-2-2", "content-2-4", "content-3-3"]}
    {...props}
  />
);
