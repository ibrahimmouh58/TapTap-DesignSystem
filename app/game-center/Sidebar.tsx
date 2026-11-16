"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Icon, type IconName } from "../icons/Icon";

type MenuItem = { label: string; href?: string; icon?: IconName; children?: MenuItem[] };

const menu: MenuItem[] = [
  { label: "Activity", href: "/game-center/activity", icon: "time" },
  { label: "Data Analysis", href: "/game-center", icon: "bar-chart" },
  {
    label: "Games",
    icon: "image",
    children: [
      { label: "New Arrivals", href: "/game-center/new-arrivals" },
      { label: "Categories", href: "/game-center/categories" },
    ],
  },
  { label: "Community", href: "/game-center/community", icon: "user" },
];

const itemClass = (on: boolean) =>
  cn(
    "flex h-10 w-full items-center gap-2 rounded px-3 text-left text-body transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
    on ? "bg-brand-soft text-brand" : "text-neutral-600 hover:bg-neutral-100"
  );

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const link = (item: MenuItem, indent = false) => (
    <Link
      key={item.label}
      href={item.href!}
      aria-current={pathname === item.href ? "page" : undefined}
      className={cn(itemClass(pathname === item.href), indent && "pl-9")}
    >
      {item.icon && <Icon name={item.icon} />}
      {item.label}
    </Link>
  );

  return (
    <nav aria-label="Main" className="w-[220px] shrink-0 border-r border-neutral-200 bg-white p-2">
      {menu.map((item) =>
        item.children ? (
          <div key={item.label}>
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={itemClass(false)}>
              {item.icon && <Icon name={item.icon} />}
              <span className="flex-1">{item.label}</span>
              <Icon name={open ? "up" : "down"} size={12} />
            </button>
            {open && item.children.map((child) => link(child, true))}
          </div>
        ) : (
          link(item)
        )
      )}
    </nav>
  );
}