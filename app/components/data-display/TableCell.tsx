"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { Button } from "../general/Button";
import { Checkbox } from "../data-entry/Checkbox";
import { Input, type InputProps } from "../data-entry/Input";
import { Toggle } from "../data-entry/Toggle";
import { AuditStatus, type AuditStatusState } from "../feedback/AuditStatus";
import { TagBasic } from "./Tag";

type Align = "left" | "middle" | "right";

const aligns: Record<Align, string> = {
  left: "justify-start text-left",
  middle: "justify-center text-center",
  right: "justify-end text-right",
};

/* ═══════════════════════════════════════════════════════════
   STANDALONE TABLE CELLS (to build tables by hand)
   Width 240 | padding 16 | gray line below
   Header: very light gray, 48 high | Body: white, 56 high
   ═══════════════════════════════════════════════════════════ */

const headerCell = "flex h-12 w-60 items-center border-b border-neutral-200 bg-neutral-50 px-4";
const bodyCell = "flex w-60 items-center border-b border-neutral-200 bg-white px-4";

// Small icon button: gray, light teal on hover, dark teal on press
const iconButton =
  "flex text-neutral-400 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/* ═══════════════════════════════════════════════════════════
   HEADER CELLS: title or checkbox, left / middle / right
   ═══════════════════════════════════════════════════════════ */

export interface TableCellHeaderTitleProps {
  align?: Align;
  /** Defaults to "Title" */
  children?: string;
  /** Help icon, text shows on hover. `false` hides it */
  help?: string | false;
  /** Filter icon. `false` hides it */
  filter?: boolean;
  /** Sort icon. `false` hides it */
  sort?: boolean;
  onFilter?: () => void;
  onSort?: () => void;
  className?: string;
}

export function TableCellHeaderTitle({
  align = "left",
  children = "Title",
  help = "Help",
  filter = true,
  sort = true,
  onFilter,
  onSort,
  className,
}: TableCellHeaderTitleProps) {
  return (
    <div role="columnheader" className={cn(headerCell, aligns[align], className)}>
      <div className="flex items-center gap-1">
        <span className="text-body font-medium text-neutral-600">{children}</span>

        {help !== false && (
          <span title={help} className="flex items-center text-neutral-400">
            <Icon name="help" size={14} label={help} />
          </span>
        )}
        {filter && (
          <button type="button" aria-label={`Filter ${children}`} onClick={onFilter} className={iconButton}>
            <Icon name="filter" variant="filled" size={14} />
          </button>
        )}
        {sort && (
          <button type="button" aria-label={`Sort ${children}`} onClick={onSort} className={iconButton}>
            <Icon name="sort" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export interface TableCellHeaderCheckboxProps {
  align?: Align;
  /** Controlled state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  /** Half-checked box: some rows are selected */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function TableCellHeaderCheckbox({
  align = "middle",
  checked,
  defaultChecked,
  indeterminate,
  onChange,
  disabled,
  className,
}: TableCellHeaderCheckboxProps) {
  const [inner, setInner] = useState(defaultChecked ?? false);
  const isChecked = checked ?? inner;

  return (
    <div role="columnheader" className={cn(headerCell, aligns[align], className)}>
      <Checkbox
        checked={isChecked}
        indeterminate={indeterminate}
        disabled={disabled}
        onChange={(c) => {
          if (checked === undefined) setInner(c);
          onChange?.(c);
        }}
      >
        <span className="sr-only">Select all</span>
      </Checkbox>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTENT CELLS: one line ("Cell text", with an edit icon or a "Default" tag)
   ═══════════════════════════════════════════════════════════ */

export interface TableCellSingleProps {
  align?: Align;
  /** Defaults to "Cell text" */
  children?: ReactNode;
  /** Edit icon after the text */
  icon?: boolean;
  onIconClick?: () => void;
  /** Bordered tag after the text ("Default" when `true`) */
  tag?: boolean | string;
  className?: string;
}

export function TableCellSingle({ align = "left", children = "Cell text", icon, onIconClick, tag, className }: TableCellSingleProps) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14 gap-2 text-body text-neutral-600", aligns[align], className)}>
      <span className="truncate">{children}</span>

      {icon && (
        <button type="button" aria-label="Edit" onClick={onIconClick} className={iconButton}>
          <Icon name="edit" size={16} />
        </button>
      )}
      {tag && <TagBasic variant="border">{tag === true ? "Default" : tag}</TagBasic>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTENT CELLS: several lines
   ═══════════════════════════════════════════════════════════ */

export interface TableCellMultiProps {
  align?: Align;
  /** Text lines. Defaults to two "Cell text" lines */
  children?: ReactNode[];
  /** Edit icon on the right */
  icon?: boolean;
  onIconClick?: () => void;
  className?: string;
}

/** Two text lines, with or without an icon */
export function TableCellDouble({ align = "left", children = ["Cell text", "Cell text"], icon, onIconClick, className }: TableCellMultiProps) {
  return (
    <div
      role="cell"
      className={cn(
        bodyCell,
        "gap-2 py-3 text-body text-neutral-600",
        // With an icon and left-aligned text, the icon goes to the far right
        icon && align === "left" ? "justify-between" : aligns[align],
        className
      )}
    >
      <div className={cn("flex flex-col", aligns[align].split(" ")[1])}>
        {children.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
      {icon && (
        <button type="button" aria-label="Edit" onClick={onIconClick} className={iconButton}>
          <Icon name="edit" size={16} />
        </button>
      )}
    </div>
  );
}

/** A title with a lighter remark below: "Cell / Description" */
export function TableCellRemark({
  align = "left",
  children = "Cell",
  remark = "Description",
  className,
}: {
  align?: Align;
  children?: ReactNode;
  remark?: ReactNode;
  className?: string;
}) {
  return (
    <div role="cell" className={cn(bodyCell, "py-3 text-body", aligns[align], className)}>
      <div className={cn("flex flex-col gap-1", aligns[align].split(" ")[1])}>
        <span className="text-neutral-600">{children}</span>
        <span className="text-neutral-500">{remark}</span>
      </div>
    </div>
  );
}

// Gray square: image placeholder (pass `src` for a real image)
function Thumb({ src, className }: { src?: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={cn("size-10 shrink-0 rounded object-cover", className)} />
  ) : (
    <span aria-hidden="true" className={cn("size-10 shrink-0 rounded bg-neutral-400", className)} />
  );
}

/** An image and a text clamped to two lines */
export function TableCellPicture({
  src,
  children = "Lovely game with happy vibe and fascinating music...",
  className,
}: {
  src?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div role="cell" className={cn(bodyCell, "w-80 gap-3 py-3 text-body text-neutral-600", className)}>
      <Thumb src={src} className="h-[60px] w-20" />
      <span className="line-clamp-2">{children}</span>
    </div>
  );
}

/** Image with text ("content"), or three thumbnails */
export function TableCellImages({
  align = "left",
  withText = false,
  children = "content",
  className,
}: {
  align?: Align;
  withText?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14 gap-2 text-body text-neutral-600", aligns[align], className)}>
      {withText ? (
        <>
          <Thumb className="mr-2" />
          <span>{children}</span>
        </>
      ) : (
        [0, 1, 2].map((i) => <Thumb key={i} />)
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACTION CELLS: icon buttons, link buttons or a switch
   ═══════════════════════════════════════════════════════════ */

export interface TableCellActionProps {
  align?: Align;
  /** "icons": edit, delete, more | "text": two links | "switch": a toggle */
  kind?: "icons" | "text" | "switch";
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  /** Texts of the two link buttons (kind "text") */
  actions?: [string, string];
  /** Switch state (kind "switch") */
  checked?: boolean;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  className?: string;
}

export function TableCellAction({
  align = "left",
  kind = "icons",
  onEdit,
  onDelete,
  onMore,
  actions = ["Action 1", "Action 2"],
  checked,
  defaultChecked = true,
  onToggle,
  className,
}: TableCellActionProps) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14 gap-4", aligns[align], className)}>
      {kind === "icons" && (
        <>
          <button type="button" aria-label="Edit" onClick={onEdit} className={iconButton}>
            <Icon name="edit" size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={onDelete}
            className="flex text-danger-600 transition-colors hover:cursor-pointer hover:text-danger-500 active:cursor-default active:text-danger-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon name="delete" size={16} />
          </button>
          <button type="button" aria-label="More actions" onClick={onMore} className={iconButton}>
            <Icon name="more-vertical" size={16} />
          </button>
        </>
      )}

      {kind === "text" && (
        <>
          <Button variant="link" size="md" className="min-w-0 px-0" onClick={onEdit}>{actions[0]}</Button>
          <Button variant="link" size="md" className="min-w-0 px-0" onClick={onDelete}>{actions[1]}</Button>
        </>
      )}

      {kind === "switch" && <Toggle checked={checked} defaultChecked={defaultChecked} onChange={onToggle} label="Enable" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INPUT AND STATE CELLS: field, checkbox, person, status
   ═══════════════════════════════════════════════════════════ */

/** A text field in the cell (same props as Input) */
export function TableCellInput({ placeholder = "Text input", className, ...props }: Omit<InputProps, "size">) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14", className)}>
      <Input size="md" placeholder={placeholder} className="w-full" {...props} />
    </div>
  );
}

/** A centered checkbox in a narrow cell */
export function TableCellCheckbox({
  checked,
  defaultChecked,
  onChange,
  className,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  const [inner, setInner] = useState(defaultChecked ?? false);
  const isChecked = checked ?? inner;

  return (
    <div role="cell" className={cn(bodyCell, "h-14 w-[60px] justify-center px-0", className)}>
      <Checkbox
        checked={isChecked}
        onChange={(c) => {
          if (checked === undefined) setInner(c);
          onChange?.(c);
        }}
      >
        <span className="sr-only">Select row</span>
      </Checkbox>
    </div>
  );
}

/** A person: round avatar and name */
export function TableCellPerson({ src, children = "Cell person", className }: { src?: string; children?: ReactNode; className?: string }) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14 gap-2 text-body text-neutral-600", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-300 text-white">
          <Icon name="user" variant="filled" size={16} />
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  );
}

/** A status: "✓ Approved" (the 5 AuditStatus states) */
export function TableCellStatus({
  state = "approved",
  className,
}: {
  state?: AuditStatusState;
  className?: string;
}) {
  return (
    <div role="cell" className={cn(bodyCell, "h-14", className)}>
      <AuditStatus state={state} />
    </div>
  );
}