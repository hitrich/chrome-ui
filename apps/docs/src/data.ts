// The catalog index: every base component, block, chart and template, as drawn on the design artboards.
// Pages, the docs sidebar and the docs search read these lists; copy is the cards' own.

export type BaseSectionId = "inputs" | "navigation" | "feedback" | "overlays" | "data";

export interface BaseSection {
  id: BaseSectionId;
  title: string;
  count: number;
}

export const baseSections: readonly BaseSection[] = [
  { id: "inputs", title: "Inputs & controls", count: 20 },
  { id: "navigation", title: "Navigation", count: 6 },
  { id: "feedback", title: "Feedback & status", count: 8 },
  { id: "overlays", title: "Overlays", count: 9 },
  { id: "data", title: "Data display & layout", count: 11 }
];

export interface BaseComponentEntry {
  /** Route segment: `/components/<slug>`. */
  slug: string;
  name: string;
  section: BaseSectionId;
  /** The catalog card's one-line description. */
  blurb: string;
  isNew: boolean;
}

/** The 54 base components in catalog order (grouped by section, alphabetical inside each). */
export const baseComponents: readonly BaseComponentEntry[] = [
  { slug: "button", name: "Button", section: "inputs", blurb: "Six finishes and four sizes, with loading and icon slots.", isNew: false },
  { slug: "button-group", name: "Button Group", section: "inputs", blurb: "Joined actions and split buttons that share one edge.", isNew: true },
  { slug: "checkbox", name: "Checkbox", section: "inputs", blurb: "Binary or mixed choices, alone or in a nested group.", isNew: false },
  { slug: "color-picker", name: "Color Picker", section: "inputs", blurb: "Saturation, hue and hex input, plus token swatches.", isNew: true },
  { slug: "combobox", name: "Combobox", section: "inputs", blurb: "Type to filter a long list, then pick one match.", isNew: true },
  { slug: "date-picker", name: "Date Picker", section: "inputs", blurb: "Single dates or ranges from a field and month grid.", isNew: true },
  { slug: "file-dropzone", name: "File Dropzone", section: "inputs", blurb: "Drag files in or browse, filtered by file type.", isNew: false },
  { slug: "icon-button", name: "Icon Button", section: "inputs", blurb: "Round, labelled actions for toolbars and headers.", isNew: false },
  { slug: "input-otp", name: "Input OTP", section: "inputs", blurb: "One-time codes with paste and auto-advance.", isNew: true },
  { slug: "number-field", name: "Number Field", section: "inputs", blurb: "Bounded numbers with steppers and arrow-key nudges.", isNew: true },
  { slug: "radio-group", name: "Radio Group", section: "inputs", blurb: "One choice from a short, visible set.", isNew: false },
  { slug: "search-field", name: "Search Field", section: "inputs", blurb: "Query input with a clear button and a focus shortcut.", isNew: false },
  { slug: "segmented-control", name: "Segmented Control", section: "inputs", blurb: "Compact single choice between adjacent modes.", isNew: false },
  { slug: "select", name: "Select", section: "inputs", blurb: "One value from a known set, with typeahead.", isNew: false },
  { slug: "slider", name: "Slider", section: "inputs", blurb: "Continuous value with a mirror-finish thumb.", isNew: false },
  { slug: "switch", name: "Switch", section: "inputs", blurb: "Settings that take effect the moment they flip.", isNew: false },
  { slug: "tag-input", name: "Tag Input", section: "inputs", blurb: "Several values in one field, added with Enter.", isNew: true },
  { slug: "text-field", name: "Text Field", section: "inputs", blurb: "Label, hint, error and prefix or suffix slots.", isNew: false },
  { slug: "textarea", name: "Textarea", section: "inputs", blurb: "Multi-line text with a live character count.", isNew: true },
  { slug: "toggle-button", name: "Toggle Button", section: "inputs", blurb: "A button that stays pressed until clicked again.", isNew: false },
  { slug: "breadcrumb", name: "Breadcrumb", section: "navigation", blurb: "Where this page sits, one level per link.", isNew: false },
  { slug: "pagination", name: "Pagination", section: "navigation", blurb: "Page through long lists with a range readout.", isNew: false },
  { slug: "stepper", name: "Stepper", section: "navigation", blurb: "Progress through a fixed sequence of stages.", isNew: false },
  { slug: "tabs", name: "Tabs", section: "navigation", blurb: "Switch between related views of one object.", isNew: false },
  { slug: "toolbar", name: "Toolbar", section: "navigation", blurb: "Grouped controls with roving keyboard focus.", isNew: false },
  { slug: "tree-view", name: "Tree View", section: "navigation", blurb: "Nested items that expand, collapse and select.", isNew: true },
  { slug: "alert", name: "Alert", section: "feedback", blurb: "Inline message that stays until the issue is fixed.", isNew: false },
  { slug: "badge", name: "Badge", section: "feedback", blurb: "Counts, versions and short labels on other parts.", isNew: false },
  { slug: "empty-state", name: "Empty State", section: "feedback", blurb: "What belongs here and the next thing to do.", isNew: false },
  { slug: "meter", name: "Meter", section: "feedback", blurb: "A measured value against known limits.", isNew: false },
  { slug: "progress", name: "Progress", section: "feedback", blurb: "Determinate and indeterminate, in a recessed groove.", isNew: false },
  { slug: "skeleton", name: "Skeleton", section: "feedback", blurb: "Layout placeholders while content loads.", isNew: false },
  { slug: "spinner", name: "Spinner", section: "feedback", blurb: "Short waits where the duration is unknown.", isNew: false },
  { slug: "status-indicator", name: "Status Indicator", section: "feedback", blurb: "A lamp and a word. Only failures turn red.", isNew: false },
  { slug: "command-palette", name: "Command Palette", section: "overlays", blurb: "Search every action and run it from the keyboard.", isNew: true },
  { slug: "context-menu", name: "Context Menu", section: "overlays", blurb: "Right-click actions for the item under the pointer.", isNew: true },
  { slug: "dialog", name: "Dialog", section: "overlays", blurb: "Blocking decisions that need an answer now.", isNew: false },
  { slug: "drawer", name: "Drawer", section: "overlays", blurb: "Side panel for details without leaving the page.", isNew: true },
  { slug: "dropdown-menu", name: "Dropdown Menu", section: "overlays", blurb: "Actions behind a trigger, with groups and shortcuts.", isNew: false },
  { slug: "hover-card", name: "Hover Card", section: "overlays", blurb: "A preview of a person or link on hover.", isNew: true },
  { slug: "popover", name: "Popover", section: "overlays", blurb: "Small anchored panel for quick, light forms.", isNew: true },
  { slug: "toast", name: "Toast", section: "overlays", blurb: "Temporary confirmation with an undo slot.", isNew: false },
  { slug: "tooltip", name: "Tooltip", section: "overlays", blurb: "Short hints for icons, with keycaps.", isNew: false },
  { slug: "accordion", name: "Accordion", section: "data", blurb: "Stacked sections that expand one at a time.", isNew: true },
  { slug: "avatar", name: "Avatar", section: "data", blurb: "Initials in a chrome ring, alone or stacked.", isNew: false },
  { slug: "calendar", name: "Calendar", section: "data", blurb: "Month grid with events and a selected day.", isNew: true },
  { slug: "chip", name: "Chip", section: "data", blurb: "Compact filters and entities to toggle or remove.", isNew: true },
  { slug: "code-block", name: "Code Block", section: "data", blurb: "Highlighted source with a filename and copy button.", isNew: false },
  { slug: "divider", name: "Divider", section: "data", blurb: "Hairline separators, plain or labelled.", isNew: false },
  { slug: "key-hint", name: "Key Hint", section: "data", blurb: "Keyboard shortcuts drawn as keycaps.", isNew: false },
  { slug: "stat", name: "Stat", section: "data", blurb: "One headline number with its trend and comparison.", isNew: false },
  { slug: "surface", name: "Surface", section: "data", blurb: "Card, raised and float levels for layering.", isNew: false },
  { slug: "table", name: "Table", section: "data", blurb: "Dense rows of tabular figures, with sticky headers.", isNew: false },
  { slug: "timeline", name: "Timeline", section: "data", blurb: "Events in order, newest first.", isNew: false },
];

export interface CatalogEntry {
  /** Anchor on its catalog page: `/components/blocks#<slug>`, `/components/charts#<slug>`. */
  slug: string;
  name: string;
  category: string;
  blurb: string;
}

export const blocks: readonly CatalogEntry[] = [
  { slug: "sidebar", name: "Sidebar", category: "App shell", blurb: "Workspace switcher, search, counted nav and the signed-in account." },
  { slug: "command-bar", name: "Command Bar", category: "App shell", blurb: "Fuzzy search across actions and records, grouped, with keycaps." },
  { slug: "data-grid", name: "Data Grid", category: "Data", blurb: "Filter, sort, select and page through dense service records." },
  { slug: "agent-run", name: "Agent Run", category: "Agents", blurb: "Live steps, a log stream and a stop control for one agent job." },
  { slug: "auth-panel", name: "Auth Panel", category: "Forms", blurb: "Email and password sign-in with a single sign-on route." },
  { slug: "settings-panel", name: "Settings Panel", category: "Forms", blurb: "Sectioned preferences with switches, selects and a save bar." },
  { slug: "notification-center", name: "Notification Center", category: "App shell", blurb: "Unread alerts, mentions and deploy news in one tray." },
  { slug: "stat-deck", name: "Stat Deck", category: "Data", blurb: "Four headline metrics with deltas and sparklines." },
  { slug: "pricing-table", name: "Pricing Table", category: "Forms", blurb: "Plan comparison with a billing toggle and one call to action." },
  { slug: "upload-queue", name: "Upload Queue", category: "Data", blurb: "Per-file progress, failures and retry in one list." },
  { slug: "activity-feed", name: "Activity Feed", category: "Data", blurb: "Who did what and when, across people and agents." },
  { slug: "composer", name: "Composer", category: "Agents", blurb: "Prompt an agent with attachments, mentions and a send key." },
];

export const charts: readonly CatalogEntry[] = [
  { slug: "area", name: "Area", category: "Trend", blurb: "Volume over time against a comparison period." },
  { slug: "line", name: "Line", category: "Trend", blurb: "Several series on one scale, one in focus." },
  { slug: "bar", name: "Bar", category: "Comparison", blurb: "Discrete periods side by side." },
  { slug: "bar-list", name: "Bar List", category: "Comparison", blurb: "Ranked items with values beside the bars." },
  { slug: "gauge", name: "Gauge", category: "Part of whole", blurb: "One score in a satin bezel against its threshold." },
  { slug: "radial-rings", name: "Radial Rings", category: "Part of whole", blurb: "A few percentages as nested chrome rings." },
  { slug: "heatmap", name: "Heatmap", category: "Distribution", blurb: "Deploys by hour, graded satin to cobalt." },
  { slug: "sparkline", name: "Sparkline", category: "Trend", blurb: "Tiny polished wires inline with a label and value." },
  { slug: "donut", name: "Donut", category: "Part of whole", blurb: "Share of a total in chrome segments." },
  { slug: "scatter", name: "Scatter", category: "Distribution", blurb: "Paired measures as beads, outliers in cobalt." },
  { slug: "funnel", name: "Funnel", category: "Comparison", blurb: "Drop-off between steps in chrome columns." },
  { slug: "waveform", name: "Waveform", category: "Trend", blurb: "Amplitude as a chrome equaliser with a playhead." },
];

export interface TemplateEntry {
  slug: string;
  title: string;
  route: string;
  theme: "satin" | "ink";
  blurb: string;
}

export const templates: readonly TemplateEntry[] = [
  { slug: "dashboard", title: "Home Dashboard", route: "/templates/dashboard", theme: "satin", blurb: "Workspace overview with KPIs, usage, approvals and on-call." },
  { slug: "control-room", title: "Control Room", route: "/templates/control-room", theme: "ink", blurb: "Incident response in Ink: traffic, error budget and agent runs." },
  { slug: "finance-desk", title: "Finance Desk", route: "/templates/finance-desk", theme: "satin", blurb: "Balances, cash flow, payment approvals and budgets by team." },
  { slug: "agent-console", title: "Agent Console", route: "/templates/agent-console", theme: "ink", blurb: "Multi-agent chat with tool calls, plans, diffs and run details." },
  { slug: "analytics", title: "Analytics", route: "/templates/analytics", theme: "satin", blurb: "Sessions, conversion funnel, sources and cohort retention." },
  { slug: "settings", title: "Settings", route: "/templates/settings", theme: "satin", blurb: "Workspace profile, members, billing, API keys and danger zone." }
];

export function findBaseComponent(slug: string | undefined) {
  return baseComponents.find((entry) => entry.slug === slug);
}
