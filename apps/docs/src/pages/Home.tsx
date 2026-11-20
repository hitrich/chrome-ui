import {
  AreaChart,
  Badge,
  Button,
  ChartTooltipRow,
  ChartWell,
  CommandPalette,
  DropdownMenu,
  IconButton,
  SegmentedControl,
  Slider,
  Spinner,
  StatusIndicator,
  Switch,
  Table,
  TextField,
  useChrome,
  type StatusIndicatorProps
} from "@loreanai/chrome-ui";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ribbon from "../assets/ribbon.jpg";
import { templates } from "../data";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import { GITHUB_URL } from "../components/shell";
import "./Home.css";

/* The landing (Main artboard): site header, hero, live bento, blocks, finishes, templates, developers, Ink band, footer. */

const INSTALL_CMD = "npm i @loreanai/chrome-ui";
const INSTALL_DOC = "/components/button#installation";

/** Stroke glyphs the shared Icon set does not carry. */
const glyph = (d: string, size?: number) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={size ? { width: size, height: size } : undefined}>
    <path d={d} />
  </svg>
);
const CHECK = "m5 12 5 5 9-10";

type CopyState = "idle" | "copied" | "failed";

/** Copies text with the Clipboard API, falling back to a hidden textarea for insecure or older contexts. */
function useCopy() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (text: string) => {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.append(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };
  return [state, copy] as const;
}

/** The lopsided spoke ring of the agent tile: 60 polished spokes, centred on their visible bounds. */
function spokeRing() {
  const n = 60;
  const r1 = 46;
  let x0 = 0, x1 = 0, y0 = 0, y1 = 0;
  const spokes: CSSProperties[] = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * 360;
    const t = (a * Math.PI) / 180;
    const len = Math.round(52 + 24 * (0.5 + 0.5 * Math.cos(3 * t + 0.5)) + 5 * Math.sin(5 * t));
    const reach = r1 + len;
    for (const r of [r1, reach]) {
      const x = r * Math.sin(t);
      const y = -r * Math.cos(t);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    spokes.push({ height: len, marginTop: -reach, transformOrigin: `50% ${reach}px`, transform: `rotate(${a.toFixed(2)}deg)` });
  }
  return { spokes, shift: { transform: `translate(${(-(x0 + x1) / 2).toFixed(1)}px, ${(-(y0 + y1) / 2).toFixed(1)}px)` } };
}
const ring = spokeRing();

/* ---------------------------------------------------------------- header + theme preference */

const primaryNav = [
  { label: "Components", to: "/components" },
  { label: "Blocks", to: "/components/blocks" },
  { label: "Charts", to: "/components/charts" },
  { label: "Templates", to: "/templates/dashboard" },
  { label: "Docs", to: "/components" }
];

type ThemePref = "ink" | "satin" | "system";

/** The landing is always Satin; its theme controls set the reader's docs theme (stored by App as `chrome-theme`). */
function useDocsTheme() {
  const { setTheme } = useChrome();
  const [pref, setPref] = useState<ThemePref>(() => {
    try {
      return window.localStorage.getItem("chrome-theme") === "ink" ? "ink" : "satin";
    } catch {
      return "satin";
    }
  });
  const choose = (next: ThemePref) => {
    setPref(next);
    setTheme(next === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "ink" : "satin") : next);
  };
  return [pref, choose] as const;
}

/* ---------------------------------------------------------------- bento data */

type Tone = NonNullable<StatusIndicatorProps["tone"]>;
const deployments: { service: string; tone: Tone; pulse?: boolean; status: ReactNode; region: string; duration: string }[] = [
  { service: "api-gateway", tone: "ok", pulse: true, status: "Live", region: "eu-west-1", duration: "41s" },
  { service: "billing-worker", tone: "info", status: <>Rolling <span className="t3">62%</span></>, region: "us-east-2", duration: "1m 12s" },
  { service: "search-indexer", tone: "bad", status: "Failed", region: "ap-south-1", duration: "3m 02s" },
  { service: "edge-renderer", tone: "ok", status: "Live", region: "us-west-1", duration: "38s" },
  { service: "auth-service", tone: "warn", status: "Queued", region: "eu-central-1", duration: "—" },
  { service: "cache-warm", tone: "ok", status: "Live", region: "eu-west-1", duration: "22s" }
];
const regions = ["eu-west-1", "us-east-2", "ap-south-1", "us-west-1", "eu-central-1"];

/** Regions done → share of traffic shifted, for the release tile's step buttons. */
const rollout = [0, 14, 38, 62, 81, 100];

const paletteGroups = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back search-indexer", shortcut: "↵" },
      { id: "rollout", label: "Roll out v4.18.0 to all regions", shortcut: "⌘R" }
    ]
  },
  {
    label: "Runbooks",
    items: [
      { id: "checklist", label: "Rollback checklist", meta: "runbook.md" },
      { id: "restart", label: "Rolling restart, edge", meta: "ops/edge.md" }
    ]
  }
];

type Range = "24h" | "7d" | "30d";
const throughput: Record<Range, {
  labels: string[];
  now: number[];
  prev: number[];
  names: [string, string];
  at: number;
  when: string;
  label: string;
}> = {
  "24h": {
    labels: ["12:00", "15:00", "18:00", "21:00", "00:00", "03:00", "06:00", "09:00", "Now"],
    now: [29800, 33100, 35400, 30200, 22600, 20800, 24900, 30400, 31600],
    prev: [28100, 30600, 32900, 28700, 21900, 20400, 23600, 28800, 29200],
    names: ["Today", "Yesterday"],
    at: 2,
    when: "Sat 14 Nov 18:00",
    label: "Requests per minute over the last 24 hours against the day before. Traffic peaks at 18:00 at 35.4 thousand, against 32.9 thousand a day earlier."
  },
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    now: [26100, 27400, 29000, 31200, 38200, 33500, 31600],
    prev: [24000, 24800, 26200, 27500, 29400, 28100, 29200],
    names: ["This week", "Last week"],
    at: 4,
    when: "Fri 13 Nov",
    label: "Requests per minute this week against last week. This week peaks on Friday 13 November at 38.2 thousand, against 29.4 thousand last Friday."
  },
  "30d": {
    labels: ["19 Oct", "26 Oct", "2 Nov", "9 Nov", "15 Nov"],
    now: [24800, 26300, 27900, 34600, 31600],
    prev: [22400, 23100, 24600, 25200, 26800],
    names: ["Last 30 days", "Previous 30"],
    at: 3,
    when: "Week of 9 Nov",
    label: "Weekly average requests per minute over the last 30 days against the 30 days before. The week of 9 November peaks at 34.6 thousand, against 25.2 thousand."
  }
};
const k = (v: number) => `${(v / 1000).toFixed(1)}k`;

/* ---------------------------------------------------------------- bento tiles */

function AgentTile() {
  const [running, setRunning] = useState(false);
  return (
    <article className="card s4 hm-agent" aria-label="Agent">
      <span className="keychip hm-agent__key" aria-hidden="true">⌘</span>
      <div className="hm-agent__stage" aria-hidden="true">
        <div className="hm-agent__pivot">
          <div className="hm-agent__ring" style={ring.shift}>
            {ring.spokes.map((style, i) => <span key={i} className="spoke" style={style} />)}
          </div>
        </div>
      </div>
      <div className="hm-agent__foot">
        <span className="small t3" role="status">{running ? "Agent running · 1 of 3 runs" : "Agent idle · 3 runs queued"}</span>
        <Button finish="polished" size="xl" className="hm-agent__start" onClick={() => setRunning((on) => !on)}>
          {running ? "Stop" : "Start"}
        </Button>
      </div>
    </article>
  );
}

function DeploymentsTile() {
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const rows = region === "all" ? deployments : deployments.filter((row) => row.region === region);
  return (
    <article className="card s5 hm-deploys">
      <div className="hm-deploys__head">
        <div className="hm-stack2">
          <h2 className="h3">Deployments</h2>
          <span className="small t3">48 today across 5 regions</span>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button finish="graphite" size="sm" trailingIcon={glyph("m6 9 6 6 6-6", 14)}>
              {region === "all" ? "All regions" : region}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.RadioGroup value={region} onValueChange={setRegion}>
              <DropdownMenu.RadioItem value="all">All regions</DropdownMenu.RadioItem>
              {regions.map((name) => <DropdownMenu.RadioItem key={name} value={name}>{name}</DropdownMenu.RadioItem>)}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <Table aria-label="Deployments" className="hm-deploys__table">
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Status</th>
            <th scope="col">Region</th>
            <th scope="col" className="r">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.service}>
              <td className="mono">{row.service}</td>
              <td><StatusIndicator tone={row.tone} pulse={row.pulse} label={row.status} /></td>
              <td className="t2">{row.region}</td>
              <td className={row.duration === "—" ? "r t3" : "r"}>{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="hm-deploys__foot">
        <span className="small t3" aria-live="polite">Page {page} of 8</span>
        <div className="hm-row8">
          {/* the demo pages wrap around, so neither button is ever a dead end */}
          <IconButton finish="graphite" size="sm" aria-label="Previous page" onClick={() => setPage((p) => (p === 1 ? 8 : p - 1))}>{glyph("m15 6-6 6 6 6")}</IconButton>
          <IconButton finish="graphite" size="sm" aria-label="Next page" onClick={() => setPage((p) => (p === 8 ? 1 : p + 1))}>{glyph("m9 6 6 6-6 6")}</IconButton>
        </div>
      </div>
    </article>
  );
}

function ReleaseTile() {
  const [done, setDone] = useState(3);
  const [paused, setPaused] = useState(false);
  const pct = rollout[done] ?? 0;
  return (
    <article className="s3 chrome-root hm-release" data-chrome-theme="ink">
      <div className="hm-release__disc" aria-hidden="true" />
      <div className="hm-release__title">
        <span className="small">Release</span>
        <h2 className="h3">v4.18.0 · {done === 5 ? "rolled out" : paused ? "paused" : "rolling out"}</h2>
      </div>
      <div className="hm-stack8">
        <div className="sp dk" role="progressbar" aria-label="Rollout" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <i className="b" style={{ width: `${pct}%` }} />
        </div>
        <div className="num hm-release__meta"><span>{done} of 5 regions</span><span>{pct}%</span></div>
      </div>
      <div className="hm-release__transport">
        <IconButton finish="smoked" size="lg" aria-label="Previous step" disabled={done === 0} onClick={() => setDone((d) => d - 1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5v14L7 12z M5 5h2v14H5z" fill="#f4f4f5" /></svg>
        </IconButton>
        <IconButton finish="polished" className="hm-release__play" aria-label={paused ? "Resume rollout" : "Pause rollout"} onClick={() => setPaused((p) => !p)}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d={paused ? "M7 4.5v15l12-7.5z" : "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"} fill="#2b2a2a" />
          </svg>
        </IconButton>
        <IconButton finish="smoked" size="lg" aria-label="Next step" disabled={done === 5} onClick={() => setDone((d) => d + 1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l10-7z M17 5h2v14h-2z" fill="#f4f4f5" /></svg>
        </IconButton>
      </div>
    </article>
  );
}

function PaletteTile() {
  return (
    <article className="card s4 hm-palette" aria-label="Command palette">
      <div className="dots hm-palette__dots" aria-hidden="true" />
      <CommandPalette inline groups={paletteGroups} defaultQuery="roll" label="Search actions and runbooks" className="hm-palette__panel" />
    </article>
  );
}

function ThroughputTile() {
  const [range, setRange] = useState<Range>("7d");
  const data = throughput[range];
  const last = data.now[data.now.length - 1] ?? 0;
  const base = data.prev[data.prev.length - 1] ?? 1;
  const delta = ((last / base - 1) * 100).toFixed(1);
  return (
    <article className="card card-lit s5 tile-pad hm-throughput">
      <div className="hm-throughput__head">
        <div className="hm-stack4">
          <h2 className="h3 t2">Throughput</h2>
          <div className="hm-throughput__value">
            <span className="num hm-throughput__big">{k(last)}</span>
            <span className="small t3 hm-nowrap">req / min</span>
            <span className="small num hm-up hm-600">+{delta}%</span>
          </div>
        </div>
        <SegmentedControl
          aria-label="Range"
          value={range}
          onValueChange={(value) => setRange(value as Range)}
          items={[{ value: "24h", label: "24h" }, { value: "7d", label: "7d" }, { value: "30d", label: "30d" }]}
        />
      </div>
      <ChartWell className="hm-throughput__well">
        <AreaChart
          height="fill"
          className="hm-throughput__chart"
          padding={{ top: 12, right: 0, bottom: 29, left: 28 }}
          aria-label={data.label}
          curve="smooth"
          labels={data.labels}
          yTicks={[20000, 30000, 40000, 50000]}
          yDomain={[20000, 50000]}
          formatY={(v) => `${v / 1000}k`}
          series={[
            { label: data.names[0], data: data.now, finish: "cobalt", area: true },
            { label: data.names[1], data: data.prev, finish: "dashed" }
          ]}
          highlight={{
            index: data.at,
            side: "left",
            tooltip: (
              <>
                <span className="t3 num">{data.when}</span>
                <ChartTooltipRow swatch="cobalt" label={data.names[0]} value={k(data.now[data.at] ?? 0)} strong />
                <ChartTooltipRow swatch="dashed" label={data.names[1]} value={k(data.prev[data.at] ?? 0)} muted />
              </>
            )
          }}
        />
      </ChartWell>
    </article>
  );
}

function PolicyTile() {
  const [shift, setShift] = useState(64);
  return (
    <article className="card s3 tile-pad hm-policy">
      <h2 className="h3">Rollout policy</h2>
      <div className="hm-col">
        {[
          { label: "Auto-rollback", on: true },
          { label: "Page on-call", on: true },
          { label: "Quiet hours", on: false }
        ].map((row) => (
          <div className="row-sw" key={row.label}>
            <span className="small">{row.label}</span>
            <Switch aria-label={row.label} defaultChecked={row.on} />
          </div>
        ))}
      </div>
      <div className="hm-stack12 hm-policy__shift">
        <span className="small hm-between"><span id="hm-shift">Traffic shift</span><span className="num t2">{shift}%</span></span>
        <Slider aria-labelledby="hm-shift" value={[shift]} max={100} step={1} onValueChange={(v) => setShift(v[0] ?? 0)} />
      </div>
      <div className="hm-stack8 hm-policy__strategy">
        <span className="small t3" id="hm-strategy">Strategy</span>
        <SegmentedControl
          aria-labelledby="hm-strategy"
          defaultValue="rolling"
          items={[{ value: "canary", label: "Canary" }, { value: "rolling", label: "Rolling" }, { value: "blue-green", label: "Blue-green" }]}
        />
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- blocks */

const Field = ({ children, focus, className }: { children: ReactNode; focus?: boolean; className?: string }) => (
  <span className={`chrome-field__control hm-field${focus ? " hm-field--focus" : ""}${className ? ` ${className}` : ""}`}>{children}</span>
);

const blockCards: { slug: string; title: string; blurb: string; stage: ReactNode; stageClass: string }[] = [
  {
    slug: "agent-run",
    title: "Agent Run",
    blurb: "Streaming multi-step progress with tool calls and completion states.",
    stageClass: "hm-stage--run",
    stage: (
      <>
        <div className="hm-between hm-13"><span className="hm-600">Rollback check · INC-418</span><span className="t3 num">3 of 5</span></div>
        <div className="sp"><i className="b" style={{ width: "60%" }} /></div>
        <ol className="hm-steps">
          <li className="t2"><span className="hm-ok">{glyph(CHECK)}</span>Read incident-418.log</li>
          <li className="t2"><span className="hm-ok">{glyph(CHECK)}</span>Diff config v4.17 → v4.18</li>
          <li><Spinner size="md" className="hm-spin" label="Running" />Replay traffic on staging</li>
          <li className="t3"><span className="hm-todo" />Draft rollback plan</li>
        </ol>
      </>
    )
  },
  {
    slug: "auth-panel",
    title: "Auth Panel",
    blurb: "Email, password and SSO with error, loading and passkey states.",
    stageClass: "hm-stage--auth",
    stage: (
      <div className="hm-auth">
        <span className="hm-auth__title">Sign in to Orbital Ops</span>
        <Field className="t2">mara@orbital.dev</Field>
        <Field focus className="hm-auth__pw">••••••••••</Field>
        <Button asChild finish="smoked" size="sm" className="hm-auth__go"><span>Continue</span></Button>
      </div>
    )
  },
  {
    slug: "notification-center",
    title: "Notification Center",
    blurb: "A severity-coded inbox with read state, grouping and quick actions.",
    stageClass: "hm-stage--inbox",
    stage: (
      <>
        {[
          { tone: "bad" as const, title: "search-indexer failed", meta: "ap-south-1 · 14 min ago" },
          { tone: "info" as const, title: "Rafael Achebe approved v4.18.0", meta: "Rolling to 3 regions · 22 min ago" },
          { tone: "warn" as const, title: "Certificate expires in 9 days", meta: "edge.orbital.dev · 1 h ago" }
        ].map((note) => (
          <div className="hm-note" key={note.title}>
            <StatusIndicator tone={note.tone} />
            <div className="hm-stack2 hm-13"><span className="hm-600">{note.title}</span><span className="t3">{note.meta}</span></div>
          </div>
        ))}
      </>
    )
  },
  {
    slug: "upload-queue",
    title: "Upload Queue",
    blurb: "Drag-in files with per-file progress, completion and limit errors.",
    stageClass: "hm-stage--run",
    stage: (
      <>
        {[
          { file: "telemetry-q3.parquet", state: <span className="t3 num">84%</span>, bar: "b", width: "84%" },
          { file: "fleet-manifest.json", state: <span className="hm-up hm-600">Done</span>, bar: "", width: "100%" },
          { file: "cam-04-raw.mov", state: <span className="hm-bad hm-600">Over 2 GB</span>, bar: "en", width: "100%" }
        ].map((up) => (
          <div className="hm-stack8" key={up.file}>
            <div className="hm-between hm-13"><span className="mono hm-125">{up.file}</span>{up.state}</div>
            <div className="sp"><i className={up.bar || undefined} style={{ width: up.width }} /></div>
          </div>
        ))}
      </>
    )
  },
  {
    slug: "stat-deck",
    title: "Stat Deck",
    blurb: "KPI tiles with deltas and sentiment that read at a glance.",
    stageClass: "hm-stage--stats",
    stage: (
      <>
        {[
          { label: "Requests", value: "31.6k", note: <span className="small num hm-up">+8.2%</span> },
          { label: "Latency p95", value: "42 ms", note: <span className="small num hm-up">−6 ms</span> },
          { label: "Error rate", value: "0.02%", note: <span className="small t3">flat</span> },
          { label: "Agents", value: "18", note: <span className="small hm-cobalt">3 running</span> }
        ].map((stat) => (
          <div className="hm-stat" key={stat.label}>
            <span className="small t3">{stat.label}</span>
            <span className="num hm-stat__value">{stat.value}</span>
            {stat.note}
          </div>
        ))}
      </>
    )
  },
  {
    slug: "composer",
    title: "Composer",
    blurb: "Prompt input with attachments, model choice and streaming send state.",
    stageClass: "hm-stage--composer",
    stage: (
      <>
        <div className="hm-row6"><Badge className="hm-chip">incident-418.log</Badge><Badge className="hm-chip">runbook.md</Badge></div>
        <Field className="hm-prompt">
          <span>Is it safe to roll back <span className="hm-nowrap">search-indexer</span> in <span className="hm-nowrap">ap-south-1?</span></span>
        </Field>
        <div className="hm-composer__bar">
          <span className="tray hm-mode">
            <Button asChild finish="ghost" size="sm"><span>Fast</span></Button>
            <Button asChild finish="polished" size="sm"><span>Deep</span></Button>
          </span>
          <Button asChild finish="smoked" size="sm" className="chrome-icon-button hm-send"><span>{glyph("M12 19V5M6 11l6-6 6 6")}</span></Button>
        </div>
      </>
    )
  }
];

/* ---------------------------------------------------------------- finishes */

const finishes = [
  { finish: "polished" as const, name: "Polished", note: "mint", text: "The one primary action per view." },
  { finish: "smoked" as const, name: "Smoked", note: "black chrome", text: "Secondary actions on any surface." },
  { finish: "cobalt" as const, name: "Cobalt", note: "confirm", text: "Approve, publish, continue." },
  { finish: "enamel" as const, name: "Enamel", note: "destructive", text: "Delete, revoke, roll back." },
  { finish: "polished" as const, name: "Rose", note: "palette", text: "The same build in your brand’s tint.", tint: "tint-rose" }
];

/* ---------------------------------------------------------------- template thumbnails */

type NavMini = { label: string; on?: boolean; count?: string; alert?: boolean; bare?: boolean; style?: CSSProperties };
const navMini = (items: readonly NavMini[]) =>
  items.map((item) => (
    <span key={item.label} className={`ni${item.on ? " on" : ""}${item.bare ? " bare" : ""}`} style={item.style}>
      {item.label}
      {item.count ? <b className={item.alert ? "r" : undefined}>{item.count}</b> : null}
    </span>
  ));
const opsNav = (on?: string): NavMini[] => [
  { label: "Home", on: on === "Home" },
  { label: "Deployments", count: "48" },
  { label: "Incidents", count: "3", alert: true },
  { label: "Agents", on: on === "Agents" },
  { label: "Analytics" },
  { label: "On-call" }
];
const bare = (labels: readonly string[]): NavMini[] => labels.map((label) => ({ label, bare: true }));
const pins = (items: readonly [string, string][]) =>
  items.map(([label, color]) => <span key={label} className="pi"><i className="d" style={{ color }} />{label}</span>);
const kpis = (items: readonly [string, string][]) => (
  <div className="rw hm-cols4">
    {items.map(([label, value]) => <div className="kp" key={label}><span className="su">{label}</span><em>{value}</em></div>)}
  </div>
);
const topBar = (search: string, cta: string, who: string) => (
  <div className="tb"><span className="sr">{search}</span><span className="cta">{cta}</span><span className="av">{who}</span></div>
);
const titleBlock = (title: string, sub: string) => <div><div className="tt">{title}</div><div className="su">{sub}</div></div>;

/** A 120×50 thumbnail plot: grid, area, dashed comparison, polished wire, cursor and axis. */
function MiniPlot({ wire, dashed, grid, base, cursor, dark, bands }: { wire: string; dashed: string; grid: string; base: number; cursor: number; dark?: boolean; bands?: string }) {
  const top = grid.split("H")[0]!.split(" ")[1];
  return (
    <svg className="ch" viewBox="0 0 120 50" preserveAspectRatio="none">
      {bands ? <path d={bands} fill="rgba(0,0,0,.04)" /> : null}
      <path d={grid} stroke={dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"} vectorEffect="non-scaling-stroke" />
      <path d={`${wire} V${base} H0Z`} fill="url(#hm-area)" />
      <path d={dashed} fill="none" stroke={dark ? "#6b6b74" : "#8f9494"} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <g className="wr ns tn">
        <path className="wb0" d={wire} />
        <path className="wb1" d={wire} />
        <path className="wb2" transform="translate(0 -.3)" d={wire} />
      </g>
      <path d={`M${cursor} ${top}V${base}`} stroke={dark ? "rgba(255,255,255,.26)" : "rgba(0,0,0,.28)"} strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" />
      <path d={`M0 ${base}H120`} stroke={dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.22)"} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const lines = (items: readonly [string, string, string?][]) =>
  items.map(([label, value, color]) => (
    <span className="li" key={label}>
      {color ? <i className="d" style={{ color }} /> : null}
      <span>{label}</span>
      <b>{value}</b>
    </span>
  ));
const bars = (items: readonly [string, ReactNode, string, string?][], mono?: boolean) =>
  items.map(([label, value, width, finish]) => (
    <span className={mono ? "lr mo" : "lr"} key={label}>
      <span><span>{label}</span>{value}</span>
      <span className="tr"><i className={finish} style={{ width }} /></span>
    </span>
  ));
const cashBars: [string, string, number?][] = [
  ["78%", "69%"], ["72%", "82%"], ["80%", "60%"], ["76%", "86%"], ["82%", "62%"], ["78%", "81%"], ["84%", "62%"], ["64%", "48%", 0.45]
];
const field = (label: string, body: ReactNode, focus?: boolean) => (
  <span className="hm-tf"><span className="su hm-tf__label">{label}</span><span className={focus ? "in f" : "in"}>{body}</span></span>
);

const thumbs: ReactNode[] = [
  <div className="scr" aria-hidden="true" key="dashboard">
    <div className="sb">
      <span className="ws">Orbital Ops</span>
      {navMini(opsNav("Home"))}
      <span className="gl">Pinned services</span>
      {pins([["api-gateway", "#0f8a5f"], ["search-indexer", "#d42e1f"], ["edge-renderer", "#1447e6"]])}
    </div>
    <div className="mn">
      {topBar("Search services, runs, people", "Deploy", "ML")}
      {titleBlock("Overview", "Month to date · 1–15 Nov")}
      {kpis([["Billable usage", "$380.9k"], ["Requests", "682.6M"], ["Agent runs", "4,812"], ["Error budget", "72%"]])}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)" }}>
        <div className="pn">
          <span className="pt">Billable usage<span className="su">USD / day</span></span>
          <MiniPlot
            bands="M0 3.3H4.3V49.3H0ZM47.1 3.3H64.3V49.3H47.1ZM107.1 3.3H120V49.3H107.1Z"
            grid="M0 3.3H120 M0 14.8H120 M0 26.3H120 M0 37.8H120"
            wire="M0.0 26.8 L8.6 20.8 L17.2 19.3 L25.7 18.4 L34.3 17.8 L42.9 19.6 L51.4 24.9 L60.0 25.9 L68.6 17.6 L77.1 16.1 L85.7 15.6 L94.3 14.7 L102.9 16.9 L111.4 23.2 L120.0 24.1"
            dashed="M0.0 23.6 L8.6 24.5 L17.2 28.8 L25.7 29.5 L34.3 23.0 L42.9 22.2 L51.4 21.6 L60.0 21.2 L68.6 22.7 L77.1 27.7 L85.7 28.5 L94.3 21.7 L102.9 20.3 L111.4 20.0 L120.0 19.5"
            base={49.3}
            cursor={94.3}
          />
          <span className="su ax"><span style={{ left: 0, transform: "none" }}>1 Nov</span><span style={{ left: "50%" }}>8 Nov</span><span style={{ right: 0, transform: "none" }}>15 Nov</span></span>
        </div>
        <div className="pn">
          <span className="pt">Needs attention<span className="su">6</span></span>
          {lines([
            ["search-indexer failing", "14m", "#d42e1f"],
            ["5xx on checkout", "52m", "#d42e1f"],
            ["TLS cert expires 25 Nov", "1d", "#b06f00"],
            ["Deploy auth-service", "1h 20m", "#1447e6"],
            ["Raise GPU pool budget", "1d", "#1447e6"]
          ])}
        </div>
      </div>
    </div>
  </div>,

  <div className="scr dk" aria-hidden="true" key="control-room">
    <div className="sb">
      <span className="ws">Orbital Ops</span>
      {navMini([{ label: "Control room", on: true }, ...opsNav().slice(1)])}
      <span className="gl">Pinned runs</span>
      {pins([["nightly-rebalance", "#3a6bff"], ["cert-rotation", "#e8a33a"], ["cache-warm", "#3fbf8f"]])}
    </div>
    <div className="mn">
      {topBar("Search services, runs, people", "Deploy", "ML")}
      {titleBlock("Control room", "5 regions · 214 services · updated 12 s ago")}
      {kpis([["Requests / min", "31.6k"], ["Latency p95", "42 ms"], ["Error rate", "0.02%"], ["Agents", "18"]])}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)" }}>
        <div className="pn">
          <span className="pt">Traffic and errors<span className="su">24h</span></span>
          <MiniPlot
            dark
            grid="M0 4.0H120 M0 15.1H120 M0 26.2H120 M0 37.3H120"
            wire="M0.0 15.7 L5.0 13.2 L10.0 11.5 L15.0 10.4 L20.0 10.1 L25.0 10.5 L30.0 9.8 L35.0 8.6 L40.0 7.2 L45.0 6.0 L50.0 6.9 L55.0 8.3 L60.0 10.7 L65.0 13.5 L70.0 16.0 L75.0 18.1 L80.0 19.8 L85.0 20.9 L90.0 21.3 L95.0 21.0 L100.0 19.4 L105.0 17.0 L110.0 14.2 L115.0 12.0 L120.0 11.1"
            dashed="M0.0 16.5 L5.0 14.5 L10.0 13.0 L15.0 12.1 L20.0 12.0 L25.0 12.5 L30.0 12.8 L35.0 14.1 L40.0 15.1 L45.0 15.8 L50.0 15.4 L55.0 14.5 L60.0 14.7 L65.0 16.1 L70.0 17.6 L75.0 19.2 L80.0 20.5 L85.0 21.4 L90.0 21.8 L95.0 21.4 L100.0 20.1 L105.0 17.9 L110.0 15.3 L115.0 13.2 L120.0 12.3"
            base={48.4}
            cursor={45}
          />
          <span className="su ax"><span style={{ left: "12.5%" }}>12:00</span><span style={{ left: "62.5%" }}>Mon 00:00</span><span style={{ right: 0, transform: "none" }}>Now</span></span>
        </div>
        <div className="pn">
          <span className="pt">Traffic by region<span className="su">24h</span></span>
          {bars([
            ["eu-west-1", <span key="v">34%</span>, "34%"],
            ["us-east-2", <span key="v">25%</span>, "25%", "s"],
            ["ap-south-1", <span key="v" className="hm-degraded">degraded · 18%</span>, "18%", "en"],
            ["us-west-1", <span key="v">14%</span>, "14%", "s"],
            ["eu-central-1", <span key="v">9%</span>, "9%", "s"]
          ], true)}
        </div>
      </div>
    </div>
  </div>,

  <div className="scr" aria-hidden="true" key="finance-desk">
    <div className="sb">
      <span className="ws">Harbor &amp; Pine</span>
      {navMini([{ label: "Treasury", on: true }, { label: "Payments", count: "4" }, { label: "Transactions" }, { label: "Budgets" }, { label: "Payouts" }, { label: "Reports" }])}
      <span className="gl">Saved views</span>
      {navMini([{ label: "Over $50,000", count: "1", bare: true }, { label: "Due this week", count: "3", bare: true }, { label: "Returned ACH", count: "1", alert: true, bare: true }])}
    </div>
    <div className="mn">
      {topBar("Search payees, invoices, transactions", "New payment", "TI")}
      {titleBlock("Treasury", "Mon 16 Nov 2026 · balances as of 10:02 ET · USD")}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)" }}>
        <div className="pn hm-gap4">
          <span className="pt">Cash position<span className="su">4 accounts</span></span>
          <span className="hm-cash">$12,730,424</span>
          <span className="su up">+$412,900 this week</span>
          <span className="hm-split">
            <i style={{ flex: 51 }} /><i style={{ flex: 33 }} /><i style={{ flex: 9 }} /><i style={{ flex: 7 }} />
          </span>
          {lines([["Reserve", "$6,500,000"], ["Operating", "$4,218,640"], ["Payroll", "$1,102,300"], ["EUR collections", "$909,484"]])}
          <span className="su hm-auto">Operating floor $1,500,000 · covered 2.8×</span>
        </div>
        <div className="pn">
          <span className="pt">Cash in and out<span className="su hm-key"><span><i className="d hm-key__in" /> In</span><span><i className="d hm-key__out" /> Out</span></span></span>
          <div className="bars">
            {cashBars.map(([cin, cout, fade], i) => (
              <span key={i}><i style={{ height: cin, opacity: fade }} /><i className="o" style={{ height: cout, opacity: fade }} /></span>
            ))}
          </div>
          <span className="su ax">
            <span style={{ left: "calc((100% - 28px) / 16)" }}>28 Sep</span>
            <span style={{ left: "calc((100% - 28px) * 7 / 16 + 12px)" }}>19 Oct</span>
            <span style={{ left: "calc((100% - 28px) * 15 / 16 + 28px)" }}>16 Nov</span>
          </span>
        </div>
      </div>
    </div>
  </div>,

  <div className="scr dk" aria-hidden="true" key="agent-console">
    <div className="sb">
      <span className="ws">Orbital Ops</span>
      {navMini(opsNav("Agents"))}
      <span className="gl">Recent threads</span>
      {navMini(bare(["INC-418 rollback", "GPU pool costs", "Cert rotation scope"]))}
    </div>
    <div className="mn">
      {topBar("Search agents, threads, runs", "New run", "ML")}
      {titleBlock("Agent console", "18 online · 3 running · 1 waiting for approval")}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "minmax(0, .95fr) minmax(0, 1.6fr) minmax(0, .9fr)" }}>
        <div className="pn">
          <span className="pt">Agents<span className="su">18</span></span>
          {[["ops-agent", "#3a6bff"], ["rollout-pilot", "#3a6bff"], ["rebalancer", "#3a6bff"], ["cert-rotation", "#e8a33a"], ["indexer-doctor", "#e5372a"], ["cache-warm", "#52525b"]].map(([name, color]) => (
            <span className="li mo" key={name}><i className="d" style={{ color }} /><span>{name}</span></span>
          ))}
          <span className="su hm-auto">Show all 18</span>
        </div>
        <div className="pn hm-gap4">
          <span className="pt">INC-418 · rollback check</span>
          <span className="bub">search-indexer health checks have been timing out in ap-south-1 since the v4.18.0 deploy. Find out whether rolling back to v4.17.3 is safe.</span>
          <span className="su hm-wrap">ops-agent · reading the incident log and comparing configs</span>
          <span className="tool">
            <span><span className="hm-mint">✓</span><span>read_file logs/incident-418.log</span><span>4.1s</span></span>
            <span><span className="hm-mint">✓</span><span>diff_config v4.17.3..v4.18.0</span><span>11.2s</span></span>
            <span><span className="hm-run">●</span><span>replay staging · ap-south-1</span><span className="hm-run">running</span></span>
          </span>
          <span className="in hm-auto">Ask a follow-up<i className="snd" /></span>
        </div>
        <div className="pn">
          <span className="pt">Run details</span>
          <span className="su hm-run">Running · 3 of 5</span>
          <span className="tr hm-mb2"><i style={{ width: "60%" }} /></span>
          {lines([["Started", "09:12:40"], ["Duration", "5m 36s"], ["Model", "Balanced"], ["Scope", "prod:read"], ["Tokens", "192,260"], ["Cost", "$0.71"]])}
        </div>
      </div>
    </div>
  </div>,

  <div className="scr" aria-hidden="true" key="analytics">
    <div className="sb">
      <span className="ws">Tidewater Goods</span>
      {navMini([{ label: "Home" }, { label: "Orders", count: "38" }, { label: "Products" }, { label: "Customers" }, { label: "Analytics", on: true }, { label: "Campaigns" }])}
      <span className="gl">Saved reports</span>
      {navMini(bare(["Weekly trading", "Email attribution", "Returns by reason"]))}
    </div>
    <div className="mn">
      {topBar("Search products, orders, customers", "Share report", "SE")}
      {titleBlock("Storefront analytics", "19 Oct – 15 Nov 2026 · all channels")}
      {kpis([["Sessions", "412,380"], ["Conversion", "2.84%"], ["Orders", "11,712"], ["Revenue", "$1.01M"]])}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)" }}>
        <div className="pn">
          <span className="pt">Sessions<span className="su">Daily</span></span>
          <MiniPlot
            grid="M0 4.0H120 M0 18.8H120 M0 33.6H120"
            wire="M0.0 34.9 L4.5 34.5 L8.9 36.9 L13.3 38.1 L17.8 38.5 L22.2 36.9 L26.7 32.5 L31.1 35.2 L35.6 34.1 L40.0 35.6 L44.4 37.7 L48.9 38.8 L53.3 36.2 L57.8 31.1 L62.2 35.2 L66.7 34.3 L71.1 34.5 L75.5 36.8 L80.0 39.1 L84.5 35.9 L88.9 29.7 L93.3 34.6 L97.8 34.6 L102.2 33.8 L106.7 35.5 L111.1 21.4 L115.5 28.6 L120.0 28.5"
            dashed="M0.0 37.5 L4.5 39.2 L8.9 40.5 L13.3 39.3 L17.8 42.8 L22.2 41.1 L26.7 34.4 L31.1 39.0 L35.6 38.3 L40.0 39.3 L44.4 40.8 L48.9 41.1 L53.3 41.0 L57.8 35.4 L62.2 36.7 L66.7 39.3 L71.1 39.2 L75.5 39.0 L80.0 42.5 L84.5 39.8 L88.9 34.4 L93.3 38.2 L97.8 37.2 L102.2 39.4 L106.7 39.7 L111.1 40.5 L115.5 41.0 L120.0 33.9"
            base={48.4}
            cursor={111.1}
          />
          <span className="su ax"><span style={{ left: 0, transform: "none" }}>19 Oct</span><span style={{ left: "51.9%" }}>2 Nov</span><span style={{ right: 0, transform: "none" }}>15 Nov</span></span>
        </div>
        <div className="pn">
          <span className="pt">Traffic sources<span className="su">Sessions</span></span>
          {bars([
            ["Organic search", <b key="v">148,460</b>, "100%"],
            ["Direct", <b key="v">94,850</b>, "64%", "s"],
            ["Paid social", <b key="v">70,100</b>, "47%", "s"],
            ["Email", <b key="v">49,490</b>, "33%", "s"]
          ])}
        </div>
      </div>
    </div>
  </div>,

  <div className="scr" aria-hidden="true" key="settings">
    <div className="sb">
      <span className="ws">Orbital Ops</span>
      {navMini(opsNav())}
      <span className="ni on hm-auto">Settings</span>
    </div>
    <div className="mn">
      {topBar("Search settings, members, keys", "Invite people", "ML")}
      {titleBlock("Settings", "Orbital Ops workspace · changes here apply to all 6 members")}
      <div className="rw hm-grow" style={{ gridTemplateColumns: "22% minmax(0, 1fr)" }}>
        <div className="hm-subnav">
          {navMini([
            { label: "General", on: true, bare: true },
            { label: "Members", count: "6", bare: true },
            { label: "Billing", bare: true },
            { label: "API keys", count: "4", bare: true },
            { label: "Notifications", bare: true },
            { label: "Security", bare: true },
            { label: "Danger zone", bare: true, style: { marginTop: 4, color: "#b8261a" } }
          ])}
        </div>
        <div className="pn hm-profile">
          <span className="pt">Workspace profile</span>
          <span className="su hm-mt-2">Shown to members, on invites and in the CLI.</span>
          <div className="rw hm-fields">
            {field("Workspace name", "Orbital Ops", true)}
            {field("URL slug", <><span className="mo hm-dim">app/</span><span className="mo">orbital-ops</span></>)}
            {field("Default region", <><span className="mo">eu-west-1</span><span className="hm-dim">Ireland</span></>)}
            {field("Time zone", "Europe/Stockholm")}
          </div>
          <span className="hm-tf hm-mt2">
            <span className="su hm-tf__label">Workspace mark</span>
            <span className="hm-mark"><i className="mk" /><span className="gb">Upload</span><span className="su hm-ink">Remove</span></span>
          </span>
          <span className="hm-savebar"><span className="su hm-grow">Last changed by Priya Raman on 3 Nov</span><span className="su hm-ink">Discard</span><span className="sv">Save changes</span></span>
        </div>
      </div>
    </div>
  </div>
];

const templateCopy = [
  "Workspace overview with KPIs, usage, approvals and on-call.",
  "Incident response in Ink: traffic, error budget and agent runs.",
  "Balances, cash flow, payment approvals and budgets by team.",
  "Multi-agent chat with tool calls, plans, diffs and run details.",
  "Sessions, conversion funnel, sources and cohort retention.",
  "Workspace profile, members, billing, API keys and danger zone."
];

/* ---------------------------------------------------------------- developers, footer */

const points = [
  { title: "Accessible by default", body: <>Radix behaviour, visible focus, forced colors and reduced motion.</> },
  { title: "Ink and Satin at runtime", body: <>Switch themes with <span className="mono hm-code-inline">useChrome()</span>; system, full or reduced motion.</> },
  { title: "Plain CSS you can override", body: <>Cascade layers and tokens. No Tailwind, no runtime CSS-in-JS.</> }
];

type FootLink = { label: string; to?: string; href?: string; all?: boolean };
const footNav: { label: string; links: FootLink[] }[] = [
  {
    label: "Components",
    links: [
      { label: "Button", to: "/components/button" },
      { label: "Date Picker", to: "/components/date-picker" },
      { label: "Command Palette", to: "/components/command-palette" },
      { label: "Select", to: "/components/select" },
      { label: "Table", to: "/components/table" },
      { label: "View all 54", to: "/components/base", all: true }
    ]
  },
  {
    label: "Charts",
    links: [
      ...[["Area", "area"], ["Gauge", "gauge"], ["Funnel", "funnel"], ["Heatmap", "heatmap"], ["Radial Rings", "radial-rings"]].map(([label, slug]) => ({ label: label!, to: `/components/charts#${slug}` })),
      { label: "View all 12", to: "/components/charts", all: true }
    ]
  },
  {
    label: "Blocks",
    links: [
      ...[["Sidebar", "sidebar"], ["Agent Run", "agent-run"], ["Data Grid", "data-grid"], ["Composer", "composer"], ["Auth Panel", "auth-panel"]].map(([label, slug]) => ({ label: label!, to: `/components/blocks#${slug}` })),
      { label: "View all 12", to: "/components/blocks", all: true }
    ]
  },
  { label: "Templates", links: templates.map((t) => ({ label: t.title, to: t.route })) },
  {
    label: "Resources",
    links: [
      { label: "Getting started", to: "/components" },
      { label: "Installation", to: INSTALL_DOC },
      { label: "Theming", to: "/foundations" },
      { label: "Accessibility", to: "/components/button#accessibility" },
      { label: "Changelog", href: `${GITHUB_URL}/releases` },
      { label: "GitHub", href: GITHUB_URL }
    ]
  }
];

function FootAnchor({ link }: { link: FootLink }) {
  const body = (
    <>
      {link.label}
      {link.all ? <Icon name="arrow-right" size={14} /> : null}
    </>
  );
  const className = link.all ? "va" : undefined;
  return link.href ? <a className={className} href={link.href}>{body}</a> : <Link className={className} to={link.to!}>{body}</Link>;
}

function Brand({ size }: { size: number }) {
  return (
    <Link to="/" aria-label="Chrome UI home" className="hm-brand">
      <Logo />
      <span className="disp hm-word" style={{ fontSize: size }}>CHROME</span>
    </Link>
  );
}

/* ---------------------------------------------------------------- page */

export default function Home() {
  const [themePref, chooseTheme] = useDocsTheme();
  const [installCopy, copyInstall] = useCopy();
  const [codeCopy, copyCode] = useCopy();
  const codeRef = useRef<HTMLPreElement>(null);
  const ink = themePref === "ink";

  return (
    <div className="pg-home">
      <a className="hm-banner" href={`${GITHUB_URL}/releases`}>
        <Badge tone="new">1.0</Badge>
        <span>Chrome UI 1.0 is out, with the Satin theme and five chrome finishes.</span>
        <span className="hm-banner__cta">Release notes <Icon name="arrow-right" size={14} /></span>
      </a>

      <header className="container hm-header">
        <Brand size={17} />
        <nav className="hide-sm hm-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <Button key={item.label} asChild finish="ghost" size="sm"><Link to={item.to}>{item.label}</Link></Button>
          ))}
        </nav>
        <div className="hm-grow" />
        <div className="hm-row8">
          <Button asChild finish="ghost" size="sm" className="hide-sm"><a href={GITHUB_URL}>GitHub</a></Button>
          <IconButton
            finish="ghost"
            size="sm"
            aria-label={ink ? "Use the Satin theme in the docs" : "Use the Ink theme in the docs"}
            title={ink ? "Docs open in Ink · switch to Satin" : "Switch the docs to Ink"}
            onClick={() => chooseTheme(ink ? "satin" : "ink")}
          >
            <Icon name={ink ? "sun" : "moon"} />
          </IconButton>
          <Button asChild finish="smoked" size="sm"><Link to={INSTALL_DOC}>Get started</Link></Button>
        </div>
      </header>

      <main id="main">
        <section className="hm-hero">
          <div className="container hm-hero__inner">
            <h1 className="h1 hm-hero__title">React components<span className="pk">,</span> finished in chrome<span className="pk">.</span></h1>
            <p className="lead hm-hero__lead">54 accessible components, 12 blocks, 12 charts and 6 templates in Ink and Satin. Open source under MIT.</p>
            <div className="hm-hero__ctas">
              <Button asChild finish="polished" size="xl"><Link to="/components">Browse components</Link></Button>
              <Button asChild finish="graphite" size="xl"><Link to="/templates/dashboard">View templates</Link></Button>
            </div>
            <TextField
              className="hm-install"
              readOnly
              value={INSTALL_CMD}
              aria-label="Install command"
              onFocus={(event) => event.currentTarget.select()}
              leading={<span aria-hidden="true">$</span>}
              trailing={
                <>
                  <span className="hm-install__state" role="status">
                    {installCopy === "copied" ? "Copied" : installCopy === "failed" ? "Select and copy" : ""}
                  </span>
                  <IconButton
                    finish="ghost"
                    size="sm"
                    aria-label={installCopy === "copied" ? "Install command copied" : "Copy install command"}
                    onClick={() => copyInstall(INSTALL_CMD)}
                  >
                    {installCopy === "copied" ? glyph(CHECK) : <Icon name="copy" />}
                  </IconButton>
                </>
              }
            />
          </div>
        </section>

        <svg width="0" height="0" className="hm-defs" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="hm-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7F9CFF" stopOpacity=".42" />
              <stop offset=".6" stopColor="#ABC9C4" stopOpacity=".16" />
              <stop offset="1" stopColor="#ABC9C4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <section aria-label="Live components">
          <div className="container">
            <div className="bento hm-bento">
              <AgentTile />
              <DeploymentsTile />
              <ReleaseTile />
              <PaletteTile />
              <ThroughputTile />
              <PolicyTile />
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="blocks-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Blocks</span>
              <h2 id="blocks-h" className="h2 hm-h2">Every surface a product needs<span className="pk">,</span> ready to drop in<span className="pk">.</span></h2>
              <p className="lead">Agent runs, data grids, sign-in, uploads and more. Import a block and it inherits your theme, tokens and motion settings.</p>
              <div className="acts">
                <Button asChild finish="smoked" size="lg"><Link to="/components/blocks">Browse 12 blocks</Link></Button>
                <Button asChild finish="graphite" size="lg"><Link to="/components/base">All 54 components</Link></Button>
              </div>
            </div>
            <div className="hm-grid360">
              {blockCards.map((card) => (
                <Link className="card hm-tile" key={card.slug} to={`/components/blocks#${card.slug}`}>
                  <div className={`stage dots ${card.stageClass}`} aria-hidden="true">{card.stage}</div>
                  <div className="meta"><h3 className="h3">{card.title}</h3><p>{card.blurb}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="finish-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Material</span>
              <h2 id="finish-h" className="h2 hm-h2">One chrome build<span className="pk">.</span><br />Five finishes<span className="pk">.</span></h2>
              <p className="lead">A gradient-stroked frame, a bezel ring, a satin inner pill and a tinted glow. Swap the palette and the rules stay the same.</p>
              <div className="acts">
                <Button asChild finish="graphite" size="lg"><Link to="/foundations/buttons">See how a chrome button is built</Link></Button>
              </div>
            </div>
            <div className="hm-finishes">
              {finishes.map((item) => (
                <div className="hm-finish" key={item.name}>
                  <Button asChild finish={item.finish} size="xl" className={item.tint ? `slab ${item.tint}` : "slab"}>
                    <span aria-hidden="true" />
                  </Button>
                  <div className="hm-finish__name"><span className="h3">{item.name}</span><span className="mono t3">{item.note}</span></div>
                  <span className="small t2">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="tpl-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Templates</span>
              <h2 id="tpl-h" className="h2 hm-h2">Six complete screens to start from<span className="pk">.</span></h2>
              <p className="lead">Real layouts with real states, built only from library parts. Copy one into your app and replace the data.</p>
            </div>
            <div className="hm-grid360">
              {templates.map((template, i) => (
                <Link className="card hm-tile" key={template.slug} to={template.route}>
                  {thumbs[i]}
                  <div className="meta"><h3 className="h3">{template.title}</h3><p>{templateCopy[i]}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="dx-h">
          <div className="container hm-dx">
            <div className="hm-dx__copy">
              <span className="eyebrow">Developers</span>
              <h2 id="dx-h" className="h2 hm-dx__title">
                <span>One import<span className="pk">.</span></span>
                <span>One provider<span className="pk">.</span></span>
                <span>Every surface themed<span className="pk">.</span></span>
              </h2>
              <ol className="hm-points">
                {points.map((point, i) => (
                  <li key={point.title}>
                    <span className="mono t3">{String(i + 1).padStart(2, "0")}</span>
                    <div className="hm-stack4"><span className="h3">{point.title}</span><span className="t2 hm-14">{point.body}</span></div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="chrome-root hm-codecard" data-chrome-theme="ink">
              <div className="hm-codecard__head">
                <span className="mono t3">app.tsx</span>
                <span className="hm-row8">
                  <span className="hm-code-state" role="status">{codeCopy === "failed" ? "Select the code to copy it" : ""}</span>
                  <Button finish="ghost" size="sm" onClick={() => copyCode(codeRef.current?.textContent ?? "")}>
                    {codeCopy === "copied" ? "Copied" : "Copy"}
                  </Button>
                </span>
              </div>
              <pre className="code hm-code" ref={codeRef} tabIndex={0} aria-label="app.tsx">
                <span className="k">import</span> {"{ Button, ChromeProvider } "}<span className="k">from</span> <span className="s">"@loreanai/chrome-ui"</span>;{"\n"}
                <span className="k">import</span> <span className="s">"@loreanai/chrome-ui/styles.css"</span>;{"\n\n"}
                <span className="k">export function</span> App() {"{\n  "}
                <span className="k">return</span> {"(\n    "}
                <span className="t">&lt;ChromeProvider</span> <span className="a">defaultTheme</span>=<span className="s">"satin"</span> <span className="a">motion</span>=<span className="s">"system"</span><span className="t">&gt;</span>{"\n      "}
                <span className="t">&lt;Button</span> <span className="a">finish</span>=<span className="s">"polished"</span><span className="t">&gt;</span>Create project<span className="t">&lt;/Button&gt;</span>{"\n    "}
                <span className="t">&lt;/ChromeProvider&gt;</span>{"\n  );\n}"}
              </pre>
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="ink-h">
          <div className="container">
            <div className="ink-band chrome-root" data-chrome-theme="ink">
              <div className="hm-band__copy">
                <span className="eyebrow">Ink theme</span>
                <h2 id="ink-h" className="hm-band__title">Same parts<span className="pk">.</span> After dark<span className="pk">.</span></h2>
                <p className="lead hm-band__lead">Every component ships in Ink and Satin. One provider switches the whole tree, chrome included.</p>
                <div className="hm-band__ctas">
                  <Button asChild finish="polished" size="lg"><Link to={INSTALL_DOC}>Get started</Link></Button>
                  <Button asChild finish="smoked" size="lg"><a href={GITHUB_URL}>Star on GitHub</a></Button>
                </div>
              </div>
              <img src={ribbon} alt="" />
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="container">
          <div className="hm-foot__grid">
            <div className="hm-foot__brand">
              <Brand size={16} />
              <span className="small t3">Satin chrome components for serious product interfaces.</span>
            </div>
            {footNav.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <span className="eyebrow">{group.label}</span>
                {group.links.map((link) => <FootAnchor key={link.label} link={link} />)}
              </nav>
            ))}
          </div>
          <div className="hm-foot__base">
            <span className="small t3">MIT License · @loreanai/chrome-ui</span>
            <SegmentedControl
              aria-label="Docs theme"
              value={themePref}
              onValueChange={(value) => chooseTheme(value as ThemePref)}
              items={[{ value: "ink", label: "Ink" }, { value: "satin", label: "Satin" }, { value: "system", label: "System" }]}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
