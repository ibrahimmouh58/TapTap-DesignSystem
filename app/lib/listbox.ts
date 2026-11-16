import { useEffect, useEffectEvent, type KeyboardEvent, type RefObject } from "react";

// Keyboard helpers shared by Select, Dropdown and similar pop-up lists.
// Options are <button role="option"> elements inside the list.

const options = (list: HTMLElement) => [...list.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)')];

/** Arrow keys, Home and End move the focus between enabled options. */
export function moveFocus(e: KeyboardEvent<HTMLElement>) {
  const items = options(e.currentTarget);
  if (items.length === 0) return;
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const next =
    e.key === "ArrowDown" ? (i + 1) % items.length
    : e.key === "ArrowUp" ? (i <= 0 ? items.length - 1 : i - 1)
    : e.key === "Home" ? 0
    : e.key === "End" ? items.length - 1
    : -1;
  if (next === -1) return;
  e.preventDefault();
  items[next].focus();
}

/** Focuses the selected option (or the first one) when the list opens. */
export function focusSelected(list: HTMLElement | null) {
  if (!list) return;
  (list.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]:not(:disabled)') ?? options(list)[0])?.focus();
}

/**
 * Closes a pop-up on outside click or Escape.
 * Escape also returns the focus to `triggerRef`.
 */
export function useDismiss(
  open: boolean,
  close: () => void,
  rootRef: RefObject<HTMLElement | null>,
  triggerRef?: RefObject<HTMLElement | null>
) {
  const onClose = useEffectEvent(close);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
      triggerRef?.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, rootRef, triggerRef]);
}
