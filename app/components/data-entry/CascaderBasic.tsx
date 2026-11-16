"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useDismiss } from "../../lib/listbox";
import { Icon } from "../../icons/Icon";

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: CascaderOption[];
}

export interface CascaderProps {
  /** Defaults to the sample list below */
  options?: CascaderOption[];
  /** Controlled path of values */
  value?: string[];
  /** Uncontrolled initial path */
  defaultValue?: string[];
  onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Form field name: the path is sent as "a/b/c" through a hidden input */
  name?: string;
  "aria-label"?: string;
  className?: string;
}

// Default options: 3 items, then 5, then 5
const items = (children?: CascaderOption[]): CascaderOption[] =>
  [1, 2, 3, 4, 5].map((n) => ({ value: `item-${n}`, label: `item ${n}`, children }));

const defaultOptions = items(items(items())).slice(0, 3);

// Minimum rows per column (empty rows keep their separators)
const MIN_ROWS = 5;

// Options matching a path of values
function getPath(options: CascaderOption[], values: string[]) {
  const path: CascaderOption[] = [];
  let level = options;
  for (const v of values) {
    const found = level.find((o) => o.value === v);
    if (!found) break;
    path.push(found);
    level = found.children ?? [];
  }
  return path;
}

export function CascaderBasic({
  options = defaultOptions,
  value,
  defaultValue,
  onChange,
  placeholder = "Text input",
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  className,
}: CascaderProps) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? inner;

  const [open, setOpen] = useState(false);
  const [browsing, setBrowsing] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss(open, () => setOpen(false), rootRef, triggerRef);

  // Columns: the root + the children of each browsed option
  const columns = [options, ...getPath(options, browsing).flatMap((o) => (o.children?.length ? [o.children] : []))];

  const pick = (level: number, option: CascaderOption) => {
    const next = [...browsing.slice(0, level), option.value];
    setBrowsing(next);

    // Leaf option (no children): select and close
    if (!option.children?.length) {
      if (value === undefined) setInner(next);
      onChange?.(next, getPath(options, next));
      setOpen(false);
    }
  };

  const label = getPath(options, selected).map((o) => o.label).join(" / ");

  return (
    <div ref={rootRef} className={cn("relative inline-block w-60", className)}>
      {name && <input type="hidden" name={name} value={selected.join("/")} />}

      <button
        ref={triggerRef}
        id={id}
        aria-label={ariaLabel}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open) setBrowsing(selected); // reopen on the current selection
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded border px-4 text-left text-subtitle transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default",
          disabled ? "border-neutral-200 bg-neutral-100" : open ? "border-brand bg-white" : "border-neutral-300 bg-white hover:border-brand-hover"
        )}
      >
        <span className={cn("truncate", label ? "text-neutral-600" : "text-neutral-400")}>{label || placeholder}</span>
        <Icon name={open ? "up" : "down"} className={disabled ? "text-neutral-400" : "text-neutral-500"} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 flex rounded bg-white shadow-elevation-3">
          {columns.map((column, level) => (
            <ul
              key={level}
              className="w-[200px] border-r border-neutral-100 p-1.5 first:rounded-l last:rounded-r last:border-r-0"
            >
              {column.map((option) => {
                const active = browsing[level] === option.value;
                return (
                  <li key={option.value} className="h-[45px] border-b border-neutral-100">
                    <button
                      type="button"
                      disabled={option.disabled}
                      onClick={() => pick(level, option)}
                      className={cn(
                        "flex h-11 w-full items-center justify-between gap-3 rounded px-2.5 text-left text-subtitle transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default disabled:text-neutral-400",
                        active ? "bg-primary-100 text-brand" : "text-neutral-600 enabled:hover:bg-neutral-100"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {!!option.children?.length && (
                        <Icon name="right" className={active ? "text-neutral-500" : "text-neutral-400"} />
                      )}
                    </button>
                  </li>
                );
              })}

              {/* Empty rows keep every column the same height */}
              {Array.from({ length: Math.max(0, MIN_ROWS - column.length) }, (_, i) => (
                <li key={`empty-${i}`} aria-hidden="true" className="h-[45px] border-b border-neutral-100" />
              ))}
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}