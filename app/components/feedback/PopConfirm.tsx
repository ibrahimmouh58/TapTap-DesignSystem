"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../general/Button";
import { Input } from "../data-entry/Input";
import { Icon } from "../../icons/Icon";
import { placements, type PopoverPlacement } from "../data-display/Popover";

/* ───────── Shared card: white, padding 12, radius 4, arrow ───────── */

function Card({
  placement,
  labelId,
  width,
  className,
  children,
}: {
  placement: PopoverPlacement;
  labelId: string;
  width: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="alertdialog" aria-labelledby={labelId} className={cn("inline-block", width, className)}>
      <div className="relative rounded bg-white p-3 text-left shadow-elevation-3">
        <span aria-hidden="true" className={cn("absolute size-1.5 rotate-45 bg-white", placements[placement].arrow)} />
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPCONFIRM BASIC: a question and two buttons
   ═══════════════════════════════════════════════════════════ */

export interface PopConfirmProps {
  /** The question. Defaults to the Figma text */
  title?: ReactNode;
  /** Arrow position: TL, Top, TR, LT, Left, LB, RT, Right, RB, BL, Bottom, BR */
  placement?: PopoverPlacement;
  /** Confirm button text (default "Yes") */
  okText?: string;
  /** Cancel button text (default "No") */
  cancelText?: string;
  /** Called by Yes */
  onConfirm?: () => void;
  /** Called by No */
  onCancel?: () => void;
  /** Icon before the question (orange exclamation by default) */
  icon?: ReactNode;
  className?: string;
}

export function PopConfirmBasic({
  title = "Are you sure to delete this task?",
  placement = "top",
  okText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  icon = <Icon name="attention" size={16} className="text-warning-600" />,
  className,
}: PopConfirmProps) {
  const id = useId();

  return (
    <Card placement={placement} labelId={id} width="w-max max-w-[260px]" className={className}>
      {/* 16px icon, 8px, then the question (Regular/Body) */}
      <div className="flex items-start gap-2">
        <span className="flex h-[22px] shrink-0 items-center">{icon}</span>
        <p id={id} className="text-body font-normal text-neutral-600">
          {title}
        </p>
      </div>

      {/* No (ghost) and Yes (primary), right-aligned */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          {okText}
        </Button>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPCONFIRM WITH INPUT: a title, a field and two buttons
   12 top | 8 | field | 8 | buttons | 12 bottom
   ═══════════════════════════════════════════════════════════ */

export interface PopConfirmWithInputProps extends Omit<PopConfirmProps, "icon" | "onConfirm"> {
  /** Field text (controlled) */
  value?: string;
  /** Initial field text (uncontrolled) */
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  /** Called by Yes, with the typed text */
  onConfirm?: (value: string) => void;
}

export function PopConfirmWithInput({
  title = "Edit",
  placement = "top",
  placeholder = "Text input",
  value,
  defaultValue = "",
  okText = "Yes",
  cancelText = "No",
  onChange,
  onConfirm,
  onCancel,
  className,
}: PopConfirmWithInputProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;

  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <Card placement={placement} labelId={id} width="w-60" className={className}>
      {/* Title (Regular/Body) */}
      <p id={id} className="text-body font-normal text-neutral-600">
        {title}
      </p>

      {/* 8px under the title: full-width 24px field */}
      <Input className="mt-2 w-full" size="sm" placeholder={placeholder} value={text} onChange={update} />

      {/* 8px under the field: No and Yes, right-aligned */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="primary" size="sm" onClick={() => onConfirm?.(text)}>
          {okText}
        </Button>
      </div>
    </Card>
  );
}