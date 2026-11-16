# TapTap Design System

React component library for the TapTap design system, built with **Next.js 16**, **React 19**, **TypeScript** and **Tailwind CSS v4**.
Colors, shadows, typography and icons come from the Figma file and are exposed as **tokens**: components use nothing else.

## Table of contents

- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Design tokens](#design-tokens)
- [Icons](#icons)
- [Shared helpers](#shared-helpers)
- [Interactive demo](#interactive-demo)
- [Components](#components)
  - [general](#general) · [data-entry](#data-entry) · [data-display](#data-display) · [feedback](#feedback) · [navigation](#navigation) · [charts](#charts)
- [Conventions](#conventions)
- [Accessibility](#accessibility)
- [To validate with Figma](#to-validate-with-figma)
- [Git](#git)

## Getting started

```bash
npm install
npm run icons   # regenerates app/icons/icons.generated.ts from the SVG files
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build` (production build + type check), `npm run lint`.

Open **http://localhost:3000/interactive-demo** to browse every component and its variants (see [Interactive demo](#interactive-demo)). `app/page.tsx` is the home page.

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | Framework |
| `tailwindcss` v4 (`@tailwindcss/turbopack`) | Styling |
| `class-variance-authority` | Combined variants (`cva`) in Button and Alert |
| `clsx`, `tailwind-merge` | Class merging (`cn`) |

## Project structure

```
systemdesign/
├── app/
│   ├── components/
│   │   ├── general/        Button, ButtonGroup
│   │   ├── data-entry/     Input, TextArea, Select, Dropdown, CascaderBasic, Checkbox, Radio, Toggle,
│   │   │                   Slider, Upload, DateTimePicker, RangePicker, Comparison, Calendar, Transfer, Form
│   │   ├── data-display/   Badge, Tag, Tooltip, Popover, FilterItem, Table, TableCell
│   │   ├── feedback/       Alert, Message, Result, AuditStatus, Dialog, Drawer, PopConfirm
│   │   ├── navigation/     Tabs, Steps, Pagination, Breadcrumb, Anchor
│   │   └── charts/         ChartFrame, chartColors, LineChart, AreaChart, ColumnChart, StackedColumnChart,
│   │                       PieChart, DonutChart, LegendVertical, LegendHorizontal, ChartTooltip
│   ├── icons/
│   │   ├── svg/            SVG files by family (arrows, base, charts, edit, suggest)
│   │   ├── Icon.tsx        the <Icon /> component
│   │   ├── IconGallery.tsx every icon, in both variants
│   │   └── icons.generated.ts  generated, do not edit
│   ├── lib/
│   │   ├── utils.ts        cn()
│   │   ├── listbox.ts      keyboard and dismiss helpers for pop-up lists
│   │   └── useModal.ts     shared Dialog / Drawer behavior
│   ├── tokens/             colors.css, shadows.css, typography.css, chart-colors.css
│   ├── globals.css         Tailwind + tokens
│   ├── interactive-demo/
│   │   └── page.tsx        component explorer (sidebar + variants)
│   ├── layout.tsx
│   └── page.tsx            home page
├── scripts/build-icons.mjs SVG files → icons.generated.ts
└── package.json
```

Components are grouped by what the user does with them:

| Folder | Question |
|---|---|
| `general` | Does it trigger an action? |
| `data-entry` | Does the user type or pick a value? |
| `data-display` | Does it show information? |
| `feedback` | Does it react to an action or report a state? |
| `navigation` | Does it move the user somewhere? |
| `charts` | Does it plot data? |

## Design tokens

Declared in `app/tokens/*.css` with Tailwind's `@theme` and imported by `app/globals.css`. Each token becomes Tailwind classes automatically: `--color-danger-600` gives `bg-danger-600`, `text-danger-600`, `border-danger-600`…

### Colors (`colors.css`)

Seven families from Figma, 8 shades each (700 → 50, 600 is the main one):

| Family | Usage | Main shade |
|---|---|---|
| `primary` | Brand teal | `primary-600` `#15c5ce` |
| `auxiliary` | Orange accent | `auxiliary-600` `#ff8156` |
| `danger` | Error, danger, rejected | `danger-600` `#f64c4c` |
| `warning` | Warning, in progress | `warning-600` `#ffad0d` |
| `success` | Success, approved | `success-600` `#47b881` |
| `info` | Information | `info-600` `#3b82f6` |
| `neutral` | Text, borders, backgrounds | `neutral-600` `#4b4b4b` |

Plus `black` and `white`. Aliases used by the components:

| Alias | Points to | Usage |
|---|---|---|
| `brand` | `primary-600` | Default |
| `brand-hover` | `primary-500` | Hover |
| `brand-pressed` | `primary-700` | Pressed |
| `brand-disabled` | `primary-300` | Disabled |
| `brand-soft` | `primary-100` | Selected option background |

The `gray-*` names are legacy aliases of the `neutral-*` scale.

### Chart colors (`chart-colors.css`)

`chart-1` … `chart-10` (Standard) and `chart-aux-1` … `chart-aux-10` (lighter). Charts never pick them by hand: `groupColors(count)` in `charts/chartColors.ts` follows the Figma **Color Grouping** guideline (1 series: 1 | 2: 1+3 | 3: 1+3+5 | … | 6: 1+3+5+7+9+2, then 4, 6, 8, 10).

### Shadows (`shadows.css`)

`shadow-elevation-1` to `shadow-elevation-4`, two layers each (Figma "Elevation 1 to 4").

| Token | Used by |
|---|---|
| `elevation-1` | Toggle knob |
| `elevation-2` | Tooltips, chart tooltip, fixed table columns |
| `elevation-3` | Menus, popovers, messages, pickers, Transfer |
| `elevation-4` | Dialog, Drawer |

### Typography (`typography.css`)

Font stacks (`font-sans`, `font-number`, `font-mono`) and seven text styles. Each class sets the size **and** the line height; the weight is separate (`font-normal` = Regular, `font-medium` = Medium, `font-bold`).

| Class | Size / line height |
|---|---|
| `text-h1` | 30 / 38 |
| `text-h2` | 24 / 32 |
| `text-h3` | 20 / 28 |
| `text-title` | 18 / 26 |
| `text-subtitle` | 16 / 24 |
| `text-body` | 14 / 22 |
| `text-caption` | 12 / 18 |

## Icons

All icons come from Figma as SVG files and are rendered with `<Icon />`. Never draw an icon inline.

### Adding or changing an icon

1. Export the SVG from Figma from a square frame.
2. Name it in lowercase with dashes and put it in its family folder under `app/icons/svg/`.
3. Run `npm run icons`.

| Case | Files |
|---|---|
| Two variants (outline and filled) | `up.line.svg` and `up.filled.svg` |
| One version only | `tri-up.svg` |

Names must be unique across families (the script warns with `⚠`). Fixed colors become `currentColor`, so an icon takes the color of the surrounding text.

### Using an icon

```tsx
import { Icon } from "../../icons/Icon";

<Icon name="down" size={16} className="text-neutral-500" />
<Icon name="success" variant="filled" size={18} className="text-success-600" />
<Icon name="loading" className="animate-spin" />
```

| Prop | Values |
|---|---|
| `name` | Any icon name (autocompleted by TypeScript) |
| `variant` | `line` (default) or `filled` |
| `size` | `12`, `14`, `16` (default), `18`, `20`, `24` |
| `label` | Accessible name. Without it the icon is decorative |
| `className` | Color, or a custom size (`size-[72px]`) |

### Families (68 icons)

| Family | Count | Icons |
|---|---|---|
| `arrows` | 26 | up, down, left, right, arrow-*, circle-*, double-*, tri-*, sort, download, export, refresh, undo, go-start, go-end |
| `base` | 15 | attachment, calendar, earth, file, filter, hide, show, image, link, loading, mail, mail-open, search, setting, user |
| `charts` | 6 | area-chart, bar-chart, cumulative-chart, line-chart, pie-chart, stacked-bar-chart |
| `edit` | 7 | copy, delete, drag, edit, more, more-vertical, star |
| `suggest` | 14 | add, attention, check, close, error, forbid, help, info, minus, plus, reduce, success, time, warning |

## Shared helpers

| File | What it does |
|---|---|
| `lib/utils.ts` | `cn(...)` joins classes and resolves Tailwind conflicts. It knows the token names, so `cn("text-caption", "text-neutral-600")` keeps both (size and color). |
| `lib/listbox.ts` | `useDismiss` (outside click + Escape, focus back to the trigger), `moveFocus` (↑ ↓ Home End in a list), `focusSelected`. Used by Select, Dropdown, Cascader and the pickers. |
| `lib/useModal.ts` | Open state, Escape, scroll lock, focus moved in, trapped with Tab and restored on close. Used by Dialog and Drawer. |
| `data-entry/Calendar.tsx` | Shared month calendar (`CalendarMonth`, `CalendarHeader`) and date helpers, used by DateTimePicker, RangePicker and Comparison. |

## Interactive demo

`app/interactive-demo/page.tsx` is an examples page for the whole design system, at `/interactive-demo`.

- **Sidebar** (left): a search field and the components grouped by category (General, Data Entry, Data Display, Feedback, Navigation, Charts), with their number of variants.
- **Main area**: the selected component, its description, then one card per variant. Wide components (Table, Transfer, Tabs, Steps, Pagination) take the full width.
- **Shareable links**: the selected component is kept in the URL hash, e.g. `/interactive-demo#table`, so the Back button and direct links work.
- **Overlays**: Dialog and Drawer are closed by default, each card has an "Open" button.

To add a component or a variant, edit the `registry` array at the top of the file:

```tsx
{
  id: "badge",                       // used in the URL: /interactive-demo#badge
  name: "Badge",
  description: "Red counter or dot on top of another element.",
  wide: false,                       // true = one card per row
  variants: [
    v("Single digit", () => <BadgeSingleDigit />),
    v("Over 99", () => <BadgeDoubleDigit count={120} />),
  ],
}
```

## Components

Import from the category folder, e.g. `import { Button } from "./components/general/Button"`.

Common API:

- **Defaults from Figma.** `<Component />` renders the Figma sample without any data.
- **Controlled or not.** `value` / `checked` (controlled) or `defaultValue` / `defaultChecked`, plus `onChange`.
- **Form fields** accept `id`, `name` and `aria-label`, so they work with `<label htmlFor>` and native forms. Pop-up fields (Select, Dropdown, pickers) send their value through a hidden input when `name` is set.
- **`className`** is merged last with `cn`, so it can override anything.
- **Sizes**: `sm` 24px, `md` 36px, `lg` 40px; `auto` (Input, Select) follows the screen size.

### general

#### Button

```tsx
<Button>Primary</Button>
<Button variant="outline" size="md" leftIcon={<Icon name="plus" />}>Add</Button>
<Button variant="dangerPrimary" disabled>Delete</Button>
<IconButton label="Settings"><Icon name="setting" /></IconButton>
```

Variants: `primary`, `outline`, `ghost`, `link`, `dangerPrimary`, `dangerOutline`, `dangerGhost`, `dangerLink`, `iconPrimary`, `iconOutline`, `iconGhost`. Sizes: `sm`, `md`, `lg` (default), `icon`, `iconSm`, `iconLg`.

#### ButtonGroup

Three joined segments, multi-select by default (`multiple={false}` for single).

```tsx
<ButtonGroupBasic />
<ButtonGroupIcon items={[{ value: "a", label: "List", icon: <Icon name="file" /> }, …]} />
```

### data-entry

| Component | Exports | Notes |
|---|---|---|
| Input | `Input`, `InputBasic`, `InputLeftIcon`, `InputRightIcon`, `InputPrefix`, `InputSuffix`, `InputPrefixSuffix`, `InputNumber` | `error`, `clearable`, `prefix` / `suffix` (inside), `addonBefore` / `addonAfter` (outside). `InputNumber`: `min`, `max`, `step`, ↑ ↓ keys |
| TextArea | `TextArea`, `TextAreaEmpty`, `TextAreaFilled` | Counter `0/1000` (`maxLength`), resizable |
| Select | `Select`, `SelectWithoutOutline`, `SelectWithoutOutlineIcon` | Keyboard: ↓ opens, ↑ ↓ Home End move, Enter picks, Escape closes |
| Dropdown | `DropdownMenu`, `DropdownMultiple` | Multiple: `display="text"` or `"tags"`, "clear all" button |
| CascaderBasic | `CascaderBasic` | Nested `options` with `children`; value is a path |
| Checkbox | `Checkbox` | `indeterminate` |
| Radio | `Radio` | Same `name` = one group. Works controlled or not |
| Toggle | `Toggle`, `ToggleWithText` | `label` is the accessible name |
| Slider | `Slider`, `SliderSingle` | Range by default, `tooltip`, `marks`. Keys: ← → ↑ ↓ PageUp PageDown Home End |
| Upload | `UploadPicture`, `UploadPicture32`, `UploadPicture11` | `onSelect(file)`; pass `progress` while uploading, `value` once uploaded |
| DateTimePicker | `DateTimePicker` | `type="date"`, `"time"` or `"datetime"` |
| RangePicker | `RangePicker` | `variant`: `basicSingle`, `basicDouble`, `quickSingle`, `quickDouble`, `dateTime`, `day`, `week`, `month`, `year` |
| Comparison | `Comparison` | "Compare to" menu: preceding period, same time last year, custom range |
| Transfer | `Transfer`, `TransferSmall`, `TransferSmall64`, `TransferMedium`, `TransferMedium64`, + state samples | `size` small / medium, `proportion` 5:5 / 6:4, `max`, `groups`, drag to reorder (small) |
| Form | `Form`, `Label`, `LabelAlignTopLeft`, `LabelAlignTopRight` | The Figma sample form. `Label` has `required`, `help`, `htmlFor`, `as="span"` for groups |

```tsx
<Input id="email" name="email" placeholder="Email" error="Invalid email" />
<Select name="country" options={[{ value: "ca", label: "Canada" }]} onChange={(v) => …} />
<RangePicker variant="quickDouble" onChange={([start, end]) => …} />
<Transfer size="medium" max={6} onApply={(values) => …} />
```

### data-display

| Component | Exports | Notes |
|---|---|---|
| Badge | `BadgeSingleDigit`, `BadgeDoubleDigit`, `BadgeDot` | Above 99: `99+` |
| Tag | `TagBasic`, `TagColorful`, `TagCheckable`, `TagReview` | `TagColorful` takes a color token: `color="var(--color-info-600)"`. `TagReview` uses the AuditStatus states |
| Tooltip | `Tooltip`, `TooltipSimple`, `TooltipTop` / `Left` / `Right` / `Bottom` | 12 placements, hover and focus |
| Popover | `PopoverSimple`, `PopoverClick`, `PopoverHover` | Same 12 placements |
| FilterItem | `FilterItemBasic`, `FilterItemWithDrag`, `FilterItemWithIcon` | `dragHandleProps` to plug a drag-and-drop library |
| Table | `Table` + samples `TableSimple`, `TableMultiSelect`, `TableExpandableRow`, `TableFixedColumns`, `TableData`, `TableFixedFooter`, `TableWithDivider` | `columns` (`render`, `sorter`, `fixed`, `help`, `filter`), `selectable`, `renderExpanded`, `footer`, `maxHeight`, `onRowClick`, `onFilter`, `onSort` |
| TableCell | `TableCellHeaderTitle`, `TableCellHeaderCheckbox`, `TableCellSingle`, `TableCellDouble`, `TableCellRemark`, `TableCellPicture`, `TableCellImages`, `TableCellAction`, `TableCellInput`, `TableCellCheckbox`, `TableCellPerson`, `TableCellStatus` | Standalone cells to build a table by hand |

```tsx
<Table
  columns={[
    { key: "name", title: "Name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { key: "status", title: "Status", render: (row) => <AuditStatus state={row.status} /> },
  ]}
  data={rows}
  rowKey={(row) => row.id}
  selectable
/>
```

### feedback

| Component | Exports | Notes |
|---|---|---|
| Alert | `Alert` | `status` info / success / warning / error, `size` basic / small, `layout` single / multi, `action` none / link / button, `closable` |
| Message | `Message` | `type` info / success / warning / error |
| Result | `Result`, `ResultSuccess`, `ResultError`, `ResultWarning`, `ResultInfo` | `actions={null}` for no buttons |
| AuditStatus | `AuditStatus` | States: rejected, underReview, approved, currentVersion, cancel. `type="point"` for a dot |
| Dialog | `DialogBasic`, `DialogWarning`, `DialogScrollable`, `DialogDivider` | `open` + `onClose` (controlled) or `defaultOpen`. `size` sm 400 / md 600 / lg 900 |
| Drawer | `DrawerBasic`, `DrawerWithCardsLeft`, `DrawerWithCardsRight` | Same open API. `DrawerBasic` sizes: xs 400, s / md / lg 768 |
| PopConfirm | `PopConfirmBasic`, `PopConfirmWithInput` | `onConfirm`, `onCancel`, arrow `placement` |

Dialog and Drawer are **closed by default**. Open them with state:

```tsx
const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Open</Button>
<DialogBasic open={open} onClose={() => setOpen(false)} onConfirm={save} />
```

They close with the cross, the overlay, Escape, Cancel or Confirm, keep the focus inside, and give it back to the button that opened them.

### navigation

| Component | Exports | Notes |
|---|---|---|
| Tabs | `TabBasic`, `TabBasicIcon`, `TabBasicSmall`, `TabContainer`, `TabContainerClosable`, `TabContainerBordered`, `TabContainerSmall` | `items` with optional `content`; ← → keys |
| Steps | `Steps`, `StepsBase`, `StepsBaseDescription`, `StepsVertical`, `StepsVerticalDescription` | Clickable when `onChange` is set |
| Pagination | `PaginationSimple`, `PaginationBasic`, `PaginationAdvanced`, `PaginationListBasic`, `PaginationListAdvanced` | `total`, `pageSize`, "Go to" field |
| Breadcrumb | `Breadcrumb`, `BreadcrumbCollapsed` | `separator` slash / arrow |
| Anchor | `Anchor` | Links to `#ids` on the page, smooth scroll |

### charts

Every chart is an SVG drawn inside `ChartFrame` (axes, ticks, grid) and colored with `groupColors`.

| Component | Exports | Notes |
|---|---|---|
| LineChart | `LineChart`, `LineChartOneValue`, `LineChartMultipleValues` | `series`, `labels`, `yMax`, `yStep`, `unit` |
| AreaChart | `AreaChart`, `AreaChartOneValue`, `AreaChartMultipleValues` | Same props as LineChart, filled at 15% |
| ColumnChart | `ColumnChart`, `ColumnChartOneValue`, `ColumnChartMultipleValues` | Grouped bars |
| StackedColumnChart | `StackedColumnChart`, `StackedColumnChartBasic`, `StackedColumnChartPercent`, `StackedColumnChartGroup` | `percent`, `perGroup` |
| PieChart | `PieChart`, `PieChartBasic` | `data` (`name`, `value`), `format` |
| DonutChart | `DonutChart`, `DonutChartBasic` | `innerRadius`, `total`, `totalLabel` |
| LegendVertical | `LegendVertical` + `…Line`, `…Column`, `…Donut` and their `…Multipage` versions | `marker` line / square / dot, `pageSize` |
| LegendHorizontal | `LegendHorizontal` + the same variants | Self-contained (no import from LegendVertical) |
| ChartTooltip | `ChartTooltip`, `ChartTooltipWithLine`, `ChartTooltipWithColumn` | `title`, `rows` (`name`, `value`, `color`) |

```tsx
<LineChart
  series={[{ name: "Visits", values: [40, 29, 44, 42, 40] }]}
  labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
/>
<LegendHorizontal marker="line" items={[{ name: "Visits" }]} />
```

The chart tooltips are standalone cards for now: they are not shown on hover inside the charts yet.

## Conventions

- **Tokens only.** No hex colors, raw font sizes (`text-sm`, `text-[10px]`), line heights or custom shadows in components. Use `bg-danger-600`, `text-caption`, `shadow-elevation-3`. Spacing and sizes (`h-10`, `w-[240px]`) are free.
- **Icons only from `app/icons`.** Use `<Icon name="…" />`. Inline `<svg>` is only for drawings that are not icons: charts, the Upload dashed border and the Transfer empty-state illustration.
- **Same API everywhere**: `variant`, `size`, `disabled`, `error`, `value` / `defaultValue` / `onChange`, `className`.
- **Defaults from Figma**: a component renders with no props.
- **`cn` for every `className`**, so the user's classes always win.
- **`cva` only when variants combine** (Button, Alert).
- **`"use client"`** only in components with state or events.
- **No current time while rendering** (`new Date()` only in event handlers or after a click): Next.js 16 with `cacheComponents` refuses it during pre-rendering.
- **Cursors**: pointer on hover, arrow while pressing, normal arrow (not "not-allowed") when disabled.
- **File names**: PascalCase, with the same casing in imports (`Popover.tsx`). Windows ignores case, Git and Linux do not. Folders are lowercase with dashes.
- **Comments**: short, in English.

## Accessibility

- Real inputs behind every custom checkbox, radio and switch (keyboard and screen readers work).
- Visible focus outline (`outline-brand`) on every interactive element.
- Pop-up lists: `aria-expanded`, `role="listbox"` / `"option"`, arrow keys, Escape returns the focus to the field.
- Dialog and Drawer: `aria-modal`, focus trapped inside and restored on close.
- Errors are announced (`role="alert"`) and linked to their field (`aria-describedby`).
- Icon-only buttons have an `aria-label`; decorative icons are hidden.

## To validate with Figma

These values were estimated from screenshots and still need checking in Dev Mode:

- **Dimensions without measurements**: single-line Alert heights (34px basic, 28px small), Alert width (505px), Message width (300px), Slider (400px), TextArea (240px), Input (190px), Select (240px), legends (row height 20px, 20px gaps), chart tooltip padding.
- **Form fields** are 36px (`size="md"`), while the Figma sample looks like 32px.
- **Toggle "ON / OFF"**: Figma uses ~10px text, the closest token is `text-caption` (12px).
- **Donut total**: Figma looks ~28px, the closest token is `text-h2` (24px).
- **Pickers and dropdowns** now use the same 40px height and 4px radius as Input and Select (they were 44px / 6px).
- **Filled icon variants** of `success`, `error`, `info`, `warning`, `forbid`, `attention` and `time` are assumed to be solid circles.
- **Transfer empty state**: a simple box drawing stands in for the Figma illustration. Add the real one to `app/icons/svg/` to replace it.

## Git

```bash
git add .
git commit -m "feat(button): describe the change"
git push
```

Commit prefixes: `feat:` (addition), `fix:` (bug fix), `refactor:` (no visible change), `chore:` (configuration), `docs:` (documentation).

`node_modules/`, `.next/` and `.env*` are never committed (`.gitignore`). `app/icons/icons.generated.ts` **is** committed so the project works right after cloning.