"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../icons/Icon";

// general
import { Button, IconButton } from "../components/general/Button";
import { ButtonGroupBasic, ButtonGroupIcon } from "../components/general/ButtonGroup";
// data-entry
import { Input, InputBasic, InputLeftIcon, InputRightIcon, InputPrefix, InputSuffix, InputPrefixSuffix, InputNumber } from "../components/data-entry/Input";
import { TextAreaEmpty, TextAreaFilled } from "../components/data-entry/TextArea";
import { Select, SelectWithoutOutline, SelectWithoutOutlineIcon } from "../components/data-entry/Select";
import { DropdownMenu, DropdownMultiple } from "../components/data-entry/Dropdown";
import { CascaderBasic } from "../components/data-entry/CascaderBasic";
import { Checkbox } from "../components/data-entry/Checkbox";
import { Radio } from "../components/data-entry/Radio";
import { Toggle, ToggleWithText } from "../components/data-entry/Toggle";
import { Slider, SliderSingle } from "../components/data-entry/Slider";
import { UploadPicture32, UploadPicture11 } from "../components/data-entry/Upload";
import { DateTimePicker } from "../components/data-entry/DateTimePicker";
import { RangePicker } from "../components/data-entry/RangePicker";
import { Comparison } from "../components/data-entry/Comparison";
import { TransferSmall, TransferSmall64, TransferSmallSelected, TransferSmallDisabled, TransferSmallSearch, TransferSmallNoResult, TransferMedium, TransferMediumLimit } from "../components/data-entry/Transfer";
import { Form, LabelAlignTopLeft, LabelAlignTopRight } from "../components/data-entry/Form";
// data-display
import { BadgeSingleDigit, BadgeDoubleDigit, BadgeDot } from "../components/data-display/Badge";
import { TagBasic, TagColorful, TagCheckable, TagReview } from "../components/data-display/Tag";
import { Tooltip, TooltipTop, TooltipLeft, TooltipRight, TooltipBottom } from "../components/data-display/Tooltip";
import { PopoverSimple, PopoverClick, PopoverHover } from "../components/data-display/Popover";
import { FilterItemBasic, FilterItemWithDrag, FilterItemWithIcon } from "../components/data-display/FilterItem";
import { TableSimple, TableMultiSelect, TableExpandableRow, TableFixedColumns, TableData, TableFixedFooter, TableWithDivider } from "../components/data-display/Table";
import { TableCellHeaderTitle, TableCellHeaderCheckbox, TableCellSingle, TableCellDouble, TableCellRemark, TableCellPicture, TableCellAction, TableCellInput, TableCellCheckbox, TableCellPerson, TableCellStatus } from "../components/data-display/TableCell";
// feedback
import { Alert } from "../components/feedback/Alert";
import { Message } from "../components/feedback/Message";
import { ResultSuccess, ResultError, ResultWarning, ResultInfo } from "../components/feedback/Result";
import { AuditStatus } from "../components/feedback/AuditStatus";
import { DialogBasic, DialogWarning, DialogScrollable, DialogDivider } from "../components/feedback/Dialog";
import { DrawerBasic, DrawerWithCardsLeft, DrawerWithCardsRight } from "../components/feedback/Drawer";
import { PopConfirmBasic, PopConfirmWithInput } from "../components/feedback/PopConfirm";
// navigation
import { TabBasic, TabBasicIcon, TabBasicSmall, TabContainer, TabContainerClosable, TabContainerBordered, TabContainerSmall } from "../components/navigation/Tabs";
import { StepsBase, StepsBaseDescription, StepsVertical, StepsVerticalDescription } from "../components/navigation/Steps";
import { PaginationSimple, PaginationBasic, PaginationAdvanced, PaginationListBasic, PaginationListAdvanced } from "../components/navigation/Pagination";
import { Breadcrumb, BreadcrumbCollapsed } from "../components/navigation/Breadcrumb";
import { Anchor } from "../components/navigation/Anchor";
// charts
import { LineChartOneValue, LineChartMultipleValues } from "../components/charts/LineChart";
import { AreaChartOneValue, AreaChartMultipleValues } from "../components/charts/AreaChart";
import { ColumnChartOneValue, ColumnChartMultipleValues } from "../components/charts/ColumnChart";
import { StackedColumnChartBasic, StackedColumnChartPercent, StackedColumnChartGroup } from "../components/charts/StackedColumnChart";
import { PieChartBasic } from "../components/charts/PieChart";
import { DonutChartBasic } from "../components/charts/DonutChart";
import { LegendVerticalLine, LegendVerticalColumn, LegendVerticalDonut, LegendVerticalLineMultipage } from "../components/charts/LegendVertical";
import { LegendHorizontalLine, LegendHorizontalColumn, LegendHorizontalDonut, LegendHorizontalLineMultipage } from "../components/charts/LegendHorizontal";
import { ChartTooltip, ChartTooltipWithLine, ChartTooltipWithColumn } from "../components/charts/ChartTooltip";
import { IconGallery } from "../icons/IconGallery";

/* ═══════════════════════════════════════════════════════════
   REGISTRY: category → component → variants
   ═══════════════════════════════════════════════════════════ */

type Variant = { name: string; render: () => ReactNode };
type Entry = { id: string; name: string; description: string; wide?: boolean; variants: Variant[] };
type Category = { name: string; items: Entry[] };

const v = (name: string, render: () => ReactNode): Variant => ({ name, render });

// Overlays are closed by default: open them with a button
function DialogDemo({ kind }: { kind: "basic" | "warning" | "scrollable" | "divider" }) {
  const [open, setOpen] = useState(false);
  const Dialog = { basic: DialogBasic, warning: DialogWarning, scrollable: DialogScrollable, divider: DialogDivider }[kind];
  return (
    <>
      <Button variant="outline" size="md" onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function DrawerDemo({ kind }: { kind: "basic" | "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const props = { open, onClose: () => setOpen(false) };
  return (
    <>
      <Button variant="outline" size="md" onClick={() => setOpen(true)}>Open drawer</Button>
      {kind === "basic" && <DrawerBasic size="xs" {...props}><p className="text-body text-neutral-600">Some contents...</p></DrawerBasic>}
      {kind === "left" && <DrawerWithCardsLeft {...props} />}
      {kind === "right" && <DrawerWithCardsRight {...props} />}
    </>
  );
}

// Lays out several small elements side by side
const Row = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-4">{children}</div>;

const registry: Category[] = [
  {
    name: "General",
    items: [
      {
        id: "button",
        name: "Button",
        description: "Triggers an action. Primary for the main action, outline and ghost for secondary ones, danger for destructive ones.",
        variants: [
          v("Primary", () => <Row><Button size="sm">Button</Button><Button size="md">Button</Button><Button>Button</Button></Row>),
          v("Outline", () => <Row><Button variant="outline" size="sm">Button</Button><Button variant="outline" size="md">Button</Button><Button variant="outline">Button</Button></Row>),
          v("Ghost and link", () => <Row><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button></Row>),
          v("Danger", () => <Row><Button variant="dangerPrimary">Delete</Button><Button variant="dangerOutline">Delete</Button><Button variant="dangerGhost">Delete</Button><Button variant="dangerLink">Delete</Button></Row>),
          v("With icon", () => <Row><Button leftIcon={<Icon name="plus" />}>Add</Button><Button variant="outline" rightIcon={<Icon name="down" />}>More</Button></Row>),
          v("Disabled", () => <Row><Button disabled>Button</Button><Button variant="outline" disabled>Button</Button></Row>),
          v("Icon buttons", () => (
            <Row>
              <IconButton label="Add" variant="iconPrimary"><Icon name="plus" /></IconButton>
              <IconButton label="Edit" variant="iconOutline"><Icon name="edit" /></IconButton>
              <IconButton label="More"><Icon name="more" /></IconButton>
              <IconButton label="Settings" variant="iconOutline" shape="square"><Icon name="setting" /></IconButton>
            </Row>
          )),
        ],
      },
      {
        id: "button-group",
        name: "Button Group",
        description: "Three joined segments to switch between options.",
        variants: [v("Text", () => <ButtonGroupBasic />), v("Icons", () => <ButtonGroupIcon />)],
      },
      {
        id: "icons",
        name: "Icons",
        description: "Every icon from Figma, in its line and filled versions.",
        wide: true,
        variants: [v("All icons", () => <IconGallery />)],
      },
    ],
  },
  {
    name: "Data Entry",
    items: [
      {
        id: "input",
        name: "Input",
        description: "Single-line text field with icons, prefixes, suffixes and an error state.",
        variants: [
          v("Basic", () => <InputBasic />),
          v("Left icon", () => <InputLeftIcon />),
          v("Right icon", () => <InputRightIcon />),
          v("Prefix", () => <InputPrefix />),
          v("Suffix", () => <InputSuffix />),
          v("Prefix and suffix", () => <InputPrefixSuffix />),
          v("Error", () => <Input defaultValue="Wrong value" error />),
          v("Disabled", () => <Input disabled placeholder="Disabled" />),
          v("Number", () => <InputNumber defaultValue={1} />),
        ],
      },
      {
        id: "textarea",
        name: "TextArea",
        description: "Multi-line text field with a character counter.",
        variants: [v("Empty", () => <TextAreaEmpty />), v("Filled", () => <TextAreaFilled />), v("Scrolling", () => <TextAreaFilled scroll />), v("Error", () => <TextAreaEmpty error />)],
      },
      {
        id: "select",
        name: "Select",
        description: "Pick one option from a list. Keyboard: ↓ opens, ↑ ↓ move, Enter picks.",
        variants: [
          v("Default", () => <Select />),
          v("Small", () => <Select size="sm" />),
          v("Error", () => <Select error />),
          v("Disabled", () => <Select disabled />),
          v("Without outline", () => <SelectWithoutOutline />),
          v("Without outline, icon", () => <SelectWithoutOutlineIcon />),
        ],
      },
      {
        id: "dropdown",
        name: "Dropdown",
        description: "Menu with one or several choices.",
        variants: [v("Single", () => <DropdownMenu />), v("Multiple, text", () => <DropdownMultiple />), v("Multiple, tags", () => <DropdownMultiple display="tags" defaultValue={["item-1", "item-2"]} />)],
      },
      { id: "cascader", name: "Cascader", description: "Pick a value in nested lists.", variants: [v("Basic", () => <CascaderBasic />)] },
      {
        id: "checkbox-radio",
        name: "Checkbox and Radio",
        description: "Checkboxes for several choices, radios for one choice in a group.",
        variants: [
          v("Checkbox", () => <Row><Checkbox>Unchecked</Checkbox><Checkbox defaultChecked>Checked</Checkbox><Checkbox indeterminate>Indeterminate</Checkbox><Checkbox disabled>Disabled</Checkbox></Row>),
          v("Radio group", () => <Row><Radio name="demo" value="a" defaultChecked>Option A</Radio><Radio name="demo" value="b">Option B</Radio><Radio disabled>Disabled</Radio></Row>),
        ],
      },
      {
        id: "toggle",
        name: "Toggle",
        description: "On / off switch.",
        variants: [v("Basic", () => <Row><Toggle /><Toggle defaultChecked /><Toggle disabled /></Row>), v("With text", () => <Row><ToggleWithText /><ToggleWithText defaultChecked /></Row>)],
      },
      {
        id: "slider",
        name: "Slider",
        description: "Pick a value or a range by dragging.",
        variants: [v("Range", () => <Slider />), v("Single", () => <SliderSingle />), v("Tooltip and marks", () => <Slider tooltip marks />), v("Disabled", () => <Slider disabled />)],
      },
      {
        id: "upload",
        name: "Upload",
        description: "Picture upload: empty, uploading and error states.",
        variants: [v("3:2", () => <UploadPicture32 />), v("1:1", () => <UploadPicture11 />), v("Uploading", () => <UploadPicture32 progress={30} />), v("Error", () => <UploadPicture32 error />)],
      },
      {
        id: "date-pickers",
        name: "Date and Time",
        description: "Pick a date, a time, a range, or a period to compare.",
        variants: [
          v("Date", () => <DateTimePicker />),
          v("Time", () => <DateTimePicker type="time" />),
          v("Date and time", () => <DateTimePicker type="datetime" />),
          v("Range", () => <RangePicker />),
          v("Range, two months", () => <RangePicker variant="basicDouble" />),
          v("Range with shortcuts", () => <RangePicker variant="quickSingle" />),
          v("Day / week / month / year", () => <RangePicker variant="day" />),
          v("Comparison", () => <Comparison />),
        ],
      },
      {
        id: "transfer",
        name: "Transfer",
        description: "Move items between two columns.",
        wide: true,
        variants: [
          v("Small 5:5", () => <TransferSmall />),
          v("Small 6:4", () => <TransferSmall64 />),
          v("Selected", () => <TransferSmallSelected />),
          v("Disabled", () => <TransferSmallDisabled />),
          v("With search result", () => <TransferSmallSearch />),
          v("No search result", () => <TransferSmallNoResult />),
          v("Medium", () => <TransferMedium />),
          v("Medium, limit reached", () => <TransferMediumLimit />),
        ],
      },
      {
        id: "form",
        name: "Form",
        description: "Labels and the sample form.",
        variants: [v("Labels", () => <div className="flex flex-col gap-2"><LabelAlignTopLeft /><LabelAlignTopRight /></div>), v("Sample form", () => <Form />)],
      },
    ],
  },
  {
    name: "Data Display",
    items: [
      {
        id: "badge",
        name: "Badge",
        description: "Red counter or dot on top of another element.",
        variants: [v("Single digit", () => <BadgeSingleDigit />), v("Double digit", () => <BadgeDoubleDigit />), v("Over 99", () => <BadgeDoubleDigit count={120} />), v("Dot", () => <BadgeDot />)],
      },
      {
        id: "tag",
        name: "Tag",
        description: "Short labels: plain, colored, checkable or review state.",
        variants: [
          v("Basic", () => <Row><TagBasic /><TagBasic variant="closable" /><TagBasic variant="border" /></Row>),
          v("Colorful", () => <Row><TagColorful /><TagColorful variant="light" /><TagColorful color="var(--color-info-600)">Info</TagColorful><TagColorful variant="light" color="var(--color-success-600)">Success</TagColorful></Row>),
          v("Checkable", () => <Row><TagCheckable size="sm" /><TagCheckable defaultChecked /><TagCheckable size="lg" /><TagCheckable disabled /></Row>),
          v("Review", () => <Row><TagReview state="approved" /><TagReview state="underReview" size="md" /><TagReview state="rejected" size="sm" /></Row>),
        ],
      },
      {
        id: "tooltip",
        name: "Tooltip",
        description: "Dark bubble shown on hover or focus.",
        variants: [
          v("Hover", () => <Tooltip />),
          v("Placements", () => <Row><TooltipTop /><TooltipBottom /><TooltipLeft /><TooltipRight /></Row>),
        ],
      },
      {
        id: "popover",
        name: "Popover",
        description: "White card with a title and content, on click or hover.",
        variants: [v("Static", () => <PopoverSimple />), v("Click", () => <PopoverClick />), v("Hover", () => <PopoverHover />), v("Bottom", () => <PopoverSimple placement="bottom" />)],
      },
      {
        id: "filter-item",
        name: "Filter Item",
        description: "Removable filter, optionally draggable.",
        variants: [v("Basic", () => <FilterItemBasic />), v("With drag handle", () => <FilterItemWithDrag />), v("With icon", () => <FilterItemWithIcon />), v("Small", () => <FilterItemBasic size="sm" />)],
      },
      {
        id: "table",
        name: "Table",
        description: "Data grid with selection, sorting, expandable rows, fixed columns and footer.",
        wide: true,
        variants: [
          v("Simple", () => <TableSimple />),
          v("Multi-select", () => <TableMultiSelect />),
          v("Expandable rows", () => <TableExpandableRow />),
          v("Fixed columns", () => <TableFixedColumns />),
          v("Data", () => <TableData />),
          v("Fixed footer", () => <TableFixedFooter />),
          v("With dividers", () => <TableWithDivider />),
        ],
      },
      {
        id: "table-cell",
        name: "Table Cell",
        description: "Standalone cells to build a table by hand.",
        variants: [
          v("Header", () => <div><TableCellHeaderTitle /><TableCellHeaderCheckbox /></div>),
          v("Text", () => <div><TableCellSingle /><TableCellDouble /><TableCellRemark /></div>),
          v("Picture", () => <TableCellPicture />),
          v("Actions", () => <div><TableCellAction /><TableCellAction kind="text" /><TableCellAction kind="switch" /></div>),
          v("Input and checkbox", () => <div><TableCellInput /><TableCellCheckbox /></div>),
          v("Person and status", () => <div><TableCellPerson /><TableCellStatus /></div>),
        ],
      },
    ],
  },
  {
    name: "Feedback",
    items: [
      {
        id: "alert",
        name: "Alert",
        description: "Inline message about the page: info, success, warning or error.",
        variants: [
          v("Statuses", () => <div className="flex flex-col gap-2"><Alert status="info" /><Alert status="success" /><Alert status="warning" /><Alert status="error" /></div>),
          v("Small", () => <Alert size="small" status="success" />),
          v("Multi-line", () => <Alert layout="multi" status="info" title="Title" closable />),
          v("With action", () => <Alert status="warning" action="button" />),
        ],
      },
      {
        id: "message",
        name: "Message",
        description: "Short floating confirmation.",
        variants: [v("Info", () => <Message type="info" />), v("Success", () => <Message type="success" />), v("Warning", () => <Message type="warning" />), v("Error", () => <Message type="error" />)],
      },
      {
        id: "result",
        name: "Result",
        description: "Full-page outcome of an action.",
        variants: [v("Success", () => <ResultSuccess />), v("Error", () => <ResultError />), v("Warning", () => <ResultWarning />), v("Info", () => <ResultInfo />)],
      },
      {
        id: "audit-status",
        name: "Audit Status",
        description: "Review state with an icon or a dot.",
        variants: [
          v("Icon", () => <div className="flex flex-col gap-2"><AuditStatus state="approved" /><AuditStatus state="underReview" /><AuditStatus state="rejected" /><AuditStatus state="currentVersion" /><AuditStatus state="cancel" /></div>),
          v("Point", () => <div className="flex flex-col gap-2"><AuditStatus type="point" state="approved" /><AuditStatus type="point" state="underReview" /><AuditStatus type="point" state="rejected" /></div>),
        ],
      },
      {
        id: "dialog",
        name: "Dialog",
        description: "Modal window. Closes with the cross, the overlay, Escape or the buttons.",
        variants: [v("Basic", () => <DialogDemo kind="basic" />), v("Warning", () => <DialogDemo kind="warning" />), v("Scrollable", () => <DialogDemo kind="scrollable" />), v("Divider", () => <DialogDemo kind="divider" />)],
      },
      {
        id: "drawer",
        name: "Drawer",
        description: "Panel sliding from the side of the screen.",
        variants: [v("Basic", () => <DrawerDemo kind="basic" />), v("Cards, left", () => <DrawerDemo kind="left" />), v("Cards, right", () => <DrawerDemo kind="right" />)],
      },
      {
        id: "popconfirm",
        name: "PopConfirm",
        description: "Small confirmation bubble next to an action.",
        variants: [v("Basic", () => <PopConfirmBasic />), v("With input", () => <PopConfirmWithInput />)],
      },
    ],
  },
  {
    name: "Navigation",
    items: [
      {
        id: "tabs",
        name: "Tabs",
        description: "Switch between views. ← → keys move between tabs.",
        wide: true,
        variants: [
          v("Basic", () => <TabBasic />),
          v("Basic with icons", () => <TabBasicIcon />),
          v("Basic small", () => <TabBasicSmall />),
          v("Container", () => <TabContainer />),
          v("Container closable", () => <TabContainerClosable />),
          v("Container bordered", () => <TabContainerBordered />),
          v("Container small", () => <TabContainerSmall />),
        ],
      },
      {
        id: "steps",
        name: "Steps",
        description: "Progress through a sequence of steps.",
        wide: true,
        variants: [v("Horizontal", () => <StepsBase />), v("Horizontal with description", () => <StepsBaseDescription />), v("Vertical", () => <StepsVertical />), v("Vertical with description", () => <StepsVerticalDescription />)],
      },
      {
        id: "pagination",
        name: "Pagination",
        description: "Move between pages of a list.",
        wide: true,
        variants: [v("Simple", () => <PaginationSimple />), v("Basic", () => <PaginationBasic />), v("Advanced", () => <PaginationAdvanced />), v("List basic", () => <PaginationListBasic />), v("List advanced", () => <PaginationListAdvanced />)],
      },
      {
        id: "breadcrumb",
        name: "Breadcrumb",
        description: "Where the current page sits in the hierarchy.",
        variants: [v("Slash", () => <Breadcrumb />), v("Arrow", () => <Breadcrumb separator="arrow" />), v("Collapsed", () => <BreadcrumbCollapsed />)],
      },
      { id: "anchor", name: "Anchor", description: "Table of contents linking to sections of the page.", variants: [v("Basic", () => <Anchor />)] },
    ],
  },
  {
    name: "Charts",
    items: [
      { id: "line-chart", name: "Line Chart", description: "Trends over time.", variants: [v("One value", () => <LineChartOneValue />), v("Multiple values", () => <LineChartMultipleValues />)] },
      { id: "area-chart", name: "Area Chart", description: "Trends with a filled area.", variants: [v("One value", () => <AreaChartOneValue />), v("Multiple values", () => <AreaChartMultipleValues />)] },
      { id: "column-chart", name: "Column Chart", description: "Compare values across categories.", variants: [v("One value", () => <ColumnChartOneValue />), v("Multiple values", () => <ColumnChartMultipleValues />)] },
      {
        id: "stacked-column-chart",
        name: "Stacked Column Chart",
        description: "Parts of a whole across categories.",
        variants: [v("Basic", () => <StackedColumnChartBasic />), v("Percent", () => <StackedColumnChartPercent />), v("Grouped", () => <StackedColumnChartGroup />)],
      },
      { id: "pie-donut", name: "Pie and Donut", description: "Share of each part in a total.", variants: [v("Pie", () => <PieChartBasic />), v("Donut", () => <DonutChartBasic />)] },
      {
        id: "legend",
        name: "Legend",
        description: "Series names with their color marker, one page or paged.",
        variants: [
          v("Vertical", () => <Row><LegendVerticalLine /><LegendVerticalColumn /><LegendVerticalDonut /></Row>),
          v("Vertical, multipage", () => <LegendVerticalLineMultipage />),
          v("Horizontal", () => <div className="flex flex-col gap-3"><LegendHorizontalLine /><LegendHorizontalColumn /><LegendHorizontalDonut /></div>),
          v("Horizontal, multipage", () => <LegendHorizontalLineMultipage />),
        ],
      },
      {
        id: "chart-tooltip",
        name: "Chart Tooltip",
        description: "Values of the hovered point or column.",
        variants: [v("Basic", () => <ChartTooltip />), v("With line chart", () => <ChartTooltipWithLine />), v("With column chart", () => <ChartTooltipWithColumn />)],
      },
    ],
  },
];

const all = registry.flatMap((c) => c.items.map((item) => ({ ...item, category: c.name })));

/* ═══════════════════════════════════════════════════════════
   SELECTED COMPONENT: kept in the URL hash (#button), so links and Back work
   ═══════════════════════════════════════════════════════════ */

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

function useHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function InteractiveDemoPage() {
  const hash = useHash();
  const [query, setQuery] = useState("");
  const current = all.find((c) => c.id === hash) ?? all[0];

  const q = query.trim().toLowerCase();
  const filtered = registry
    .map((c) => ({ ...c, items: c.items.filter((i) => !q || i.name.toLowerCase().includes(q)) }))
    .filter((c) => c.items.length > 0);

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Sidebar: search and components by category */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
        <div className="border-b border-neutral-200 px-5 py-5">
          <h1 className="text-title font-medium text-neutral-700">TapTap</h1>
          <p className="mt-1 text-caption text-neutral-500">Design System · Components</p>
        </div>

        <div className="px-4 pt-4">
          <Input size="md" placeholder="Search components" value={query} onChange={setQuery} leftIcon={<Icon name="search" />} clearable className="w-full" aria-label="Search components" />
        </div>

        <nav aria-label="Components" className="flex-1 overflow-y-auto px-3 py-4">
          {filtered.map((group) => (
            <div key={group.name} className="mb-5">
              <p className="mb-1 px-2 text-caption font-medium uppercase text-neutral-400">{group.name}</p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.id === current.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-9 items-center justify-between rounded px-3 text-body transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                          active ? "bg-brand-soft font-medium text-brand" : "text-neutral-600 hover:bg-neutral-100"
                        )}
                      >
                        {item.name}
                        <span className="text-caption text-neutral-400">{item.variants.length}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-2 text-body text-neutral-400">No component found</p>}
        </nav>
      </aside>

      {/* Main: the selected component and all its variants */}
      <main className="min-w-0 flex-1">
        <header className="border-b border-neutral-200 px-10 py-6">
          <p className="text-caption text-neutral-400">
            Components / {current.category} / {current.name}
          </p>
          <h2 className="mt-2 text-h2 font-medium text-neutral-700">{current.name}</h2>
          <p className="mt-1 max-w-2xl text-body text-neutral-500">{current.description}</p>
        </header>

        <div className={cn("grid gap-6 p-10", current.wide ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2")}>
          {current.variants.map((variant) => (
            <section key={`${current.id}-${variant.name}`} className="flex min-w-0 flex-col rounded border border-neutral-200">
              <h3 className="rounded-t border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-body font-medium text-neutral-600">{variant.name}</h3>
              {/* No overflow clipping here: menus and date panels must be able to open outside the card */}
              <div className="flex min-h-40 min-w-0 flex-1 items-center justify-center rounded-b bg-white p-8">{variant.render()}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}