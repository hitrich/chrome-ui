import {
  AreaChart,
  Badge,
  Button,
  EmptyState,
  ChartLegend,
  ChartWell,
  CommandPalette,
  Gauge,
  Heatmap,
  HeatmapLegend,
  IconButton,
  KeyHint,
  SearchField,
  SegmentedControl,
  StatusIndicator,
  Table,
  type ButtonFinish,
  type CommandPaletteGroup
} from "@loreanai/chrome-ui";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { DocsShell } from "../components/DocsShell";
import { baseComponents, blocks, charts } from "../data";
import { BaseTile, Blurb, useSlashFocus } from "./BaseCatalog";
import { baseDemos } from "./base/demos";
import { SidebarBlock } from "./blocks/Blocks";
import "./BaseCatalog.css";
import "./ComponentsOverview.css";

const INSTALL = "npm i @loreanai/chrome-ui";

const sections = [
  { value: "all", label: "All" },
  { value: "foundations", label: "Foundations" },
  { value: "base", label: "Base" },
  { value: "blocks", label: "Blocks" },
  { value: "charts", label: "Charts" }
];

function Arrow() {
  return (
    <svg className="i s14" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );
}

/** Same card as the Base catalog; `wide` is the Blocks/Charts tile (220px stage, category on the title row). */
function Tile({ to, name, badge, cat, blurb, wide, children, legend }: {
  to: string;
  name: string;
  badge?: ReactNode;
  cat?: string;
  blurb: string;
  wide?: boolean;
  /** the preview stage */
  children: ReactNode;
  legend?: ReactNode;
}) {
  return (
    <article className={wide ? "card tile co-wide" : "card tile"}>
      {children}
      <div className="meta">
        <h3 className="h3">
          <Link to={to}>{name}</Link>
          {badge}
          {cat ? <span className="co-cat">{cat}</span> : null}
        </h3>
        <Blurb text={blurb} />
        {legend}
      </div>
    </article>
  );
}

function Section({ id, title, count, sub, more, children }: { id: string; title: string; count?: number; sub?: string; more?: { to: string; label: string }; children: ReactNode }) {
  return (
    <section aria-labelledby={`h-${id}`} id={id}>
      <div className="pb-sec">
        <h2 className="pb-sh" id={`h-${id}`}>
          {title} {count != null ? <span className="num t3">{count}</span> : null}
        </h2>
        {more ? <Link className="co-va" to={more.to}>{more.label}<Arrow /></Link> : <span className="small t3">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

/* ---------- Foundations stages ---------- */

const swatches = [
  { label: "Ink", fill: "linear-gradient(180deg, #050506 0 25%, #0c0c0e 25% 50%, #161618 50% 75%, #232326 75%)" },
  { label: "Satin", fill: "linear-gradient(180deg, #f4f5f5 0 25%, #e8e9e9 25% 50%, #e1e2e2 50% 75%, #d3d6d6 75%)" },
  { label: "Chrome", fill: "linear-gradient(180deg, #c9c9c9, #686a69 50%, #abc9c4)" },
  { label: "Cobalt", fill: "linear-gradient(180deg, #c7d3ff 0 33%, #1f55ff 33% 66%, #1447e6 66%)" },
  { label: "Enamel", fill: "linear-gradient(180deg, #ff8a80 0 33%, #e5372a 33% 66%, #b8261a 66%)" }
];

const finishes: [ButtonFinish, string][] = [
  ["polished", "Deploy"], ["smoked", "Review"], ["cobalt", "Approve"], ["enamel", "Delete"], ["graphite", "Cancel"], ["ghost", "Skip"]
];

function MotionCurve() {
  const id = useId().replace(/:/g, "");
  const d = "M0 112 C35.2 22.4 35.2 0 176 0";
  return (
    <svg viewBox="0 0 176 112" width="160" height="102" aria-hidden="true" className="co-curve">
      <defs>
        <radialGradient id={`${id}b`} cx=".36" cy=".3" r=".78"><stop offset="0" stopColor="#fff" /><stop offset=".22" stopColor="#eef0f0" /><stop offset=".55" stopColor="#9aa0a2" /><stop offset=".85" stopColor="#3e4244" /><stop offset="1" stopColor="#25282a" /></radialGradient>
        <filter id={`${id}f`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <path d="M0 112.5H176M0 .5H176" className="co-curve__rule" />
      <path d="M0 112 L35.2 22.4 M176 0 L35.2 0" className="co-curve__handle" strokeDasharray="2 2" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#0b2687" strokeOpacity=".28" strokeWidth="7" filter={`url(#${id}f)`} transform="translate(0 3)" />
        <path d={d} stroke="#0d2a8a" strokeWidth="4.4" />
        <path d={d} stroke="#2f5fff" strokeWidth="3" />
        <path d={d} stroke="#c3d1ff" strokeWidth="1" transform="translate(0 -.7)" />
      </g>
      <circle cx="35.2" cy="22.4" r="3" className="co-curve__knot" strokeWidth="1.25" />
      <circle cx="35.2" cy="0" r="3" className="co-curve__knot" strokeWidth="1.25" />
      <circle cx="0" cy="112" r="4.5" fill={`url(#${id}b)`} stroke="#25282a" strokeWidth=".6" />
      <circle cx="176" cy="0" r="4.5" fill={`url(#${id}b)`} stroke="#25282a" strokeWidth=".6" />
    </svg>
  );
}

/* ---------- Charts (props from the Charts artboard) ---------- */

const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];
const mon16 = [12000, 9000, 8000, 10000, 18000, 27000, 31000, 33000, 35000, 38200, 34000, 26000, 20000];
const mon9 = [11000, 9000, 8000, 9000, 15000, 23000, 26000, 28000, 30000, 29000, 27000, 22000, 17000];
// Deploys by weekday (rows, Mon first) and hour: busy 09–18 on weekdays, quiet at night and weekends (the artboard's generator).
const deploys = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const busy = h >= 9 && h <= 18 ? 1 : h >= 7 && h <= 21 ? 0.45 : 0.08;
    const n = Math.sin((d * 24 + h) * 12.9898) * 43758.5453;
    return Math.round(busy * (d < 5 ? 1 : 0.25) * (0.55 + 0.6 * (n - Math.floor(n))) * 1000) / 1000;
  })
);

/* ---------- Blocks: the Sidebar is the Blocks catalog's own (it drops its main pane on a narrow stage); the Command
   Bar and Data Grid there are full-size compositions, so this row draws the artboard's compact cuts of them. ---------- */

const glyph = (d: string) => <svg className="i s14" viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
const commandGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "deploy", label: "Deploy billing-worker", icon: glyph("M12 16V4M7 9l5-5 5 5M4 20h16"), shortcut: ["⌘", "↵"] },
      { id: "rollback", label: "Roll back billing-worker", icon: glyph("M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7") }
    ]
  },
  { label: "Services", items: [{ id: "billing-worker", label: "billing-worker", icon: <StatusIndicator tone="ok" />, mono: true, meta: "us-east-2" }] }
];

const gridRows = [
  { service: "search-indexer", tone: "bad", status: "Failed", p95: "380\u00a0ms" },
  { service: "edge-renderer", tone: "info", status: "Rolling", p95: "112\u00a0ms" },
  { service: "billing-worker", tone: "ok", status: "Live", p95: "64\u00a0ms" },
  { service: "api-gateway", tone: "ok", status: "Live", p95: "42\u00a0ms" }
] as const;

function MiniGrid() {
  return (
    <div className="co-pnl co-grid">
      <Table density="compact" aria-label="Services">
        <thead><tr><th scope="col">Service</th><th scope="col">Status</th><th scope="col" className="r">p95</th></tr></thead>
        <tbody>
          {gridRows.map((r) => (
            <tr key={r.service} data-selected={r.service === "search-indexer" || undefined}>
              <td className="mono">{r.service}</td>
              <td><StatusIndicator tone={r.tone} label={r.status} /></td>
              <td className="r num">{r.p95}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="co-grid__foot"><span>1 selected</span><span className="num">1–4 of 214</span></div>
    </div>
  );
}

const baseRow = ["button", "select", "date-picker", "switch", "slider", "text-field", "tabs", "status-indicator", "command-palette", "dialog", "toast", "table"];

function InstallCommand() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };
  return (
    <div className="co-install mono">
      <code><span className="t3">$ </span>{INSTALL}</code>
      {state === "idle" ? null : <span className="co-install__state" aria-hidden="true">{state === "copied" ? "Copied" : "Copy failed"}</span>}
      <IconButton finish="ghost" size="sm" aria-label={state === "copied" ? "Install command copied" : "Copy install command"} onClick={copy}>
        {state === "copied" ? (
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
        ) : (
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
        )}
      </IconButton>
      <span className="chrome-visually-hidden" role="status">{state === "copied" ? "Copied to the clipboard" : state === "failed" ? "Could not copy" : ""}</span>
    </div>
  );
}

export default function Page() {
  const [show, setShow] = useState("all");
  const [query, setQuery] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useSlashFocus(field);

  const needle = query.trim().toLowerCase();
  const match = (name: string) => name.toLowerCase().includes(needle);
  const on = (id: string) => show === "all" || show === id;

  const foundationCards = [
    {
      name: "Color", to: "/foundations#color", blurb: "Ink and Satin neutrals, chrome stops and signal colors.", stage: "pv co-color",
      body: swatches.map((s) => <span key={s.label} className="co-sp"><span style={{ background: s.fill }} />{s.label}</span>)
    },
    {
      name: "Typography", to: "/foundations#typography", blurb: "Oxanium wordmark, Plus Jakarta Sans interface, JetBrains Mono data.", stage: "pv co-type",
      body: (
        <div className="co-type__stack">
          <span className="disp co-type__mark">CHROME</span>
          <span className="co-type__title">Rollout policy</span>
          <span className="num co-type__num">31.6k&nbsp;<span className="co-type__unit t3">req / min</span></span>
          <span className="mono co-xs t2">v4.18.0 · eu-west-1</span>
        </div>
      )
    },
    {
      name: "Finishes", to: "/foundations/buttons", blurb: "Polished, smoked, cobalt, enamel, graphite and ghost.", stage: "pv", isNew: true,
      body: <div className="co-fin">{finishes.map(([finish, label]) => <Button key={finish} finish={finish} size="sm">{label}</Button>)}</div>
    },
    {
      name: "Motion", to: "/foundations", blurb: "Press, reflection glide and overlays, reduced-motion aware.", stage: "pv co-motion",
      body: <><MotionCurve /><span className="mono co-xs t2">cubic-bezier(.2, .8, .2, 1)</span></>
    }
  ].filter((c) => match(c.name));

  const baseCards = baseRow.map((slug) => baseComponents.find((e) => e.slug === slug)!).filter((e) => match(e.name));
  const block = (slug: string) => blocks.find((e) => e.slug === slug)!;
  const blockCards = [
    { entry: block("sidebar"), stage: "pv co-blk co-blk--sidebar", body: <SidebarBlock /> },
    { entry: block("command-bar"), stage: "pv co-blk", body: <CommandPalette inline defaultQuery="deploy bill" groups={commandGroups} label="Command bar preview" className="co-cmd" /> },
    { entry: block("data-grid"), stage: "pv co-blk", body: <MiniGrid /> }
  ].filter((c) => match(c.entry.name));
  const chart = (slug: string) => charts.find((e) => e.slug === slug)!;
  const chartCards = [
    {
      entry: chart("area"),
      legend: <ChartLegend items={[{ label: "Mon 16 Nov", kind: "line", finish: "cobalt" }, { label: "Mon 9 Nov", kind: "line", finish: "dashed" }]} />,
      body: (
        <AreaChart
          aria-label="Area chart of requests per hour. Monday 16 November peaks at 38.2k at 18:00, about 9k above Monday 9 November at the same hour."
          caption="Requests / hour"
          labels={hours}
          xTicks={[0, 3, 6, 9, 12]}
          yTicks={[0, 20000, 40000]}
          series={[{ label: "Mon 16 Nov", data: mon16 }, { label: "Mon 9 Nov", data: mon9, finish: "dashed" }]}
          highlight={{ index: 9, label: "38.2k" }}
          dataTable
        />
      )
    },
    {
      entry: chart("gauge"),
      legend: <ChartLegend items={[{ label: "Remaining", kind: "gauge", finish: "cobalt" }, { label: "Page at 25%", kind: "tick" }]} />,
      body: <Gauge aria-label="Gauge: 72 percent of the error budget remains. On-call is paged below 25 percent." value={72} label="error budget left" threshold={{ value: 25, label: "25%" }} />
    },
    {
      entry: chart("heatmap"),
      legend: <HeatmapLegend />,
      body: (
        <Heatmap
          aria-label="Heatmap of deploys by hour and weekday. Most deploys land between 09:00 and 18:00 on weekdays; nights and weekends are quiet."
          caption="Deploys by hour, UTC"
          values={deploys}
          thresholds={[0.12, 0.3, 0.55, 0.8]}
          rowLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          columnLabels={["00:00", "06:00", "12:00", "18:00"]}
        />
      )
    }
  ].filter((c) => match(c.entry.name));

  const shown = [on("foundations") && foundationCards.length, on("base") && baseCards.length, on("blocks") && blockCards.length, on("charts") && chartCards.length]
    .reduce<number>((sum, n) => sum + (n || 0), 0);

  return (
    <DocsShell className="pg-components">
      <header className="pb-hd">
        <h1 className="h1">Components</h1>
        <p className="lead co-lead">54 base components, 12 blocks and 12 charts. Every part reads the same tokens, so a sidebar, a chart and a dialog look machined from the same stock.</p>
        <InstallCommand />
      </header>

      <div className="pb-filters">
        <div className="pb-scroll">
          <SegmentedControl aria-label="Show section" items={sections} value={show} onValueChange={setShow} />
        </div>
        <SearchField
          ref={field}
          className="pb-filter"
          aria-label="Filter components by name"
          placeholder="Filter by name"
          value={query}
          onValueChange={setQuery}
          shortcut={<KeyHint keys={["/"]} />}
        />
      </div>

      {on("foundations") && foundationCards.length ? (
        <Section id="foundations" title="Foundations" sub="The tokens every part is built on">
          <div className="pb-grid">
            {foundationCards.map((c) => (
              <Tile key={c.name} to={c.to} name={c.name} blurb={c.blurb} badge={c.isNew ? <Badge tone="new">New</Badge> : null}>
                <div className={c.stage}><div className="co-stage">{c.body}</div></div>
              </Tile>
            ))}
          </div>
        </Section>
      ) : null}

      {on("base") && baseCards.length ? (
        <Section id="base" title="Base" count={54} more={{ to: "/components/base", label: "View all 54" }}>
          <div className="pb-grid">
            {baseCards.map((entry) => <BaseTile key={entry.slug} entry={entry} demo={baseDemos[entry.slug]} />)}
          </div>
        </Section>
      ) : null}

      {on("blocks") && blockCards.length ? (
        <Section id="blocks" title="Blocks" count={12} more={{ to: "/components/blocks", label: "View all 12" }}>
          <div className="pb-grid co-grid-wide">
            {blockCards.map((c) => (
              <Tile key={c.entry.slug} wide to={`/components/blocks#${c.entry.slug}`} name={c.entry.name} cat={c.entry.category} blurb={c.entry.blurb}>
                <div className={c.stage}><div className="co-stage">{c.body}</div></div>
              </Tile>
            ))}
          </div>
        </Section>
      ) : null}

      {on("charts") && chartCards.length ? (
        <Section id="charts" title="Charts" count={12} more={{ to: "/components/charts", label: "View all 12" }}>
          <div className="pb-grid co-grid-wide">
            {chartCards.map((c) => (
              <Tile key={c.entry.slug} wide to={`/components/charts#${c.entry.slug}`} name={c.entry.name} cat={c.entry.category} blurb={c.entry.blurb} legend={c.legend}>
                <ChartWell className="pv co-chart">{c.body}</ChartWell>
              </Tile>
            ))}
          </div>
        </Section>
      ) : null}

      {shown ? null : (
        <EmptyState
          className="pb-empty"
          title="No components match"
          description={`Nothing here is called “${query.trim()}”.`}
          action={<Button size="sm" onClick={() => { setShow("all"); setQuery(""); field.current?.focus(); }}>Clear filters</Button>}
        />
      )}
    </DocsShell>
  );
}
