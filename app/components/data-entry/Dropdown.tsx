"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { focusSelected, moveFocus, useDismiss } from "../../lib/listbox";
import { Icon } from "../../icons/Icon";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownBaseProps {
  /** Defaults to "item 1" … "item 5" */
  options?: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Id of the field (for <label htmlFor>) */
  id?: string;
  /** Form field name: the value is sent through hidden inputs */
  name?: string;
  "aria-label"?: string;
  className?: string;
}

export interface DropdownMenuProps extends DropdownBaseProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string, option: DropdownOption) => void;
}

export interface DropdownMultipleProps extends DropdownBaseProps {
  /** Controlled values */
  value?: string[];
  /** Uncontrolled initial values */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** "text": comma-separated values | "tags": removable chips */
  display?: "text" | "tags";
}

const defaultOptions: DropdownOption[] = [1, 2, 3, 4, 5].map((n) => ({ value: `item-${n}`, label: `item ${n}` }));

// Field (always visible): 40px high, side padding 16, Subtitle text
const field =
  "flex w-full items-center justify-between gap-2 rounded border px-4 text-left text-subtitle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const panel = "absolute left-0 top-full z-10 mt-1 max-h-[300px] w-full overflow-y-auto rounded bg-white shadow-elevation-3";

// An option: teal when selected, light gray on hover otherwise
const optionClass = (active: boolean) =>
  cn(
    "flex w-full items-center rounded px-2.5 text-left text-subtitle transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default disabled:text-neutral-400",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
    active ? "bg-primary-100 text-brand" : "text-neutral-600 enabled:hover:bg-neutral-100"
  );

const openKeys = (e: KeyboardEvent, open: () => void) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    open();
  }
};

/* ═══════════════════════════════════════════════════════════
   DROPDOWN MENU: single choice
   ═══════════════════════════════════════════════════════════ */

export function DropdownMenu({
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
}: DropdownMenuProps) {
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useDismiss(open, () => setOpen(false), rootRef, triggerRef);

  useEffect(() => {
    if (open) focusSelected(listRef.current);
  }, [open]);

  const pick = (option: DropdownOption) => {
    if (value === undefined) setInner(option.value);
    onChange?.(option.value, option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const label = options.find((o) => o.value === selected)?.label;

  return (
    <div ref={rootRef} className={cn("relative inline-block w-60", className)}>
      {name && <input type="hidden" name={name} value={selected ?? ""} />}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => openKeys(e, () => setOpen(true))}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          field,
          "h-10 enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default",
          disabled ? "border-neutral-200 bg-neutral-100" : open ? "border-brand bg-white" : "border-neutral-300 bg-white hover:border-brand-hover"
        )}
      >
        <span className={cn("truncate", label ? "text-neutral-600" : "text-neutral-400")}>{label || placeholder}</span>
        <Icon name={open ? "up" : "down"} className={disabled ? "text-neutral-400" : "text-neutral-500"} />
      </button>

      {open && (
        <ul ref={listRef} role="listbox" onKeyDown={moveFocus} className={cn(panel, "p-1.5")}>
          {options.map((option) => (
            <li key={option.value} role="none" className="border-b border-neutral-100 py-px last:border-b-0">
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                disabled={option.disabled}
                onClick={() => pick(option)}
                className={cn(optionClass(option.value === selected), "h-11")}
              >
                <span className="truncate">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DROPDOWN MULTIPLE: several choices (text or tags)
   ═══════════════════════════════════════════════════════════ */

export function DropdownMultiple({
  options = defaultOptions,
  value,
  defaultValue,
  onChange,
  display = "text",
  placeholder = "Text input",
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  className,
}: DropdownMultipleProps) {
  const [inner, setInner] = useState(defaultValue ?? []);
  const selected = value ?? inner;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useDismiss(open, () => setOpen(false), rootRef, triggerRef);

  useEffect(() => {
    if (open) focusSelected(listRef.current);
  }, [open]);

  const update = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  // The panel stays open: options are toggled on and off
  const toggle = (v: string) => update(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const selectedOptions = options.filter((o) => selected.includes(o.value));
  const hasValue = selectedOptions.length > 0;

  const state = disabled
    ? "cursor-default border-neutral-200 bg-neutral-100"
    : cn("cursor-pointer bg-white", open ? "border-brand" : "border-neutral-300 hover:border-brand-hover");

  return (
    <div ref={rootRef} className={cn("relative inline-block w-60", className)}>
      {name && selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}

      {/* Field: a div  because it contains other buttons */}
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          } else openKeys(e, () => setOpen(true));
        }}
        className={cn(field, "min-h-10 py-1.5", state)}
      >
        <div className="min-w-0 flex-1">
          {!hasValue && <span className="text-neutral-400">{placeholder}</span>}

          {hasValue && display === "text" && (
            <span className="block truncate text-neutral-600">{selectedOptions.map((o) => o.label).join(", ")}</span>
          )}

          {hasValue && display === "tags" && (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions.map((o) => (
                <span key={o.value} className="inline-flex h-6 items-center gap-1 rounded bg-neutral-100 px-2 text-body text-neutral-600">
                  {o.label}
                  <button
                    type="button"
                    aria-label={`Remove ${o.label}`}
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(o.value);
                    }}
                    className="flex size-4 items-center justify-center text-neutral-500 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Clear all + arrow */}
        <div className="flex shrink-0 items-center gap-2">
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Clear all"
              onClick={(e) => {
                e.stopPropagation();
                update([]);
              }}
              className="flex items-center justify-center text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-500 active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Icon name="error" variant="filled" />
            </button>
          )}
          <Icon name={open ? "up" : "down"} className={disabled ? "text-neutral-400" : "text-neutral-500"} />
        </div>
      </div>

      {open && (
        <ul ref={listRef} role="listbox" aria-multiselectable="true" onKeyDown={moveFocus} className={cn(panel, "flex flex-col gap-1 p-1.5")}>
          {options.map((option) => {
            const active = selected.includes(option.value);
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  onClick={() => toggle(option.value)}
                  className={cn(optionClass(active), "h-9 justify-between gap-3")}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Icon name="check" size={20} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
