// Catalog-card previews for the 54 base components (BaseComponents artboard), keyed by the slugs in data.ts.
// Each demo renders its own `.base-demo` root, which fills the nearest positioned stage (position: relative,
// a height, overflow: hidden) and centres its content with the card's 16px padding. Open overlays are inert
// plain-markup samples (B2 `inline` roots, A1 static classes); everything else is live.
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Checkbox,
  Chip,
  CodeBlock,
  ColorPicker,
  CommandPalette,
  ContextMenu,
  Divider,
  Drawer,
  EmptyState,
  FileDropzone,
  Gauge,
  HoverCard,
  IconButton,
  InputOTP,
  KeyHint,
  Meter,
  NumberField,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Skeleton,
  Slider,
  Sparkline,
  Spinner,
  Stat,
  StatusIndicator,
  Stepper,
  Surface,
  Switch,
  Table,
  Tabs,
  TagInput,
  Textarea,
  TextField,
  Timeline,
  ToggleButton,
  Toolbar,
  TreeView,
  type CommandPaletteGroup,
  type TreeViewNode
} from "@loreanai/chrome-ui";
import { useState, type CSSProperties, type JSX, type ReactNode } from "react";
import "./demos.css";

/* ---------- shared bits ---------- */

function I({ children, size = 14, style }: { children: ReactNode; size?: 12 | 14 | 16; style?: CSSProperties }) {
  return (
    <svg className="i" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: size, height: size, ...style }}>
      {children}
    </svg>
  );
}

const g = {
  rerun: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sliders: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  wrap: <path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4M15 16l-2 2 2 2M4 18h5" />,
  pin: <path d="M12 17v4M8 3h8l-1 6 3 4H6l3-4z" />,
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />,
  link: <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  terminal: <path d="m4 17 6-5-6-5M12 19h8" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>,
  signOut: <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M18 12H8" />,
  sortDown: <path d="M12 5v14M6 13l6 6 6-6" />
};

const nov = (day: number) => new Date(2026, 10, day);

/** The demo root: fills the stage, centres the sample. `className` picks per-demo stage alignment. */
function Demo({ name, className, inert, children }: { name: string; className?: string; inert?: boolean; children: ReactNode }) {
  return (
    <div className={className ? `base-demo ${className}` : "base-demo"} data-demo={name} inert={inert}>
      {children}
    </div>
  );
}

const Lamp = ({ tone }: { tone: "ok" | "info" | "warn" | "bad" | "off" }) => <StatusIndicator tone={tone} />;

/* ---------- Inputs & controls ---------- */

function ButtonDemo() {
  return (
    <Demo name="button">
      <div className="bd-v" style={{ alignItems: "center", gap: 12 }}>
        <div className="bd-h"><Button finish="polished">Deploy</Button><Button finish="graphite">Cancel</Button></div>
        <div className="bd-h">
          <Button finish="smoked" size="sm" aria-busy="true" leadingIcon={<Spinner size="sm" label="Deploying" />}>Deploying…</Button>
          <Button finish="ghost" size="sm">Skip</Button>
        </div>
      </div>
    </Demo>
  );
}

function ButtonGroupDemo() {
  return (
    <Demo name="button-group">
      <div className="bd-v" style={{ alignItems: "center", gap: 12 }}>
        <ButtonGroup aria-label="Run actions">
          <Button size="sm" leadingIcon={<I>{g.rerun}</I>}>Rerun</Button>
          <Button size="sm">Logs</Button>
          <IconButton size="sm" aria-label="More actions"><I>{g.more}</I></IconButton>
        </ButtonGroup>
        <ButtonGroup variant="split" aria-label="Promote">
          <Button size="sm" finish="polished">Promote to eu-west-1</Button>
          <IconButton size="sm" finish="polished" aria-label="Choose region"><I style={{ strokeWidth: 2 }}>{g.chevron}</I></IconButton>
        </ButtonGroup>
      </div>
    </Demo>
  );
}

const regions = ["eu-west-1", "us-east-2", "ap-south-1"] as const;

function CheckboxDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ "eu-west-1": true, "us-east-2": true, "ap-south-1": false });
  const count = regions.filter((r) => on[r]).length;
  const all = count === regions.length ? true : count ? "indeterminate" : false;
  return (
    <Demo name="checkbox">
      <div className="bd-v sm13" style={{ gap: 8 }}>
        <Checkbox
          checked={all}
          aria-label={`Rollout regions, ${count} of 3 selected`}
          onCheckedChange={() => setOn(Object.fromEntries(regions.map((r) => [r, all !== true])))}
        >
          Rollout regions<span className="xs t3 num bd-after">{count} of 3</span>
        </Checkbox>
        {regions.map((r) => (
          <span key={r} className="bd-indent">
            <Checkbox checked={on[r]} onCheckedChange={(v) => setOn({ ...on, [r]: v === true })}><span className="mono xs">{r}</span></Checkbox>
          </span>
        ))}
      </div>
    </Demo>
  );
}

function ColorPickerDemo() {
  return (
    <Demo name="color-picker">
      <ColorPicker className="bd-fw" defaultValue="#1447E6" />
    </Demo>
  );
}

const people = [
  { name: "Rafael Achebe", label: <><b>Ra</b>fael Achebe</> },
  { name: "Priya Raman", label: <>Priya <b>Ra</b>man</> },
  { name: "Mara Lindqvist", label: <>Ma<b>ra</b> Lindqvist</> }
];

// Open listbox as plain markup (B1 classes): a real Combobox opens its list in a portal.
function ComboboxDemo() {
  return (
    <Demo name="combobox" inert>
      <div className="bd-v bd-fw" style={{ gap: 6 }}>
        <div className="chrome-combobox chrome-in-well" data-state="open">
          <span className="chrome-combobox__icon" aria-hidden="true"><I>{g.person}</I></span>
          <span>ra<span className="bd-caret" /></span>
        </div>
        <div className="chrome-in-popover chrome-combobox__list bd-static-list" role="listbox" aria-label="Assignee">
          {people.map((p, i) => (
            <div key={p.name} role="option" aria-selected={i === 0} className="chrome-in-option" data-highlighted={i === 0 ? "" : undefined}>
              <span className="chrome-in-option__icon" aria-hidden="true"><Avatar name={p.name} size="sm" /></span>
              <span className="chrome-in-option__label">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  );
}

// The picker's open panel, in flow; the Calendar inside is live.
function DatePickerDemo() {
  return (
    <Demo name="date-picker">
      <div className="chrome-in-popover chrome-date-picker__popover">
        <Calendar aria-label="Rollout window" mode="range" size="sm" defaultMonth={nov(1)} defaultValue={{ from: nov(16), to: nov(20) }} today={null} />
      </div>
    </Demo>
  );
}

function FileDropzoneDemo() {
  return (
    <Demo name="file-dropzone">
      <div className="bd-v bd-fw" style={{ gap: 8 }}>
        <FileDropzone
          label={<>Drop runbooks <span className="bd-drop-or">or <span className="link">browse</span></span></>}
          description="Markdown or PDF, up to 20 MB"
          browseLabel=""
          accept=".md,.pdf"
        />
        <div className="float bd-file">
          <I>{g.file}</I>
          <span className="bd-v f1" style={{ gap: 6 }}>
            <span className="mono xs bd-nowrap">rollback-plan.md</span>
            <span className="bd-h" style={{ gap: 8 }}><Progress className="f1" value={68} aria-label="rollback-plan.md uploaded" /><span className="xs t3 num">68%</span></span>
          </span>
          <IconButton finish="ghost" size="sm" aria-label="Cancel upload"><I size={12}>{g.close}</I></IconButton>
        </div>
      </div>
    </Demo>
  );
}

function IconButtonDemo() {
  return (
    <Demo name="icon-button">
      <div className="bd-h" style={{ gap: 12 }}>
        <IconButton finish="polished" size="lg" aria-label="Add service"><I size={16} style={{ strokeWidth: 2 }}>{g.plus}</I></IconButton>
        <IconButton finish="graphite" aria-label="Deploy settings"><I size={16}>{g.sliders}</I></IconButton>
        <IconButton finish="graphite" size="sm" aria-label="Copy run ID"><I>{g.copy}</I></IconButton>
        <IconButton finish="ghost" aria-label="Notifications"><I size={16}>{g.bell}</I></IconButton>
      </div>
    </Demo>
  );
}

function InputOTPDemo() {
  return (
    <Demo name="input-otp">
      <InputOTP
        className="bd-otp"
        label="Verification code"
        defaultValue="418"
        hint={<>Expires in 4:52 · <button type="button" className="bd-linkbtn">Resend</button></>}
      />
    </Demo>
  );
}

function NumberFieldDemo() {
  return (
    <Demo name="number-field">
      <NumberField label="Replicas per region" defaultValue={6} min={2} max={12} hint="Between 2 and 12" style={{ width: 180 }} />
    </Demo>
  );
}

function RadioGroupDemo() {
  return (
    <Demo name="radio-group">
      <div className="bd-v sm13" style={{ gap: 10 }}>
        <span className="field-label" id="bd-rollout">Rollout strategy</span>
        <RadioGroup.Root defaultValue="canary" aria-labelledby="bd-rollout" className="bd-radios">
          <RadioGroup.Item value="canary">Canary<span className="xs t3 bd-after">5% first</span></RadioGroup.Item>
          <RadioGroup.Item value="rolling">Rolling</RadioGroup.Item>
          <RadioGroup.Item value="blue-green">Blue-green</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    </Demo>
  );
}

function SearchFieldDemo() {
  return (
    <Demo name="search-field">
      <div className="bd-v bd-fw" style={{ gap: 10 }}>
        <SearchField aria-label="Search services" placeholder="Search services" shortcut={<KeyHint keys={["/"]} />} />
        <SearchField aria-label="Search services, filled" defaultValue="billing" data-focus-visible="" />
        <span className="xs t3">4 matches in services and runs</span>
      </div>
    </Demo>
  );
}

function SegmentedControlDemo() {
  return (
    <Demo name="segmented-control">
      <div className="bd-v" style={{ alignItems: "center", gap: 12 }}>
        <SegmentedControl aria-label="Time range" defaultValue="24h" items={["1h", "24h", "7d", "30d"].map((v) => ({ value: v, label: v }))} />
        <SegmentedControl
          aria-label="Layout"
          defaultValue="list"
          items={[
            { value: "list", icon: <I>{g.list}</I>, label: <span className="chrome-visually-hidden">List view</span> },
            { value: "grid", icon: <I>{g.grid}</I>, label: <span className="chrome-visually-hidden">Grid view</span> }
          ]}
        />
      </div>
    </Demo>
  );
}

// Open listbox as plain markup (A1 static classes).
function SelectDemo() {
  return (
    <Demo name="select" inert>
      <div className="bd-v bd-fw" style={{ gap: 6 }}>
        <button type="button" className="chrome-select__trigger" data-state="open" aria-haspopup="listbox" aria-expanded="true" aria-label="Region">
          <span className="chrome-select__value"><Lamp tone="ok" />eu-west-1</span>
          <I>{g.chevron}</I>
        </button>
        <div role="listbox" aria-label="Region" className="chrome-select__content bd-static-list">
          <div role="option" aria-selected="true" className="chrome-select__item" data-highlighted=""><span><Lamp tone="ok" />eu-west-1</span><I style={{ color: "var(--chrome-cobalt)" }}>{g.check}</I></div>
          <div role="option" aria-selected="false" className="chrome-select__item"><span><Lamp tone="ok" />us-east-2</span></div>
          <div role="option" aria-selected="false" className="chrome-select__item"><span><Lamp tone="bad" />ap-south-1</span><span className="xs t3">degraded</span></div>
        </div>
      </div>
    </Demo>
  );
}

function SliderDemo() {
  const [value, setValue] = useState([64]);
  return (
    <Demo name="slider">
      <div className="bd-v bd-fw" style={{ gap: 10 }}>
        <span className="bd-h bd-jb"><span className="field-label">Traffic shift</span><span className="num sm t2">{value[0]}%</span></span>
        <Slider className="bd-slider" aria-label="Traffic shift" value={value} onValueChange={setValue} />
        {/* tick scale: page markup (the package Slider has no scale) */}
        <div className="bd-scale" aria-hidden="true">
          <div className="bd-ticks" /><div className="bd-ticks bd-mj" />
          <div className="bd-tkl xs t3 num"><span style={{ left: "0%" }}>0</span><span style={{ left: "50%" }}>50</span><span style={{ left: "100%" }}>100</span></div>
        </div>
      </div>
    </Demo>
  );
}

function SwitchDemo() {
  const rows = [
    { label: "Auto-rollback", on: true },
    { label: "Page on-call", on: true },
    { label: "Quiet hours", on: false }
  ];
  return (
    <Demo name="switch">
      <div className="bd-v bd-fw" style={{ gap: 0 }}>
        {rows.map((row, i) => (
          <div key={row.label}>
            {i ? <Divider /> : null}
            <label className="bd-h bd-jb bd-row10">
              <span className="sm">{row.label}</span>
              <Switch defaultChecked={row.on} aria-label={row.label} />
            </label>
          </div>
        ))}
      </div>
    </Demo>
  );
}

function TagInputDemo() {
  return (
    <Demo name="tag-input">
      <TagInput className="bd-fw" label="Regions" defaultValue={["eu-west-1", "us-east-2"]} placeholder="Add a region" hint="Press Enter to add a region" />
    </Demo>
  );
}

function TextFieldDemo() {
  return (
    <Demo name="text-field">
      <TextField className="bd-fw" label="Repository" leading="orbital-ops/" defaultValue="cache-warm" hint="Lowercase, numbers and dashes" data-focus-visible="" />
    </Demo>
  );
}

function TextareaDemo() {
  return (
    <Demo name="textarea">
      <Textarea
        className="bd-fw"
        label="Rollback note"
        defaultValue={"Reverting v4.18.0: p95 hit 380\u00a0ms in ap-south-1 after the cache change."}
        maxLength={280}
        hint="Shown in the deploy log"
      />
    </Demo>
  );
}

function ToggleButtonDemo() {
  return (
    <Demo name="toggle-button">
      <div className="bd-v" style={{ alignItems: "center", gap: 12 }}>
        <div className="bd-h" style={{ gap: 6 }}>
          <ToggleButton size="sm" defaultPressed><StatusIndicator tone="ok" pulse />Live tail</ToggleButton>
          <ToggleButton size="sm" className="chrome-icon-button" aria-label="Wrap lines"><I>{g.wrap}</I></ToggleButton>
          <ToggleButton size="sm" defaultPressed>UTC</ToggleButton>
        </div>
        <div className="bd-h" style={{ gap: 6 }}>
          <ToggleButton size="sm" defaultPressed><I>{g.pin}</I>Pinned</ToggleButton>
          <ToggleButton size="sm"><I>{g.bell}</I>Watch</ToggleButton>
        </div>
      </div>
    </Demo>
  );
}

/* ---------- Navigation ---------- */

const home = { label: <><I>{g.home}</I><span className="chrome-visually-hidden">Home</span></>, href: "/templates/dashboard" };

function BreadcrumbDemo() {
  const [open, setOpen] = useState(false);
  const middle = open
    ? [{ label: "Services", href: "/templates/control-room" }, { label: "billing-worker", href: "/templates/control-room" }]
    : [{ label: <button type="button" className="bd-more" aria-label="Show 2 more levels" onClick={() => setOpen(true)}><I>{g.more}</I></button> }];
  return (
    <Demo name="breadcrumb">
      <div className="bd-v" style={{ gap: 18 }}>
        <Breadcrumb items={[home, { label: "Services", href: "/templates/control-room" }, { label: "billing-worker" }]} />
        <Breadcrumb aria-label="Breadcrumb, collapsed" items={[home, ...middle, { label: "Deploys", href: "/templates/control-room" }, { label: <span className="mono xs">v4.18.0</span> }]} />
      </div>
    </Demo>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <Demo name="pagination">
      <div className="bd-v" style={{ alignItems: "center", gap: 12 }}>
        <Pagination page={page} count={18} onPageChange={setPage} aria-label="Runs pages" />
        <span className="xs t3 num" aria-live="polite">Runs {(page - 1) * 20 + 1}–{Math.min(page * 20, 352)} of 352</span>
      </div>
    </Demo>
  );
}

function StepperDemo() {
  return (
    <Demo name="stepper">
      <Stepper
        className="bd-fw"
        activeStep={2}
        aria-label="Release v4.18.0"
        steps={[
          { id: "build", label: "Build", description: "2m\u00a014s" },
          { id: "test", label: "Test", description: "4m\u00a002s" },
          { id: "canary", label: "Canary", description: "Running" },
          { id: "live", label: "Live", description: "Waiting" }
        ]}
      />
    </Demo>
  );
}

const tabCopy: Record<string, [string, string]> = {
  overview: ["v4.18.0 live in 3 of 5 regions", "Deployed 41\u00a0s ago by P.\u00a0Raman"],
  deploys: ["12 deploys since Monday", "Last: eu-west-1 at 14:02"],
  logs: ["search-indexer: 38 timeouts", "ap-south-1, last 15\u00a0min"]
};

function TabsDemo() {
  return (
    <Demo name="tabs">
      <Tabs.Root defaultValue="overview" className="bd-v bd-fw" style={{ gap: 12 }}>
        <Tabs.List aria-label="Release v4.18.0">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="deploys">Deploys <Badge className="num">12</Badge></Tabs.Trigger>
          <Tabs.Trigger value="logs">Logs</Tabs.Trigger>
        </Tabs.List>
        {Object.entries(tabCopy).map(([key, [line, meta]]) => (
          <Tabs.Content key={key} value={key}>
            <div className="bd-v" style={{ gap: 4 }}>
              <span className="sm">{line}</span>
              <span className="xs t3">{meta}</span>
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Demo>
  );
}

function ToolbarDemo() {
  return (
    <Demo name="toolbar">
      <div className="bd-editor bd-fw">
        <Toolbar label="Formatting">
          <ToggleButton size="sm" className="chrome-icon-button" defaultPressed aria-label="Bold"><b>B</b></ToggleButton>
          <ToggleButton size="sm" className="chrome-icon-button" aria-label="Italic"><i style={{ fontFamily: "Georgia, serif" }}>I</i></ToggleButton>
          <ToggleButton size="sm" className="chrome-icon-button" aria-label="Inline code"><I>{g.code}</I></ToggleButton>
          <Divider orientation="vertical" />
          <ToggleButton size="sm" className="chrome-icon-button" aria-label="Bulleted list"><I>{g.list}</I></ToggleButton>
          <IconButton size="sm" finish="ghost" aria-label="Link"><I>{g.link}</I></IconButton>
          <IconButton size="sm" finish="ghost" aria-label="More formatting" className="bd-ml"><I>{g.more}</I></IconButton>
        </Toolbar>
        <div className="bd-v" style={{ gap: 2, padding: "10px 12px 12px" }}>
          <span className="sm b">Post-incident review</span>
          <span className="xs t2"><b style={{ fontWeight: 600 }}>search-indexer</b> health checks timed out after the v4.18.0 cache change.</span>
        </div>
      </div>
    </Demo>
  );
}

const lampIcon = (tone: "ok" | "bad") => <StatusIndicator tone={tone} />;
const tree: TreeViewNode[] = [
  {
    id: "orbital-ops",
    label: "orbital-ops",
    icon: <I size={12}>{g.folder}</I>,
    children: [
      {
        id: "services",
        label: "services",
        icon: <I size={12}>{g.folder}</I>,
        children: [
          { id: "api-gateway", label: "api-gateway", icon: lampIcon("ok") },
          { id: "billing-worker", label: "billing-worker", icon: lampIcon("ok") },
          { id: "search-indexer", label: "search-indexer", icon: lampIcon("bad") }
        ]
      },
      {
        id: "agents",
        label: "agents",
        icon: <I size={12}>{g.folder}</I>,
        meta: "3",
        children: [
          { id: "ops-agent", label: "ops-agent", icon: lampIcon("ok") },
          { id: "triage-agent", label: "triage-agent", icon: lampIcon("ok") },
          { id: "cost-agent", label: "cost-agent", icon: lampIcon("ok") }
        ]
      }
    ]
  }
];

function TreeViewDemo() {
  return (
    <Demo name="tree-view">
      <TreeView className="bd-fw" aria-label="Workspace" items={tree} defaultExpanded={["orbital-ops", "services"]} defaultSelected="search-indexer" />
    </Demo>
  );
}

/* ---------- Feedback & status ---------- */

function AlertDemo() {
  return (
    <Demo name="alert">
      <Alert
        className="bd-fw"
        tone="danger"
        role="note"
        title={<><span className="mono bd-mono12">search-indexer</span> failing</>}
        action={<a className="link" href="/templates/control-room">View INC-418</a>}
      >
        <span className="mono bd-nowrap">ap-south-1</span> health checks have timed out for <span className="num">14&nbsp;min</span>.
      </Alert>
    </Demo>
  );
}

function BadgeDemo() {
  return (
    <Demo name="badge">
      <div className="bd-v" style={{ alignItems: "center", gap: 22 }}>
        <div className="bd-h" style={{ gap: 28 }}>
          {/* count bubble and presence dot: page markup (not in the package yet) */}
          <span className="bd-anchor">
            <IconButton aria-label="Notifications, 3 unread"><I size={16}>{g.bell}</I></IconButton>
            <span className="bd-count num" aria-hidden="true">3</span>
          </span>
          <span className="bd-anchor">
            <Avatar name="Hana Sato" size="lg" />
            <span className="bd-presence" role="img" aria-label="Online" />
          </span>
        </div>
        <div className="bd-h" style={{ gap: 6 }}><Badge>v4.18.0</Badge><Badge tone="new">Beta</Badge><Badge tone="bad">SEV-1</Badge></div>
      </div>
    </Demo>
  );
}

function EmptyStateDemo() {
  return (
    <Demo name="empty-state">
      <EmptyState
        compact
        title="No open incidents"
        description={"Pages from on-call land here. The last one closed 6\u00a0days ago."}
        action={<Button size="sm">View runbooks</Button>}
      />
    </Demo>
  );
}

function MeterDemo() {
  return (
    <Demo name="meter">
      <div className="bd-v bd-fw" style={{ gap: 16 }}>
        <Meter label="CPU quota" value={46} segments={10} />
        <Meter
          label={<>Disk · <span className="mono xs">eu-west-1</span></>}
          aria-label="Disk, eu-west-1"
          value={86}
          tone="warning"
          segments={10}
          formatValue={(v) => <span className="bd-h" style={{ gap: 6 }}><StatusIndicator tone="warn" />{v}%</span>}
        />
        <span className="bd-h xs t3" style={{ gap: 8 }}><span className="bd-tick" aria-hidden="true" />Warns above 80%</span>
      </div>
    </Demo>
  );
}

function ProgressDemo() {
  return (
    <Demo name="progress">
      <div className="bd-v bd-fw" style={{ gap: 16, marginTop: -6 }}>
        <div className="bd-v" style={{ gap: 8 }}>
          <span className="bd-h bd-jb sm"><span>Rolling out v4.18.0</span><span className="num t2">62%</span></span>
          <Progress value={62} aria-label="Rolling out v4.18.0" />
        </div>
        <div className="bd-h" style={{ gap: 12 }}>
          {/* ring: the package ring gauge (Progress is a bar only) */}
          <Gauge variant="ring" size={44} value={60} valueText="" unit="" aria-label="Rollout: 3 of 5 regions" />
          <span className="bd-v" style={{ gap: 2 }}><span className="sm">3 of 5 regions</span><span className="xs t3">About 4&nbsp;min left</span></span>
        </div>
        <div className="bd-v" style={{ gap: 6 }}>
          <span className="xs t3">Preparing canary</span>
          <Progress indeterminate aria-label="Preparing canary" />
        </div>
      </div>
    </Demo>
  );
}

function SkeletonDemo() {
  return (
    <Demo name="skeleton">
      <Surface finish="chrome" className="bd-skc bd-fw" role="status" aria-label="Loading service">
        <div className="bd-h" style={{ gap: 10 }}>
          <Skeleton variant="circle" width={32} height={32} />
          <span className="bd-v f1" style={{ gap: 7 }}><Skeleton variant="text" width="70%" /><Skeleton variant="text" width="45%" /></span>
        </div>
        <Skeleton height={36} />
        <Skeleton variant="text" width="85%" />
      </Surface>
    </Demo>
  );
}

function SpinnerDemo() {
  return (
    <Demo name="spinner">
      <div className="bd-v" style={{ alignItems: "center", gap: 22 }}>
        <div className="bd-h" style={{ gap: 28 }}>
          <Spinner finish="cobalt" size="sm" label="Loading logs" />
          <Spinner finish="cobalt" label="Loading runs" />
          <Spinner finish="silver" size="lg" label="Loading traces" />
        </div>
        <Button size="sm" disabled leadingIcon={<Spinner finish="silver" size="sm" label="Replaying" />}>Replaying traffic</Button>
      </div>
    </Demo>
  );
}

const statuses = [
  { service: "api-gateway", tone: "ok", label: "Live", pulse: true },
  { service: "edge-renderer", tone: "info", label: "Rolling" },
  { service: "search-indexer", tone: "bad", label: "Failed" },
  { service: "cache-warm", tone: "warn", label: "Queued" },
  { service: "billing-worker", tone: "off", label: "Paused" }
] as const;

function StatusIndicatorDemo() {
  return (
    <Demo name="status-indicator">
      <div className="bd-fw bd-status">
        {statuses.map((s) => (
          <span key={s.service} className="bd-contents">
            <span className="mono xs">{s.service}</span>
            <StatusIndicator className="sm" tone={s.tone} pulse={"pulse" in s} label={s.label} />
          </span>
        ))}
      </div>
    </Demo>
  );
}

/* ---------- Overlays ---------- */

const paletteGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back v4.18.0", icon: <I>{g.rerun}</I>, shortcut: "↵" },
      { id: "pause", label: "Pause rollout", icon: <I>{g.pause}</I> },
      { id: "restart", label: "Rolling restart", icon: <I>{g.layers}</I> },
      { id: "deploy", label: "Deploy billing-worker", icon: <I>{g.upload}</I>, shortcut: ["⌘", "↵"] }
    ]
  }
];

function CommandPaletteDemo() {
  return (
    <Demo name="command-palette" inert>
      <CommandPalette className="bd-fw" inline size="sm" defaultQuery="roll" groups={paletteGroups} label="Command palette preview" />
    </Demo>
  );
}

function ContextMenuDemo() {
  return (
    <Demo name="context-menu" className="bd-start" inert>
      <div className="bd-scene">
        <ContextMenu.Root inline>
          <ContextMenu.Trigger asChild>
            <div className="bd-target">
              <Lamp tone="bad" />
              <span className="mono xs f1 bd-ellipsis">search-indexer</span>
              <span className="xs t3 num" style={{ flex: "none" }}>380&nbsp;ms</span>
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content style={{ position: "absolute", left: 44, top: 22, width: 164, minWidth: 0 }}>
            <ContextMenu.Item icon={<I>{g.terminal}</I>} shortcut="L" data-highlighted="">Open logs</ContextMenu.Item>
            <ContextMenu.Item icon={<I>{g.copy}</I>}>Copy service ID</ContextMenu.Item>
            <ContextMenu.Item icon={<I>{g.rerun}</I>}>Restart</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item icon={<I>{g.trash}</I>} destructive>Delete service</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
        <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" className="bd-cursor">
          <path d="M1 1v14l4-3.5 2.6 5.5 2.2-1-2.6-5.4H13z" fill="#202222" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </Demo>
  );
}

function DialogDemo() {
  return (
    <Demo name="dialog" inert>
      <div className="bd-page bd-page--dialog" aria-hidden="true">
        {["40%", "90%", "76%", "84%", "62%"].map((w, i) => <span key={w + i} className="bd-sk" style={{ width: w, height: i ? 8 : 10 }} />)}
      </div>
      <span className="bd-scrim" />
      <div role="dialog" aria-label="Roll back v4.18.0?" className="chrome-dialog__content bd-dialog" data-inline="">
        <span className="sm b">Roll back v4.18.0?</span>
        <span className="xs t2"><span className="mono">billing-worker</span> returns to v4.17.3 in all 5&nbsp;regions.</span>
        <div className="bd-h" style={{ justifyContent: "flex-end", gap: 6, marginTop: 12 }}>
          <Button size="sm">Cancel</Button>
          <Button size="sm" finish="enamel">Roll back</Button>
        </div>
      </div>
    </Demo>
  );
}

function DrawerDemo() {
  return (
    <Demo name="drawer" inert>
      <div className="bd-page bd-page--drawer" aria-hidden="true">
        {[36, 120, 38, 120, 28].map((w, i) => <span key={i} className="bd-sk" style={{ width: w, height: i ? 8 : 10 }} />)}
      </div>
      <Drawer.Root inline>
        <Drawer.Content>
          <Drawer.Header eyebrow="INC-418">
            <Drawer.Title>Indexer timeouts</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <StatusIndicator tone="bad" label={<>SEV-1 · <span className="num">14&nbsp;min</span></>} />
            <dl className="bd-kv xs">
              <dt>Owner</dt><dd>M. Lindqvist</dd>
              <dt>Region</dt><dd className="mono">ap-south-1</dd>
            </dl>
          </Drawer.Body>
          <Drawer.Footer>
            <Button finish="graphite" size="sm">Open runbook</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </Demo>
  );
}

function DropdownMenuDemo() {
  return (
    <Demo name="dropdown-menu" inert>
      <div className="bd-v" style={{ width: 184, alignItems: "flex-end", gap: 6 }}>
        <Button size="sm" data-active="" aria-expanded="true" aria-haspopup="menu" aria-label="Account menu" className="bd-avatar-trigger">
          <Avatar name="Mara Lindqvist" size="sm" /><I>{g.chevron}</I>
        </Button>
        <div role="menu" aria-label="Account" className="chrome-dropdown bd-static-list" style={{ width: 184 }}>
          <div className="bd-v bd-menu-head"><span className="sm b">Mara Lindqvist</span><span className="xs t3">Flight director</span></div>
          <div role="separator" className="chrome-dropdown__separator" />
          <div role="menuitem" className="chrome-dropdown__item" data-highlighted=""><I>{g.keyboard}</I><span className="f1">Shortcuts</span><KeyHint keys={["?"]} /></div>
          <div role="menuitem" className="chrome-dropdown__item"><I>{g.signOut}</I>Sign out</div>
        </div>
      </div>
    </Demo>
  );
}

function HoverCardDemo() {
  return (
    <Demo name="hover-card" inert>
      <div className="bd-v bd-fw" style={{ gap: 12, marginTop: -6 }}>
        <HoverCard.Root inline>
          <span className="sm">Assigned to <HoverCard.Trigger asChild><a className="link bd-underline" href="/templates/settings">@rafael</a></HoverCard.Trigger></span>
          <HoverCard.Content arrowOffset={94} style={{ width: "100%" }}>
            <div className="bd-h" style={{ gap: 10 }}>
              <Avatar name="Rafael Achebe" size="lg" />
              <span className="bd-v" style={{ gap: 0 }}><span className="sm b">Rafael Achebe</span><span className="xs t3">SRE lead · Lisbon</span></span>
            </div>
            <Divider />
            <span className="bd-h bd-jb xs">
              <StatusIndicator tone="ok" label="On call until 18:00" />
              <span className="t3 num">14:32</span>
            </span>
          </HoverCard.Content>
        </HoverCard.Root>
      </div>
    </Demo>
  );
}

function PopoverDemo() {
  return (
    <Demo name="popover" inert>
      <div className="bd-v" style={{ alignItems: "center", gap: 10 }}>
        <Popover.Root inline>
          <Popover.Trigger asChild>
            <Button finish="graphite" size="sm" leadingIcon={<I>{g.clock}</I>}>Snooze</Button>
          </Popover.Trigger>
          <Popover.Content style={{ width: 184 }} aria-label="Snooze cache-warm">
            <span className="sm b">Snooze <span className="mono bd-mono12">cache-warm</span></span>
            <span className="xs t2">Pages resume when it ends.</span>
            <SegmentedControl className="bd-fill" style={{ marginTop: 6 }} aria-label="Snooze for" defaultValue="1h" items={["30m", "1h", "4h"].map((v) => ({ value: v, label: v }))} />
          </Popover.Content>
        </Popover.Root>
      </div>
    </Demo>
  );
}

function ToastDemo() {
  return (
    <Demo name="toast" inert>
      <div className="bd-toasts">
        <div className="float bd-toast-back bd-toast-back--2" />
        <div className="float bd-toast-back bd-toast-back--1" />
        <div role="status" className="chrome-toast bd-toast">
          <div className="chrome-toast__title">Rollout paused</div>
          <div className="chrome-toast__description num">v4.18.0 at 62%</div>
          <button type="button" className="chrome-toast__action">Undo</button>
        </div>
        {/* timer wire: page markup (not in the package yet) */}
        <span className="bd-timer" aria-hidden="true"><span style={{ width: "64%" }} /></span>
      </div>
    </Demo>
  );
}

function TooltipDemo() {
  return (
    <Demo name="tooltip" className="bd-tip-stage" inert>
      <div className="bd-tip-row">
        <span className="mono sm t2" style={{ justifySelf: "end" }}>a41f9c2</span>
        <span className="bd-anchor">
          <IconButton size="sm" data-active="" aria-label="Copy commit SHA"><I>{g.copy}</I></IconButton>
          <span role="tooltip" className="chrome-tooltip bd-tip">Copy commit SHA<KeyHint keys={["⌘C"]} /></span>
        </span>
        <span />
      </div>
    </Demo>
  );
}

/* ---------- Data display & layout ---------- */

function AccordionDemo() {
  return (
    <Demo name="accordion">
      <Accordion.Root type="single" collapsible defaultValue="triggers" className="bd-fw">
        <Accordion.Item value="triggers">
          <Accordion.Trigger>Rollback triggers</Accordion.Trigger>
          <Accordion.Content>p95 above 300&nbsp;ms or errors above 1% for 5&nbsp;minutes.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="paging">
          <Accordion.Trigger>Paging rules</Accordion.Trigger>
          <Accordion.Content>Page the on-call SRE after 2&nbsp;minutes; escalate to the lead after 10.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="regions">
          <Accordion.Trigger>Regions</Accordion.Trigger>
          <Accordion.Content>us-east-2, eu-west-1, ap-south-1, sa-east-1 and ca-central-1.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Demo>
  );
}

function AvatarDemo() {
  return (
    <Demo name="avatar">
      <div className="bd-v" style={{ alignItems: "center", gap: 22 }}>
        <div className="bd-stack" role="group" aria-label="6 people on this incident">
          {["Mara Lindqvist", "Rafael Achebe", "Priya Raman", "Hana Sato"].map((n) => <Avatar key={n} name={n} />)}
          {/* overflow count: the Avatar markup with a count (no "+N" variant in the package) */}
          <span className="chrome-avatar" data-size="md"><span className="t2" aria-hidden="true">+2</span><span className="chrome-avatar__name">2 more</span></span>
        </div>
        <div className="bd-h" style={{ gap: 10 }}>
          <span className="bd-anchor"><Avatar name="Kwame Mensah" size="lg" /><span className="bd-presence" role="img" aria-label="Online" /></span>
          <span className="bd-v" style={{ gap: 0 }}><span className="sm b">Kwame Mensah</span><span className="xs t3">Support · online</span></span>
        </div>
      </div>
    </Demo>
  );
}

function CalendarDemo() {
  return (
    <Demo name="calendar" className="bd-pad8">
      <Calendar
        aria-label="Release calendar"
        size="sm"
        defaultMonth={nov(1)}
        defaultValue={nov(17)}
        today={null}
        isDateMarked={(d) => d.getDay() === 2}
        markedLabel="release train"
        legend="Release train, every Tuesday"
      />
    </Demo>
  );
}

function ChipDemo() {
  const [people, setPeople] = useState(["Priya Raman"]);
  return (
    <Demo name="chip">
      <div className="bd-h bd-wrap" style={{ justifyContent: "center", gap: "8px 6px" }}>
        <Chip defaultSelected>Failed</Chip>
        <Chip defaultSelected={false}>Rolling</Chip>
        <Chip defaultSelected={false}>Live</Chip>
        {people.map((name) => (
          <Chip key={name} avatar={<Avatar name={name} size="sm" />} onRemove={() => setPeople([])}>{name}</Chip>
        ))}
        <Chip variant="dashed" icon={<I size={12}>{g.plus}</I>} onClick={() => setPeople(["Priya Raman"])}>Add filter</Chip>
      </div>
    </Demo>
  );
}

const deployCode = `import { Button } from
  '@loreanai/chrome-ui'

<Button finish="polished">
  Deploy
</Button>`;

function CodeBlockDemo() {
  return (
    <Demo name="code-block" className="bd-pad12">
      <CodeBlock className="bd-fw bd-code" filename="Deploy.tsx" code={deployCode} />
    </Demo>
  );
}

function DividerDemo() {
  return (
    <Demo name="divider">
      <div className="bd-v bd-fw" style={{ gap: 16, marginTop: 6 }}>
        <div className="bd-h sm" style={{ justifyContent: "center", gap: 12 }}>
          <span>Logs</span><Divider orientation="vertical" className="bd-vr" /><span>Metrics</span><Divider orientation="vertical" className="bd-vr" /><span>Traces</span>
        </div>
        <Divider label="Earlier today" />
        <div className="bd-v" style={{ gap: 0 }}>
          <span className="bd-h bd-jb" style={{ padding: "6px 0" }}><span className="mono xs">api-gateway</span><span className="num xs t2">41s</span></span>
          <Divider />
          <span className="bd-h bd-jb" style={{ padding: "6px 0" }}><span className="mono xs">edge-renderer</span><span className="num xs t2">2m 10s</span></span>
        </div>
      </div>
    </Demo>
  );
}

function KeyHintDemo() {
  const rows: [string, ReactNode][] = [
    ["Command palette", <KeyHint keys={["⌘", "K"]} />],
    ["Deploy", <KeyHint keys={["⌘", "↵"]} />],
    ["Switch theme", <KeyHint keys={["⇧", "⌘", "L"]} />],
    ["Next incident", <span className="bd-h" style={{ gap: 4 }}><KeyHint keys={["G"]} /><span className="xs t3">then</span><KeyHint keys={["I"]} /></span>]
  ];
  return (
    <Demo name="key-hint">
      <dl className="bd-v bd-fw sm bd-keys">
        {rows.map(([label, keys]) => <div key={label} className="bd-h bd-jb"><dt>{label}</dt><dd>{keys}</dd></div>)}
      </dl>
    </Demo>
  );
}

const requests = [32, 28, 30, 23, 25, 19, 21, 15, 16, 10, 11].map((y) => 40 - y);

function StatDemo() {
  return (
    <Demo name="stat">
      <Stat
        className="bd-fw bd-stat"
        label="Requests"
        value={<>31.6k<span className="sm t3 bd-unit">/ min</span></>}
        delta="+8.2%"
        trend="up"
        sentiment="positive"
        description={<><Sparkline className="bd-spark" data={requests} domain={[0, 40]} height={40} finish="cobalt" /><span className="xs t3 num">29.2k at this time last Monday</span></>}
      />
    </Demo>
  );
}

function SurfaceDemo() {
  const layers = [
    { finish: "ink", label: "Card", level: 0 },
    { finish: "edge", label: "Raised", level: 1 },
    { finish: "chrome", label: "Float", level: 2 }
  ] as const;
  return (
    <Demo name="surface">
      <div className="bd-surfaces">
        {layers.map((l) => (
          <Surface key={l.label} finish={l.finish} className="bd-layer" data-level={l.level}>
            <span className="bd-h bd-jb sm"><span>{l.label}</span><span className="mono xs t3">{l.level}</span></span>
          </Surface>
        ))}
      </div>
    </Demo>
  );
}

const p95 = [
  { service: "search-indexer", tone: "bad", ms: "380\u00a0ms" },
  { service: "edge-renderer", tone: "info", ms: "112\u00a0ms" },
  { service: "api-gateway", tone: "ok", ms: "42\u00a0ms" }
] as const;

function TableDemo() {
  return (
    <Demo name="table">
      <div className="float bd-fw bd-table">
        <Table density="compact" aria-label="p95 latency by service">
          <thead>
            <tr>
              <th scope="col">Service</th>
              <th scope="col" className="r" aria-sort="descending"><span className="bd-h bd-sorted">p95<I size={12}>{g.sortDown}</I></span></th>
            </tr>
          </thead>
          <tbody>
            {p95.map((r) => (
              <tr key={r.service}>
                <td><span className="bd-h"><Lamp tone={r.tone} /><span className="mono">{r.service}</span></span></td>
                <td className="r num">{r.ms}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Demo>
  );
}

function TimelineDemo() {
  return (
    <Demo name="timeline">
      <Timeline
        className="bd-fw"
        items={[
          { id: "live", title: <>v4.18.0 live in <span className="mono xs">eu-west-1</span></>, meta: "14:02 · Ops agent", tone: "accent" },
          { id: "canary", title: <>Canary passed in <span className="mono xs">us-east-2</span></>, meta: "13:48 · 12 of 12 checks" },
          { id: "build", title: "Build 2,114 finished", meta: "13:31 · 2m\u00a014s" }
        ]}
      />
    </Demo>
  );
}

export const baseDemos: Record<string, () => JSX.Element> = {
  "button": ButtonDemo,
  "button-group": ButtonGroupDemo,
  "checkbox": CheckboxDemo,
  "color-picker": ColorPickerDemo,
  "combobox": ComboboxDemo,
  "date-picker": DatePickerDemo,
  "file-dropzone": FileDropzoneDemo,
  "icon-button": IconButtonDemo,
  "input-otp": InputOTPDemo,
  "number-field": NumberFieldDemo,
  "radio-group": RadioGroupDemo,
  "search-field": SearchFieldDemo,
  "segmented-control": SegmentedControlDemo,
  "select": SelectDemo,
  "slider": SliderDemo,
  "switch": SwitchDemo,
  "tag-input": TagInputDemo,
  "text-field": TextFieldDemo,
  "textarea": TextareaDemo,
  "toggle-button": ToggleButtonDemo,
  "breadcrumb": BreadcrumbDemo,
  "pagination": PaginationDemo,
  "stepper": StepperDemo,
  "tabs": TabsDemo,
  "toolbar": ToolbarDemo,
  "tree-view": TreeViewDemo,
  "alert": AlertDemo,
  "badge": BadgeDemo,
  "empty-state": EmptyStateDemo,
  "meter": MeterDemo,
  "progress": ProgressDemo,
  "skeleton": SkeletonDemo,
  "spinner": SpinnerDemo,
  "status-indicator": StatusIndicatorDemo,
  "command-palette": CommandPaletteDemo,
  "context-menu": ContextMenuDemo,
  "dialog": DialogDemo,
  "drawer": DrawerDemo,
  "dropdown-menu": DropdownMenuDemo,
  "hover-card": HoverCardDemo,
  "popover": PopoverDemo,
  "toast": ToastDemo,
  "tooltip": TooltipDemo,
  "accordion": AccordionDemo,
  "avatar": AvatarDemo,
  "calendar": CalendarDemo,
  "chip": ChipDemo,
  "code-block": CodeBlockDemo,
  "divider": DividerDemo,
  "key-hint": KeyHintDemo,
  "stat": StatDemo,
  "surface": SurfaceDemo,
  "table": TableDemo,
  "timeline": TimelineDemo
};
