// Home dashboard template (Orbital Ops, Satin) — work/canvas/project/Dashboard.dc.html
import {
  AreaChart,
  Avatar,
  Badge,
  Button,
  ChartLegend,
  ChartTooltipRow,
  ChartWell,
  Chip,
  KeyHint,
  Popover,
  SegmentedControl,
  StatusIndicator,
  Table,
  formatCompact,
  type StatusIndicatorProps
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Confirm, Kpis, Notifications, PageHead, Split, Track, type Kpi } from "./d1-shared";
import "./Dashboard.css";

type Tone = StatusIndicatorProps["tone"];
const bad = { color: "var(--chrome-enamel-text)" };
const v = (text: string, style?: object) => <span className="t3 mono" style={{ fontSize: 11.5, ...style }}>{text}</span>;
const online = <StatusIndicator tone="success" pulse />;

/* ---- data (every number from the artboard) ---- */
const kpis: Kpi[] = [
  { label: "Billable usage", value: "$380.9k", delta: "+13.8%", tone: "up", focus: true, spark: [26.6, 15.7, 13, 11.3, 10.3, 13.6, 23.3, 25, 9.8, 7.1, 6.3, 4.6, 8.6, 20.1, 21.8], note: "vs $334.7k in 1–15 Oct" },
  { label: "Requests served", value: "682.6M", delta: "+9.6%", tone: "up", spark: [24, 15, 14, 12, 11, 13, 22, 24, 11, 9, 8, 6, 9, 19, 20], note: "31.6k per minute on average" },
  { label: "Agent runs", value: "4,812", delta: "+31.0%", tone: "up", spark: [27, 25, 24, 22, 23, 20, 21, 18, 16, 17, 13, 11, 12, 8, 6], note: "97.8% succeeded · 106 failed" },
  { label: "Error budget left", value: "72%", delta: "−19 pts in 7 days", tone: "am", spark: [4.8, 5.6, 6.4, 7.1, 7.9, 9.5, 10.3, 11.1, 13.4, 15, 17.4, 19.7, 22.1, 23.6, 26], note: "Burn 0.8× · resets 1 Dec" }
];

const nov = Array.from({ length: 15 }, (_, i) => `${i + 1} Nov`);
const usage = [19.6, 24.8, 26.1, 26.9, 27.4, 25.8, 21.2, 20.4, 27.6, 28.9, 29.3, 30.1, 28.2, 22.7, 21.9].map((x) => x * 1000);
const usageOct = [22.4, 21.6, 17.9, 17.2, 22.9, 23.6, 24.1, 24.4, 23.1, 18.8, 18.1, 24, 25.2, 25.5, 25.9].map((x) => x * 1000);
const money = (x: number) => (x === 0 ? "$0" : `$${formatCompact(x)}`);

interface Attention { tone: Tone; title: ReactNode; full?: string; to: string; age: string; kind: "incident" | "approval"; tag: ReactNode; meta: ReactNode }
const person = (name: string, grow?: boolean) => (
  <>
    <Avatar name={name} size="sm" aria-hidden="true" />
    <span className="d1-trunc" style={grow ? { flex: 1 } : undefined}>{name}</span>
  </>
);
const review = (
  <Confirm
    trigger={<Button size="sm" className="db-review">Review</Button>}
    title="Deploy auth-service to eu-central-1"
    description="Priya Raman asks to deploy auth-service v4.18.0 to eu-central-1, the last region still on v4.17.3."
    confirm="Approve deploy"
  />
);
const attention: Attention[] = [
  { tone: "bad", title: "search-indexer health checks failing", to: "/templates/control-room", age: "14m", kind: "incident", tag: <Badge tone="bad">SEV-1</Badge>, meta: <><span className="d1-mono12">INC-418</span><span aria-hidden="true">·</span>{person("Mara Lindqvist")}</> },
  { tone: "warn", title: <>Elevated <span className="pg-nocalt">5xx</span> on checkout in ap-south-1</>, to: "/templates/control-room", age: "52m", kind: "incident", tag: <Badge>SEV-2</Badge>, meta: <><span className="d1-mono12">INC-417</span><span aria-hidden="true">·</span>{person("Rafael Achebe")}</> },
  { tone: "info", title: "edge-renderer TLS cert expires 25 Nov", to: "/templates/control-room", age: "1d", kind: "incident", tag: <Badge>SEV-3</Badge>, meta: <><span className="d1-mono12">INC-415</span><span aria-hidden="true">·</span><span className="d1-mono12">ops-agent</span></> },
  { tone: "off", title: "Deploy auth-service to eu-central-1", to: "/templates/control-room", age: "1h 20m", kind: "approval", tag: <Badge>Approval</Badge>, meta: <>{person("Priya Raman", true)}{review}</> },
  { tone: "off", title: "cert-rotation requests write access to auth-service secrets in all regions", full: "cert-rotation requests write access to auth-service secrets in all regions", to: "/templates/agent-console", age: "3h", kind: "approval", tag: <Badge>Approval</Badge>, meta: <span className="d1-mono12">ops-agent</span> },
  { tone: "off", title: "Raise GPU pool budget to $42k a month", to: "/templates/agent-console", age: "1d", kind: "approval", tag: <Badge>Approval</Badge>, meta: <><span className="num">from $36k</span><span aria-hidden="true">·</span>{person("Tomás Ilić")}</> }
];

interface Run { tone: Tone; state: string; age: string; name: string; desc: ReactNode; value: number; finish?: "co" | "en"; foot: string }
const runs: Run[] = [
  { tone: "info", state: "Running", age: "18m", name: "nightly-rebalance", desc: <>412 of 572 shards moved in <span className="d1-nw">eu-west-1</span></>, value: 72, foot: "72% · about 7 min left" },
  { tone: "info", state: "Running", age: "6m", name: "INC-418 rollback check", desc: "Step 3 of 5 · replaying traffic on staging", value: 60, foot: "60% · ops-agent" },
  { tone: "info", state: "Running", age: "9m", name: "edge-renderer rollout", desc: "v4.18.0 · 3 of 5 regions healthy", value: 62, foot: "62% of traffic · rollout-pilot" },
  { tone: "warn", state: "Queued", age: "3h", name: "cert-rotation", desc: "Waiting for secrets write approval", value: 0, foot: "Starts when approved" },
  { tone: "bad", state: "Failed", age: "38m", name: "search-indexer reindex", desc: <>Timed out after 600s in <span className="d1-nw">ap-south-1</span></>, value: 40, finish: "en", foot: "Stopped at 40%" }
];

interface Deploy { service: string; version: string; region: string; regions?: boolean; tone: Tone; status: ReactNode; by: string; agent?: boolean; duration: string; started: string }
const deploys: Deploy[] = [
  { service: "edge-renderer", version: "v4.18.0", region: "3 of 5 regions", regions: true, tone: "info", status: <>Rolling<span className="t3 num" style={{ marginLeft: 8 }}>62%</span></>, by: "rollout-pilot", agent: true, duration: "9m 20s", started: "09:09" },
  { service: "api-gateway", version: "v4.18.0", region: "eu-west-1", tone: "ok", status: "Live", by: "Priya Raman", duration: "41s", started: "09:06" },
  { service: "search-indexer", version: "v4.18.0", region: "ap-south-1", tone: "bad", status: "Failed", by: "Rafael Achebe", duration: "3m 12s", started: "08:40" },
  { service: "auth-service", version: "v4.18.0", region: "eu-central-1", tone: "warn", status: "Needs approval", by: "Priya Raman", duration: "—", started: "07:58" },
  { service: "cache-warm", version: "v2.6.1", region: "All regions", regions: true, tone: "ok", status: "Live", by: "ops-agent", agent: true, duration: "22s", started: "05:00" },
  { service: "billing-worker", version: "v4.17.3", region: "us-east-2", tone: "ok", status: "Live", by: "Priya Raman", duration: "1m 04s", started: "Sun 22:14" }
];
const shortName = (name: string) => name.replace(/^(\S)\S*\s/, "$1. ");

const days = [["Mon", 16], ["Tue", 17], ["Wed", 18], ["Thu", 19], ["Fri", 20], ["Sat", 21], ["Sun", 22]] as const;

/* ---- sidebar: pinned services and regions filter the Deployments table ---- */
type Filter = { kind: "service" | "region"; value: string } | null;
const services: [string, Tone, ReactNode][] = [
  ["api-gateway", "success", <span className="t3 small">live</span>],
  ["search-indexer", "danger", <span className="small" style={bad}>failing</span>],
  ["edge-renderer", "accent", <span className="t3 num small">62%</span>]
];
const regions: [string, Tone, ReactNode][] = [
  ["eu-west-1", "success", v("v4.18.0")],
  ["us-east-2", "success", v("v4.18.0")],
  ["us-west-1", "success", v("v4.18.0")],
  ["ap-south-1", "danger", <span className="mono" style={{ fontSize: 11.5, ...bad }}>INC-418</span>],
  ["eu-central-1", "neutral", v("v4.17.3")]
];
const matches = (d: Deploy, f: Filter) => !f || (f.kind === "service" ? d.service === f.value : d.region === f.value || d.region === "All regions");

export default function Page() {
  const [filter, setFilter] = useState<Filter>(null);
  const [attn, setAttn] = useState("all");
  const [retried, setRetried] = useState(false);

  const pick = (kind: "service" | "region", value: string) => setFilter((f) => (f?.kind === kind && f.value === value ? null : { kind, value }));
  const sectionItems = (kind: "service" | "region", list: typeof services): AppNavItem[] =>
    list.map(([label, lamp, meta]) => ({ label, lamp, mono: true, meta, current: filter?.kind === kind && filter.value === label, onSelect: () => pick(kind, label) }));

  const nav: AppNavItem[] = [
    { label: "Home", icon: "home", to: "/templates/dashboard", active: true },
    { label: "Deployments", icon: "layers", to: "/templates/control-room", badge: { value: 48 } },
    { label: "Incidents", icon: "alert", to: "/templates/control-room", badge: { value: 3, tone: "danger" } },
    { label: "Agents", icon: "cpu", to: "/templates/agent-console", meta: online },
    { label: "Analytics", icon: "chart", to: "/templates/analytics" },
    { label: "On-call", icon: "calendar", to: "/templates/control-room#cr-oncall" }
  ];

  const shownAttention = attention.filter((a) => attn === "all" || (attn === "incidents" ? a.kind === "incident" : a.kind === "approval"));
  const rows = deploys.filter((d) => matches(d, filter));
  const runList = runs.map((r) => (retried && r.tone === "bad" ? { ...r, tone: "warn" as Tone, state: "Queued", age: "now", value: 0, foot: "Retry queued" } : r));

  return (
    <AppShell
      className="pg-dashboard"
      workspace={{ name: "Orbital Ops", sub: "Production" }}
      nav={nav}
      sections={[
        { label: "Pinned services", items: sectionItems("service", services) },
        { label: "Regions", items: sectionItems("region", regions) }
      ]}
      card={
        <>
          <span className="small" style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="t2">Release <span className="mono" style={{ fontSize: 12 }}>v4.18.0</span></span>
            <span className="num">62%</span>
          </span>
          <Track value={62} label="Release v4.18.0" />
          <span className="small t3" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span>3 of 5 regions live</span>
            <span>Next <span className="mono" style={{ fontSize: 12 }}>eu-central-1</span></span>
          </span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", to: "/templates/settings" }]}
      search={{ label: "Search services, runs and people", placeholder: "Search services, runs, people" }}
      actions={
        <>
          <Link className="small hide-sm" to="/templates/control-room" style={bad}>
            <StatusIndicator tone="danger" role="none" label="INC-418 open · ap-south-1" />
          </Link>
          <Notifications
            label="Notifications, 4 unread"
            items={[
              { text: "INC-418 · search-indexer health checks failing", meta: "14m" },
              { text: "INC-417 · Elevated 5xx on checkout in ap-south-1", meta: "52m" },
              { text: "Priya Raman asks to deploy auth-service to eu-central-1", meta: "1h 20m" },
              { text: "cert-rotation requests secrets write access", meta: "3h" }
            ]}
          />
          <Confirm
            trigger={<Button finish="polished">Deploy <KeyHint>⌘↵</KeyHint></Button>}
            title="Deploy v4.18.0 to eu-central-1?"
            description="The release is live in 3 of 5 regions. eu-central-1 is next; auth-service there still needs approval."
            confirm="Deploy"
          />
        </>
      }
      user={{ name: "Mara Lindqvist" }}
    >
      <PageHead
        title="Overview"
        sub="Month to date · 1–15 Nov compared with 1–15 Oct · updated 09:18 UTC"
        periods={["7d", "Month to date", "Quarter", "12m"]}
        periodLabel="Date range"
        defaultPeriod="Month to date"
      />

      <Kpis items={kpis} />

      <div className="bento">
        <article className="card card-lit s8 db-usage">
          <div className="d1-hd d1-hd--start">
            <div className="d1-col">
              <h2 className="h3">Billable usage</h2>
              <span className="small t3">Daily, USD · all services and regions</span>
            </div>
            <ChartLegend className="d1-legend" items={[{ label: "1–15 Nov", finish: "cobalt" }, { label: "1–15 Oct", finish: "dashed" }, { label: "Weekend", kind: "square", finish: "band" }]} />
          </div>
          <ChartWell className="db-plot">
            <AreaChart
              aria-label="Daily billable usage for 1 to 15 November, peaking at 30.1 thousand dollars on 12 November, 25.4 percent above the same date in October"
              height={349}
              weight="lg"
              padding={{ top: 20, bottom: 30, left: 50, right: 0 }}
              labels={nov}
              xTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
              edgeLabels={false}
              yTicks={[0, 10000, 20000, 30000, 40000]}
              formatY={money}
              bands={[{ from: 0, to: 0.5 }, { from: 5.5, to: 7.5 }, { from: 12.5, to: 14 }]}
              series={[{ label: "Usage", data: usage }, { label: "October", data: usageOct, finish: "dashed" }]}
              highlight={{
                index: 11,
                series: [0, 1],
                align: "bottom",
                tooltip: (
                  <>
                    <ChartTooltipRow label={<span className="t3">Thu 12 Nov</span>} value="+25.4%" tone="up" style={{ minWidth: 164 }} />
                    <ChartTooltipRow swatch="cobalt" label="Usage" value="$30.1k" strong />
                    <ChartTooltipRow swatch="dashed" label="Mon 12 Oct" value="$24.0k" muted />
                  </>
                )
              }}
              dataTable
            />
          </ChartWell>
          <div className="db-mix">
            <Split parts={[[37, "co"], [28, "sk"], [16, "si"], [19, "fl"]]} />
            <ChartLegend
              className="db-mix__legend"
              aria-label="Usage by service"
              items={[
                { label: <><span className="d1-mono12">edge-renderer</span><span className="num t3">$140.9k</span></>, kind: "square", finish: "cobalt" },
                { label: <><span className="d1-mono12">api-gateway</span><span className="num t3">$106.7k</span></>, kind: "square", finish: "smoked" },
                { label: <><span className="d1-mono12">search-indexer</span><span className="num t3">$60.9k</span></>, kind: "square", finish: "silver" },
                { label: <>3 others<span className="num t3">$72.4k</span></>, kind: "square", finish: "flat" }
              ]}
            />
          </div>
        </article>

        <article className="card s4 db-attn">
          <div className="db-attn__head">
            <div className="d1-hd">
              <h2 className="h3">Needs attention</h2>
              <Link className="d1-link" to="/templates/control-room">View all</Link>
            </div>
            <SegmentedControl
              aria-label="Filter"
              value={attn}
              onValueChange={setAttn}
              items={[
                { value: "all", label: <span>All <span className="num t3">6</span></span> },
                { value: "incidents", label: <span>Incidents <span className="num t3">3</span></span> },
                { value: "approvals", label: <span>Approvals <span className="num t3">3</span></span> }
              ]}
            />
          </div>
          <ul className="db-attn__list">
            {shownAttention.map((a) => (
              <li className="db-att" key={a.age + a.kind}>
                <StatusIndicator tone={a.tone} className="db-att__lamp" />
                <div className="d1-col db-att__body">
                  <span className="d1-row">
                    <Link className="d1-trunc db-att__title" to={a.to} title={a.full}>{a.title}</Link>
                    <span className="small t3 num">{a.age}</span>
                  </span>
                  <span className="d1-row small t3 db-att__meta">
                    {a.tag}
                    {a.meta}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <section className="card db-agents" aria-labelledby="db-agents">
          <div className="d1-hd db-agents__head">
            <div className="d1-row" style={{ gap: 12 }}>
              <h2 className="h3" id="db-agents">Agent activity</h2>
              <span className="small t3">18 online · 3 running · 1 failed today</span>
            </div>
            <Link className="d1-link" to="/templates/agent-console">Open agent console</Link>
          </div>
          <div className="db-runs d1-cells">
            {runList.map((r) => (
              <div className="db-run" key={r.name}>
                <span className="d1-row">
                  <StatusIndicator tone={r.tone} label={r.state} role="none" className="small" />
                  <span className="small t3 num" style={{ marginLeft: "auto" }}>{r.age}</span>
                </span>
                <span className="mono d1-trunc" style={{ fontSize: 13 }}>{r.name}</span>
                <span className="small t2 num db-run__desc">{r.desc}</span>
                <Track value={r.value} finish={r.finish} label={`${r.name}, ${r.state.toLowerCase()}`} />
                <span className="small db-run__foot">
                  <span className="t3 num">{r.foot}</span>
                  {r.tone === "bad" ? <Button finish="ghost" size="sm" className="db-retry" onClick={() => setRetried(true)}>Retry</Button> : null}
                </span>
              </div>
            ))}
          </div>
        </section>

        <article className="card s8 db-deploys">
          <div className="d1-hd db-deploys__head">
            <div className="d1-row d1-wrap" style={{ gap: 12 }}>
              <h2 className="h3">Deployments</h2>
              <span className="small t3">48 this month · 2 need action</span>
              {filter ? <Chip size="sm" onRemove={() => setFilter(null)} removeLabel={`Clear ${filter.value} filter`}><span className="d1-mono12">{filter.value}</span></Chip> : null}
            </div>
            <Link className="d1-link" to="/templates/control-room">View all</Link>
          </div>
          <Table aria-label="Deployments" containerClassName="db-deploys__table">
            <thead>
              <tr><th scope="col">Service</th><th scope="col">Region</th><th scope="col">Status</th><th scope="col">By</th><th scope="col" className="r">Duration</th><th scope="col" className="r">Started</th></tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.service}>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{d.service}</span> <span className="t3 d1-mono12">{d.version}</span></td>
                  <td className={d.regions ? "t2" : "d1-mono12 t2"}>{d.region}</td>
                  <td><StatusIndicator tone={d.tone} label={d.status} role="none" /></td>
                  {d.agent ? (
                    <td className="d1-mono12 t2">{d.by}</td>
                  ) : (
                    <td><span className="d1-row"><Avatar name={d.by} size="sm" aria-hidden="true" />{shortName(d.by)}</span></td>
                  )}
                  <td className={d.duration === "—" ? "r t3" : "r num"}>{d.duration}</td>
                  <td className="r num t3">{d.started}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d1-hd small db-deploys__foot">
            <span className="t3 num">{filter ? `${rows.length} of 6 on this page match ${filter.value}` : "Showing 6 of 48"}</span>
            <div className="d1-row" style={{ gap: 4, marginRight: -12 }}>
              <Button finish="ghost" size="sm" disabled>Previous</Button>
              <Button finish="ghost" size="sm" asChild><Link to="/templates/control-room">Next</Link></Button>
            </div>
          </div>
        </article>

        <article className="card s4 db-oncall">
          <div className="d1-hd">
            <div className="d1-row" style={{ gap: 12 }}>
              <h2 className="h3">On-call</h2>
              <span className="small t3">Platform · week 47</span>
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button type="button" className="d1-link">Schedule</button>
              </Popover.Trigger>
              <Popover.Content align="end" aria-label="Platform on-call, week 47" className="db-sched">
                <span className="small" style={{ fontWeight: 600 }}>Platform · week 47</span>
                <span className="small t2">Primary: Rafael Achebe, Mon 16 – Sun 22 Nov</span>
                <span className="small t2">Secondary: Priya Raman</span>
                <span className="small t3 num">Handoff to Priya Raman, Mon 23 Nov, 09:00 UTC</span>
              </Popover.Content>
            </Popover.Root>
          </div>
          <div className="db-people">
            {[
              ["Rafael Achebe", "Primary · SRE lead", <StatusIndicator key="s" tone="ok" pulse label="On shift" role="none" className="small t2" />],
              ["Priya Raman", "Secondary · platform eng", <span key="s" className="small t3">Backup</span>],
              ["Mara Lindqvist", "Commander · flight director", <span key="s" className="d1-mono12 d1-dn">INC-418</span>]
            ].map(([name, role, state]) => (
              <div className="db-oc" key={name as string}>
                <Avatar name={name as string} aria-hidden="true" />
                <span className="d1-col" style={{ gap: 2, flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>{name}</span>
                  <span className="small t3">{role}</span>
                </span>
                {state}
              </div>
            ))}
          </div>
          <ol aria-label="Primary on-call, Mon 16 to Sun 22 November: Rafael Achebe every day" className="db-days">
            {days.map(([d, n], i) => (
              <li className="db-day" key={n} aria-current={i === 0 ? "date" : undefined}>
                <span className="t3">{d}</span>
                <span className={i === 0 ? "num db-day__today" : "num t2"}>{n}</span>
              </li>
            ))}
          </ol>
          <div className="d1-hd db-handoff">
            <span className="d1-col" style={{ gap: 0 }}>
              <span className="small" style={{ fontWeight: 500 }}>Handoff to Priya Raman</span>
              <span className="small t3 num">Mon 23 Nov, 09:00 UTC</span>
            </span>
            <Confirm
              trigger={<Button size="sm">Page Rafael</Button>}
              title="Page Rafael Achebe?"
              description="Rafael is the primary on-call for Platform this week. He gets a push notification and a call."
              confirm="Page Rafael"
            />
          </div>
        </article>
      </div>
    </AppShell>
  );
}
