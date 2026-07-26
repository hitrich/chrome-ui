import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  ChromeProvider,
  CodeBlock,
  Dialog,
  Divider,
  DropdownMenu,
  EmptyState,
  FileDropzone,
  IconButton,
  KeyHint,
  Meter,
  Pagination,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stat,
  StatusIndicator,
  Stepper,
  Surface,
  Switch,
  Table,
  Tabs,
  TextField,
  Timeline,
  Toast,
  ToggleButton,
  Toolbar,
  Tooltip
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { DocsRail } from "../components/DocsRail";
import { Header } from "../components/Header";
import { UiIcon } from "../components/UiIcon";
import { componentDocs } from "../data";

function ComponentPreview({ slug }: { slug: string }) {
  const [buttonState, setButtonState] = useState("Focus");
  const [switchOn, setSwitchOn] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [page, setPage] = useState(4);
  const [step, setStep] = useState(1);

  if (slug === "avatar") return <div className="inline-demo"><Avatar name="Arin Reyes" size="lg" /><Avatar name="Chrome Library" /><Avatar name="Violet Transmission" size="sm" /></div>;
  if (slug === "chrome-provider") return <div className="provider-demo"><ChromeProvider theme="ink" motion="reduced"><Surface finish="edge"><strong>Ink scope</strong><span>Reduced motion</span></Surface></ChromeProvider></div>;
  if (slug === "button") {
    const previewClass = buttonState === "Default" ? undefined : `preview-button--${buttonState.toLowerCase()}`;
    return (
      <>
        <Button size="lg" className={previewClass} disabled={buttonState === "Disabled"}>
          Create project <UiIcon name="arrow-right" />
        </Button>
        <div className="state-selector" aria-label="Button preview state">
          {["Default", "Hover", "Focus", "Pressed", "Disabled"].map((state) => (
            <button key={state} aria-pressed={buttonState === state} onClick={() => setButtonState(state)}>{state}</button>
          ))}
        </div>
      </>
    );
  }
  if (slug === "icon-button") return <IconButton size="lg" aria-label="Favorite component"><UiIcon name="star" /></IconButton>;
  if (slug === "text-field") return <TextField label="Project name" placeholder="Violet Transmission" hint="Names can be changed later." trailing={<UiIcon name="sliders" />} />;
  if (slug === "select") return <Select.Root defaultValue="analog"><Select.Trigger aria-label="Input source"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item><Select.Item value="usb">USB interface</Select.Item><Select.Item value="loop">Loopback</Select.Item><Select.Item value="line" disabled>Line input unavailable</Select.Item></Select.Content></Select.Root>;
  if (slug === "checkbox") return <Checkbox defaultChecked>Include component styles</Checkbox>;
  if (slug === "radio-group") return <RadioGroup.Root defaultValue="ink"><RadioGroup.Item value="ink">Ink</RadioGroup.Item><RadioGroup.Item value="arctic">Arctic</RadioGroup.Item></RadioGroup.Root>;
  if (slug === "switch") return <label className="labeled-control"><span>Responsive light</span><Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="Responsive light" /></label>;
  if (slug === "slider") return <div className="wide-demo"><span>Reflection intensity</span><Slider defaultValue={[64]} aria-label="Reflection intensity" /></div>;
  if (slug === "tabs") return <Tabs.Root defaultValue="preview"><Tabs.List><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code">Code</Tabs.Trigger><Tabs.Trigger value="anatomy">Anatomy</Tabs.Trigger></Tabs.List><Tabs.Content value="preview"><p>The active plane stays clear and connected.</p></Tabs.Content><Tabs.Content value="code"><p>Compound parts preserve accessible structure.</p></Tabs.Content><Tabs.Content value="anatomy"><p>List, trigger, and content form one relationship.</p></Tabs.Content></Tabs.Root>;
  if (slug === "badge") return <div className="inline-demo"><Badge>Neutral</Badge><Badge tone="accent">Focused</Badge><Badge tone="danger">Live</Badge><Badge tone="success">Ready</Badge></div>;
  if (slug === "tooltip") return <Tooltip.Root defaultOpen><Tooltip.Trigger asChild><IconButton aria-label="Material information"><UiIcon name="sparkle" /></IconButton></Tooltip.Trigger><Tooltip.Content>Reactive chrome finish</Tooltip.Content></Tooltip.Root>;
  if (slug === "dropdown") return <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button>Project actions <UiIcon name="sliders" /></Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>Duplicate project</DropdownMenu.Item><DropdownMenu.Item>Save snapshot</DropdownMenu.Item><DropdownMenu.Item>Export package</DropdownMenu.Item><DropdownMenu.Separator /><DropdownMenu.Item disabled>Delete unavailable</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>;
  if (slug === "dialog") return <Dialog.Root><Dialog.Trigger asChild><Button>Open dialog <UiIcon name="external" /></Button></Dialog.Trigger><Dialog.Content><Dialog.Title>Export package</Dialog.Title><Dialog.Description>Components, tokens, and CSS will be prepared for download.</Dialog.Description><div className="dialog-actions"><Dialog.Close asChild><Button variant="quiet">Cancel</Button></Dialog.Close><Dialog.Close asChild><Button>Export</Button></Dialog.Close></div></Dialog.Content></Dialog.Root>;
  if (slug === "toast") return <Toast.Provider><Button onClick={() => setToastOpen(true)}>Save snapshot</Button><Toast.Root open={toastOpen} onOpenChange={setToastOpen}><Toast.Title>Snapshot saved</Toast.Title><Toast.Description>Just now</Toast.Description><Toast.Close aria-label="Dismiss"><UiIcon name="close" /></Toast.Close></Toast.Root><Toast.Viewport /></Toast.Provider>;
  if (slug === "progress") return <div className="wide-demo"><span>Package build · 68%</span><Progress value={68} aria-label="Package build" /></div>;
  if (slug === "surface") return <div className="surface-demo"><Surface finish="ink">Ink</Surface><Surface finish="edge">Edge</Surface><Surface finish="chrome">Chrome</Surface></div>;
  if (slug === "alert") return <Alert tone="success" title="Package is ready" action={<Button size="sm" variant="quiet">View log</Button>}>38 exports compiled without warnings.</Alert>;
  if (slug === "breadcrumb") return <Breadcrumb items={[{ label: "Workspace", href: "#workspace" }, { label: "Components", href: "#components" }, { label: "Alert", current: true }]} />;
  if (slug === "code-block") return <CodeBlock filename="signal.tsx" language="tsx" code={'<Alert tone="success" title="Ready">\n  Package compiled.\n</Alert>'} />;
  if (slug === "divider") return <div className="wide-demo"><span>Input stage</span><Divider label="Signal chain" /><span>Output stage</span></div>;
  if (slug === "empty-state") return <EmptyState title="No saved views" description="Pin a filter set to return to this exact workspace." icon={<UiIcon name="bookmark" />} action={<Button size="sm">Create view</Button>} />;
  if (slug === "file-dropzone") return <FileDropzone accept=".json,.tsx" label="Drop component files" description="JSON or TSX · up to 12 MB" />;
  if (slug === "key-hint") return <div className="shortcut-demo"><span>Command menu <KeyHint keys={["⌘", "K"]} /></span><span>Save snapshot <KeyHint keys={["⌘", "S"]} /></span></div>;
  if (slug === "meter") return <div className="wide-demo"><Meter label="Signal headroom" value={72} tone="success" /><Meter label="CPU pressure" value={43} tone="accent" /></div>;
  if (slug === "pagination") return <Pagination page={page} count={12} onPageChange={setPage} />;
  if (slug === "search-field") return <div className="wide-demo"><SearchField label="Search components" defaultValue="Reactive chrome" shortcut={<KeyHint keys={["⌘", "K"]} />} /></div>;
  if (slug === "segmented-control") return <SegmentedControl aria-label="Component view" defaultValue="preview" items={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }, { value: "anatomy", label: "Anatomy" }]} />;
  if (slug === "skeleton") return <div className="skeleton-demo"><Skeleton variant="circle" width={52} /><div><Skeleton variant="text" width="42%" /><Skeleton variant="text" width="78%" /><Skeleton height={72} /></div></div>;
  if (slug === "spinner") return <div className="spinner-demo"><Spinner size="sm" label="Loading compact view" /><Spinner label="Loading view" /><Spinner size="lg" label="Loading detailed view" /></div>;
  if (slug === "stat") return <div className="stat-demo"><Stat label="Build time" value="1.84s" delta="12.4%" trend="down" sentiment="positive" description="Compared with previous build" /><Stat label="A11y checks" value="100%" delta="Clear" trend="up" sentiment="positive" description="38 components verified" /></div>;
  if (slug === "status-indicator") return <div className="status-demo"><StatusIndicator tone="success" label="Operational" pulse /><StatusIndicator tone="warning" label="Degraded" /><StatusIndicator tone="danger" label="Offline" /></div>;
  if (slug === "stepper") return <Stepper activeStep={step} onStepChange={setStep} steps={[{ id: "source", label: "Source", description: "Connect" }, { id: "map", label: "Map", description: "Configure" }, { id: "review", label: "Review", description: "Confirm" }]} />;
  if (slug === "table") return <Table aria-label="Recent component builds"><thead><tr><th>Component</th><th>Status</th><th>Build</th></tr></thead><tbody><tr data-selected="true"><td>Command surface</td><td><StatusIndicator tone="success" label="Ready" /></td><td>1.84s</td></tr><tr><td>Signal meter</td><td><StatusIndicator tone="accent" label="Review" /></td><td>2.06s</td></tr><tr><td>File dropzone</td><td><StatusIndicator tone="neutral" label="Draft" /></td><td>—</td></tr></tbody></Table>;
  if (slug === "timeline") return <Timeline items={[{ id: "1", title: "Package published", description: "Version 0.2.0 is available to the workspace.", meta: "14:32", tone: "success" }, { id: "2", title: "Accessibility pass", description: "Keyboard and contrast checks completed.", meta: "14:18", tone: "accent" }, { id: "3", title: "Build queued", description: "38 exports entered the pipeline.", meta: "14:02" }]} />;
  if (slug === "toggle-button") return <div className="inline-demo"><ToggleButton defaultPressed><UiIcon name="bookmark" /> Pinned</ToggleButton><ToggleButton><UiIcon name="star" /> Favorite</ToggleButton><ToggleButton disabled>Locked</ToggleButton></div>;
  if (slug === "toolbar") return <Toolbar label="Component actions"><IconButton size="sm" variant="quiet" aria-label="Favorite"><UiIcon name="star" /></IconButton><IconButton size="sm" variant="quiet" aria-label="Save"><UiIcon name="bookmark" /></IconButton><Divider orientation="vertical" /><ToggleButton size="sm" defaultPressed><UiIcon name="sliders" /> Inspect</ToggleButton><IconButton size="sm" variant="quiet" aria-label="Delete"><UiIcon name="trash" /></IconButton></Toolbar>;
  return null;
}

const disabledVariantSlugs = new Set(["icon-button", "text-field", "select", "checkbox", "radio-group", "switch", "slider", "tabs", "dropdown"]);

function DisabledVariant({ slug }: { slug: string }) {
  if (slug === "icon-button") return <IconButton disabled aria-label="Unavailable action"><UiIcon name="star" /></IconButton>;
  if (slug === "text-field") return <TextField disabled aria-label="Unavailable field" placeholder="Unavailable" />;
  if (slug === "select") return <Select.Root disabled defaultValue="analog"><Select.Trigger aria-label="Unavailable input"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item></Select.Content></Select.Root>;
  if (slug === "checkbox") return <Checkbox disabled defaultChecked>Unavailable</Checkbox>;
  if (slug === "radio-group") return <RadioGroup.Root defaultValue="ink" aria-label="Unavailable theme"><RadioGroup.Item value="ink" disabled>Ink</RadioGroup.Item></RadioGroup.Root>;
  if (slug === "switch") return <Switch disabled defaultChecked aria-label="Unavailable setting" />;
  if (slug === "slider") return <Slider disabled defaultValue={[64]} aria-label="Unavailable intensity" />;
  if (slug === "tabs") return <Tabs.Root defaultValue="preview"><Tabs.List><Tabs.Trigger value="preview" disabled>Preview</Tabs.Trigger></Tabs.List><Tabs.Content value="preview" className="sr-only">Unavailable view</Tabs.Content></Tabs.Root>;
  if (slug === "dropdown") return <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button disabled>Unavailable menu</Button></DropdownMenu.Trigger></DropdownMenu.Root>;
  return null;
}

function VariantSample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="extended-variant__item">
      <div className="extended-variant__stage">{children}</div>
      <span>{label}</span>
    </div>
  );
}

function ExtendedVariants({ slug }: { slug: string }) {
  if (slug === "alert") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Accent"><Alert className="variant-alert" tone="accent" title="In review" /></VariantSample>
      <VariantSample label="Success"><Alert className="variant-alert" tone="success" title="Ready" /></VariantSample>
      <VariantSample label="Warning"><Alert className="variant-alert" tone="warning" title="Attention" /></VariantSample>
      <VariantSample label="Danger"><Alert className="variant-alert" tone="danger" title="Blocked" /></VariantSample>
    </div>
  );
  if (slug === "breadcrumb") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="Path"><Breadcrumb items={[{ label: "Library", href: "#library" }, { label: "Components" }]} /></VariantSample>
      <VariantSample label="Deep location"><Breadcrumb items={[{ label: "Workspace", href: "#workspace" }, { label: "Build", href: "#build" }, { label: "Review" }]} /></VariantSample>
    </div>
  );
  if (slug === "code-block") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="Copy action"><CodeBlock filename="signal.ts" language="ts" code="const ready = true;" /></VariantSample>
      <VariantSample label="Read only"><CodeBlock filename="tokens.css" language="css" code="--chrome-focus: #1258ff;" copyable={false} /></VariantSample>
    </div>
  );
  if (slug === "divider") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Plain"><Divider /></VariantSample>
      <VariantSample label="Labelled"><Divider label="Input" /></VariantSample>
      <VariantSample label="Long label"><Divider label="Signal chain" /></VariantSample>
      <VariantSample label="Vertical"><div className="variant-vertical-divider"><span>A</span><Divider orientation="vertical" /><span>B</span></div></VariantSample>
    </div>
  );
  if (slug === "empty-state") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="With icon"><EmptyState compact title="No views" icon={<UiIcon name="bookmark" />} /></VariantSample>
      <VariantSample label="Message only"><EmptyState compact title="Queue clear" description="No pending work." /></VariantSample>
    </div>
  );
  if (slug === "file-dropzone") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="Ready"><FileDropzone className="variant-dropzone" label="Drop files" description="JSON or TSX" /></VariantSample>
      <VariantSample label="Disabled"><FileDropzone className="variant-dropzone" label="Upload locked" description="Permission required" disabled /></VariantSample>
    </div>
  );
  if (slug === "key-hint") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Single"><KeyHint keys={["Esc"]} /></VariantSample>
      <VariantSample label="Chord"><KeyHint keys={["⌘", "K"]} /></VariantSample>
      <VariantSample label="Shift"><KeyHint keys={["⇧", "Enter"]} /></VariantSample>
      <VariantSample label="Sequence"><KeyHint keys={["G", "D"]} /></VariantSample>
    </div>
  );
  if (slug === "meter") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Neutral"><Meter value={36} tone="neutral" showValue={false} aria-label="Neutral meter" /></VariantSample>
      <VariantSample label="Accent"><Meter value={54} tone="accent" showValue={false} aria-label="Accent meter" /></VariantSample>
      <VariantSample label="Success"><Meter value={72} tone="success" showValue={false} aria-label="Success meter" /></VariantSample>
      <VariantSample label="Danger"><Meter value={88} tone="danger" showValue={false} aria-label="Danger meter" /></VariantSample>
    </div>
  );
  if (slug === "pagination") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="First page"><Pagination page={1} count={3} /></VariantSample>
      <VariantSample label="Middle page"><Pagination page={2} count={3} /></VariantSample>
    </div>
  );
  if (slug === "search-field") return (
    <div className="extended-variants" data-layout="three">
      <VariantSample label="Empty"><SearchField aria-label="Empty search" placeholder="Search" shortcut={<KeyHint keys={["⌘", "K"]} />} /></VariantSample>
      <VariantSample label="With query"><SearchField aria-label="Filled search" defaultValue="Chrome" /></VariantSample>
      <VariantSample label="Disabled"><SearchField aria-label="Disabled search" placeholder="Unavailable" disabled /></VariantSample>
    </div>
  );
  if (slug === "segmented-control") {
    const items = [{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }];
    return (
      <div className="extended-variants" data-layout="two">
        <VariantSample label="Default"><SegmentedControl aria-label="Default view" items={items} defaultValue="preview" /></VariantSample>
        <VariantSample label="Small · disabled"><SegmentedControl aria-label="Disabled view" items={items} defaultValue="code" size="sm" disabled /></VariantSample>
      </div>
    );
  }
  if (slug === "skeleton") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Text"><Skeleton variant="text" width="80%" /></VariantSample>
      <VariantSample label="Short text"><Skeleton variant="text" width="48%" /></VariantSample>
      <VariantSample label="Block"><Skeleton height={38} /></VariantSample>
      <VariantSample label="Circle"><Skeleton variant="circle" width={38} /></VariantSample>
    </div>
  );
  if (slug === "spinner") return (
    <div className="extended-variants" data-layout="three">
      <VariantSample label="Small"><Spinner size="sm" label="Small loading" /></VariantSample>
      <VariantSample label="Medium"><Spinner label="Medium loading" /></VariantSample>
      <VariantSample label="Large"><Spinner size="lg" label="Large loading" /></VariantSample>
    </div>
  );
  if (slug === "stat") return (
    <div className="extended-variants" data-layout="three">
      <VariantSample label="Positive decrease"><Stat label="Build time" value="1.8s" delta="12%" trend="down" sentiment="positive" /></VariantSample>
      <VariantSample label="Negative increase"><Stat label="Error rate" value="4.2%" delta="1.1%" trend="up" sentiment="negative" /></VariantSample>
      <VariantSample label="Neutral"><Stat label="Workers" value="12" delta="Stable" trend="flat" /></VariantSample>
    </div>
  );
  if (slug === "status-indicator") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Neutral"><StatusIndicator label="Draft" /></VariantSample>
      <VariantSample label="Accent"><StatusIndicator tone="accent" label="Review" /></VariantSample>
      <VariantSample label="Success"><StatusIndicator tone="success" label="Ready" pulse /></VariantSample>
      <VariantSample label="Danger"><StatusIndicator tone="danger" label="Offline" /></VariantSample>
    </div>
  );
  if (slug === "stepper") {
    const steps = [{ id: "source", label: "Source" }, { id: "map", label: "Map" }, { id: "review", label: "Review" }];
    return (
      <div className="extended-variants" data-layout="two">
        <VariantSample label="Start"><Stepper className="variant-stepper" steps={steps} activeStep={0} /></VariantSample>
        <VariantSample label="Complete path"><Stepper className="variant-stepper" steps={steps} activeStep={2} /></VariantSample>
      </div>
    );
  }
  if (slug === "table") return (
    <div className="extended-variants" data-layout="one">
      <VariantSample label="Compact density · selected row">
        <Table density="compact" aria-label="Compact build table"><thead><tr><th>Export</th><th>Status</th></tr></thead><tbody><tr data-selected="true"><td>Alert</td><td>Ready</td></tr><tr><td>Toolbar</td><td>Review</td></tr></tbody></Table>
      </VariantSample>
    </div>
  );
  if (slug === "timeline") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="System activity"><Timeline items={[{ id: "1", title: "Published", meta: "Now", tone: "success" }, { id: "2", title: "Reviewed", meta: "2m", tone: "accent" }]} /></VariantSample>
      <VariantSample label="Warning state"><Timeline items={[{ id: "1", title: "Retry queued", meta: "Now", tone: "warning" }, { id: "2", title: "Build failed", meta: "4m", tone: "danger" }]} /></VariantSample>
    </div>
  );
  if (slug === "toggle-button") return (
    <div className="extended-variants" data-layout="four">
      <VariantSample label="Off"><ToggleButton>Inspect</ToggleButton></VariantSample>
      <VariantSample label="On"><ToggleButton defaultPressed>Inspect</ToggleButton></VariantSample>
      <VariantSample label="Small"><ToggleButton size="sm"><UiIcon name="star" /> Star</ToggleButton></VariantSample>
      <VariantSample label="Disabled"><ToggleButton disabled>Locked</ToggleButton></VariantSample>
    </div>
  );
  if (slug === "toolbar") return (
    <div className="extended-variants" data-layout="two">
      <VariantSample label="Actions"><Toolbar label="Actions"><IconButton size="sm" variant="quiet" aria-label="Save variant"><UiIcon name="bookmark" /></IconButton><IconButton size="sm" variant="quiet" aria-label="Favorite variant"><UiIcon name="star" /></IconButton></Toolbar></VariantSample>
      <VariantSample label="Grouped tools"><Toolbar label="Grouped tools"><ToggleButton size="sm" defaultPressed>Inspect</ToggleButton><Divider orientation="vertical" /><IconButton size="sm" variant="quiet" aria-label="Delete variant"><UiIcon name="trash" /></IconButton></Toolbar></VariantSample>
    </div>
  );
  return null;
}

function usageFor(title: string, slug: string) {
  const snippets: Record<string, string> = {
    avatar: `import { Avatar } from "@loreanai/chrome-ui"\n\n<Avatar name="Arin Reyes" />`,
    "chrome-provider": `import { ChromeProvider } from "@loreanai/chrome-ui"\n\n<ChromeProvider defaultTheme="ink" motion="system">\n  <App />\n</ChromeProvider>`,
    button: `import { Button } from "@loreanai/chrome-ui"\n\n<Button variant="primary">Create project</Button>`,
    "icon-button": `import { IconButton } from "@loreanai/chrome-ui"\n\n<IconButton aria-label="More actions">···</IconButton>`,
    "text-field": `import { TextField } from "@loreanai/chrome-ui"\n\n<TextField label="Project name" />`,
    select: `import { Select } from "@loreanai/chrome-ui"\n\n<Select.Root defaultValue="analog">\n  <Select.Trigger aria-label="Input source"><Select.Value /></Select.Trigger>\n  <Select.Content><Select.Item value="analog">Analog 4</Select.Item></Select.Content>\n</Select.Root>`,
    checkbox: `import { Checkbox } from "@loreanai/chrome-ui"\n\n<Checkbox defaultChecked>Include styles</Checkbox>`,
    "radio-group": `import { RadioGroup } from "@loreanai/chrome-ui"\n\n<RadioGroup.Root defaultValue="ink" aria-label="Theme">\n  <RadioGroup.Item value="ink">Ink</RadioGroup.Item>\n  <RadioGroup.Item value="arctic">Arctic</RadioGroup.Item>\n</RadioGroup.Root>`,
    switch: `import { Switch } from "@loreanai/chrome-ui"\n\n<Switch aria-label="Responsive light" defaultChecked />`,
    slider: `import { Slider } from "@loreanai/chrome-ui"\n\n<Slider aria-label="Reflection intensity" defaultValue={[64]} />`,
    tabs: `import { Tabs } from "@loreanai/chrome-ui"\n\n<Tabs.Root defaultValue="preview">\n  <Tabs.List aria-label="Component view"><Tabs.Trigger value="preview">Preview</Tabs.Trigger></Tabs.List>\n  <Tabs.Content value="preview">Live component</Tabs.Content>\n</Tabs.Root>`,
    badge: `import { Badge } from "@loreanai/chrome-ui"\n\n<Badge tone="accent">Focused</Badge>`,
    tooltip: `import { Tooltip } from "@loreanai/chrome-ui"\n\n<Tooltip.Provider><Tooltip.Root><Tooltip.Trigger>Material</Tooltip.Trigger><Tooltip.Content>Reactive chrome</Tooltip.Content></Tooltip.Root></Tooltip.Provider>`,
    dropdown: `import { Button, DropdownMenu } from "@loreanai/chrome-ui"\n\n<DropdownMenu.Root><DropdownMenu.Trigger asChild><Button>Actions</Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>Duplicate</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>`,
    dialog: `import { Button, Dialog } from "@loreanai/chrome-ui"\n\n<Dialog.Root><Dialog.Trigger asChild><Button>Export</Button></Dialog.Trigger><Dialog.Content><Dialog.Title>Export package</Dialog.Title><Dialog.Description>Prepare files.</Dialog.Description></Dialog.Content></Dialog.Root>`,
    toast: `import { Toast } from "@loreanai/chrome-ui"\n\n<Toast.Provider><Toast.Root><Toast.Title>Snapshot saved</Toast.Title></Toast.Root><Toast.Viewport /></Toast.Provider>`,
    progress: `import { Progress } from "@loreanai/chrome-ui"\n\n<Progress value={68} aria-label="Package build" />`,
    surface: `import { Surface } from "@loreanai/chrome-ui"\n\n<Surface finish="chrome">Primary action</Surface>`,
    alert: `import { Alert } from "@loreanai/chrome-ui"\n\n<Alert tone="success" title="Package ready">Build complete.</Alert>`,
    breadcrumb: `import { Breadcrumb } from "@loreanai/chrome-ui"\n\n<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Components" }]} />`,
    "code-block": `import { CodeBlock } from "@loreanai/chrome-ui"\n\n<CodeBlock filename="signal.tsx" language="tsx" code={source} />`,
    divider: `import { Divider } from "@loreanai/chrome-ui"\n\n<Divider label="Signal chain" />`,
    "empty-state": `import { EmptyState } from "@loreanai/chrome-ui"\n\n<EmptyState title="No saved views" description="Pin a filter set." />`,
    "file-dropzone": `import { FileDropzone } from "@loreanai/chrome-ui"\n\n<FileDropzone accept=".json,.tsx" onFiles={setFiles} />`,
    "key-hint": `import { KeyHint } from "@loreanai/chrome-ui"\n\n<KeyHint keys={["⌘", "K"]} />`,
    meter: `import { Meter } from "@loreanai/chrome-ui"\n\n<Meter label="Signal headroom" value={72} tone="success" />`,
    pagination: `import { Pagination } from "@loreanai/chrome-ui"\n\n<Pagination page={page} count={12} onPageChange={setPage} />`,
    "search-field": `import { SearchField } from "@loreanai/chrome-ui"\n\n<SearchField label="Search components" onValueChange={setQuery} />`,
    "segmented-control": `import { SegmentedControl } from "@loreanai/chrome-ui"\n\n<SegmentedControl items={views} defaultValue="preview" />`,
    skeleton: `import { Skeleton } from "@loreanai/chrome-ui"\n\n<Skeleton variant="text" width="72%" />`,
    spinner: `import { Spinner } from "@loreanai/chrome-ui"\n\n<Spinner label="Loading components" />`,
    stat: `import { Stat } from "@loreanai/chrome-ui"\n\n<Stat label="Build time" value="1.84s" delta="12.4%" trend="down" sentiment="positive" />`,
    "status-indicator": `import { StatusIndicator } from "@loreanai/chrome-ui"\n\n<StatusIndicator tone="success" label="Operational" pulse />`,
    stepper: `import { Stepper } from "@loreanai/chrome-ui"\n\n<Stepper steps={steps} activeStep={1} onStepChange={setStep} />`,
    table: `import { Table } from "@loreanai/chrome-ui"\n\n<Table><thead>...</thead><tbody>...</tbody></Table>`,
    timeline: `import { Timeline } from "@loreanai/chrome-ui"\n\n<Timeline items={activity} />`,
    "toggle-button": `import { ToggleButton } from "@loreanai/chrome-ui"\n\n<ToggleButton defaultPressed>Pin view</ToggleButton>`,
    toolbar: `import { Toolbar } from "@loreanai/chrome-ui"\n\n<Toolbar label="Component actions">{tools}</Toolbar>`
  };
  const componentImport = snippets[slug] ?? `import { ${title.replace(/\s/g, "")} } from "@loreanai/chrome-ui"`;
  return componentImport;
}

function ButtonUsageCode() {
  return (
    <code className="syntax-code">
      <span><b>import</b>{" { Button } "}<b>from</b>{" "}<i>"@loreanai/chrome-ui"</i></span>
      <span aria-hidden="true">&nbsp;</span>
      <span>{"<Button "}<em>variant</em>{"="}<i>"primary"</i>{">Create project</Button>"}</span>
    </code>
  );
}

const componentPropTypes: Record<string, Record<string, string>> = {
  alert: {
    tone: "'accent' | 'success' | 'warning' | 'danger'",
    title: "ReactNode",
    icon: "ReactNode",
    action: "ReactNode",
    role: "AriaRole"
  },
  breadcrumb: {
    items: "BreadcrumbItem[]",
    separator: "ReactNode",
    "aria-label": "string",
    className: "string"
  },
  "code-block": {
    code: "string",
    filename: "string",
    language: "string",
    copyable: "boolean",
    onCopy: "(code) => void"
  },
  divider: { orientation: "'horizontal' | 'vertical'", label: "ReactNode", className: "string" },
  "empty-state": {
    title: "ReactNode",
    description: "ReactNode",
    icon: "ReactNode",
    action: "ReactNode",
    compact: "boolean"
  },
  "file-dropzone": {
    accept: "string",
    multiple: "boolean",
    disabled: "boolean",
    onFiles: "(files) => void",
    label: "ReactNode"
  },
  "key-hint": { keys: "string[]", children: "ReactNode", className: "string" },
  meter: {
    value: "number",
    min: "number",
    max: "number",
    tone: "ChromeTone",
    formatValue: "(value) => ReactNode"
  },
  pagination: {
    page: "number",
    count: "number",
    onPageChange: "(page) => void",
    previousLabel: "string",
    nextLabel: "string"
  },
  "search-field": {
    label: "string",
    value: "string",
    defaultValue: "string",
    onValueChange: "(value) => void",
    shortcut: "ReactNode"
  },
  "segmented-control": {
    items: "SegmentedControlItem[]",
    value: "string",
    defaultValue: "string",
    onValueChange: "(value) => void",
    size: "'sm' | 'md'"
  },
  skeleton: {
    variant: "'text' | 'block' | 'circle'",
    width: "CSSProperties['width']",
    height: "CSSProperties['height']",
    className: "string"
  },
  spinner: { size: "'sm' | 'md' | 'lg'", label: "string", className: "string" },
  stat: {
    label: "ReactNode",
    value: "ReactNode",
    delta: "ReactNode",
    trend: "'up' | 'down' | 'flat'",
    sentiment: "'neutral' | 'positive' | 'negative'",
    description: "ReactNode"
  },
  "status-indicator": { tone: "ChromeTone", label: "ReactNode", pulse: "boolean", role: "AriaRole" },
  stepper: {
    steps: "StepperItem[]",
    activeStep: "number",
    orientation: "'horizontal' | 'vertical'",
    onStepChange: "(index) => void"
  },
  table: {
    density: "'compact' | 'comfortable'",
    stickyHeader: "boolean",
    scrollLabel: "string",
    scrollHint: "string",
    children: "ReactNode"
  },
  timeline: { items: "TimelineItem[]", className: "string" },
  "toggle-button": {
    pressed: "boolean",
    defaultPressed: "boolean",
    onPressedChange: "(pressed) => void",
    size: "'sm' | 'md'",
    disabled: "boolean"
  },
  toolbar: {
    label: "string",
    orientation: "'horizontal' | 'vertical'",
    children: "ReactNode",
    onKeyDown: "KeyboardEventHandler"
  }
};

function propType(prop: string, slug: string) {
  const documentedType = componentPropTypes[slug]?.[prop];
  if (documentedType) return documentedType;
  if (prop === "theme" || prop === "defaultTheme") return "'ink' | 'arctic'";
  if (prop === "motion" || prop === "defaultMotion") return "'system' | 'full' | 'reduced'";
  if (prop === "variant") return "'primary' | 'quiet'";
  if (prop === "tone") return "'neutral' | 'accent' | 'success' | 'warning' | 'danger'";
  if (prop === "orientation") return "'horizontal' | 'vertical'";
  if (prop === "trend") return "'up' | 'down' | 'flat'";
  if (prop === "density") return "'compact' | 'comfortable'";
  if (prop === "size") return slug === "spinner" ? "'sm' | 'md' | 'lg'" : "'sm' | 'md'";
  if (["disabled", "asChild", "static", "modal", "open", "checked", "defaultChecked", "showClose", "copyable", "multiple", "compact", "showValue", "pulse", "stickyHeader", "defaultPressed", "pressed"].includes(prop)) return "boolean";
  if (["min", "max", "duration", "delayDuration", "sideOffset", "page", "count", "activeStep"].includes(prop)) return "number";
  if (["items", "steps"].includes(prop)) return "array";
  if (["icon", "action", "separator", "shortcut", "children", "label", "title", "description", "delta"].includes(prop)) return "ReactNode";
  if (["value", "defaultValue"].includes(prop)) return slug === "slider" ? "number[]" : slug === "progress" ? "number" : "string";
  if (prop.startsWith("on")) return "function";
  return "string";
}

function PropsDefinitionList({ props, slug }: { props: readonly string[]; slug: string }) {
  return (
    <dl>
      {props.map((prop) => <div key={prop}><dt>{prop}</dt><dd>{propType(prop, slug)}</dd></div>)}
    </dl>
  );
}

export function ComponentExplorer() {
  const { slug = "button" } = useParams();
  const [copied, setCopied] = useState(false);
  const item = componentDocs.find((component) => component.slug === slug) ?? componentDocs[0];
  const isButton = item.slug === "button";
  const usage = usageFor(item.title, item.slug);
  const copyUsage = () => {
    void navigator.clipboard?.writeText(usage).catch(() => undefined);
    setCopied(true);
  };

  return (
    <div className="docs-page">
      <Header showThemeToggle />
      <div className="docs-layout">
        <DocsRail />
        <main className="component-doc" id="main-content">
          <header className="component-doc__header">
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </header>

          <section aria-labelledby="preview-title">
            <h2 id="preview-title">Preview</h2>
            <div className={`component-preview${isButton ? " component-preview--button" : ""}`}>
              <div className="component-preview__scope">
                <ComponentPreview slug={item.slug} />
              </div>
            </div>
          </section>

          <section aria-labelledby="variants-title">
            <h2 id="variants-title">Variants</h2>
            {isButton ? (
              <div className="variant-rail">
                <div><Button>Create project <UiIcon name="arrow-right" /></Button><span>Primary</span></div>
                <div><Button variant="secondary">Create project <UiIcon name="arrow-right" /></Button><span>Secondary</span></div>
                <div><Button variant="quiet">Create project <UiIcon name="arrow-right" /></Button><span>Quiet</span></div>
                <div><Button variant="danger">Delete project <UiIcon name="arrow-right" /></Button><span>Danger</span></div>
              </div>
            ) : componentPropTypes[item.slug] ? (
              <ExtendedVariants slug={item.slug} />
            ) : (
              <div className="variant-summary">
                <span>Ink</span><span>Arctic</span><span>Focused</span>
                {disabledVariantSlugs.has(item.slug) ? <div className="disabled-variant"><DisabledVariant slug={item.slug} /><span>Disabled</span></div> : <span>Disabled</span>}
              </div>
            )}
          </section>

          <section className="documentation-split">
            <div>
              <h2>Usage</h2>
              <pre>{isButton ? <ButtonUsageCode /> : <code>{usage}</code>}<button aria-label={copied ? "Usage copied" : "Copy usage"} onClick={copyUsage}><UiIcon name={copied ? "check" : "copy"} /></button></pre>
            </div>
            <div>
              <h2>Anatomy</h2>
              <dl>{item.anatomy.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
            </div>
          </section>
          <section className="inline-props" aria-labelledby="inline-props-title">
            <h2 id="inline-props-title">Props</h2>
            <PropsDefinitionList props={item.props} slug={item.slug} />
          </section>
        </main>
        <aside className="props-panel">
          <h2>Props</h2>
          <PropsDefinitionList props={item.props} slug={item.slug} />
        </aside>
      </div>
    </div>
  );
}
