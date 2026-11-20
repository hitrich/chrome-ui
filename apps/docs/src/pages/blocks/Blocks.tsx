// The twelve Blocks (work/canvas/project/Blocks.dc.html), each the content of one preview stage.
// Exported one by one so other pages (Components overview) can show the same compositions; Blocks.css is scoped under `.blk`.
import {
  AreaChart,
  Avatar,
  Badge,
  BarChart,
  Button,
  ChartWell,
  Checkbox,
  Chip,
  CommandPalette,
  IconButton,
  KeyHint,
  Meter,
  Popover,
  Progress,
  SearchField,
  SegmentedControl,
  Select,
  Sparkline,
  Spinner,
  StatusIndicator,
  Switch,
  Table,
  Textarea,
  TextField,
  type CommandPaletteGroup
} from "@loreanai/chrome-ui";
import { useId, useState, type CSSProperties, type FormEvent, type JSX, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { Logo } from "../../components/Logo";
import "./Blocks.css";

/* Glyphs the docs icon set does not carry (same 24-unit stroke grid, drawn by the `.i` utility). */
const glyphs = {
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
  download: <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  columns: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></>,
  "sort-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12 5 5 9-10" />,
  rotate: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  pause: <path d="M9 5v14M15 5v14" />,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>,
  clip: <path d="m20 11-8 8a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 17a2 2 0 0 1-3-3l7.5-7.5" />,
  at: <><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>,
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />
};

function G({ n, size = 14, className, style }: { n: keyof typeof glyphs; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className ? `i ${className}` : "i"} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: size, height: size, ...style }}>
      {glyphs[n]}
    </svg>
  );
}

/* ---------------------------------------------------------------- Sidebar */

const sideNav: { label: string; icon: "home" | "layers" | "alert" | "cpu" | "chart"; meta?: ReactNode }[] = [
  { label: "Control Room", icon: "home" },
  { label: "Deployments", icon: "layers", meta: <Badge className="num">48</Badge> },
  { label: "Incidents", icon: "alert", meta: <Badge tone="bad" className="num">3</Badge> },
  { label: "Agents", icon: "cpu", meta: <StatusIndicator tone="ok" pulse /> },
  { label: "Analytics", icon: "chart" }
];

export function SidebarBlock() {
  return (
    <div className="blk blk-sidebar pnl">
      <div className="blk-sidebar__side v">
        <div className="h blk-sidebar__ws">
          <Logo className="blk-logo24" />
          <span className="v f1" style={{ gap: 0 }}>
            <span className="sm b">Orbital Ops</span>
            <span className="xs t3">Production</span>
          </span>
          <Icon name="chevron-up-down" size={14} className="t3" />
        </div>
        <SearchField aria-label="Search Orbital Ops" placeholder="Search" shortcut={<KeyHint>⌘K</KeyHint>} />
        <div className="v" style={{ gap: 1 }}>
          {sideNav.map((item, i) => (
            <span key={item.label} className={i === 0 ? "nav-item n28 active" : "nav-item n28"}>
              <Icon name={item.icon} />
              <span className="f1">{item.label}</span>
              {item.meta}
            </span>
          ))}
        </div>
        <div className="h blk-sidebar__me">
          <Avatar name="Mara Lindqvist" size="sm" />
          <span className="sm f1">Mara Lindqvist</span>
          <Icon name="sliders" size={14} className="t3" />
        </div>
      </div>
      <div className="blk-sidebar__main v f1">
        <div className="h jb">
          <span className="v" style={{ gap: 0 }}>
            <span className="sm b">Control Room</span>
            <span className="xs t3">5 regions · 214 services</span>
          </span>
          <StatusIndicator tone="bad" pulse label="INC-418 open" />
        </div>
        <div className="h">
          <div className="blk-mk"><span className="xs t2">Requests / min</span><span className="num blk-mk__v">31.6k</span></div>
          <div className="blk-mk"><span className="xs t2">Latency p95</span><span className="num blk-mk__v">42 ms</span></div>
        </div>
        <ChartWell className="blk-sidebar__plot">
          <AreaChart
            aria-label="Requests a minute over the last hour, climbing to 31.6 thousand"
            height="fill"
            yLabels={false}
            yDomain={[0, 90]}
            yTicks={[0, 30, 60]}
            padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
            series={[{ label: "Requests / min", data: [12, 18, 16, 30, 26, 40, 36, 52, 56, 68, 64] }]}
          />
        </ChartWell>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Command Bar */

const commandGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "deploy-bill", label: "Deploy billing-worker to production", icon: <G n="upload" />, shortcut: ["⌘", "↵"] },
      { id: "rollback-bill", label: "Roll back billing-worker to v4.17.2", icon: <G n="rotate" /> },
      { id: "pause", label: "Pause rollout", icon: <G n="pause" /> }
    ]
  },
  {
    label: "Services",
    items: [
      { id: "svc-billing", label: "billing-worker", icon: <StatusIndicator tone="ok" />, mono: true, meta: "us-east-2 · v4.17.3" },
      { id: "svc-search", label: "search-indexer", icon: <StatusIndicator tone="bad" />, mono: true, meta: "ap-south-1 · v4.18.0" }
    ]
  }
];

export function CommandBarBlock() {
  return <CommandPalette inline footer defaultQuery="deploy bill" groups={commandGroups} label="Command bar" className="blk blk-command" />;
}

/* ---------------------------------------------------------------- Data Grid */

const services = [
  { name: "search-indexer", region: "ap-south-1", version: "v4.18.0", p95: "380 ms", tone: "bad", status: "Failed" },
  { name: "edge-renderer", region: "us-west-1", version: "v4.18.0", p95: "112 ms", tone: "info", status: "Rolling" },
  { name: "billing-worker", region: "us-east-2", version: "v4.17.3", p95: "64 ms", tone: "ok", status: "Live" },
  { name: "api-gateway", region: "eu-west-1", version: "v4.18.0", p95: "42 ms", tone: "ok", status: "Live" }
] as const;

export function DataGridBlock() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(["search-indexer"]));
  const [query, setQuery] = useState("");
  const rows = services.filter((s) => s.name.includes(query.trim().toLowerCase()));
  const picked = rows.filter((s) => selected.has(s.name)).length;
  const toggle = (name: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(name);
      else next.delete(name);
      return next;
    });
  return (
    <div className="blk blk-grid pnl">
      <div className="h blk-grid__bar">
        <SearchField aria-label="Filter services" placeholder="Filter services" className="blk-grid__filter" value={query} onValueChange={setQuery} />
        <Chip size="sm" icon={<G n="filter" size={12} />}>Version: v4.x</Chip>
        <IconButton finish="ghost" size="sm" aria-label="Download CSV" className="ml"><G n="download" /></IconButton>
        <Button finish="graphite" size="sm" leadingIcon={<G n="columns" />}>Columns</Button>
      </div>
      <Table density="compact" aria-label="Services">
        <thead>
          <tr>
            <th scope="col" style={{ width: 32 }}>
              <Checkbox
                aria-label="Select all rows"
                checked={picked === 0 ? false : picked === rows.length ? true : "indeterminate"}
                onCheckedChange={(v) => rows.forEach((s) => toggle(s.name, v === true))}
              />
            </th>
            <th scope="col">Service</th>
            <th scope="col">Region</th>
            <th scope="col">Version</th>
            <th scope="col" className="r" aria-sort="descending">
              <span className="h" style={{ justifyContent: "flex-end", gap: 4 }}>p95<G n="sort-down" size={12} /></span>
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.name} data-selected={selected.has(s.name) || undefined}>
              <td><Checkbox aria-label={`Select ${s.name}`} checked={selected.has(s.name)} onCheckedChange={(v) => toggle(s.name, v === true)} /></td>
              <td className="mono">{s.name}</td>
              <td className="mono t2">{s.region}</td>
              <td className="t2">{s.version}</td>
              <td className="r num">{s.p95}</td>
              <td><StatusIndicator tone={s.tone} label={s.status} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="h xs t2 blk-grid__foot">
        <span>{picked} selected</span>
        <span className="ml num">{query.trim() ? `${rows.length} of 4 shown` : "1–4 of 214"}</span>
        <IconButton finish="ghost" size="sm" aria-label="Previous page" disabled><G n="chevron-left" /></IconButton>
        <IconButton finish="ghost" size="sm" aria-label="Next page"><G n="chevron-right" /></IconButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Agent Run */

export function AgentRunBlock() {
  const [paused, setPaused] = useState(false);
  const done = (label: string, time: string) => (
    <li className="t2"><G n="check" className="blk-ok" /><span className="f1">{label}</span><span className="num t3 xs">{time}</span></li>
  );
  return (
    <div className="blk blk-run pnl">
      <div className="blk-run__main v f1">
        <div className="h jb" style={{ alignItems: "flex-start" }}>
          <span className="v" style={{ gap: 2 }}>
            <span className="sm b">Agent run · INC-418</span>
            <span className="xs t3">Rollback check · started 2 min ago</span>
          </span>
          <StatusIndicator tone={paused ? "off" : "info"} label={<span className="num">3 of 5</span>} className="t2" />
        </div>
        <Progress value={50} aria-label="Agent run progress, step 3 of 5" />
        <ol className="blk-steps">
          {done("Read incident-418.log", "4s")}
          {done("Diff config v4.17.3 → v4.18.0", "11s")}
          <li>
            {paused ? <G n="pause" className="t3" /> : <Spinner label="Running" className="blk-cobalt" />}
            <span className="f1">Replay traffic on staging</span>
            <span className={paused ? "xs t3" : "xs blk-cobalt"}>{paused ? "paused" : "running"}</span>
          </li>
          <li className="t3"><span className="blk-pend" />Compare error budgets</li>
          <li className="t3"><span className="blk-pend" />Draft rollback plan</li>
        </ol>
        <div className="h" style={{ justifyContent: "flex-end", marginTop: "auto" }}>
          <Button finish="graphite" size="sm" onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Button>
          <Button finish="enamel" size="sm">Roll back now</Button>
        </div>
      </div>
      <div className="blk-log" role="log" aria-label="agent.log">
        <span className="h blk-log__head"><StatusIndicator tone="ok" pulse />agent.log</span>
        <i>14:08:02</i> read incident-418{"\n"}
        <i>14:08:06</i> 41 errors found{"\n"}
        <i>14:08:11</i> diff 4.17.3..4.18{"\n"}
        <i>14:08:17</i> cache.ttl 30→300{"\n"}
        <i>14:08:19</i> replay 12k reqs{"\n"}
        <i>14:09:41</i> <span className="e">p95 312 ms &gt; 300</span>{"\n"}
        <i>14:09:43</i> {paused ? "paused" : "waiting…"}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Auth Panel */

export function AuthPanelBlock() {
  const [note, setNote] = useState("Use your work email");
  const passwordId = useId();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNote("Signed in as mara@orbital-ops.dev");
  };
  return (
    <form className="blk blk-auth pnl" aria-label="Sign in to Orbital Ops" onSubmit={submit}>
      <div className="h blk-auth__head">
        <Logo />
        <span className="v" style={{ gap: 0 }}>
          <span className="sm b">Sign in to Orbital Ops</span>
          <span className="xs t3" aria-live="polite">{note}</span>
        </span>
      </div>
      <TextField label="Email" type="email" defaultValue="mara@orbital-ops.dev" autoComplete="off" />
      <div className="v" style={{ gap: 4 }}>
        <span className="h jb">
          <label className="chrome-field__label" htmlFor={passwordId}>Password</label>
          <button type="button" className="link xs blk-linkbtn" onClick={() => setNote("Reset link sent to mara@orbital-ops.dev")}>Forgot?</button>
        </span>
        <TextField id={passwordId} type="password" defaultValue="orbitalops" autoComplete="off" data-focus-visible="" />
      </div>
      <Button finish="polished" type="submit" className="fw" style={{ marginTop: 4 }}>Continue</Button>
      <span className="xs t2" style={{ textAlign: "center" }}>
        or <button type="button" className="link blk-linkbtn" onClick={() => setNote("Opening Orbital Ops single sign-on…")}>sign in with SSO</button>
      </span>
    </form>
  );
}

/* ---------------------------------------------------------------- Settings Panel */

const settingsDefaults = { sev1: true, digest: false, quiet: "22-07" };

export function SettingsPanelBlock() {
  const [saved, setSaved] = useState(settingsDefaults);
  const [draft, setDraft] = useState(settingsDefaults);
  const quietId = useId();
  return (
    <div className="blk blk-settings pnl">
      <div className="blk-settings__side v">
        <span className="blk-cap">Settings</span>
        {["General", "Notifications", "Members", "Billing", "API keys"].map((label) => (
          <span key={label} className={label === "Notifications" ? "nav-item n28 active" : "nav-item n28"}>{label}</span>
        ))}
      </div>
      <div className="blk-settings__main v f1">
        <span className="sm b">Notifications</span>
        <span className="xs t3" style={{ marginBottom: 4 }}>Who gets told, and how fast.</span>
        <div className="h jb blk-row">
          <span className="v" style={{ gap: 0 }}><span className="sm">Page on-call for SEV-1</span><span className="xs t3">Within 30s, by phone and push</span></span>
          <Switch aria-label="Page on-call for SEV-1" checked={draft.sev1} onCheckedChange={(sev1) => setDraft({ ...draft, sev1 })} />
        </div>
        <div className="h jb blk-row">
          <span className="v" style={{ gap: 0 }}><span className="sm">Weekly digest</span><span className="xs t3">Mondays at 09:00</span></span>
          <Switch aria-label="Weekly digest" checked={draft.digest} onCheckedChange={(digest) => setDraft({ ...draft, digest })} />
        </div>
        <div className="h jb blk-row" style={{ borderBottom: 0 }}>
          <span className="sm" id={quietId}>Quiet hours</span>
          <Select.Root value={draft.quiet} onValueChange={(quiet) => setDraft({ ...draft, quiet })}>
            <Select.Trigger aria-labelledby={quietId} className="num blk-settings__select"><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="22-07">22:00 – 07:00</Select.Item>
              <Select.Item value="23-07">23:00 – 07:00</Select.Item>
              <Select.Item value="off">Off</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div className="h blk-settings__save">
          <Button finish="ghost" size="sm" onClick={() => setDraft(saved)}>Discard</Button>
          <Button finish="cobalt" size="sm" onClick={() => setSaved(draft)}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Notification Center */

const notes = [
  { id: "ra", who: "Rafael Achebe", text: " assigned you INC-418", when: "4 min ago" },
  { id: "si", text: " failed in ap-south-1", when: "14 min ago · SEV-1" },
  { id: "pr", who: "Priya Raman", text: " commented on the v4.18.0 rollout", when: "1 h ago" }
];

export function NotificationCenterBlock() {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("all");
  const [unread, setUnread] = useState<ReadonlySet<string>>(() => new Set(["ra", "si"]));
  const shown = tab === "all" ? notes : notes.filter((n) => n.who);
  return (
    <div className="blk blk-notify">
      <span className="blk-notify__bell">
        <IconButton
          finish="graphite"
          aria-label={unread.size ? `Notifications, ${unread.size} unread` : "Notifications"}
          aria-expanded={open}
          data-active={open ? "" : undefined}
          onClick={() => setOpen(!open)}
        >
          <Icon name="bell" />
        </IconButton>
        {unread.size ? <span className="blk-count num" aria-hidden="true">{unread.size}</span> : null}
      </span>
      {open ? (
        <Popover.Root inline>
          <Popover.Content flush arrow={false} aria-label="Notifications" className="blk-notify__tray">
            <div className="h blk-notify__head">
              <span className="sm b">Notifications</span>
              <SegmentedControl size="sm" aria-label="Show" value={tab} onValueChange={setTab} items={[{ value: "all", label: "All" }, { value: "mentions", label: "Mentions" }]} />
              <button type="button" className="link xs ml blk-linkbtn" disabled={!unread.size} onClick={() => setUnread(new Set())}>Mark all read</button>
            </div>
            {shown.map((n) => (
              <div key={n.id} className="blk-ntf">
                {n.who ? <Avatar name={n.who} size="sm" /> : <span className="blk-ki"><Icon name="alert" size={14} /></span>}
                <span className="v f1" style={{ gap: 1 }}>
                  <span className="sm">{n.who ? <b>{n.who}</b> : <span className="mono xs">search-indexer</span>}{n.text}</span>
                  <span className="xs t3">{n.when}</span>
                </span>
                {unread.has(n.id) ? <span className="blk-unread" role="img" aria-label="Unread" /> : null}
              </div>
            ))}
          </Popover.Content>
        </Popover.Root>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Stat Deck */

// the artboard's error-rate sketch (x 0–200, y down in a 28 px box), resampled every 5 units for the even-spaced Sparkline
const errorKeys: [number, number][] = [[0, 22], [40, 22], [60, 23], [80, 22], [95, 22], [100, 6], [105, 22], [140, 22], [170, 23], [200, 22]];
const errorRate = Array.from({ length: 41 }, (_, i) => {
  const x = i * 5;
  const j = errorKeys.findIndex(([kx]) => kx >= x);
  const [x1, y1] = errorKeys[j]!;
  const [x0, y0] = errorKeys[Math.max(0, j - 1)]!;
  return 28 - (x1 === x ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));
});
const flat = errorRate.map((v, i) => (i === 20 ? null : v));
const spike = errorRate.map((v, i) => (i >= 19 && i <= 21 ? v : null));

function Stat({ label, value, unit, note, children }: { label: string; value: string; unit?: string; note: ReactNode; children: ReactNode }) {
  return (
    <div className="pnl blk-stat">
      <span className="sm t2">{label}</span>
      <div className="h blk-stat__row">
        <span className="blk-stat__v">{value}</span>
        {unit ? <span className="xs t3">{unit}</span> : null}
        {note}
      </div>
      {children}
    </div>
  );
}

export function StatDeckBlock() {
  return (
    <div className="blk blk-stats">
      <Stat label="Requests" value="31.6k" unit="/ min" note={<span className="xs blk-up ml num">+8.2%</span>}>
        <Sparkline height={28} domain={[0, 28]} finish="cobalt" data={[4, 7, 6, 11, 10, 15, 13, 18, 17, 23, 22]} />
      </Stat>
      <Stat label="Latency p95" value="42" unit="ms" note={<span className="xs blk-up ml num">−6 ms</span>}>
        <Sparkline height={28} domain={[0, 28]} data={[22, 19, 20, 16, 18, 14, 15, 11, 13, 9, 10]} />
      </Stat>
      <Stat label="Error rate" value="0.02%" note={<span className="xs t3 ml">flat</span>}>
        <div className="blk-stat__stack">
          <Sparkline height={28} domain={[0, 28]} data={flat} />
          <Sparkline height={28} domain={[0, 28]} finish="enamel" data={spike} />
        </div>
      </Stat>
      <Stat label="Agents" value="18" unit="online" note={<span className="xs ml blk-cobalt">3 running</span>}>
        <BarChart
          aria-label="Agents online by hour, rising to 18"
          height={28}
          barWidth={10}
          yLabels={false}
          yDomain={[0, 100]}
          yTicks={[]}
          padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
          series={[{ label: "Agents", finish: "silver", data: [40, 55, 50, 70, 62, 84, { value: 100, finish: "cobalt" }] }]}
        />
      </Stat>
    </div>
  );
}

/* ---------------------------------------------------------------- Pricing Table */

const plans = [
  { name: "Starter", month: "$0", year: "$0", unit: "/ mo", yearUnit: "/ yr", sub: "Side projects", features: ["3 services", "1 region", "7-day logs"], cta: "Start free" },
  { name: "Team", month: "$24", year: "$288", unit: "/ seat / mo", yearUnit: "/ seat / yr", sub: "For on-call teams", features: ["25 services", "5 regions", "500 agent runs"], cta: "Start trial", pick: true },
  { name: "Scale", month: "Custom", year: "Custom", sub: "Regulated fleets", features: ["No service cap", "SSO, audit log", "99.99% SLA"], cta: "Talk to us" }
];

export function PricingTableBlock() {
  const [period, setPeriod] = useState("monthly");
  const yearly = period === "yearly";
  return (
    <div className="blk blk-pricing">
      <SegmentedControl size="sm" aria-label="Billing period" value={period} onValueChange={setPeriod} items={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
      <div className="blk-pricing__plans">
        {plans.map((p) => (
          <div key={p.name} className={p.pick ? "pnl blk-plan" : "blk-plan blk-plan--flat"}>
            {p.pick ? <span className="h jb"><span className="sm b">{p.name}</span><Badge>Recommended</Badge></span> : <span className="sm b">{p.name}</span>}
            <span className="h blk-plan__price">
              <span className="blk-plan__v">{yearly ? p.year : p.month}</span>
              {p.unit ? <span className="xs t3">{yearly ? p.yearUnit : p.unit}</span> : null}
            </span>
            <span className="xs t2">{p.sub}</span>
            <ul className="blk-plan__list">
              {p.features.map((f) => <li key={f}><G n="check" size={12} />{f}</li>)}
            </ul>
            <Button finish={p.pick ? "polished" : "graphite"} size="sm" className="fw" style={{ marginTop: "auto" }}>{p.cta}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Upload Queue */

export function UploadQueueBlock() {
  const [retried, setRetried] = useState(false);
  const file = (name: string, meta: ReactNode, bar: ReactNode, bad = false) => (
    <div className="blk-upload__row">
      <G n="file" className={bad ? "blk-bad" : "t3"} />
      <div className="v f1" style={{ gap: 4 }}>
        <span className="h jb xs"><span className="mono">{name}</span>{meta}</span>
        {bar}
      </div>
    </div>
  );
  return (
    <div className="blk blk-upload pnl">
      <div className="h jb">
        <span className="v" style={{ gap: 0 }}>
          <span className="sm b">Upload to INC-418</span>
          <span className="xs t3">4 files · {retried ? 3 : 2} uploading</span>
        </span>
        <Button finish="graphite" size="sm" leadingIcon={<Icon name="plus" size={14} />}>Add files</Button>
      </div>
      <div className="blk-drop xs"><G n="upload" />Drop files here, up to 50 MB each</div>
      <div className="v" style={{ gap: 2 }}>
        {file("incident-418.log", <span className="h t3 num" style={{ gap: 6 }}>2.4 MB<G n="check" size={12} className="blk-ok" /></span>, <Meter value={100} tone="neutral" showValue={false} aria-label="incident-418.log uploaded" />)}
        {file("staging-replay.har", <span className="t3 num">22 MB · 72%</span>, <Progress value={72} aria-label="staging-replay.har upload" />)}
        {file("search-indexer-trace.json", <span className="t3 num">48 MB · 31% · 1 min left</span>, <Progress value={31} aria-label="search-indexer-trace.json upload" />)}
        {retried
          ? file("ap-south-1-p95.csv", <span className="t3 num">Retrying · 40%</span>, <Progress value={40} aria-label="ap-south-1-p95.csv upload" />)
          : file(
              "ap-south-1-p95.csv",
              <span className="h" style={{ gap: 8 }}><span className="blk-bad">Connection reset</span><button type="button" className="link blk-linkbtn" onClick={() => setRetried(true)}>Retry</button></span>,
              <Meter value={40} tone="danger" showValue={false} aria-label="ap-south-1-p95.csv upload failed at 40%" />,
              true
            )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Activity Feed */

export function ActivityFeedBlock() {
  const agent = <Logo className="blk-logo24" />;
  return (
    <div className="blk blk-feed pnl">
      <div className="h jb"><span className="sm b">Activity</span><span className="xs t3">Today · INC-418</span></div>
      <ol className="blk-feed__list">
        <li><Avatar name="Mara Lindqvist" size="sm" /><span className="sm f1"><b>Mara Lindqvist</b> opened INC-418 as SEV-1</span><span className="xs t3 num">14:02</span></li>
        <li>{agent}<span className="sm f1"><b>Ops agent</b> paused v4.18.0 in ap-south-1</span><span className="xs t3 num">14:05</span></li>
        <li><Avatar name="Rafael Achebe" size="sm" /><span className="sm f1"><b>Rafael Achebe</b> acknowledged the page</span><span className="xs t3 num">14:06</span></li>
        <li>
          <Avatar name="Priya Raman" size="sm" />
          <span className="v f1" style={{ gap: 6 }}>
            <span className="sm"><b>Priya Raman</b> merged #2291</span>
            <span className="mono xs t2 blk-feed__pr">Raise search-indexer timeout to 8s</span>
          </span>
          <span className="xs t3 num">14:21</span>
        </li>
        <li>{agent}<span className="sm f1"><b>Ops agent</b> confirmed p95 under 300 ms in ap-south-1</span><span className="xs t3 num">14:34</span></li>
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- Composer */

const draftText = "Draft a rollback plan for search-indexer and page @rafael if p95 stays above 300 ms for 10 min.";

export function ComposerBlock() {
  const [text, setText] = useState(draftText);
  const [attached, setAttached] = useState(true);
  const send = () => {
    setText("");
    setAttached(false);
  };
  return (
    <div className="blk blk-composer">
      <div className="h blk-composer__msg">
        <Logo className="blk-logo24" />
        <div className="v" style={{ gap: 4 }}>
          <span className="xs t3">Ops agent · 14:09</span>
          <span className="sm blk-bubble">p95 in ap-south-1 is 312 ms, over the 300 ms budget. Want a rollback plan?</span>
        </div>
      </div>
      <div className="pnl v blk-composer__box">
        <Textarea
          aria-label="Message to Ops agent"
          placeholder="Ask Ops agent…"
          rows={2}
          resize="none"
          value={text}
          onValueChange={setText}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
        />
        {attached ? (
          <div className="h">
            <Chip size="sm" icon={<G n="file" size={12} />} onRemove={() => setAttached(false)} removeLabel="Remove incident-418.log">
              <span className="mono blk-composer__file">incident-418.log</span>
            </Chip>
          </div>
        ) : null}
        <div className="h" style={{ gap: 4 }}>
          <IconButton finish="ghost" size="sm" aria-label="Attach a file" style={{ marginLeft: -8 }}><G n="clip" /></IconButton>
          <IconButton finish="ghost" size="sm" aria-label="Mention someone" onClick={() => setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}@`)}><G n="at" /></IconButton>
          <Button finish="ghost" size="sm" trailingIcon={<G n="chevron-down" />}><StatusIndicator tone="ok" />Ops agent</Button>
          <KeyHint keys={["⌘", "↵"]} className="ml" style={{ marginRight: 6 }} />
          <IconButton finish="polished" aria-label="Send to Ops agent" disabled={!text.trim()} onClick={send}><G n="arrow-up" size={16} style={{ strokeWidth: 2 }} /></IconButton>
        </div>
      </div>
    </div>
  );
}

/** Stage content per block slug (data.ts). */
export const blockPreviews: Record<string, () => JSX.Element> = {
  "sidebar": SidebarBlock,
  "command-bar": CommandBarBlock,
  "data-grid": DataGridBlock,
  "agent-run": AgentRunBlock,
  "auth-panel": AuthPanelBlock,
  "settings-panel": SettingsPanelBlock,
  "notification-center": NotificationCenterBlock,
  "stat-deck": StatDeckBlock,
  "pricing-table": PricingTableBlock,
  "upload-queue": UploadQueueBlock,
  "activity-feed": ActivityFeedBlock,
  "composer": ComposerBlock
};
