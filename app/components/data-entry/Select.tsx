"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/utils";
import { focusSelected, moveFocus, useDismiss } from "../../lib/listbox";
import { Icon } from "../../icons/Icon";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Defaults to "item 1" … "item 5" */
  options?: SelectOption[];
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string, option: SelectOption) => void;
  placeholder?: string;
  /** "auto" (default) follows the screen size | "lg" 40px | "md" 36px | "sm" 24px */
  size?: "auto" | "lg" | "md" | "sm";
  /** `true` shows "Error Text", a string shows that string */
  error?: boolean | string;
  disabled?: boolean;
  /** Id of the trigger button (for <label htmlFor>) */
  id?: string;
  /** Form field name: the value is sent through a hidden input */
  name?: string;
  "aria-label"?: string;
  className?: string;
}

const defaultOptions: SelectOption[] = [1, 2, 3, 4, 5].map((n) => ({ value: `item-${n}`, label: `item ${n}` }));

// Figma sizes: height | side padding | gap | text | icon. Radius 4.
// lg 40 | 12 | 8 | Subtitle | 16 — md 36 | 12 | 8 | Body | 14 — sm 24 | 8 | 4 | Caption | 12
const sizes = {
  auto: {
    box: "h-6 gap-1 px-2 text-caption sm:h-9 sm:gap-2 sm:px-3 sm:text-body lg:h-10 lg:text-subtitle",
    text: "text-caption sm:text-body lg:text-subtitle",
    icon: "size-3 sm:size-3.5 lg:size-4",
    option: "h-6 px-2 text-caption sm:h-9 sm:px-3 sm:text-body lg:h-10 lg:text-subtitle",
  },
  lg: { box: "h-10 gap-2 px-3 text-subtitle", text: "text-subtitle", icon: "size-4", option: "h-10 px-3 text-subtitle" },
  md: { box: "h-9 gap-2 px-3 text-body", text: "text-body", icon: "size-3.5", option: "h-9 px-3 text-body" },
  sm: { box: "h-6 gap-1 px-2 text-caption", text: "text-caption", icon: "size-3", option: "h-6 px-2 text-caption" },
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/* ───────── Shared logic: value, open state, dismiss, keyboard ───────── */

function useSelect({ options = defaultOptions, value, defaultValue, onChange }: Pick<SelectProps, "options" | "value" | "defaultValue" | "onChange">) {
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useDismiss(open, () => setOpen(false), rootRef, triggerRef);

  // Opening moves the focus into the list
  useEffect(() => {
    if (open) focusSelected(listRef.current);
  }, [open]);

  const pick = (option: SelectOption) => {
    if (value === undefined) setInner(option.value);
    onChange?.(option.value, option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Arrow down / up on the closed trigger opens the list
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const label = options.find((o) => o.value === selected)?.label;
  return { options, selected, label, open, setOpen, rootRef, triggerRef, listRef, pick, onTriggerKey };
}

/* ───────── Shared list ───────── */

function List({
  options,
  selected,
  pick,
  optionClass,
  listRef,
}: {
  options: SelectOption[];
  selected?: string;
  pick: (o: SelectOption) => void;
  optionClass: string;
  listRef: RefObject<HTMLUListElement | null>;
}) {
  return (
    <ul
      ref={listRef}
      role="listbox"
      onKeyDown={moveFocus}
      className="absolute left-0 top-full z-10 mt-1 max-h-[300px] w-max min-w-full overflow-y-auto rounded bg-white p-1 shadow-elevation-3"
    >
      {options.map((o) => (
        <li key={o.value} role="none">
          <button
            type="button"
            role="option"
            aria-selected={o.value === selected}
            disabled={o.disabled}
            onClick={() => pick(o)}
            className={cn(
              "flex w-full items-center rounded text-left transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default disabled:text-neutral-400",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
              optionClass,
              o.value === selected ? "bg-primary-100 text-brand" : "text-neutral-600 enabled:hover:bg-neutral-100"
            )}
          >
            <span className="truncate">{o.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════════════════════════════════════════════
   SELECT: bordered field
   ═══════════════════════════════════════════════════════════ */

export function Select({
  placeholder = "Empty",
  size = "auto",
  error = false,
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  className,
  ...rest
}: SelectProps) {
  const s = useSelect(rest);
  const z = sizes[size];

  // Border by state: disabled, error, open, hover, default
  const border = disabled
    ? "border-neutral-200 bg-neutral-100"
    : error
      ? "border-danger-600 bg-white"
      : s.open
        ? "border-brand bg-white"
        : "border-neutral-300 bg-white hover:border-brand-hover";

  return (
    <div className={cn("inline-flex w-60 flex-col", className)}>
      {name && <input type="hidden" name={name} value={s.selected ?? ""} />}

      <div ref={s.rootRef} className="relative">
        <button
          ref={s.triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => s.setOpen(!s.open)}
          onKeyDown={s.onTriggerKey}
          aria-label={ariaLabel}
          aria-expanded={s.open}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          className={cn(
            "flex w-full items-center justify-between rounded border text-left transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default",
            focusRing,
            z.box,
            border
          )}
        >
          <span className={cn("truncate", s.label ? "text-neutral-600" : "text-neutral-400")}>{s.label ?? placeholder}</span>
          {/* Arrow points up while open */}
          <Icon name={s.open ? "up" : "down"} className={cn(z.icon, disabled ? "text-neutral-400" : "text-neutral-500")} />
        </button>

        {s.open && <List options={s.options} selected={s.selected} pick={s.pick} optionClass={z.option} listRef={s.listRef} />}
      </div>

      {error && !disabled && (
        <span role="alert" className={cn("mt-1 text-danger-600", z.text)}>
          {error === true ? "Error Text" : error}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SELECT WITHOUT OUTLINE: no border, gray background on hover and press
   ═══════════════════════════════════════════════════════════ */

export interface SelectWithoutOutlineProps extends Omit<SelectProps, "error"> {
  /** Icon on the left (see SelectWithoutOutlineIcon) */
  icon?: ReactNode;
  /** Error state: red text and icon */
  error?: boolean;
}

function WithoutOutline({
  placeholder = "Default",
  size = "auto",
  error = false,
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  className,
  icon,
  ...rest
}: SelectWithoutOutlineProps) {
  const s = useSelect(rest);
  const z = sizes[size];

  const tone = disabled ? "text-neutral-400" : error ? "text-danger-600" : "text-neutral-600";
  const bg = disabled ? "" : s.open ? "bg-neutral-300" : "hover:bg-neutral-100 active:bg-neutral-300";

  return (
    <div ref={s.rootRef} className={cn("relative inline-block", className)}>
      {name && <input type="hidden" name={name} value={s.selected ?? ""} />}

      <button
        ref={s.triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => s.setOpen(!s.open)}
        onKeyDown={s.onTriggerKey}
        aria-label={ariaLabel}
        aria-expanded={s.open}
        aria-haspopup="listbox"
        aria-invalid={error}
        className={cn(
          "inline-flex items-center rounded transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default",
          focusRing,
          z.box,
          tone,
          bg
        )}
      >
        {icon && <span aria-hidden="true" className={cn("flex shrink-0 items-center", z.icon)}>{icon}</span>}
        <span className="truncate">{s.label ?? placeholder}</span>
        <Icon name="down" className={cn(z.icon, disabled || error ? "text-current" : "text-neutral-500")} />
      </button>

      {s.open && <List options={s.options} selected={s.selected} pick={s.pick} optionClass={z.option} listRef={s.listRef} />}
    </div>
  );
}

/** Text only: "Default ⌄" */
export const SelectWithoutOutline = (props: Omit<SelectWithoutOutlineProps, "icon">) => <WithoutOutline {...props} />;

/** With a left icon (envelope by default): "✉ Default ⌄" */
export const SelectWithoutOutlineIcon = ({
  icon = <Icon name="mail" variant="filled" className="size-full" />,
  ...props
}: SelectWithoutOutlineProps) => <WithoutOutline icon={icon} {...props} />;
