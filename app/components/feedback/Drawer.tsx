"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { useModal } from "../../lib/useModal";
import { Button } from "../general/Button";
import { Icon } from "../../icons/Icon";

/* ───────── Styles: one per side, one per variant ───────── */

const sides = {
  right: { panel: "right-0", hidden: "translate-x-full" },
  left: { panel: "left-0", hidden: "-translate-x-full" },
};

const variants = {
  basic: { panel: "bg-white", header: "px-6 py-4", icon: "size-4", separator: "mx-4 h-4", title: "text-title font-medium", body: "px-6 py-4" },
  cards: { panel: "bg-neutral-100", header: "h-[70px] px-7", icon: "size-6", separator: "mx-5 h-5", title: "text-h3", body: "flex flex-col gap-5 p-5" },
};

/* ═══════════════════════════════════════════════════════════
   DRAWER: overlay, sliding panel, header, footer
   ═══════════════════════════════════════════════════════════ */

interface DrawerProps {
  variant?: "basic" | "cards";
  side?: "left" | "right";
  /** Width class, e.g. "w-[400px]" */
  width?: string;
  /** Controlled open state */
  open?: boolean;
  /** Open on load (uncontrolled) */
  defaultOpen?: boolean;
  /** Called on every close: cross, overlay, Escape, Cancel, Confirm */
  onClose?: () => void;
  /** Called by Confirm (the drawer then closes) */
  onConfirm?: () => void;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  children?: ReactNode;
}

function Drawer({
  variant = "basic",
  side = "right",
  width = "w-[480px]",
  open,
  defaultOpen = false,
  onClose,
  onConfirm,
  title = "Drawer Title",
  cancelText = "Cancel",
  confirmText = "Confirm",
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { isOpen, close } = useModal({ open, defaultOpen, onClose, panelRef, initialFocusRef: closeRef });
  const v = variants[variant];
  const s = sides[side];

  const confirm = () => {
    onConfirm?.();
    close();
  };

  return (
    <div aria-hidden={!isOpen} className={cn("fixed inset-0 z-50", isOpen ? "visible" : "invisible transition-[visibility] delay-300")}>
      {/* Overlay */}
      <div onClick={close} className={cn("absolute inset-0 bg-black/30 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute top-0 flex h-full max-w-full flex-col shadow-elevation-4 transition-transform duration-300 ease-out",
          width,
          v.panel,
          s.panel,
          isOpen ? "translate-x-0" : s.hidden
        )}
      >
        {/* Header: cross | separator | title */}
        <header className={cn("flex shrink-0 items-center border-b border-neutral-100 bg-white", v.header)}>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className={cn(
              "flex items-center justify-center text-neutral-500 transition-colors hover:cursor-pointer hover:text-brand active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
              v.icon
            )}
          >
            <Icon name="close" className="size-full" />
          </button>
          <span aria-hidden="true" className={cn("w-px bg-neutral-300", v.separator)} />
          <h2 className={cn("truncate text-neutral-700", v.title)}>{title}</h2>
        </header>

        {/* Content: scrolls when long, no visible scrollbar */}
        <div className={cn("flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", v.body)}>{children}</div>

        {/* Footer: Cancel | Confirm (98 × 36, 8px apart) */}
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-neutral-100 bg-white px-6 py-4">
          <Button variant="ghost" size="md" className="w-[98px]" onClick={close}>
            {cancelText}
          </Button>
          <Button variant="primary" size="md" className="w-[98px]" onClick={confirm}>
            {confirmText}
          </Button>
        </footer>
      </aside>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DRAWER BASIC: free content (xs = 400px | s, md, lg = 768px)
   ═══════════════════════════════════════════════════════════ */

const widths = { xs: "w-[400px]", s: "w-[768px]", md: "w-[768px]", lg: "w-[768px]" };

export type DrawerBasicProps = Omit<DrawerProps, "variant" | "width"> & { size?: keyof typeof widths };

export function DrawerBasic({ size = "md", ...props }: DrawerBasicProps) {
  return <Drawer variant="basic" width={widths[size]} {...props} />;
}

/* ═══════════════════════════════════════════════════════════
   DRAWER WITH CARDS: Left and Right
   ═══════════════════════════════════════════════════════════ */

export interface DrawerCard {
  id: string;
  title: string;
  /** Card content (empty by default, as in Figma) */
  content?: ReactNode;
}

export type DrawerWithCardsProps = Omit<DrawerProps, "variant" | "side" | "width" | "children"> & {
  /** Defaults to 2 "Title" cards */
  cards?: DrawerCard[];
};

const defaultCards: DrawerCard[] = [
  { id: "1", title: "Title" },
  { id: "2", title: "Title" },
];

function DrawerWithCards({ side, cards = defaultCards, ...props }: DrawerWithCardsProps & { side: "left" | "right" }) {
  return (
    <Drawer variant="cards" side={side} width="w-[500px]" {...props}>
      {cards.map((card) => (
        <section key={card.id} className="shrink-0 overflow-hidden rounded-lg bg-white">
          <h3 className="flex h-[70px] items-center border-b border-neutral-100 px-5 text-title font-normal text-neutral-600">{card.title}</h3>
          <div className="min-h-[280px] p-5">{card.content}</div>
        </section>
      ))}
    </Drawer>
  );
}

export const DrawerWithCardsLeft = (props: DrawerWithCardsProps) => <DrawerWithCards side="left" {...props} />;
export const DrawerWithCardsRight = (props: DrawerWithCardsProps) => <DrawerWithCards side="right" {...props} />;
