"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { useModal } from "../../lib/useModal";
import { Button, type ButtonProps } from "../general/Button";
import { Icon } from "../../icons/Icon";

export interface DialogProps {
  /** Width: sm = 400px | md = 600px (default) | lg = 900px */
  size?: "sm" | "md" | "lg";
  /** Controlled open state */
  open?: boolean;
  /** Open on load (uncontrolled) */
  defaultOpen?: boolean;
  /** Called on every close: cross, overlay, Escape, cancel, confirm */
  onClose?: () => void;
  /** Called by the confirm button (the dialog then closes) */
  onConfirm?: () => void;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  /** Content. Defaults to "Some contents..." */
  children?: ReactNode;
  className?: string;
}

const widths = { sm: "w-[400px]", md: "w-[600px]", lg: "w-[900px]" };

// Demo content of the Scrollable variant: long enough to scroll
const longContent = Array.from({ length: 24 }, (_, i) => <p key={i}>Some contents...</p>);

/* Basic, Warning, Scrollable: padding 24 | title → content 16 | content → buttons 32 | radius 4
   Divider: side padding 24 | vertical padding 16 | full-width separators */
function DialogBase({
  size = "md",
  open,
  defaultOpen = false,
  onClose,
  onConfirm,
  title = "Title",
  cancelText = "Cancel",
  confirmText = "Confirm",
  children,
  className,
  icon,
  scrollable = false,
  divided = false,
  confirmVariant = "primary",
}: DialogProps & {
  /** Icon before the content (Warning) */
  icon?: ReactNode;
  /** Fixed-height scrolling content (Scrollable) */
  scrollable?: boolean;
  /** Separators under the title and above the buttons (Divider) */
  divided?: boolean;
  confirmVariant?: ButtonProps["variant"];
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { isOpen, close } = useModal({ open, defaultOpen, onClose, panelRef, initialFocusRef: closeRef });

  const confirm = () => {
    onConfirm?.();
    close();
  };

  const body =
    children ??
    (scrollable ? (
      longContent
    ) : (
      <>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </>
    ));

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        // Visible at once when opening (so the focus can move in), hidden after the closing animation
        isOpen ? "visible" : "invisible transition-[visibility] delay-200"
      )}
    >
      {/* Overlay */}
      <div onClick={close} className={cn("absolute inset-0 bg-black/30 transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0")} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-full max-w-full flex-col rounded bg-white shadow-elevation-4 transition duration-200",
          !divided && "p-6",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          widths[size],
          className
        )}
      >
        {/* Title (Medium/Title) and close cross */}
        <header className={cn("flex shrink-0 justify-between gap-4", divided ? "items-center border-b border-neutral-200 px-6 py-4" : "items-start")}>
          <h2 className="text-title font-medium text-neutral-700">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-[22px] shrink-0 items-center justify-center text-neutral-500 transition-colors hover:cursor-pointer hover:text-neutral-600 active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon name="close" size={14} />
          </button>
        </header>

        {/* Content (Regular/Body). Scrollable: 242px visible. Divider: min 242px, scrolls when longer */}
        <div
          {...(scrollable ? { tabIndex: 0, role: "region", "aria-label": "Scrollable content" } : {})}
          className={cn(
            "min-h-0 text-body font-normal text-neutral-600",
            divided ? "flex-1 overflow-y-auto px-6 py-4" : "mt-4",
            icon && "flex items-start gap-2",
            scrollable &&
              "max-h-[242px] overflow-y-auto [scrollbar-color:var(--color-neutral-200)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          )}
        >
          {icon && <span className="flex h-[22px] shrink-0 items-center">{icon}</span>}
          <div className={divided ? "min-h-[242px]" : undefined}>{body}</div>
        </div>

        {/* Cancel (ghost) and confirm, 8px apart, right-aligned */}
        <footer className={cn("flex shrink-0 items-center justify-end gap-2", divided ? "border-t border-neutral-200 px-6 py-4" : "mt-8")}>
          <Button variant="ghost" size="md" onClick={close}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} size="md" onClick={confirm}>
            {confirmText}
          </Button>
        </footer>
      </div>
    </div>
  );
}

/* ───────── Variants ───────── */

/** Basic: title, content, Cancel and Confirm */
export const DialogBasic = (props: DialogProps) => <DialogBase {...props} />;

/** Warning: orange warning icon, red outline "Delete" button */
export const DialogWarning = ({ confirmText = "Delete", ...props }: DialogProps) => (
  <DialogBase icon={<Icon name="attention" size={16} className="text-warning-600" />} confirmVariant="dangerOutline" confirmText={confirmText} {...props} />
);

/** Scrollable: long scrolling content, "Disagree" and "Agree" */
export const DialogScrollable = ({ cancelText = "Disagree", confirmText = "Agree", ...props }: DialogProps) => (
  <DialogBase scrollable cancelText={cancelText} confirmText={confirmText} {...props} />
);

/** Divider: separators under the title and above the buttons, "Save" */
export const DialogDivider = ({ confirmText = "Save", ...props }: DialogProps) => <DialogBase divided confirmText={confirmText} {...props} />;
