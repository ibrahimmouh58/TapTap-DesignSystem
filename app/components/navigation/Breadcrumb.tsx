"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface BreadcrumbItem {
  title: ReactNode;
  /** Link. Without href the item is not clickable (the current page needs none) */
  href?: string;
  /** Icon before the text */
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Defaults to the Figma list. The last item is the current page */
  items?: BreadcrumbItem[];
  /** "slash": "/" (default) | "arrow": right arrow */
  separator?: "slash" | "arrow";
  className?: string;
}

const defaultItems: BreadcrumbItem[] = [
  { title: "Homepage", href: "#" },
  { title: "Target", href: "#" },
  { title: "Tag", href: "#" },
  { title: "Developer Settings", href: "#" },
  { title: "Authority", href: "#" },
];

// A trail entry: an item, or the dots of the collapsed version
type Entry = { item: BreadcrumbItem } | { ellipsis: true };

function BreadcrumbBase({
  items = defaultItems,
  separator = "slash",
  collapsed,
  className,
}: BreadcrumbProps & { collapsed: boolean }) {
  const [expanded, setExpanded] = useState(false);

  // Collapsed: first item, "···", last item (clicking "···" expands)
  const entries: Entry[] =
    collapsed && !expanded && items.length > 2
      ? [{ item: items[0] }, { ellipsis: true }, { item: items[items.length - 1] }]
      : items.map((item) => ({ item }));

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/* 4px between a text and the separator, on both sides */}
      <ol className="flex flex-wrap items-center gap-1 text-body">
        {entries.map((entry, i) => {
          const last = i === entries.length - 1;

          // Dots: gray text, teal on hover
          if ("ellipsis" in entry) {
            return (
              <li key="ellipsis" className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Show the full path"
                  onClick={() => setExpanded(true)}
                  className="flex items-center text-neutral-500 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <Icon name="more" size={16} />
                </button>
                <Separator type={separator} />
              </li>
            );
          }

          const { item } = entry;
          const clickable = !last && (item.href || item.onClick);
          const content = (
            <>
              {item.icon && <span aria-hidden="true" className="flex shrink-0 items-center [&>svg]:size-4">{item.icon}</span>}
              {item.title}
            </>
          );

          return (
            <li key={i} className="flex items-center gap-1">
              {clickable ? (
                // Default: gray | hover: light teal | press: dark teal
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-neutral-500 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {content}
                </a>
              ) : (
                // Current page: dark text, no link
                <span aria-current={last ? "page" : undefined} className={cn("flex items-center gap-1", last ? "text-neutral-700" : "text-neutral-500")}>
                  {content}
                </span>
              )}

              {!last && <Separator type={separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Separator between two items
function Separator({ type }: { type: "slash" | "arrow" }) {
  return type === "slash" ? (
    <span aria-hidden="true" className="text-neutral-400">/</span>
  ) : (
    <Icon name="right" size={12} className="text-neutral-400" />
  );
}

/** Every item: "Homepage / Target / Tag / Developer Settings / Authority" */
export const Breadcrumb = (props: BreadcrumbProps) => <BreadcrumbBase collapsed={false} {...props} />;

/** Collapsed: "Homepage / ··· / Authority" */
export const BreadcrumbCollapsed = (props: BreadcrumbProps) => <BreadcrumbBase collapsed {...props} />;