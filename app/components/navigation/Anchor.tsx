"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";

export interface AnchorItem {
  /** Target id, e.g. "#section-1" (the element needs that id) */
  href: string;
  title: string;
  /** Subtitles: smaller and indented */
  children?: AnchorItem[];
}

export interface AnchorProps {
  /** Defaults to the Figma list */
  items?: AnchorItem[];
  /** Active link (controlled) */
  value?: string;
  /** Initial active link (uncontrolled) */
  defaultValue?: string;
  onChange?: (href: string) => void;
  className?: string;
}

const defaultItems: AnchorItem[] = [
  { href: "#title-one", title: "Title One" },
  { href: "#title-two", title: "Title Two" },
  { href: "#title-three", title: "Title Three" },
  {
    href: "#long-title",
    title: "Long Title",
    children: [
      { href: "#subtitle-one", title: "Subtitle One" },
      { href: "#subtitle-two", title: "Subtitle Two" },
    ],
  },
];

export function Anchor({ items = defaultItems, value, defaultValue, onChange, className }: AnchorProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.href);
  const active = value ?? inner;

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (value === undefined) setInner(href);
    onChange?.(href);
    // Scroll to the target if it exists on the page
    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
  };

  // A link: title (Body) or subtitle (Caption)
  const link = (item: AnchorItem, sub: boolean) => {
    const on = item.href === active;
    return (
      <a
        href={item.href}
        aria-current={on ? "location" : undefined}
        onClick={(e) => go(e, item.href)}
        className={cn(
          // No "truncate" here: it would cut the bar that sticks out on the left
          "relative flex items-center transition-colors hover:cursor-pointer active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          sub ? "h-[18px] pl-6 text-caption" : "h-6 pl-3 text-body",
          on ? "text-brand" : sub ? "text-neutral-500 hover:text-brand-hover" : "text-neutral-500 hover:text-brand-hover"
        )}
      >
        {/* Teal bar over the gray line, before the active link */}
        {on && <span aria-hidden="true" className="absolute inset-y-0 -left-0.5 w-0.5 bg-brand" />}
        {/* Long text is truncated with "…" */}
        <span className="truncate">{item.title}</span>
      </a>
    );
  };

  return (
    <nav aria-label="Anchor" className={cn("inline-block w-[220px] max-w-full", className)}>
      <ul className="flex flex-col gap-0 border-l-2 border-neutral-200">
        {items.map((item) => (
          <li key={item.href}>
            {link(item, false)}
            {item.children && (
              <ul className="flex flex-col">
                {item.children.map((child) => (
                  <li key={child.href}>{link(child, true)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}