"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";

export interface TabItem {
  value: string;
  label: ReactNode;
  /** Icon before the text */
  icon?: ReactNode;
  /** Content shown under the tabs when this one is active (optional) */
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabProps {
  /** Defaults to 5 "Tab" tabs */
  items?: TabItem[];
  /** Active tab (controlled) */
  value?: string;
  /** Initial active tab (uncontrolled) */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** "start": tabs on the left (default) | "stretch": they share the full width */
  align?: "start" | "stretch";
  /** Basic: lg 40px | md 36px (default) | sm 24px. Container: "sm" gives Small (38px), else 42px */
  size?: "lg" | "md" | "sm";
  /** Container only: close cross in each tab */
  closable?: boolean;
  /** Container only: gray border around each tab */
  bordered?: boolean;
  /** Container only: called when a tab is closed */
  onClose?: (value: string) => void;
  className?: string;
}

const defaultItems: TabItem[] = [1, 2, 3, 4, 5].map((n) => ({ value: `tab-${n}`, label: "Tab" }));

// Same list with a globe icon before each tab
const defaultIconItems: TabItem[] = defaultItems.map((item) => ({ ...item, icon: <Icon name="earth" /> }));

// BASIC: height, text and icons. 32px between two labels (16 + 16)
const basicSizes = {
  lg: "h-10 px-4 text-subtitle [&_svg]:size-[18px]",
  md: "h-9 px-4 text-body [&_svg]:size-4",
  sm: "h-6 px-4 text-caption [&_svg]:size-3.5",
};

// CONTAINER: Default 42px (padding 16) | Small 38px (padding 12) | Regular/Subtitle | 4px between tabs
const containerSizes = {
  default: { box: "h-[42px] text-subtitle", left: "pl-4", right: "pr-4", rightClosable: "pr-2", close: "pr-4" },
  small: { box: "h-[38px] text-subtitle", left: "pl-3", right: "pr-3", rightClosable: "pr-2", close: "pr-3" },
};

/* ───────── Shared base: tab list, keyboard, closing, content ───────── */

function TabBase({
  variant,
  items = defaultItems,
  value,
  defaultValue,
  onChange,
  align = "start",
  size = "md",
  closable = false,
  bordered = false,
  onClose,
  className,
}: TabProps & { variant: "basic" | "container" }) {
  const [closed, setClosed] = useState<string[]>([]);
  const visible = items.filter((i) => !closed.includes(i.value));

  const [inner, setInner] = useState(defaultValue ?? items.find((i) => !i.disabled)?.value);
  const active = value ?? inner;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Unique ids: several Tabs can live on the same page
  const uid = useId();
  const tabId = (v: string) => `${uid}-tab-${v}`;
  const panelId = (v: string) => `${uid}-panel-${v}`;

  const select = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  // Close a tab. If it was active, move to the first remaining tab
  const close = (v: string) => {
    setClosed((c) => [...c, v]);
    onClose?.(v);
    if (v === active) {
      const next = visible.find((i) => i.value !== v && !i.disabled);
      if (next) select(next.value);
    }
  };

  // Left and right arrows: next enabled tab (disabled tabs are skipped)
  const onKeyDown = (e: React.KeyboardEvent, from: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();

    const total = visible.length;
    for (let n = 1; n < total; n++) {
      const next = visible[(((from + step * n) % total) + total) % total];
      if (!next.disabled) {
        refs.current[next.value]?.focus();
        select(next.value);
        return;
      }
    }
  };

  const panel = visible.find((i) => i.value === active)?.content;
  const basic = variant === "basic";
  const c = containerSizes[size === "sm" ? "small" : "default"];

  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          align === "start" ? "flex w-fit" : "flex w-full",
          // Basic: gray line under the list | Container: 4px between cards
          basic ? "border-b border-neutral-200" : "gap-1"
        )}
      >
        {visible.map((item, i) => {
          const on = item.value === active;
          const ref = (el: HTMLButtonElement | null) => {
            refs.current[item.value] = el;
          };
          const tabProps = {
            id: tabId(item.value),
            type: "button" as const,
            role: "tab" as const,
            "aria-selected": on,
            "aria-controls": on && panel !== undefined ? panelId(item.value) : undefined,
            tabIndex: on ? 0 : -1,
            disabled: item.disabled,
            onClick: () => select(item.value),
            onKeyDown: (e: React.KeyboardEvent) => onKeyDown(e, i),
          };

          /* ─── BASIC: text with a teal underline under the active tab ─── */
          if (basic) {
            return (
              <button
                key={item.value}
                ref={ref}
                {...tabProps}
                className={cn(
                  "-mb-px flex items-center justify-center whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                  "enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default",
                  basicSizes[size],
                  align === "stretch" && "flex-1",
                  // Active: teal | default: gray | hover: light teal | press: dark teal | disabled: very light gray
                  on ? "text-brand" : "text-neutral-600 enabled:hover:text-brand-hover enabled:active:text-brand-pressed disabled:text-neutral-400"
                )}
              >
                {/* 8px icon-text. The underline only spans icon and text */}
                <span className="relative flex h-full items-center gap-2">
                  {item.icon}
                  {item.label}
                  {on && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
                </span>
              </button>
            );
          }

          /* ─── CONTAINER: one white card per tab, with a cross when "closable" ─── */
          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center whitespace-nowrap bg-white transition-colors [&_svg]:size-4",
                c.box,
                align === "stretch" && "flex-1",
                bordered && "border border-neutral-200",
                // Active: teal | default: gray | hover: light teal | press: dark teal | disabled: very light gray
                item.disabled
                  ? "cursor-default text-neutral-400"
                  : cn("hover:cursor-pointer active:cursor-default", on ? "text-brand" : "text-neutral-600 hover:text-brand-hover active:text-brand-pressed")
              )}
            >
              <button
                ref={ref}
                {...tabProps}
                className={cn(
                  "flex h-full flex-1 items-center justify-center gap-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                  c.left,
                  closable ? c.rightClosable : c.right
                )}
              >
                {item.icon}
                {item.label}
              </button>

              {/* Cross: gray, even on the active or hovered tab */}
              {closable && (
                <button
                  type="button"
                  aria-label="Close tab"
                  disabled={item.disabled}
                  onClick={() => close(item.value)}
                  className={cn(
                    "flex h-full items-center pl-1 text-neutral-500 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                    "enabled:hover:cursor-pointer enabled:active:cursor-default disabled:cursor-default disabled:text-neutral-400",
                    c.close
                  )}
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active tab content */}
      {panel !== undefined && (
        <div role="tabpanel" id={panelId(active!)} aria-labelledby={tabId(active!)} className="pt-4 text-body text-neutral-600">
          {panel}
        </div>
      )}
    </div>
  );
}

/* ───────── Variants ───────── */

/** Basic, text only: "Tab" */
export const TabBasic = (props: TabProps) => <TabBase variant="basic" {...props} />;

/** Basic with an icon before each tab (globe by default) */
export const TabBasicIcon = ({ items = defaultIconItems, ...props }: TabProps) => (
  <TabBase variant="basic" items={items} {...props} />
);

/** Basic, small (24px) */
export const TabBasicSmall = (props: TabProps) => <TabBase variant="basic" size="sm" {...props} />;

/** Container: one white card per tab */
export const TabContainer = (props: TabProps) => <TabBase variant="container" {...props} />;

/** Container with a cross to close each tab */
export const TabContainerClosable = (props: TabProps) => <TabBase variant="container" closable {...props} />;

/** Container with a border around each tab */
export const TabContainerBordered = (props: TabProps) => <TabBase variant="container" bordered {...props} />;

/** Container, Small (38px) */
export const TabContainerSmall = (props: TabProps) => <TabBase variant="container" size="sm" {...props} />;