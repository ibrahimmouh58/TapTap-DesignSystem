"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface InputProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Native attributes, for forms and labels */
  id?: string;
  name?: string;
  "aria-label"?: string;
  required?: boolean;
  placeholder?: string;
  /** "auto" (default) follows the screen size | "lg" 40px | "md" 36px | "sm" 24px */
  size?: "auto" | "lg" | "md" | "sm";
  /** `true` shows "Error Text", a string shows that string */
  error?: boolean | string;
  disabled?: boolean;
  /** Gray round button that clears the text while typing */
  clearable?: boolean;
  /** Icon on the left of the text */
  leftIcon?: ReactNode;
  /** Icon on the right of the text */
  rightIcon?: ReactNode;
  /** Gray text INSIDE the field, before the value, e.g. "¥" */
  prefix?: ReactNode;
  /** Gray text INSIDE the field, after the value, e.g. "CNY" */
  suffix?: ReactNode;
  /** Gray block on the LEFT of the field, e.g. "http://" */
  addonBefore?: ReactNode;
  /** Gray block on the RIGHT of the field, e.g. ".com" */
  addonAfter?: ReactNode;
  className?: string;
}

// Figma sizes: height and text (h), side padding (px), icons.
// "auto" follows the screen: sm (phone), md (tablet), lg (desktop).
const sizes = {
  auto: {
    h: "h-6 text-caption sm:h-9 sm:text-body lg:h-10 lg:text-subtitle",
    px: "px-2 sm:px-3",
    text: "text-caption sm:text-body lg:text-subtitle",
    clear: "size-3.5 sm:size-4",
    icon: "[&>svg]:size-3.5 sm:[&>svg]:size-4 lg:[&>svg]:size-[18px]",
  },
  lg: { h: "h-10 text-subtitle", px: "px-3", text: "text-subtitle", clear: "size-4", icon: "[&>svg]:size-[18px]" },
  md: { h: "h-9 text-body", px: "px-3", text: "text-body", clear: "size-4", icon: "[&>svg]:size-4" },
  sm: { h: "h-6 text-caption", px: "px-2", text: "text-caption", clear: "size-3.5", icon: "[&>svg]:size-3.5" },
};

/* ───────── Base field (shared) ───────── */

export function Input({
  value,
  defaultValue = "",
  onChange,
  placeholder = "Empty",
  size = "auto",
  error = false,
  disabled = false,
  clearable = true,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  id,
  name,
  "aria-label": ariaLabel,
  required,
  className,
}: InputProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const z = sizes[size];

  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  // Pointer cursor on hover (text cursor while typing)
  const hand = !disabled && !focused ? "hover:cursor-pointer active:cursor-default" : "";

  // Border by state: disabled, error, focus, hover, default
  const border = disabled
    ? "border-neutral-200 bg-neutral-100"
    : error
      ? "border-danger-600 bg-white"
      : focused
        ? "border-brand bg-white"
        : "border-neutral-300 bg-white hover:border-brand-hover";

  // Gray icon (paler when disabled)
  const icon = (node: ReactNode) => (
    <span aria-hidden="true" className={`flex shrink-0 items-center ${disabled ? "text-neutral-400" : "text-neutral-500"} ${z.icon}`}>
      {node}
    </span>
  );

  // Prefix and suffix: gray text inside the field
  const affix = (node: ReactNode) => (
    <span className={`shrink-0 ${disabled ? "text-neutral-400" : "text-neutral-500"}`}>{node}</span>
  );

  // Gray block stuck to the field, separated by a line
  const addon = (node: ReactNode, side: "border-r" | "border-l") => (
    <span
      className={`flex shrink-0 items-center border-inherit ${side} ${z.px} ${
        disabled ? "bg-neutral-100 text-neutral-400" : "bg-neutral-50 text-neutral-600"
      }`}
    >
      {node}
    </span>
  );

  return (
    <div className={cn("inline-flex w-[190px] flex-col", className)}>
      <div className={`flex items-stretch overflow-hidden rounded border transition-colors ${z.h} ${hand} ${border}`}>
        {addonBefore && addon(addonBefore, "border-r")}

        <div className={`flex min-w-0 flex-1 items-center gap-2 ${z.px}`}>
          {leftIcon && icon(leftIcon)}
          {prefix && affix(prefix)}

          <input
            ref={inputRef}
            id={id}
            name={name}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={error && !disabled ? errorId : undefined}
            value={text}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            onChange={(e) => update(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`min-w-0 flex-1 bg-transparent text-neutral-600 outline-none placeholder:text-neutral-400 disabled:text-neutral-400 ${focused ? "" : "cursor-[inherit]"}`}
          />

          {/* Clear button: normal, hover (darker), press (darkest) */}
          {clearable && focused && text && (
            <button
              type="button"
              aria-label="Clear"
              // keep the focus in the field
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                update("");
                inputRef.current?.focus();
              }}
              className={`flex shrink-0 items-center justify-center text-neutral-400 transition-colors hover:cursor-pointer hover:text-neutral-500 active:cursor-default active:text-neutral-600 ${z.clear}`}
            >
              <Icon name="error" variant="filled" className="size-full" />
            </button>
          )}

          {rightIcon && icon(rightIcon)}
          {suffix && affix(suffix)}
        </div>

        {addonAfter && addon(addonAfter, "border-l")}
      </div>

      {error && !disabled && (
        <span id={errorId} role="alert" className={`mt-1 text-danger-600 ${z.text}`}>
          {error === true ? "Error Text" : error}
        </span>
      )}
    </div>
  );
}

/* ───────── Variants ───────── */

type Variant = Omit<InputProps, "leftIcon" | "rightIcon" | "prefix" | "suffix" | "addonBefore" | "addonAfter">;

/** No icon */
export const InputBasic = (props: Variant) => <Input {...props} />;

/** Left icon (search by default) */
export const InputLeftIcon = ({ icon = <Icon name="search" />, ...props }: Variant & { icon?: ReactNode }) => (
  <Input leftIcon={icon} {...props} />
);

/** Right icon (search by default) */
export const InputRightIcon = ({ icon = <Icon name="search" />, ...props }: Variant & { icon?: ReactNode }) => (
  <Input rightIcon={icon} {...props} />
);

/** Prefix: gray block on the left ("http://" by default) */
export const InputPrefix = ({ prefix = "http://", ...props }: Variant & { prefix?: ReactNode }) => (
  <Input addonBefore={prefix} {...props} />
);

/** Suffix: gray block on the right (".com" by default) */
export const InputSuffix = ({ suffix = ".com", ...props }: Variant & { suffix?: ReactNode }) => (
  <Input addonAfter={suffix} {...props} />
);

/** PrefixSuffix: gray text inside, on both sides ("¥" and "CNY" by default) */
export const InputPrefixSuffix = ({
  prefix = "¥",
  suffix = "CNY",
  ...props
}: Variant & { prefix?: ReactNode; suffix?: ReactNode }) => <Input prefix={prefix} suffix={suffix} {...props} />;

/* ───────── InputNumber: text on the left, up and down arrows on the right ───────── */

export interface InputNumberProps {
  /** Controlled value */
  value?: number;
  /** Uncontrolled initial value */
  defaultValue?: number;
  /** Called with the number, or undefined when empty */
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  /** Arrow step (default 1) */
  step?: number;
  /** Native attributes, for forms and labels */
  id?: string;
  name?: string;
  "aria-label"?: string;
  required?: boolean;
  placeholder?: string;
  /** "auto" (default) follows the screen size | "lg" 40px | "md" 36px | "sm" 24px */
  size?: "auto" | "lg" | "md" | "sm";
  error?: boolean | string;
  disabled?: boolean;
  className?: string;
}

export function InputNumber({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  placeholder = "Empty",
  size = "auto",
  error = false,
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  required,
  className,
}: InputNumberProps) {
  const [inner, setInner] = useState<number | undefined>(defaultValue);
  const num = value !== undefined ? value : inner;
  const [draft, setDraft] = useState<string | null>(null); // text while typing
  const [focused, setFocused] = useState(false);
  const errorId = useId();
  const z = sizes[size];

  // Pointer cursor on hover (text cursor while typing)
  const hand = !disabled && !focused ? "hover:cursor-pointer active:cursor-default" : "";

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const commit = (n: number | undefined) => {
    if (value === undefined) setInner(n);
    onChange?.(n);
  };
  // parseFloat + toFixed avoids rounding errors (0.1 + 0.2)
  const stepBy = (dir: 1 | -1) => commit(clamp(parseFloat(((num ?? 0) + dir * step).toFixed(10))));

  const atMin = num !== undefined && min !== undefined && num <= min;
  const atMax = num !== undefined && max !== undefined && num >= max;

  // Border by state: disabled, error, focus, hover, default
  const border = disabled
    ? "border-neutral-200 bg-neutral-100"
    : error
      ? "border-danger-600 bg-white"
      : focused
        ? "border-brand bg-white"
        : "border-neutral-300 bg-white hover:border-brand-hover";

  // Up (dir = 1) or down (dir = -1) arrow, each half the height
  const arrow = (dir: 1 | -1, off: boolean) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={dir === 1 ? "Increase" : "Decrease"}
      disabled={disabled || off}
      // keep the focus in the field
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        stepBy(dir);
        setDraft(null);
      }}
      className="flex flex-1 items-center justify-center px-1 text-neutral-500 transition-colors enabled:hover:cursor-pointer enabled:hover:text-brand enabled:active:cursor-default disabled:text-neutral-400"
    >
      <Icon name={dir === 1 ? "up" : "down"} size={14} />
    </button>
  );

  return (
    <div className={cn("inline-flex w-[190px] flex-col", className)}>
      <div className={`flex items-stretch gap-2 rounded border pl-3 transition-colors ${z.h} ${hand} ${border}`}>
        <input
          id={id}
          name={name}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={error && !disabled ? errorId : undefined}
          inputMode="decimal"
          value={draft ?? (num === undefined ? "" : String(num))}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          onChange={(e) => {
            const t = e.target.value;
            if (!/^-?\d*\.?\d*$/.test(t)) return; // digits, - and . only
            setDraft(t);
            const n = parseFloat(t);
            commit(Number.isNaN(n) ? undefined : n);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              stepBy(e.key === "ArrowUp" ? 1 : -1);
              setDraft(null);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (num !== undefined) commit(clamp(num)); // bring the value back between min and max
            setDraft(null);
          }}
          className={`min-w-0 flex-1 bg-transparent text-neutral-600 outline-none placeholder:text-neutral-400 disabled:text-neutral-400 ${focused ? "" : "cursor-[inherit]"}`}
        />

        <div className="flex w-6 shrink-0 flex-col">
          {arrow(1, atMax)}
          {arrow(-1, atMin)}
        </div>
      </div>

      {error && !disabled && (
        <span id={errorId} role="alert" className={`mt-1 text-danger-600 ${z.text}`}>
          {error === true ? "Error Text" : error}
        </span>
      )}
    </div>
  );
}