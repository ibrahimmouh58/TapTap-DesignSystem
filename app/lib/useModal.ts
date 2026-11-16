import { useEffect, useEffectEvent, useRef, useState, type RefObject } from "react";

/**
 * Shared behavior of Dialog and Drawer:
 * controlled / uncontrolled open state, Escape to close, page scroll lock,
 * focus moved inside on open, kept inside with Tab, and given back on close.
 */
export function useModal({
  open,
  defaultOpen = false,
  onClose,
  panelRef,
  initialFocusRef,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onClose?: () => void;
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
}) {
  const [inner, setInner] = useState(false);
  const isOpen = open ?? inner;

  // Open on load after the first paint, so the opening animation plays
  useEffect(() => {
    if (!defaultOpen) return;
    const id = requestAnimationFrame(() => setInner(true));
    return () => cancelAnimationFrame(id);
  }, [defaultOpen]);

  const close = () => {
    setInner(false);
    onClose?.();
  };
  const onEscape = useEffectEvent(close);

  // Remember what had the focus, to give it back on close
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previous.current = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onEscape();
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab inside the panel
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous.current?.focus();
    };
  }, [isOpen, panelRef, initialFocusRef]);

  return { isOpen, close };
}
