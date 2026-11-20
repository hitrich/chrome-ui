import { Divider, IconButton, Stepper, StatusIndicator, ToggleButton, Toolbar, TreeView, type TreeViewNode } from "@loreanai/chrome-ui";
import { Icon } from "../../components/Icon";
import { G } from "./glyphs";
import type { ComponentDoc } from "./types";

const AA = "WCAG 2.2 AA";

const stages = [
  { id: "build", label: "Build", description: "2m 14s" },
  { id: "test", label: "Test", description: "4m 02s" },
  { id: "canary", label: "Canary", description: "Running" },
  { id: "live", label: "Live", description: "Waiting" }
];

const lamp = (tone: "ok" | "bad") => <StatusIndicator tone={tone} />;
const workspace: TreeViewNode[] = [
  {
    id: "orbital-ops",
    label: "orbital-ops",
    children: [
      {
        id: "services",
        label: "services",
        children: [
          { id: "api-gateway", label: "api-gateway", icon: lamp("ok") },
          { id: "billing-worker", label: "billing-worker", icon: lamp("ok") },
          { id: "search-indexer", label: "search-indexer", icon: lamp("bad") }
        ]
      },
      { id: "agents", label: "agents", meta: "3", children: [{ id: "ops-agent", label: "ops-agent", icon: lamp("ok") }] }
    ]
  }
];

export const navigationDocs: Record<string, ComponentDoc> = {
  breadcrumb: {
    tags: [AA],
    imports: ["Breadcrumb"],
    code: `import { Breadcrumb } from "@loreanai/chrome-ui";

<Breadcrumb
  items={[
    { label: "Services", href: "/services" },
    { label: "billing-worker", href: "/services/billing-worker" },
    { label: "Deploys", href: "/services/billing-worker/deploys" },
    { label: "v4.18.0" }
  ]}
/>`,
    props: [
      {
        extends: "Also takes `nav` attributes. Links are plain `a href`: in a client-routed app, intercept the click or render your own trail.",
        rows: [
          { name: "items", type: "readonly BreadcrumbItem[]", description: "`{ label, href?, current? }` from the root down. The last item without `href` is the current page." },
          { name: "separator", type: "ReactNode", default: "chevron", description: "Drawn between items, `aria-hidden`." },
          { name: "aria-label", type: "string", default: '"Breadcrumb"', description: "Names the landmark." }
        ]
      }
    ],
    a11y: [
      { badge: "nav", text: "A `nav` landmark named “Breadcrumb” around an ordered list, so the depth is announced." },
      { badge: "aria-current", text: "The current page is a plain span with `aria-current=\"page\"`, never a link to itself." },
      { keys: ["Tab"], text: "Each ancestor is a link in reading order; separators are skipped." }
    ]
  },

  pagination: {
    tags: [AA],
    imports: ["Pagination"],
    code: `import { useState } from "react";
import { Pagination } from "@loreanai/chrome-ui";

export function RunPages() {
  const [page, setPage] = useState(3);
  return <Pagination aria-label="Runs" page={page} count={18} onPageChange={setPage} />;
}`,
    props: [
      {
        extends: "Also takes `nav` attributes. Long counts collapse to first, last and the pages around the current one, with “…” between.",
        rows: [
          { name: "page", type: "number", description: "Current page, from 1; clamped to the count." },
          { name: "count", type: "number", description: "Number of pages." },
          { name: "onPageChange", type: "(page: number) => void", description: "Called with the page a reader picks." },
          { name: "previousLabel", type: "string", default: '"Previous page"', description: "Name of the previous button." },
          { name: "nextLabel", type: "string", default: '"Next page"', description: "Name of the next button." },
          { name: "aria-label", type: "string", default: '"Pagination"', description: "Names the landmark, such as “Runs”." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab", "Enter"], text: "Every page is a button named “Page 3”; Enter or Space goes there." },
      { badge: "aria-current", text: "The current page carries `aria-current=\"page\"`; previous and next disable at the ends." },
      { badge: "readout", text: "Pair it with a visible range such as “Runs 41–60 of 352” so the position is clear without counting." }
    ]
  },

  stepper: {
    tags: [AA],
    imports: ["Stepper"],
    code: `import { Stepper } from "@loreanai/chrome-ui";

const stages = [
  { id: "build", label: "Build", description: "2m 14s" },
  { id: "test", label: "Test", description: "4m 02s" },
  { id: "canary", label: "Canary", description: "Running" },
  { id: "live", label: "Live", description: "Waiting" }
];

<Stepper steps={stages} activeStep={2} aria-label="Deploy v4.18.0" />`,
    sections: [
      {
        id: "orientation",
        title: "Vertical",
        text: "Steps before `activeStep` show a check, the active one is lit, the rest wait.",
        samples: [{ label: 'orientation="vertical"', node: <Stepper steps={stages} activeStep={2} orientation="vertical" aria-label="Deploy stages" /> }]
      }
    ],
    props: [
      {
        extends: "Also takes `ol` attributes.",
        rows: [
          { name: "steps", type: "readonly StepperItem[]", description: "`{ id, label, description?, disabled? }` in order." },
          { name: "activeStep", type: "number", default: "0", description: "Index of the current step; earlier ones are complete." },
          { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Row or column." },
          { name: "onStepChange", type: "(index: number) => void", description: "Makes every step a button, so readers can jump between stages." }
        ]
      }
    ],
    a11y: [
      { badge: "ol", text: "An ordered list, so “step 3 of 4” comes from the markup." },
      { badge: "aria-current", text: "The active step carries `aria-current=\"step\"`; the check on finished steps is decorative." },
      { keys: ["Tab", "Enter"], text: "With `onStepChange`, each step is a button in the tab order." }
    ]
  },

  tabs: {
    tags: ["Radix Tabs", AA],
    imports: ["Badge", "Tabs"],
    code: `import { Badge, Tabs } from "@loreanai/chrome-ui";

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="billing-worker">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="deploys">Deploys <Badge>12</Badge></Tabs.Trigger>
    <Tabs.Trigger value="logs">Logs</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">v4.18.0 live in 3 of 5 regions.</Tabs.Content>
  <Tabs.Content value="deploys">12 deploys this week.</Tabs.Content>
  <Tabs.Content value="logs">Streaming from eu-west-1.</Tabs.Content>
</Tabs.Root>`,
    props: [
      {
        part: "Tabs.Root",
        extends: "Radix `Tabs.Root`, unchanged.",
        rows: [
          { name: "value", type: "string", description: "Controlled active tab." },
          { name: "defaultValue", type: "string", description: "Starting tab when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called when the tab changes." },
          { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which arrow keys move between tabs." },
          { name: "activationMode", type: '"automatic" | "manual"', default: '"automatic"', description: "Manual waits for Enter or Space before switching." }
        ]
      },
      {
        part: "Tabs.List · Tabs.Trigger · Tabs.Content",
        extends: "Radix parts with the chrome underline. Name the list with `aria-label`.",
        rows: [
          { name: "loop", type: "boolean", default: "true", description: "On List: arrow keys wrap around." },
          { name: "value", type: "string", description: "On Trigger and Content: pairs a tab with its panel." },
          { name: "disabled", type: "boolean", default: "false", description: "On Trigger: skips the tab." },
          { name: "forceMount", type: "true", description: "On Content: keeps an inactive panel mounted." }
        ]
      }
    ],
    a11y: [
      { keys: ["←", "→"], text: "Move between tabs and show each panel; Home and End jump to the ends." },
      { keys: ["Tab"], text: "From the active tab, Tab moves into its panel." },
      { badge: "tablist", text: "Tabs, tablist and tabpanel roles are wired, with `aria-selected` and `aria-controls`." }
    ]
  },

  toolbar: {
    tags: [AA],
    imports: ["IconButton", "ToggleButton", "Toolbar"],
    code: `import { IconButton, ToggleButton, Toolbar } from "@loreanai/chrome-ui";
import { Bold, Italic, Link } from "./icons";

<Toolbar label="Formatting">
  <ToggleButton aria-label="Bold"><Bold /></ToggleButton>
  <ToggleButton aria-label="Italic"><Italic /></ToggleButton>
  <IconButton finish="ghost" size="sm" aria-label="Insert link"><Link /></IconButton>
</Toolbar>`,
    sections: [
      {
        id: "orientation",
        title: "Orientation",
        text: "Inside a Toolbar a ToggleButton becomes a quiet 28 px key; vertical toolbars move focus with ↑ and ↓.",
        samples: [
          {
            label: 'orientation="horizontal"',
            node: (
              <Toolbar label="Formatting">
                <ToggleButton aria-label="Bold" defaultPressed><G name="bold" size={14} /></ToggleButton>
                <ToggleButton aria-label="Italic"><G name="italic" size={14} /></ToggleButton>
                <Divider orientation="vertical" />
                <IconButton finish="ghost" size="sm" aria-label="Insert link"><Icon name="link" size={14} /></IconButton>
              </Toolbar>
            )
          },
          {
            label: 'orientation="vertical"',
            node: (
              <Toolbar label="View" orientation="vertical">
                <ToggleButton aria-label="List" defaultPressed><G name="list" size={14} /></ToggleButton>
                <ToggleButton aria-label="Grid"><G name="grid" size={14} /></ToggleButton>
              </Toolbar>
            )
          }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes except `aria-label`, which comes from `label`.",
        rows: [
          { name: "label", type: "string", description: "Required. Names the toolbar." },
          { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which arrow keys move focus." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab"], text: "The toolbar is one tab stop; it remembers the last control used." },
      { keys: ["←", "→"], text: "Move between controls, wrapping at the ends (↑ and ↓ when vertical). Home and End jump." },
      { badge: "toolbar", text: "`role=\"toolbar\"` with `aria-orientation`; icon-only keys each need an `aria-label`." }
    ]
  },

  "tree-view": {
    tags: ["New", AA],
    imports: ["StatusIndicator", "TreeView"],
    code: `import { StatusIndicator, TreeView, type TreeViewNode } from "@loreanai/chrome-ui";

const workspace: TreeViewNode[] = [
  {
    id: "orbital-ops",
    label: "orbital-ops",
    children: [
      {
        id: "services",
        label: "services",
        children: [
          { id: "api-gateway", label: "api-gateway", icon: <StatusIndicator tone="ok" /> },
          { id: "billing-worker", label: "billing-worker", icon: <StatusIndicator tone="ok" /> },
          { id: "search-indexer", label: "search-indexer", icon: <StatusIndicator tone="bad" /> }
        ]
      },
      { id: "agents", label: "agents", meta: "3", children: [{ id: "ops-agent", label: "ops-agent" }] }
    ]
  }
];

export function WorkspaceTree({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <TreeView
      aria-label="Workspace"
      items={workspace}
      defaultExpanded={["orbital-ops", "services"]}
      defaultSelected="search-indexer"
      onSelectedChange={(id) => onOpen(id)}
    />
  );
}`,
    sections: [
      {
        id: "lines",
        title: "Guides",
        text: "Nested leaves sit beside an engraved guide; `lines={false}` drops it for dense sidebars.",
        samples: [
          { label: "lines", node: <div style={{ width: 220 }}><TreeView aria-label="Workspace" items={workspace} defaultExpanded={["orbital-ops", "services"]} defaultSelected="search-indexer" /></div> },
          { label: "lines={false}", node: <div style={{ width: 220 }}><TreeView aria-label="Workspace without guides" items={workspace} defaultExpanded={["orbital-ops", "services"]} lines={false} /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `ul` attributes; name it with `aria-label`.",
        rows: [
          { name: "items", type: "readonly TreeViewNode[]", description: "`{ id, label, textValue?, icon?, meta?, children?, disabled? }`." },
          { name: "expanded", type: "readonly string[]", description: "Controlled ids of open parents." },
          { name: "defaultExpanded", type: "readonly string[]", default: "[]", description: "Parents open at first." },
          { name: "onExpandedChange", type: "(ids: string[]) => void", description: "Called when a parent opens or closes." },
          { name: "selected", type: "string | null", description: "Controlled selected id." },
          { name: "defaultSelected", type: "string | null", default: "null", description: "Selected at first when uncontrolled." },
          { name: "onSelectedChange", type: "(id: string, node: TreeViewNode) => void", description: "Called on click, Enter or Space." },
          { name: "lines", type: "boolean", default: "true", description: "Engraved guide beside nested leaves." }
        ]
      }
    ],
    a11y: [
      { keys: ["↑", "↓"], text: "Move through visible rows; Home and End jump. Typing letters jumps to a matching row." },
      { keys: ["→", "←"], text: "Open a parent or step into it; close it or step back to the parent." },
      { keys: ["Enter", "Space"], text: "Select the focused row. The tree is one tab stop with `aria-expanded` and `aria-selected` on rows." }
    ]
  }
};
