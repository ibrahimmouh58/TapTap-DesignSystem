"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";

export interface TextAreaProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Max characters, shown in the "0/1000" counter (typing past it turns the field red) */
  maxLength?: number;
  /** `true` shows "Error Text", a string shows that string */
  error?: boolean | string;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  required?: boolean;
  className?: string;
}

const longText =
  "ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.";

export function TextArea({
  value,
  defaultValue = "",
  onChange,
  placeholder = "Textarea",
  maxLength = 1000,
  error = false,
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
  required,
  className,
}: TextAreaProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const [focused, setFocused] = useState(false);
  const errorId = useId();

  const over = text.length > maxLength;
  const invalid = !!error || over;

  // Border by state: disabled, error, focus, hover, default
  const border = disabled
    ? "border-neutral-200 bg-neutral-100"
    : invalid
      ? "border-danger-600 bg-white"
      : focused
        ? "border-brand bg-white"
        : "border-neutral-300 bg-white hover:border-brand-hover";

  return (
    <div className={cn("inline-flex w-[240px] max-w-full flex-col", className)}>
      {/* Frame: padding 8 × 12, resizable from the bottom-right corner */}
      <div
        className={cn(
          "flex h-20 min-h-[64px] resize-y flex-col overflow-hidden rounded border px-3 py-2 transition-colors",
          disabled && "resize-none",
          !disabled && !focused && "hover:cursor-pointer",
          border
        )}
      >
        <textarea
          id={id}
          name={name}
          required={required}
          aria-label={ariaLabel}
          aria-invalid={invalid}
          aria-describedby={error && !disabled ? errorId : undefined}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            if (value === undefined) setInner(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "min-h-0 w-full flex-1 resize-none bg-transparent text-body text-neutral-700 outline-none [scrollbar-width:thin] placeholder:text-neutral-400 disabled:text-neutral-400",
            !focused && "cursor-[inherit]"
          )}
        />

        {/* Counter, 4px below the text */}
        <div
          aria-hidden="true"
          className={cn("mt-1 flex shrink-0 justify-end pr-2 text-caption", !disabled && over ? "text-danger-600" : "text-neutral-400")}
        >
          {text.length}/{maxLength}
        </div>
      </div>

      {error && !disabled && (
        <span id={errorId} role="alert" className="mt-1 text-caption text-danger-600">
          {error === true ? "Error Text" : error}
        </span>
      )}
    </div>
  );
}

/* ───────── Variants ───────── */

type Variant = Omit<TextAreaProps, "defaultValue">;

/** Empty: "Textarea" placeholder, 0/1000 */
export const TextAreaEmpty = (props: Variant) => <TextArea {...props} />;

/** Filled: "Filled", or a long text with `scroll` to show scrolling */
export const TextAreaFilled = ({ scroll = false, ...props }: Variant & { scroll?: boolean }) => (
  <TextArea defaultValue={scroll ? longText : "Filled"} {...props} />
);
