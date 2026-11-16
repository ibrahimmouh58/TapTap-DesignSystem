"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "../../icons/Icon";
import { Button, IconButton } from "../../components/general/Button";
import { Select, SelectWithoutOutline } from "../../components/data-entry/Select";
import { RangePicker } from "../../components/data-entry/RangePicker";
import { Label } from "../../components/data-entry/Form";
import { TabBasic } from "../../components/navigation/Tabs";
import { PaginationListBasic } from "../../components/navigation/Pagination";
import { Table, type TableColumn } from "../../components/data-display/Table";
import { AuditStatus, type AuditStatusState } from "../../components/feedback/AuditStatus";
import { Card } from "../Card";

type Status = "approved" | "installed" | "wishlist" | "cancel";

type Result = {
  id: string;
  name: string;
  /** "game": square icon | "person": round avatar | "text": no picture */
  kind: "game" | "person" | "text";
  info: string;
  related?: string;
  status?: Status;
  time: string;
  views: number;
};

const results: Result[] = [
  { id: "1", name: "Human: Fall Flat", kind: "game", info: "Multiplayer Adventure", related: "999+", status: "approved", time: "21-07-01 00:00:00", views: 798 },
  { id: "2", name: "Gemini", kind: "game", info: "Top-rate Games", related: "30", status: "installed", time: "21-06-01 10:00:00", views: 67231 },
  { id: "3", name: "Sausage Man", kind: "game", info: "Sausage Man is a battle royale game", related: "30", status: "wishlist", time: "20-08-01 10:00:00", views: 12233 },
  { id: "4", name: "Lilelia: Idle Adventure", kind: "game", info: "Tuber Recommend", related: "30", status: "approved", time: "19-07-01 11:30:00", views: 123 },
  { id: "5", name: "To the Moon", kind: "game", info: "Best Music and Narrative of 2017", related: "89", status: "cancel", time: "19-07-01 11:30:00", views: 91 },
  { id: "6", name: "Muse Dash", kind: "game", info: "Vivamus in purus ex", related: "23", status: "wishlist", time: "18-06-18 12:03:23", views: 3451 },
  { id: "7", name: "Juicy Realm", kind: "game", info: "Lorem ipsum dolor sit amet", related: "20", status: "approved", time: "21-06-18 12:03:23", views: 85 },
  { id: "8", name: "Carto", kind: "game", info: "World-shifting puzzle mechanic", time: "21-06-18 12:03:23", views: 798 },
  { id: "9", name: "Mona Fernandez", kind: "person", info: "Capturing a generational opportunity", related: "39", status: "approved", time: "21-06-01 10:00:00", views: 67231 },
  { id: "10", name: "Panzu", kind: "person", info: "TapTap Editor's Choice", related: "4", status: "wishlist", time: "21-07-01 11:30:00", views: 12233 },
  { id: "11", name: "Daniel Zhang", kind: "person", info: "Gemini - A Journey of Two Stars", related: "3", status: "installed", time: "21-06-18 12:03:23", views: 123 },
  { id: "12", name: "8-BIT", kind: "person", info: "Human: Fall Flat is a quirky open-ended game", related: "4", status: "installed", time: "21-07-01 11:30:00", views: 91 },
  { id: "13", name: "Mathew Bauthier", kind: "person", info: "Top Releases of October 2021", time: "21-06-18 12:03:23", views: 3451 },
  { id: "14", name: "PUBG and Fortnite Like", kind: "text", info: "Sausage Man SS2 is coming soon", time: "21-06-01 10:00:00", views: 85 },
  { id: "15", name: "Independent Game", kind: "text", info: "Human: Fall Flat is a quirky open-ended game", time: "21-06-01 10:00:00", views: 798 },
  { id: "16", name: "ICEY is Landing", kind: "text", info: "Tuber Recommend", time: "21-06-01 10:00:00", views: 67231 },
  { id: "17", name: "TapTap Editor's Choice", kind: "text", info: "Designed for everyone", time: "20-07-01 11:30:00", views: 12233 },
  { id: "18", name: "Tower Defence", kind: "text", info: "Indie Prize Showcase Official Selection", time: "21-06-18 12:03:23", views: 123 },
  { id: "19", name: "Simulation Game", kind: "text", info: "Management simulation", time: "20-07-01 11:30:00", views: 91 },
  { id: "20", name: "Top-rate Games", kind: "text", info: "Independent Game Collection", time: "20-08-18 12:03:23", views: 3451 },
];

// Our statuses mapped to the AuditStatus states and labels
const statuses: Record<Status, { state: AuditStatusState; label: string }> = {
  approved: { state: "approved", label: "Approved" },
  installed: { state: "currentVersion", label: "Installed" },
  wishlist: { state: "underReview", label: "Wishlist" },
  cancel: { state: "cancel", label: "Cancel" },
};

const tabs = [
  { value: "all", label: "All 2,130" },
  { value: "article", label: "Article 85" },
  { value: "people", label: "People 63" },
  { value: "game", label: "Game 25" },
  { value: "news", label: "News 21" },
];

const sorts = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "views", label: "Most viewed" },
];

const types = [
  { value: "article", label: "Article" },
  { value: "people", label: "People" },
  { value: "game", label: "Game" },
  { value: "news", label: "News" },
];

const empty = <span className="text-neutral-400">-</span>;

/* ───────── Table cells ───────── */

// Game: square icon | person: round avatar | text: nothing
function Thumb({ kind }: { kind: Result["kind"] }) {
  if (kind === "text") return null;
  return (
    <span className={kind === "game" ? "flex size-6 shrink-0 items-center justify-center rounded bg-primary-100 text-brand" : "flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500"}>
      <Icon name={kind === "game" ? "image" : "user"} size={14} />
    </span>
  );
}

function Related({ count }: { count?: string }) {
  if (!count) return empty;
  return (
    <span className="flex items-center gap-3">
      <span className="flex -space-x-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 ring-2 ring-white">
            <Icon name="user" size={12} />
          </span>
        ))}
      </span>
      <span className="text-neutral-600">{count}</span>
    </span>
  );
}

const columns: TableColumn<Result>[] = [
  {
    key: "name",
    title: "Name",
    width: 200,
    filter: true,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (r) => (
      <a href="#" className="flex min-w-0 items-center gap-2 text-brand hover:text-brand-hover">
        <Thumb kind={r.kind} />
        <span className="truncate">{r.name}</span>
      </a>
    ),
  },
  { key: "info", title: "Info", width: 220, render: (r) => <span className="block truncate" title={r.info}>{r.info}</span> },
  { key: "related", title: "Related", width: 140, render: (r) => <Related count={r.related} /> },
  {
    key: "status",
    title: "Status",
    width: 130,
    render: (r) => (r.status ? <AuditStatus state={statuses[r.status].state} className="text-caption">{statuses[r.status].label}</AuditStatus> : empty),
  },
  { key: "time", title: "Time", width: 150, render: (r) => r.time || empty },
  { key: "views", title: "Views", width: 90, align: "right", help: "Number of views", render: (r) => r.views.toLocaleString("en-US") },
  {
    key: "action",
    title: "Action",
    width: 80,
    render: (r) => (
      <span className="flex items-center gap-1">
        <IconButton label={`Edit ${r.name}`} size="iconSm"><Icon name="edit" /></IconButton>
        <IconButton label={`More actions for ${r.name}`} size="iconSm"><Icon name="more-vertical" /></IconButton>
      </span>
    ),
  },
];


function SearchResults() {
  const query = useSearchParams().get("q") ?? "";

  return (
    <>
      <div className="-mx-4 -mt-4 bg-white px-4 pt-4">
        <h1 className="text-title font-medium text-neutral-700">
          Search Result
          {query && <span className="ml-2 text-body font-normal text-neutral-400"></span>}
        </h1>
        <TabBasic items={tabs} size="md" className="mt-2" />
      </div>

      <Card className="flex items-center gap-6 px-6 py-8">
        <label className="flex items-center gap-2 text-body text-neutral-600">
          <Label as="span" help="Kind of result" className="w-auto">Type</Label>
          <Select size="md" placeholder="Select" options={types} className="w-[240px]" />
        </label>
        <div className="flex items-center gap-2 text-body text-neutral-600">
          Time Range
          <RangePicker />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="md">Reset</Button>
          <Button size="md">Search</Button>
          <Button variant="link" size="md" rightIcon={<Icon name="down" />}>Expand</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-title font-medium text-neutral-700">Search Table</h2>
          <div className="ml-auto flex items-center gap-2">
            <SelectWithoutOutline size="md" options={sorts} defaultValue="default" aria-label="Sort by" />
            <Select size="md" className="w-[180px]" aria-label="Filter" />
            <IconButton label="Pick a date" size="iconSm"><Icon name="calendar" /></IconButton>
            <IconButton label="Refresh" size="iconSm"><Icon name="refresh" /></IconButton>
            <IconButton label="Table settings" size="iconSm"><Icon name="setting" /></IconButton>
          </div>
        </div>

        <Table columns={columns} data={results} rowKey={(r) => r.id} selectable size="sm" />

        <PaginationListBasic total={2130} pageSize={20} defaultCurrent={2} className="mt-4" />
      </Card>
    </>
  );
}

/** Search results page: /game-center/search?q=context */
export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}