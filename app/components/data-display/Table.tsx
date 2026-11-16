"use client";

import { Fragment, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "../../icons/Icon";
import { Checkbox } from "../data-entry/Checkbox";
import { AuditStatus, type AuditStatusState } from "../feedback/AuditStatus";
import { TagColorful } from "./Tag";

type Align = "left" | "middle" | "right";

const aligns: Record<Align, string> = {
  left: "justify-start text-left",
  middle: "justify-center text-center",
  right: "justify-end text-right",
};

// Icon button: gray, light teal on hover, dark teal on press
const iconBtn =
  "flex text-neutral-400 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// Teal link (Edit, More, Reset)
const link =
  "text-brand transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default active:text-brand-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/* ═══════════════════════════════════════════════════════════
   TABLE: the base component, a grid described by `columns`.
   md: header 44, rows 48 min, Body | sm: header 36, rows 36 min, Caption
   ═══════════════════════════════════════════════════════════ */

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  /** px number or CSS width (default "1fr"). A `fixed` column needs a px width */
  width?: number | string;
  align?: Align;
  /** Cell content. Defaults to `row[key]` */
  render?: (row: T, index: number) => ReactNode;
  /** Help icon in the header (text shows on hover) */
  help?: string;
  /** Filter icon in the header */
  filter?: boolean;
  /** Sort icon in the header */
  sortable?: boolean;
  /** Compare function: sorting is then automatic */
  sorter?: (a: T, b: T) => number;
  /** Column stuck to the left while scrolling horizontally */
  fixed?: boolean;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Unique row id */
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  /** Checkbox column */
  selectable?: boolean;
  /** Checked rows (controlled) */
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  /** Expanded row content. Adds a chevron column */
  renderExpanded?: (row: T) => ReactNode;
  defaultExpanded?: string[];
  /** Footer row ("Total"), one value per column key */
  footer?: Record<string, ReactNode>;
  /** Max height: header and footer stay, rows scroll */
  maxHeight?: number;
  /** Vertical separators between columns */
  divider?: boolean;
  size?: "md" | "sm";
  onSort?: (sort: { key: string; dir: "asc" | "desc" } | null) => void;
  /** Called by a column's filter icon */
  onFilter?: (key: string) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  selectable = false,
  selected,
  defaultSelected = [],
  onSelectedChange,
  renderExpanded,
  defaultExpanded = [],
  footer,
  maxHeight,
  divider = false,
  size = "md",
  onSort,
  onFilter,
  className,
}: TableProps<T>) {
  const [innerSel, setInnerSel] = useState<string[]>(defaultSelected);
  const sel = selected ?? innerSel;
  const [open, setOpen] = useState<string[]>(defaultExpanded);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const pick = (next: string[]) => {
    if (selected === undefined) setInnerSel(next);
    onSelectedChange?.(next);
  };

  // Sort cycle: none, ascending, descending
  const toggleSort = (key: string) => {
    const next = sort?.key !== key ? { key, dir: "asc" as const } : sort.dir === "asc" ? { key, dir: "desc" as const } : null;
    setSort(next);
    onSort?.(next);
  };
  const sortCol = columns.find((c) => c.key === sort?.key);
  const rows = sort && sortCol?.sorter ? [...data].sort((a, b) => sortCol.sorter!(a, b) * (sort.dir === "asc" ? 1 : -1)) : data;

  const keys = rows.map(rowKey);
  const allOn = keys.length > 0 && keys.every((k) => sel.includes(k));
  const someOn = keys.some((k) => sel.includes(k));

  // Lead columns: checkboxes (52px) and chevrons (48px)
  const leads = [selectable && "select", renderExpanded && "expand"].filter(Boolean) as ("select" | "expand")[];
  const leadW = leads.map((k) => (k === "select" ? 52 : 48));
  const leadSum = leadW.reduce((a, w) => a + w, 0);

  const colWidth = (c: TableColumn<T>) => (typeof c.width === "number" ? `${c.width}px` : (c.width ?? "1fr"));
  const template = [...leadW.map((w) => `${w}px`), ...columns.map(colWidth)].join(" ");
  const minWidth = leadSum + columns.reduce((a, c) => a + (typeof c.width === "number" ? c.width : 120), 0);

  // Fixed columns: left offset, shadow on the last one
  const anyFixed = columns.some((c) => c.fixed);
  const lastFixed = columns.map((c) => !!c.fixed).lastIndexOf(true);
  const fixedLeft = (idx: number) =>
    leadSum + columns.slice(0, idx).filter((c) => c.fixed).reduce((a, c) => a + (typeof c.width === "number" ? c.width : 0), 0);

  const headPad = size === "md" ? "h-11" : "h-9";
  const rowPad = size === "md" ? "min-h-12 py-2" : "min-h-9 py-1.5";

  const cell = (c: TableColumn<T>, idx: number, bg: string, content: ReactNode, role: string, pad: string) => (
    <div
      key={c.key}
      role={role}
      style={c.fixed ? { left: fixedLeft(idx) } : undefined}
      className={cn(
        "flex min-w-0 items-center px-4",
        pad,
        aligns[c.align ?? "left"],
        divider && idx < columns.length - 1 && "border-r border-neutral-200",
        c.fixed && cn("sticky z-10", bg, idx === lastFixed && "shadow-elevation-2 [clip-path:inset(0_-12px_0_0)]")
      )}
    >
      {content}
    </div>
  );

  const leadCell = (i: number, bg: string, content: ReactNode, role: string, pad: string) => (
    <div
      key={`lead-${i}`}
      role={role}
      style={anyFixed ? { left: leadW.slice(0, i).reduce((a, w) => a + w, 0) } : undefined}
      className={cn("flex items-center justify-center", pad, anyFixed && cn("sticky z-10", bg))}
    >
      {content}
    </div>
  );

  return (
    <div className={cn("overflow-auto", className)} style={maxHeight ? { maxHeight } : undefined}>
      <div role="table" className={cn("text-neutral-600", size === "md" ? "text-body" : "text-caption")} style={{ minWidth }}>
        <div
          role="row"
          className={cn("grid bg-neutral-50", maxHeight && "sticky top-0 z-20")}
          style={{ gridTemplateColumns: template }}
        >
          {leads.map((kind, li) =>
            leadCell(
              li,
              "bg-neutral-50",
              kind === "select" ? (
                <Checkbox
                  checked={allOn}
                  indeterminate={someOn && !allOn}
                  onChange={(on) => pick(on ? [...new Set([...sel, ...keys])] : sel.filter((k) => !keys.includes(k)))}
                >
                  <span className="sr-only">Select all</span>
                </Checkbox>
              ) : null,
              "columnheader",
              headPad
            )
          )}

          {columns.map((c, idx) => {
            const showSort = c.sortable || !!c.sorter;
            const label = typeof c.title === "string" ? c.title : c.key;
            return cell(
              c,
              idx,
              "bg-neutral-50",
              <div className="flex items-center gap-1 font-medium text-neutral-600">
                <span>{c.title}</span>
                {c.help && (
                  <span title={c.help} className="flex text-neutral-400">
                    <Icon name="help" size={14} label={c.help} />
                  </span>
                )}
                {c.filter && (
                  <button type="button" aria-label={`Filter ${label}`} onClick={() => onFilter?.(c.key)} className={iconBtn}>
                    <Icon name="filter" variant="filled" size={14} />
                  </button>
                )}
                {showSort && (
                  <button
                    type="button"
                    aria-label={`Sort ${label}`}
                    onClick={() => toggleSort(c.key)}
                    className={cn(iconBtn, sort?.key === c.key && "text-brand")}
                  >
                    <Icon name="sort" size={14} />
                  </button>
                )}
              </div>,
              "columnheader",
              headPad
            );
          })}
        </div>

        {/* Rows: very light gray on hover */}
        {rows.map((row, i) => {
          const k = rowKey(row, i);
          const isOpen = open.includes(k);
          const bg = "bg-white group-hover:bg-neutral-100";

          return (
            <div key={k} role="rowgroup">
              <div
                role="row"
                aria-selected={selectable ? sel.includes(k) : undefined}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "group grid border-b border-neutral-200 bg-white transition-colors hover:bg-neutral-100",
                  onRowClick && "hover:cursor-pointer active:cursor-default"
                )}
                style={{ gridTemplateColumns: template }}
              >
                {leads.map((kind, li) =>
                  leadCell(
                    li,
                    bg,
                    kind === "select" ? (
                      <span onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={sel.includes(k)} onChange={(on) => pick(on ? [...sel, k] : sel.filter((x) => x !== k))}>
                          <span className="sr-only">Select row</span>
                        </Checkbox>
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={isOpen ? "Collapse row" : "Expand row"}
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(isOpen ? open.filter((x) => x !== k) : [...open, k]);
                        }}
                        className="flex text-neutral-500 transition-colors hover:cursor-pointer hover:text-brand-hover active:cursor-default focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <Icon name={isOpen ? "down" : "right"} size={16} />
                      </button>
                    ),
                    "cell",
                    rowPad
                  )
                )}

                {columns.map((c, idx) =>
                  cell(
                    c,
                    idx,
                    bg,
                    c.render ? c.render(row, i) : <span className="truncate">{(row as unknown as Record<string, ReactNode>)[c.key]}</span>,
                    "cell",
                    rowPad
                  )
                )}
              </div>

              {/* Expanded row, aligned with the first column */}
              {renderExpanded && isOpen && (
                <div className="border-b border-neutral-200 bg-neutral-50 py-4 pr-4" style={{ paddingLeft: leadSum + 16 }}>
                  {renderExpanded(row)}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer: "Total" */}
        {footer && (
          <div
            role="row"
            className={cn("grid bg-neutral-50 font-medium", maxHeight && "sticky bottom-0 z-20")}
            style={{ gridTemplateColumns: template }}
          >
            {leads.map((_, li) => leadCell(li, "bg-neutral-50", null, "cell", headPad))}
            {columns.map((c, idx) => cell(c, idx, "bg-neutral-50", footer[c.key], "cell", headPad))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. TABLE SIMPLE: avatar and name, title, email, role tag, actions
   ═══════════════════════════════════════════════════════════ */

interface Person {
  name: string;
  title: string;
  email: string;
  role: "Admin" | "Collaborator" | "Editor";
}

const people: Person[] = [
  { name: "Casey Jimenez", title: "Regional Paradigm Technician", email: "jessica.hanson@example.com", role: "Admin" },
  { name: "Sheri Warner", title: "Product Directives Officer", email: "curtis.weaver@example.com", role: "Collaborator" },
  { name: "Mona Fernandez", title: "Forward Response Developer", email: "debra.holt@example.com", role: "Collaborator" },
  { name: "Ted Horton", title: "Central Security Manager", email: "jackson.graham@example.com", role: "Editor" },
  { name: "Scott Rios", title: "Lead Implementation Liaison", email: "deanna.curtis@example.com", role: "Editor" },
  { name: "Emily Frank", title: "Internal Applications Engineer", email: "kenzi.lawson@example.com", role: "Admin" },
];

const roleColors: Record<Person["role"], string> = {
  Admin: "var(--color-success-600)",
  Collaborator: "var(--color-auxiliary-700)",
  Editor: "var(--color-info-600)",
};

const simpleColumns: TableColumn<Person>[] = [
  {
    key: "name",
    title: "Name",
    width: "1.2fr",
    render: (p) => (
      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-300 text-white">
          <Icon name="user" variant="filled" size={14} />
        </span>
        <span className="truncate">{p.name}</span>
      </span>
    ),
  },
  { key: "title", title: "Title", width: "1.6fr" },
  { key: "email", title: "Email", width: "1.6fr" },
  { key: "role", title: "Role", width: "1fr", render: (p) => <TagColorful variant="light" color={roleColors[p.role]}>{p.role}</TagColorful> },
  {
    key: "action",
    title: "",
    width: 88,
    align: "right",
    render: (p) => (
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`Edit ${p.name}`} onClick={(e) => e.stopPropagation()} className={iconBtn}>
          <Icon name="edit" size={16} />
        </button>
        <button type="button" aria-label={`More actions for ${p.name}`} onClick={(e) => e.stopPropagation()} className={iconBtn}>
          <Icon name="more-vertical" size={16} />
        </button>
      </span>
    ),
  },
];

export function TableSimple({ className }: { className?: string }) {
  return <Table className={cn("w-[960px] max-w-full", className)} columns={simpleColumns} data={people} rowKey={(p) => p.email} />;
}

/* ═══════════════════════════════════════════════════════════
   2. TABLE MULTI-SELECT: checkboxes, "select all", sortable columns
   ═══════════════════════════════════════════════════════════ */

interface Contract {
  id: string;
  name: string;
  type: string;
  owner: string;
  start: string;
  end: string;
}

const contracts: Contract[] = (
  [
    ["1001", "IBM Corporate", "Executed Agreement", "Courtney Henry", "06/19/2020", "06/19/2021"],
    ["1002", "TEK Systems", "Executed Agreement", "Wade Warren", "07/18/2020", "07/18/2021"],
    ["1003", "HSHS Medical Group", "Order Form", "Eleanor Pena", "07/30/2020", "07/30/2021"],
    ["1004", "Hiretual", "Executed Agreement", "Jerome Bell", "09/10/2020", "09/10/2021"],
    ["1005", "Innovatemap", "Executed Agreement", "Cody Fisher", "10/19/2020", "10/19/2021"],
    ["1006", "Concurrency Inc.", "Executed Agreement", "Bessie Cooper", "11/21/2020", "11/21/2021"],
  ] as const
).map(([id, name, type, owner, start, end]) => ({ id, name, type, owner, start, end }));

const byDate = (key: "start" | "end") => (a: Contract, b: Contract) => +new Date(a[key]) - +new Date(b[key]);

const contractColumns: TableColumn<Contract>[] = [
  { key: "id", title: "ID", width: 100, sorter: (a, b) => +a.id - +b.id },
  { key: "name", title: "Name", width: "1.2fr", render: (c) => <span className="truncate text-brand">{c.name}</span> },
  { key: "type", title: "Contract Type", width: "1.2fr" },
  { key: "owner", title: "Contract Owner", width: "1.2fr" },
  { key: "start", title: "Start Date", width: "1.2fr", sorter: byDate("start") },
  { key: "end", title: "Termination Date", width: "1.2fr", sorter: byDate("end") },
];

export function TableMultiSelect({ className }: { className?: string }) {
  return (
    <Table
      className={cn("w-[1000px] max-w-full", className)}
      columns={contractColumns}
      data={contracts}
      rowKey={(c) => c.id}
      selectable
      defaultSelected={["1002", "1003", "1005"]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   3. TABLE EXPANDABLE ROW: a chevron opens a details row
   ═══════════════════════════════════════════════════════════ */

interface Server {
  name: string;
  location: string;
  type: string;
  status: "In Progress" | "Cancel" | "Success";
  account: string;
  distinct: string;
}

const servers: Server[] = [
  { name: "Dallas-03", location: "DAL03", type: "Connect", status: "In Progress", account: "bd5400bb-386c-4289-a2e5-77daaf5b9c01", distinct: "channel" },
  { name: "Dallas-01", location: "DAL01", type: "Exchange", status: "In Progress", account: "5e3b3e7d-43f8-4240-8a10-c9843325", distinct: "first_pay_level" },
  { name: "Sydney-01", location: "SYD01", type: "Connect", status: "Cancel", account: "f355d7dc-cea8-4520-a65f-b3964a0d1c22", distinct: "role_create" },
  { name: "Dallas-09", location: "DAL09", type: "Connect", status: "Success", account: "4f34b84d-53c2-4a9e-8402-5c391e32b2c4", distinct: "account_login" },
  { name: "Sydney-06", location: "SYD06", type: "Connect", status: "Success", account: "537e1ca0-4619-4651-b57f-dcdc", distinct: "app_end" },
  { name: "Sydney-03", location: "SYD03", type: "Exchange", status: "Cancel", account: "b95a3381-370a-46b8-bc26-2cd86c9", distinct: "mobile_type" },
];

const statusIcons: Record<Server["status"], [IconName, string]> = {
  "In Progress": ["time", "text-warning-600"],
  Cancel: ["error", "text-neutral-400"],
  Success: ["success", "text-success-600"],
};

const serverColumns: TableColumn<Server>[] = [
  { key: "name", title: "Name", width: 170 },
  { key: "location", title: "Location", width: 200 },
  { key: "type", title: "Type", width: 170 },
  {
    key: "status",
    title: "Status",
    width: 220,
    render: (s) => {
      const [icon, color] = statusIcons[s.status];
      return (
        <span className="flex items-center gap-2">
          <Icon name={icon} variant="filled" size={16} className={color} />
          {s.status}
        </span>
      );
    },
  },
  // Truncated with "…"; the full id shows on hover (native tooltip)
  { key: "account", title: "Account ID", width: 330, render: (s) => <span title={s.account} className="truncate">{s.account}</span> },
  { key: "distinct", title: "Distinct ID", width: "1fr" },
];

export function TableExpandableRow({ className }: { className?: string }) {
  return (
    <Table
      className={cn("w-[1100px] max-w-full", className)}
      columns={serverColumns}
      data={servers}
      rowKey={(s) => s.name}
      defaultExpanded={["Dallas-03"]}
      renderExpanded={() => (
        <dl className="grid grid-cols-[170px_1fr] gap-y-2.5">
          {[
            ["Date created", "Mon,15 Jul 2020 17:52:57 GMT"],
            ["User IP address", "10.123.12/30"],
            ["Router", "ZCV-DRK-TZ-03"],
          ].map(([label, value]) => (
            <Fragment key={label}>
              <dt className="font-medium text-neutral-600">{label}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   4. TABLE FIXED COLUMNS: "Game" and "Action" stay on the left while scrolling
   ═══════════════════════════════════════════════════════════ */

interface Game {
  color: string;
  address: string;
  email: string;
  download: string;
  testing: string;
  days: string;
  testers: string;
  update: string;
}

const games: Game[] = (
  [
    ["bg-warning-500", "2418 Elm Rd. Santa Ana", "bill.sanders@example.com", "3,451", "21-07-01 00:00:00", "30 days", "6,730", "2021-07-12"],
    ["bg-danger-500", "73 Cedar Cir. Shiloh", "tanya.hill@example.com", "798", "21-07-01 12:03:23", "27 days", "2,330", "2021-07-01"],
    ["bg-info-500", "910 Oak Rd. Allentown", "felicia.reid@example.com", "67,231", "21-06-01 10:00:00", "20 days", "1,998", "2021-06-28"],
    ["bg-success-500", "55 Pine Ave. Manchester", "nathan.roberts@example.com", "12,233", "21-07-01 11:30:00", "18 days", "2,330", "2021-08-04"],
    ["bg-danger-600", "302 Birch St. San Jose", "debra.holt@example.com", "123", "21-08-06 10:00:00", "10 days", "7,792", "2021-07-02"],
    ["bg-auxiliary-600", "18 Maple Rd. Inglewood", "jessica.hanson@example.com", "91", "21-06-18 12:03:23", "6 days", "9,000", "2021-09-12"],
  ] as const
).map(([color, address, email, download, testing, days, testers, update]) => ({ color, address, email, download, testing, days, testers, update }));

const gameColumns: TableColumn<Game>[] = [
  {
    key: "game",
    title: "Game",
    width: 160,
    fixed: true,
    filter: true,
    sortable: true,
    render: (g) => (
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={cn("size-5 shrink-0 rounded", g.color)} />
        Game Name
      </span>
    ),
  },
  {
    key: "action",
    title: "Action",
    width: 100,
    fixed: true,
    render: () => (
      <span className="flex items-center gap-3">
        <button type="button" aria-label="Edit" onClick={(e) => e.stopPropagation()} className={iconBtn}>
          <Icon name="edit" size={14} />
        </button>
        <button type="button" aria-label="More actions" onClick={(e) => e.stopPropagation()} className={iconBtn}>
          <Icon name="more-vertical" size={14} />
        </button>
      </span>
    ),
  },
  { key: "address", title: "Address", width: 220 },
  { key: "email", title: "Email", width: 220 },
  { key: "download", title: "Download", width: 120, align: "right", help: "Number of downloads" },
  { key: "testing", title: "Testing time", width: 170 },
  { key: "days", title: "Days", width: 110, sortable: true },
  {
    key: "testers",
    title: "Number of testers",
    width: 170,
    align: "right",
    render: (g) => (
      <span>
        {g.testers} <span className="text-neutral-300">/ 10,000</span>
      </span>
    ),
  },
  { key: "update", title: "Update time", width: 130 },
];

export function TableFixedColumns({ className }: { className?: string }) {
  return <Table size="sm" className={cn("w-[760px] max-w-full", className)} columns={gameColumns} data={games} rowKey={(g) => g.email} />;
}

/* ═══════════════════════════════════════════════════════════
   5. TABLE DATA and 6. FIXED FOOTER: numbers, percentages, "Total" row
   ═══════════════════════════════════════════════════════════ */

interface Rating {
  label: string;
  dot: string;
  cells: readonly (readonly [string, string])[];
}

const dates = ["08-02", "08-03", "08-04", "08-05", "08-06", "08-07"];

const ratings: Rating[] = [
  { label: "Extremely high", dot: "bg-success-600", cells: [["253", "1.12%"], ["228", "1.03%"], ["238", "1.08%"], ["256", "1.16%"], ["259", "1.18%"], ["252", "1.14%"]] },
  { label: "High", dot: "bg-info-600", cells: [["870", "3.84%"], ["870", "4.28%"], ["932", "4.23%"], ["921", "4.18%"], ["918", "4.17%"], ["916", "4.15%"]] },
  { label: "Low", dot: "bg-danger-600", cells: [["11,152", "49.18%"], ["10,251", "46.40%"], ["10,155", "46.14%"], ["10,158", "46.11%"], ["10,143", "46.07%"], ["10,204", "46.28%"]] },
  { label: "Middle", dot: "bg-warning-600", cells: [["10,403", "45.87%"], ["10,670", "48.29%"], ["10,685", "48.55%"], ["10,694", "48.55%"], ["10,697", "48.59%"], ["10,678", "48.43%"]] },
];

const totals = ["22,678", "22,094", "22,010", "22,029", "22,017", "22,050"];

// "253 (1.12%)": number in dark gray, percentage in light gray
const NumPct = ({ n, p }: { n: string; p: string }) => (
  <span className="whitespace-nowrap">
    {n} <span className="ml-1 text-neutral-300">({p})</span>
  </span>
);

const ratingColumns: TableColumn<Rating>[] = [
  {
    key: "label",
    title: "Willingness rating",
    width: 190,
    sortable: true,
    render: (r) => (
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", r.dot)} />
        {r.label}
      </span>
    ),
  },
  ...dates.map((d, i) => ({
    key: d,
    title: d,
    align: "right" as const,
    sortable: true,
    render: (r: Rating) => <NumPct n={r.cells[i][0]} p={r.cells[i][1]} />,
  })),
];

const totalRow: Record<string, ReactNode> = {
  label: "Total",
  ...Object.fromEntries(dates.map((d, i) => [d, <NumPct key={d} n={totals[i]} p="100.00%" />])),
};

/** Data: rows, a "Total" row and pagination below */
export function TableData({ className }: { className?: string }) {
  return (
    <div className={cn("w-[1000px] max-w-full", className)}>
      <Table size="sm" columns={ratingColumns} data={ratings} rowKey={(r) => r.label} footer={totalRow} />

      <div className="flex items-center justify-between px-4 py-4 text-caption text-neutral-400">
        <span>1–5 of 5 items</span>
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <Icon name="left" size={14} className="text-neutral-300" />
          <span aria-current="page" className="flex h-6 min-w-6 items-center justify-center rounded bg-primary-100 text-brand">
            1
          </span>
          <Icon name="right" size={14} className="text-neutral-300" />
        </nav>
      </div>
    </div>
  );
}

// More rows than the table height: they scroll, header and "Total" stay
const manyRatings: Rating[] = [...ratings, ratings[3], ratings[3], ratings[3]];

/** Fixed Footer: header and "Total" stay, rows scroll in between */
export function TableFixedFooter({ className }: { className?: string }) {
  return (
    <Table
      size="sm"
      maxHeight={220}
      className={cn("w-[1000px] max-w-full", className)}
      columns={ratingColumns}
      data={manyRatings}
      rowKey={(r, i) => `${r.label}-${i}`}
      footer={totalRow}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   7. TABLE WITH DIVIDER: vertical separators, two-line cells, hidden password
   ═══════════════════════════════════════════════════════════ */

interface Account {
  id: string;
  name: string;
  email: string;
  status: AuditStatusState;
  from: string;
  to: string;
  views?: string;
  delta?: string;
}

const accounts: Account[] = [
  { id: "1001", name: "Jerome Bell", email: "alma.lawson@example.com", status: "approved", from: "21-07-01 00:00:00", to: "21-07-30 00:00:00", views: "6,123", delta: "421 (+22.50%)" },
  { id: "1002", name: "Guy Hawkins", email: "michael.mitc@example.com", status: "cancel", from: "21-06-10 10:00:00", to: "21-07-20 03:12:20", views: "3,183", delta: "1,389 (+30.00%)" },
  { id: "1003", name: "Cody Fisher", email: "debra.holt@example.com", status: "underReview", from: "21-07-01 12:00:00", to: "21-10-15 08:10:00" },
  { id: "1004", name: "Wade Warren", email: "nevaeh.simmons@example.com", status: "approved", from: "21-07-01 00:00:00", to: "21-07-30 00:00:00", views: "808", delta: "18 (+3.13%)" },
];

const statusLabels: Record<AuditStatusState, string> = {
  rejected: "Rejected",
  underReview: "Under Review",
  approved: "Approved",
  currentVersion: "Current Version",
  cancel: "Cancel",
};

const details = "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.";

// Hidden password with an eye to show it, and a "Reset" link below
function PasswordCell() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="flex items-center gap-1 rounded bg-neutral-100 px-1.5 text-caption text-neutral-500">
        {show ? "Pa55w0rd!2021" : "••••••••••••"}
        <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={(e) => (e.stopPropagation(), setShow(!show))} className={iconBtn}>
          <Icon name={show ? "show" : "hide"} size={12} />
        </button>
      </span>
      <button type="button" onClick={(e) => e.stopPropagation()} className={cn(link, "text-caption")}>
        Reset
      </button>
    </div>
  );
}

const Stack = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span className="flex flex-col">
    <span>{top}</span>
    <span className="text-caption text-neutral-400">{bottom}</span>
  </span>
);

const accountColumns: TableColumn<Account>[] = [
  { key: "id", title: "ID", width: 90, sortable: true },
  { key: "name", title: "Administration", width: 210, help: "Nom et email", render: (a) => <Stack top={a.name} bottom={a.email} /> },
  { key: "status", title: "Status", width: 150, render: (a) => <AuditStatus state={a.status}>{statusLabels[a.status]}</AuditStatus> },
  { key: "time", title: "Testing time", width: 190, render: (a) => <Stack top={a.from} bottom={a.to} /> },
  {
    key: "views",
    title: "Views",
    width: 150,
    align: "right",
    render: (a) => (a.views ? <span className="text-right"><span>{a.views}</span><br /><span className="text-caption text-neutral-400">{a.delta}</span></span> : "–"),
  },
  { key: "details", title: "Details", width: 290, render: () => <span className="line-clamp-2 text-caption">{details}</span> },
  { key: "password", title: "Password", width: 200, render: () => <PasswordCell /> },
  {
    key: "action",
    title: "Action",
    width: 120,
    render: () => (
      <span className="flex gap-3 text-caption">
        <button type="button" onClick={(e) => e.stopPropagation()} className={link}>Edit</button>
        <button type="button" onClick={(e) => e.stopPropagation()} className={link}>More</button>
      </span>
    ),
  },
];

export function TableWithDivider({ className }: { className?: string }) {
  return (
    <Table
      size="sm"
      divider
      selectable
      defaultSelected={["1002", "1003"]}
      className={cn("w-[1100px] max-w-full", className)}
      columns={accountColumns}
      data={accounts}
      rowKey={(a) => a.id}
    />
  );
}