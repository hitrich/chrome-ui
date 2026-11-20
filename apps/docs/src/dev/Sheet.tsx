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
  Tooltip,
  type ButtonFinish,
  type ButtonSize
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";

/* Dev sheet: every package primitive in every finish, size and state, Satin on the left and Ink on the right,
   laid out like the design's primitives sheet so the two can be compared crop for crop. */

const css = `
.dev-sheet{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(720px,100%),1fr));min-height:100vh}
.dev-sheet>h1{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.dev-col{padding:32px 28px;display:flex;flex-direction:column;gap:16px;min-width:0}
.dev-col .eyebrow{font:500 11px/16px var(--chrome-font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--chrome-text-3)}
.dev-panel{padding:20px;display:flex;flex-direction:column;gap:16px}
.dev-bare{padding:4px 0 8px;display:flex;flex-direction:column;gap:16px}
.dev-frow{display:flex;flex-direction:column;gap:10px;padding:12px 0;border-top:1px solid var(--chrome-line)}
.dev-frow:first-of-type{border-top:0}
.dev-fname{font:500 11px/1 var(--chrome-font-mono);color:var(--chrome-text-3)}
.dev-cells{display:flex;flex-wrap:wrap;align-items:flex-end;gap:14px}
.dev-cells.c{align-items:center}
.dev-cell{display:flex;flex-direction:column;align-items:center;gap:6px}
.dev-cap{font:400 10.5px/14px var(--chrome-font-mono);color:var(--chrome-text-3)}
.dev-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}
.dev-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.dev-v{display:flex;flex-direction:column;gap:8px;min-width:0}
.dev-sbox{height:88px;padding:16px;font-size:15px;line-height:22px;font-weight:500}
.dev-menu{position:static;width:100%;max-height:none}
@media (max-width:640px){.dev-g2,.dev-g3{grid-template-columns:minmax(0,1fr)}.dev-col{padding:24px 16px}}
`;

const finishes: { finish: ButtonFinish; label: string }[] = [
  { finish: "polished", label: "Deploy" },
  { finish: "smoked", label: "Open console" },
  { finish: "cobalt", label: "Approve" },
  { finish: "enamel", label: "Roll back" },
  { finish: "graphite", label: "Preview" },
  { finish: "ghost", label: "Cancel" }
];
const sizes: ButtonSize[] = ["sm", "md", "lg", "xl"];

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const Plus = () => icon("M12 5v14M5 12h14");
const Arrow = () => icon("M5 12h14M13 6l6 6-6 6");
const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
const Copy = () => icon("M8 8h12v12H8zM16 8V4H4v12h4");
const Wrap = () => icon("M4 6h16M4 12h13a3 3 0 0 1 0 6h-4M15 16l-2 2 2 2M4 18h5");
const Logs = () => icon("M4 6h16M4 12h16M4 18h10");

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return <div className="dev-cell">{children}<span className="dev-cap">{label}</span></div>;
}

function Panel({ title, children, bare = false }: { title: string; children: ReactNode; bare?: boolean }) {
  return bare ? (
    <section className="dev-bare" aria-label={title}><div className="eyebrow">{title}</div>{children}</section>
  ) : (
    <Surface className="dev-panel" aria-label={title} role="region"><div className="eyebrow">{title}</div>{children}</Surface>
  );
}

function Column({ theme }: { theme: "satin" | "ink" }) {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState("day");
  const [page, setPage] = useState(3);
  const [slider, setSlider] = useState([64]);
  return (
    <ChromeProvider theme={theme} className="dev-col" aria-label={theme === "satin" ? "Satin" : "Ink"} role="region">
      <div className="eyebrow" style={{ marginBottom: 16 }}>{theme === "satin" ? "Satin · data-chrome-theme=satin" : "Ink · data-chrome-theme=ink"}</div>

      <Panel title="Buttons on page" bare>
        <div className="dev-cells">
          {finishes.map(({ finish, label }) => <Button key={finish} finish={finish}>{label}</Button>)}
        </div>
        <div className="dev-cells">
          <Button finish="polished" size="xl" trailingIcon={<Arrow />}>Deploy to production</Button>
          <Button size="lg" leadingIcon={<Plus />}>New service</Button>
          <Button>Deploy<KeyHint keys={["⌘↵"]} /></Button>
        </div>
      </Panel>

      <Panel title="Buttons on tile · finish × size × state">
        {finishes.map(({ finish, label }) => (
          <div className="dev-frow" key={finish}>
            <div className="dev-fname">{finish}</div>
            <div className="dev-cells">
              {sizes.map((size) => <Cell key={size} label={size}><Button finish={finish} size={size}>{label}</Button></Cell>)}
              <Cell label="icon"><IconButton finish={finish} aria-label="Add"><Plus /></IconButton></Cell>
            </div>
            <div className="dev-cells">
              <Cell label="rest"><Button finish={finish}>{label}</Button></Cell>
              <Cell label="hover"><Button finish={finish} data-hover="">{label}</Button></Cell>
              <Cell label="pressed"><Button finish={finish} data-active="">{label}</Button></Cell>
              <Cell label="focus"><Button finish={finish} data-focus-visible="">{label}</Button></Cell>
              <Cell label="disabled"><Button finish={finish} disabled>{label}</Button></Cell>
              <Cell label="loading"><Button finish={finish} loading>{label}</Button></Cell>
            </div>
          </div>
        ))}
        <div className="dev-frow">
          <div className="dev-fname">asChild · variant alias · static</div>
          <div className="dev-cells">
            <Button asChild finish="smoked" size="sm"><a href="/components">Get started</a></Button>
            <Button variant="primary">variant primary</Button>
            <Button variant="danger">variant danger</Button>
            <Button variant="quiet">variant quiet</Button>
            <Button static data-active="">static pressed</Button>
          </div>
        </div>
      </Panel>

      <Panel title="Inputs">
        <div className="dev-g2">
          <TextField label="Service name" placeholder="Search services" leading={<Search />} trailing={<KeyHint keys={["⌘K"]} />} hint="plain" />
          <TextField label="Hover" defaultValue="billing-worker" hint="hover" data-hover="" />
          <TextField label="Region" defaultValue="eu-west-1" hint="focus" data-focus-visible="" />
          <TextField label="Owner" defaultValue="Priya Raman" hint="disabled" disabled />
          <TextField label="Repository" leading="orbital-ops/" defaultValue="cache-warm" hint="Lowercase, numbers and dashes" />
          <TextField label="Timeout" defaultValue="380" trailing="ms" error="Above the 250 ms budget" />
          <SearchField label="Search" placeholder="Search services" shortcut={<KeyHint keys={["/"]} />} />
          <SearchField label="Search, filled" defaultValue="billing" />
        </div>
      </Panel>

      <Panel title="Switch · checkbox · radio · slider">
        <div className="dev-cells">
          <Cell label="off"><Switch aria-label="Off" /></Cell>
          <Cell label="on"><Switch aria-label="On" checked={on} onCheckedChange={setOn} /></Cell>
          <Cell label="hover"><Switch aria-label="Hover" data-hover="" /></Cell>
          <Cell label="focus"><Switch aria-label="Focus" defaultChecked data-focus-visible="" /></Cell>
          <Cell label="dis"><Switch aria-label="Disabled" disabled /></Cell>
          <Cell label="dis on"><Switch aria-label="Disabled on" disabled defaultChecked /></Cell>
        </div>
        <div className="dev-cells">
          <Cell label="off"><Checkbox aria-label="Off" /></Cell>
          <Cell label="on"><Checkbox aria-label="On" defaultChecked /></Cell>
          <Cell label="hover"><Checkbox aria-label="Hover" data-hover="" /></Cell>
          <Cell label="focus"><Checkbox aria-label="Focus" defaultChecked data-focus-visible="" /></Cell>
          <Cell label="dis"><Checkbox aria-label="Disabled" disabled /></Cell>
          <Cell label="dis on"><Checkbox aria-label="Disabled on" disabled defaultChecked /></Cell>
          <Cell label="mixed"><Checkbox aria-label="Mixed" checked="indeterminate" /></Cell>
          <Checkbox defaultChecked>Notify on deploy</Checkbox>
        </div>
        <RadioGroup.Root defaultValue="canary" aria-label="Rollout strategy" style={{ gridAutoFlow: "column", justifyContent: "start", gap: 18 }}>
          <RadioGroup.Item value="canary">Canary</RadioGroup.Item>
          <RadioGroup.Item value="rolling" data-hover="">Rolling (hover)</RadioGroup.Item>
          <RadioGroup.Item value="blue" data-focus-visible="">Blue-green (focus)</RadioGroup.Item>
          <RadioGroup.Item value="off" disabled>Disabled</RadioGroup.Item>
        </RadioGroup.Root>
        <div className="dev-g2">
          <div className="dev-v"><span className="dev-cap">slider {slider[0]}%</span><Slider aria-label="Traffic shift" value={slider} onValueChange={setSlider} /></div>
          <div className="dev-v"><span className="dev-cap">slider focus 72%</span><Slider aria-label="Focused" defaultValue={[72]} thumbLabels={["Focused"]} /></div>
          <div className="dev-v"><span className="dev-cap">slider 0%</span><Slider aria-label="Empty" defaultValue={[0]} /></div>
          <div className="dev-v"><span className="dev-cap">slider disabled</span><Slider aria-label="Disabled" defaultValue={[55]} disabled /></div>
        </div>
      </Panel>

      <Panel title="Segmented · key hint · toggle · toolbar">
        <div className="dev-cells c">
          <SegmentedControl aria-label="Range" value={seg} onValueChange={setSeg} items={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]} />
          <SegmentedControl aria-label="Strategy" defaultValue="rolling" items={[{ value: "canary", label: "Canary" }, { value: "rolling", label: "Rolling" }, { value: "bg", label: "Blue-green" }]} />
          <SegmentedControl aria-label="Small" size="sm" defaultValue="24h" items={["1h", "24h", "7d", "30d"].map((v) => ({ value: v, label: v }))} />
        </div>
        <div className="dev-cells c">
          <KeyHint keys={["⌘"]} /><KeyHint keys={["K"]} /><KeyHint keys={["Enter"]} /><KeyHint keys={["⌘", "↵"]} /><KeyHint>Esc</KeyHint>
        </div>
        <div className="dev-cells c">
          <ToggleButton size="sm" defaultPressed><StatusIndicator tone="ok" pulse />Live tail</ToggleButton>
          <ToggleButton size="sm" aria-label="Wrap lines" className="chrome-icon-button"><Wrap /></ToggleButton>
          <ToggleButton size="sm" defaultPressed>UTC</ToggleButton>
          <ToggleButton defaultPressed><Logs />Pinned</ToggleButton>
          <ToggleButton disabled>Watch</ToggleButton>
        </div>
        <Toolbar label="Formatting">
          <ToggleButton defaultPressed aria-label="Bold"><b>B</b></ToggleButton>
          <ToggleButton aria-label="Italic"><i style={{ fontFamily: "Georgia, serif" }}>I</i></ToggleButton>
          <Divider orientation="vertical" />
          <IconButton finish="ghost" aria-label="Copy"><Copy /></IconButton>
          <IconButton finish="ghost" aria-label="Wrap"><Wrap /></IconButton>
        </Toolbar>
      </Panel>

      <Panel title="Badges · status">
        <div className="dev-cells c">
          <Badge>v4.18.0</Badge><Badge tone="new">New</Badge><Badge tone="bad">Failing</Badge><Badge tone="accent">accent</Badge><Badge tone="danger">danger</Badge><Badge tone="success">success</Badge><Badge tone="warning">warning</Badge>
        </div>
        <div className="dev-cells c">
          <StatusIndicator tone="ok" label="Healthy" />
          <StatusIndicator tone="ok" pulse label="Live" />
          <StatusIndicator tone="info" label="Deploying" />
          <StatusIndicator tone="warn" label="Degraded" />
          <StatusIndicator tone="bad" label="Failing" />
          <StatusIndicator tone="off" label="Paused" />
          <StatusIndicator tone="success" label="success alias" />
        </div>
      </Panel>

      <Surface className="dev-panel" style={{ padding: 0, gap: 0 }} role="region" aria-label="Table">
        <div className="eyebrow" style={{ padding: "20px 20px 8px" }}>Table</div>
        <Table aria-label="Services">
          <thead><tr><th>Service</th><th>Region</th><th>Status</th><th className="r">p95 ms</th></tr></thead>
          <tbody>
            <tr><td>api-gateway</td><td>eu-west-1</td><td><StatusIndicator tone="ok" label="Healthy" /></td><td className="r">142</td></tr>
            <tr data-hover=""><td>billing-worker</td><td>us-east-2</td><td><StatusIndicator tone="warn" label="Degraded" /></td><td className="r">388</td></tr>
            <tr><td>search-indexer</td><td>ap-south-1</td><td><StatusIndicator tone="bad" label="Failing" /></td><td className="r">1,204</td></tr>
          </tbody>
        </Table>
      </Surface>

      <Panel title="Surfaces · overlays (static samples)" bare>
        <div className="dev-g3">
          <Surface className="dev-sbox">Card</Surface>
          <Surface finish="edge" className="dev-sbox">Card lit</Surface>
          <Surface finish="chrome" className="dev-sbox">Float</Surface>
        </div>
        <div className="dev-g2">
          <div role="menu" aria-label="Static menu" className="chrome-dropdown dev-menu">
            <div className="chrome-dropdown__label">Service</div>
            <div role="menuitem" className="chrome-dropdown__item" data-highlighted=""><Logs />Open logs<KeyHint keys={["L"]} /></div>
            <div role="menuitem" className="chrome-dropdown__item"><Copy />Copy service ID</div>
            <div role="separator" className="chrome-dropdown__separator" />
            <div role="menuitem" className="chrome-dropdown__item" data-tone="danger"><Plus />Delete service</div>
          </div>
          <div className="dev-v" style={{ gap: 12 }}>
            <button type="button" className="chrome-select__trigger" data-state="open" aria-label="Region (static open)"><span className="chrome-select__value"><StatusIndicator tone="ok" />eu-west-1</span><span aria-hidden="true">{icon("m6 9 6 6 6-6")}</span></button>
            <div role="listbox" aria-label="Static listbox" className="chrome-select__content dev-menu">
              <div role="option" aria-selected="true" className="chrome-select__item" data-highlighted=""><span><StatusIndicator tone="ok" />eu-west-1</span>{icon("m5 12 5 5 9-10")}</div>
              <div role="option" aria-selected="false" className="chrome-select__item"><span><StatusIndicator tone="bad" />ap-south-1</span></div>
            </div>
            <span role="tooltip" className="chrome-tooltip" style={{ alignSelf: "flex-start" }}>Copy commit SHA<KeyHint keys={["⌘C"]} /></span>
          </div>
        </div>
        <div className="dev-g2">
          <div role="dialog" aria-label="Static dialog" className="chrome-dialog__content" data-inline="">
            <h2 className="chrome-dialog__title">Roll back v4.18.0?</h2>
            <p className="chrome-dialog__description">billing-worker returns to v4.17.3 in all 5 regions.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}><Button size="sm">Cancel</Button><Button size="sm" finish="enamel">Roll back</Button></div>
          </div>
          <div className="dev-v" style={{ gap: 12 }}>
            <div role="status" className="chrome-toast">
              <div className="chrome-toast__title">Rollout paused</div>
              <div className="chrome-toast__description">v4.18.0 at 62%</div>
              <button type="button" className="chrome-toast__action">Undo</button>
            </div>
            <Divider />
            <Divider label="Earlier today" />
          </div>
        </div>
      </Panel>

      <Panel title="Feedback">
        <Alert tone="danger" title="search-indexer failing" action={<a href="/templates/control-room" style={{ color: "var(--chrome-cobalt-text)", fontWeight: 600 }}>View INC-418</a>}>ap-south-1 health checks have timed out for 14 min.</Alert>
        <div className="dev-g2">
          <Alert tone="accent" title="Canary at 5%">us-east-2 takes traffic next.</Alert>
          <Alert tone="success" title="v4.18.0 live">All 12 checks passed.</Alert>
          <Alert tone="warning" title="Disk at 86%">eu-west-1 warns above 80%.</Alert>
          <EmptyState compact title="No open incidents" description="Pages from on-call land here. The last one closed 6 days ago." action={<Button size="sm">View runbooks</Button>} />
        </div>
        <div className="dev-g2">
          <div className="dev-v" style={{ gap: 14 }}>
            <Meter label="CPU quota" value={46} segments={10} />
            <Meter label="Disk · eu-west-1" value={86} tone="warning" segments={10} />
            <Meter label="Coverage" value={62} />
          </div>
          <div className="dev-v" style={{ gap: 14 }}>
            <span className="dev-cap">progress 62% · indeterminate</span>
            <Progress value={62} aria-label="Rollout" />
            <Progress indeterminate aria-label="Preparing canary" />
            <div className="dev-cells c">
              <Spinner size="sm" /><Spinner /><Spinner size="lg" />
              <Spinner finish="cobalt" size="sm" /><Spinner finish="cobalt" /><Spinner finish="silver" size="lg" />
            </div>
          </div>
        </div>
        <div className="dev-g2">
          <div className="dev-v" style={{ gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Skeleton variant="circle" /><div className="dev-v" style={{ flex: 1, gap: 7 }}><Skeleton variant="text" width="70%" /><Skeleton variant="text" width="45%" /></div></div>
            <Skeleton />
          </div>
          <Stat label="Requests" value="31.6k" delta="+8.2%" trend="up" sentiment="positive" description="29.2k at this time last Monday" />
        </div>
      </Panel>

      <Panel title="Navigation">
        <Breadcrumb items={[{ label: "Services", href: "/components" }, { label: "Deploys", href: "/components" }, { label: "billing-worker" }]} />
        <Tabs.Root defaultValue="overview">
          <Tabs.List aria-label="Release v4.18.0">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="deploys">Deploys <Badge>12</Badge></Tabs.Trigger>
            <Tabs.Trigger value="logs">Logs</Tabs.Trigger>
            <Tabs.Trigger value="off" disabled>Disabled</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" style={{ paddingTop: 10, fontSize: 12.5 }}>v4.18.0 live in 3 of 5 regions</Tabs.Content>
          <Tabs.Content value="deploys" style={{ paddingTop: 10, fontSize: 12.5 }}>12 deploys</Tabs.Content>
          <Tabs.Content value="logs" style={{ paddingTop: 10, fontSize: 12.5 }}>Logs</Tabs.Content>
        </Tabs.Root>
        <div className="dev-cells c" style={{ justifyContent: "space-between" }}>
          <Pagination page={page} count={18} onPageChange={setPage} />
          <div style={{ display: "flex" }}>
            <Avatar name="Mara Lindqvist" size="sm" /><Avatar name="Rafael Achebe" /><Avatar name="Priya Raman" size="lg" />
          </div>
        </div>
        <Stepper activeStep={2} steps={[{ id: "b", label: "Build", description: "2m 14s" }, { id: "t", label: "Test", description: "4m 02s" }, { id: "c", label: "Canary", description: "Running" }, { id: "l", label: "Live", description: "Waiting" }]} />
        <div className="dev-g2">
          <Timeline items={[{ id: "a", title: "v4.18.0 live in eu-west-1", meta: "14:02 · Ops agent", tone: "accent" }, { id: "b", title: "Canary passed in us-east-2", meta: "13:48 · 12 of 12 checks" }, { id: "c", title: "Build 2,114 finished", meta: "13:31 · 2m 14s" }]} />
          <Stepper orientation="vertical" activeStep={1} steps={[{ id: "s", label: "Source" }, { id: "m", label: "Map" }, { id: "r", label: "Review" }]} />
        </div>
      </Panel>

      <Panel title="Live overlays (Radix)">
        <div className="dev-cells c">
          <Select.Root defaultValue="eu-west-1">
            <Select.Trigger aria-label="Region" data-testid={`select-${theme}`} style={{ width: 200 }}><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Regions</Select.Label>
                <Select.Item value="eu-west-1">eu-west-1</Select.Item>
                <Select.Item value="us-east-2">us-east-2</Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Item value="ap-south-1" disabled>ap-south-1 (degraded)</Select.Item>
            </Select.Content>
          </Select.Root>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild><Button size="sm" data-testid={`menu-${theme}`}>Actions</Button></DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Label>Service</DropdownMenu.Label>
              <DropdownMenu.Item><Logs />Open logs<KeyHint keys={["L"]} /></DropdownMenu.Item>
              <DropdownMenu.Item><Copy />Copy service ID</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item data-tone="danger"><Plus />Delete service</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Tooltip.Root>
            <Tooltip.Trigger asChild><IconButton size="sm" aria-label="Copy commit SHA" data-testid={`tip-${theme}`}><Copy /></IconButton></Tooltip.Trigger>
            <Tooltip.Content>Copy commit SHA<KeyHint keys={["⌘C"]} /></Tooltip.Content>
          </Tooltip.Root>
          <Dialog.Root>
            <Dialog.Trigger asChild><Button size="sm" finish="enamel" data-testid={`dialog-${theme}`}>Roll back…</Button></Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>Roll back v4.18.0?</Dialog.Title>
              <Dialog.Description>billing-worker returns to v4.17.3 in all 5 regions.</Dialog.Description>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                <Dialog.Close asChild><Button size="sm">Cancel</Button></Dialog.Close>
                <Dialog.Close asChild><Button size="sm" finish="enamel">Roll back</Button></Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Root>
          <LiveToast theme={theme} />
        </div>
      </Panel>

      <Panel title="Data · files">
        <div className="dev-g2">
          <FileDropzone label="Drop runbooks" description="Markdown or PDF, up to 20 MB" browseLabel="or browse" />
          <CodeBlock filename="Deploy.tsx" language="tsx" code={`import { Button } from "@loreanai/chrome-ui";\n\n<Button finish="polished">Deploy</Button>`} />
        </div>
      </Panel>
    </ChromeProvider>
  );
}

function LiveToast({ theme }: { theme: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Toast.Provider swipeDirection="right">
      <Button size="sm" finish="ghost" data-testid={`toast-${theme}`} onClick={() => setOpen(true)}>Show toast</Button>
      <Toast.Root open={open} onOpenChange={setOpen}>
        <Toast.Title>Rollout paused</Toast.Title>
        <Toast.Description>v4.18.0 at 62%</Toast.Description>
        <Toast.Action altText="Undo the pause">Undo</Toast.Action>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

export default function Page() {
  return (
    <main className="dev-sheet">
      <style>{css}</style>
      <h1>Primitives sheet</h1>
      <Column theme="satin" />
      <Column theme="ink" />
    </main>
  );
}
