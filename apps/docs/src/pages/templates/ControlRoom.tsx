import {
  AreaChart,
  Avatar,
  Badge,
  BarChart,
  Button,
  ChartLegend,
  ChartTooltipRow,
  ChartWell,
  Dialog,
  Drawer,
  Gauge,
  IconButton,
  KeyHint,
  SegmentedControl,
  Sparkline,
  Spinner,
  StatusIndicator,
  Table
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Icon } from "../../components/Icon";
import { D2Icon, Pill, useMedia } from "./d2-shared";
import "./ControlRoom.css";

const online = <StatusIndicator tone="success" pulse />;
const mono = (text: string) => <span className="mono cr-m12">{text}</span>;

/* ---- chart data (from the artboard's plot coordinates) ---- */
const crY = [77.8, 65.7, 56.9, 51.4, 50.2, 51.9, 48.6, 42.6, 35.9, 29.9, 34.3, 41.4, 53.0, 66.8, 79.4, 89.8, 98.1, 103.6, 105.8, 104.2, 96.4, 84.3, 70.6, 59.6, 55.2];
const crLastY = [82.0, 72.1, 64.4, 60.0, 59.5, 62.2, 63.3, 69.9, 74.9, 78.3, 76.5, 72.1, 72.7, 79.8, 87.5, 95.2, 101.8, 106.2, 107.9, 106.2, 99.6, 88.6, 76.0, 65.5, 61.1];
const req = (y: number) => Math.round(((240 - y) / 5.5) * 100) * 10;
const hours = Array.from({ length: 24 }, (_, i) => (i === 23 ? "Now" : i === 15 ? "Mon 00:00" : `${String((9 + i) % 24).padStart(2, "0")}:00`));
const err5xx = [51.8, 53.6, 52.7, 50.9, 50.0, 51.8, 52.7, 50.9, 49.1, 50.0, 51.8, 52.7, 53.6, 54.5, 55.4, 55.4, 56.3, 55.4, 54.5, 53.6, 51.8, 50.0, 47.3, 11.3].map(
  (y) => Math.round(((68.5 - y) / 910) * 10000) / 10000
);
const flip = (ys: number[]) => ys.map((y) => 32 - y);
const sparkRequests = flip([18.3, 14.9, 12.4, 10.9, 10.6, 11.0, 10.1, 8.4, 6.5, 4.8, 6.0, 8.1, 11.3, 15.2, 18.8, 21.8, 24.1, 25.6, 26.3, 25.8, 23.6, 20.2, 16.3, 13.2, 12.0]);
const sparkLatency = flip([16.9, 17.9, 16.0, 15.1, 14.1, 15.1, 16.0, 16.9, 15.1, 14.1, 16.0, 16.9, 18.8, 19.7, 20.7, 21.6, 22.5, 22.5, 21.6, 20.7, 19.7, 18.8, 17.9, 18.8, 18.8]);
const sparkErrors = flip([22.8, 23.6, 23.2, 22.4, 22, 22.8, 23.2, 22.4, 21.6, 22, 22.8, 23.2, 23.6, 24, 24.4, 24.4, 24.8, 24.4, 24, 23.6, 22.8, 22, 20.8, 4.8]);

const ranges = [
  { value: "1h", label: "1h", text: "last hour" },
  { value: "24h", label: "24h", text: "last 24 hours" },
  { value: "7d", label: "7d", text: "last 7 days" },
  { value: "30d", label: "30d", text: "last 30 days" }
];

const regions = [
  { name: "eu-west-1", rpm: "10.7k", err: "0.01%", share: 34 },
  { name: "us-east-2", rpm: "7.9k", err: "0.01%", share: 25 },
  { name: "ap-south-1", rpm: "5.7k", err: "0.31%", share: 18, degraded: true },
  { name: "us-west-1", rpm: "4.4k", err: "0.01%", share: 14 },
  { name: "eu-central-1", rpm: "2.8k", err: "0.01%", share: 9 }
];

interface Incident {
  id: string;
  title: ReactNode;
  service: string;
  region: string;
  sev: "SEV-1" | "SEV-2" | "SEV-3";
  tone: "bad" | "warn" | "info";
  owner: { name: string; short: string } | null;
  open: string;
}

const incidents: Incident[] = [
  { id: "INC-418", title: "search-indexer health checks timing out", service: "search-indexer", region: "ap-south-1", sev: "SEV-1", tone: "bad", owner: { name: "Mara Lindqvist", short: "M. Lindqvist" }, open: "14m" },
  { id: "INC-417", title: "Elevated 5xx on checkout in ap-south-1", service: "api-gateway", region: "ap-south-1", sev: "SEV-2", tone: "warn", owner: { name: "Rafael Achebe", short: "R. Achebe" }, open: "52m" },
  { id: "INC-415", title: "TLS certificate for edge-renderer expires in 9 days", service: "edge-renderer", region: "all regions", sev: "SEV-3", tone: "info", owner: null, open: "1d" }
];

type StepState = "done" | "active" | "todo";
const steps: { state: StepState; label: ReactNode; time?: string }[] = [
  { state: "done", label: <>Read {mono("incident-418.log")}</>, time: "4s" },
  { state: "done", label: "Diff config v4.17.3 → v4.18.0", time: "11s" },
  { state: "active", label: "Replay ap-south-1 traffic on staging", time: "2m 14s" },
  { state: "todo", label: "Compare error budgets" },
  { state: "todo", label: "Draft rollback plan for review" }
];

const nav: AppNavItem[] = [
  { label: "Control room", icon: "monitor", to: "/templates/control-room", active: true },
  { label: "Deployments", icon: "layers", to: "/templates/control-room", badge: { value: 48 } },
  { label: "Incidents", icon: "alert", to: "/templates/control-room#cr-incidents", badge: { value: 3, tone: "danger" } },
  { label: "Agents", icon: "cpu", to: "/templates/agent-console", meta: online },
  { label: "Analytics", icon: "chart", to: "/templates/analytics" },
  { label: "On-call", icon: "calendar", to: "/templates/control-room#cr-oncall" }
];

const pinned = [
  { label: "nightly-rebalance", lamp: "accent", meta: <span className="t3 num small">72%</span> },
  { label: "cert-rotation", lamp: "warning", meta: <span className="t3 small">queued</span> },
  { label: "cache-warm", lamp: "success", meta: <span className="t3 small">done</span> }
] as const;

export default function Page() {
  const [range, setRange] = useState("24h");
  const [pinnedRun, setPinnedRun] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [paged, setPaged] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rollback, setRollback] = useState<"idle" | "confirm" | "started">("idle");
  // the readout needs ~200 px beside the 18:00 bead; on phones the stats row under the plot carries the peak
  const narrow = useMedia("(max-width: 560px)");
  const rangeText = ranges.find((r) => r.value === range)?.text ?? "last 24 hours";
  const open = incidents.find((i) => i.id === drawer);

  return (
    <AppShell
      className="pg-control"
      workspace={{ name: "Orbital Ops", sub: "Production" }}
      nav={nav}
      sections={[
        {
          label: "Pinned runs",
          items: pinned.map((run) => ({
            ...run,
            mono: true,
            current: pinnedRun === run.label,
            onSelect: () => setPinnedRun((current) => (current === run.label ? null : run.label))
          }))
        }
      ]}
      card={
        <>
          <span className="small cr-cardline">
            <span className="t2">Release {mono("v4.18.0")}</span>
            <span className="num">62%</span>
          </span>
          <Pill parts={[[62, "cobalt"]]} label="Release v4.18.0" />
          <span className="small t3 cr-cardsub">
            <span>3 of 5 regions live</span>
            <span>Next {mono("eu-central-1")}</span>
          </span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", to: "/templates/settings" }]}
      search={{ label: "Search services, runs and people", placeholder: "Search services, runs, people" }}
      actions={
        <>
          <button type="button" className="small hide-sm cr-inc" onClick={() => setDrawer("INC-418")}>
            <StatusIndicator tone="danger" role="none" label="INC-418 open · ap-south-1" />
          </button>
          <IconButton finish="ghost" aria-label="Notifications, 4 unread">
            <Icon name="bell" />
          </IconButton>
          <Button finish="polished">
            Deploy <KeyHint>⌘↵</KeyHint>
          </Button>
        </>
      }
      user={{ name: "Mara Lindqvist" }}
    >
      <div className="hd cr-head">
        <div className="cr-title">
          <h1 className="cr-h1">Control room</h1>
          <span className="small t3">5 regions · 214 services · {rangeText} · updated 12&nbsp;s ago</span>
        </div>
        <div className="row cr-tools">
          <SegmentedControl aria-label="Time range" items={ranges} value={range} onValueChange={setRange} />
          <Button finish="graphite" leadingIcon={<D2Icon name="download" />}>
            Export
          </Button>
        </div>
      </div>

      <section className="card cr-kpis" aria-label="Key metrics">
        <div className="cr-kpi">
          <span className="small t2">Requests</span>
          <div className="cr-kv-row">
            <span className="cr-kv">31.6k</span>
            <span className="small t3">/ min</span>
            <span className="small up num cr-end">+8.2%</span>
          </div>
          <Sparkline height={32} data={sparkRequests} domain={[0, 32]} finish="cobalt" />
          <span className="small t3 num">vs 29.2k a minute last week</span>
        </div>
        <div className="cr-kpi">
          <span className="small t2">Latency p95</span>
          <div className="cr-kv-row">
            <span className="cr-kv">42</span>
            <span className="small t3">ms</span>
            <span className="small up num cr-end">−6&nbsp;ms</span>
          </div>
          <Sparkline height={32} data={sparkLatency} domain={[0, 32]} />
          <span className="small t3 num">Target under 120&nbsp;ms</span>
        </div>
        <div className="cr-kpi">
          <span className="small t2">Error rate</span>
          <div className="cr-kv-row">
            <span className="cr-kv">0.02%</span>
            <span className="small t3 cr-end">flat</span>
          </div>
          <Sparkline height={32} data={sparkErrors} domain={[0, 32]} tail={{ from: 22, finish: "enamel" }} />
          <span className="small num">
            <span className="dn">0.06% in the last hour</span> <span className="t3">· ap-south-1</span>
          </span>
        </div>
        <div className="cr-kpi">
          <span className="small t2">Agents</span>
          <div className="cr-kv-row">
            <span className="cr-kv">18</span>
            <span className="small t3">online</span>
            <span className="small co num cr-end">3 running</span>
          </div>
          <div className="cr-kpi-pill">
            <Pill parts={[[16.7, "cobalt"], [5.6, "amber"], [5.6, "enamel"]]} />
          </div>
          <span className="small t3 num">1 waiting for approval · 1 failed</span>
        </div>
      </section>

      <div className="bento">
        <article className="card card-lit s8 cr-panel cr-traffic" aria-labelledby="cr-traffic">
          <div className="hd cr-top">
            <div className="cr-title cr-title--4">
              <h2 className="h3" id="cr-traffic">Traffic and errors</h2>
              <span className="small t3">Requests a minute, all regions · Sun 09:00 to now</span>
            </div>
            <ChartLegend
              className="small t2 cr-legend"
              items={[{ label: "Requests", finish: "cobalt" }, { label: "Same hour last week", finish: "dashed" }, { label: "5xx rate", kind: "square" }]}
            />
          </div>
          <ChartWell className="cr-plot">
            <AreaChart
              aria-label="Requests a minute over the last 24 hours. Traffic peaked at 38.2 thousand at 18:00 on Sunday, against 29.4 thousand at the same hour last week, and bottomed out at 24.4 thousand at 03:00."
              height={248}
              weight="lg"
              padding={{ top: 20, bottom: 8, left: 50, right: 0 }}
              yTicks={[0, 10000, 20000, 30000, 40000]}
              series={[{ label: "Requests", data: crY.map(req) }, { label: "Last week", data: crLastY.map(req), finish: "dashed" }]}
              highlight={{
                index: 9,
                series: [0, 1],
                side: "right",
                align: "middle",
                tooltip: narrow ? undefined : (
                  <>
                    <ChartTooltipRow label={<span className="t3">Sun 15 Nov, 18:00</span>} value="+29.9%" tone="up" />
                    <ChartTooltipRow swatch="cobalt" label="Requests" value="38.2k" strong />
                    <ChartTooltipRow swatch="dashed" label="Sun 8 Nov" value="29.4k" muted />
                    <ChartTooltipRow label="5xx rate" value="0.02%" muted rule />
                  </>
                )
              }}
            />
            <BarChart
              aria-label="5xx error rate by hour. It held near 0.02 percent until 08:00, then rose to 0.06 percent in the last hour, above the 0.05 percent alert line."
              height={98}
              barWidth={8}
              yLabels={false}
              yDomain={[0, 0.075]}
              yTicks={[]}
              padding={{ top: 0, bottom: 29.5, left: 50, right: 0 }}
              labels={hours}
              xTicks={[3, 9, 15, 21, 23]}
              threshold={{ value: 0.05, label: "0.05%", tone: "danger", labelPlacement: "axis" }}
              series={[{ label: "5xx rate", data: err5xx.map((v, i) => (i === 23 ? { value: v, finish: "enamel" as const } : v)), finish: "silver" }]}
            />
          </ChartWell>
          <div className="small cr-stats">
            <span>
              <span className="t3">Average </span>
              <span className="num">31.6k</span>
            </span>
            <span>
              <span className="t3">Peak </span>
              <span className="num">38.2k</span>
              <span className="t3"> · Sun 18:00</span>
            </span>
            <span>
              <span className="t3">Low </span>
              <span className="num">24.4k</span>
              <span className="t3"> · Mon 03:00</span>
            </span>
            <button type="button" className="cr-alert" onClick={() => setDrawer("INC-417")}>
              {mono("INC-417")} · 5xx on checkout since 08:26
            </button>
          </div>
        </article>

        <article className="card s4 cr-panel cr-regions" aria-labelledby="cr-regions">
          <div className="cr-title cr-title--4">
            <h2 className="h3" id="cr-regions">Traffic by region</h2>
            <span className="small t3">Share of requests, 24h · 5xx in the last hour</span>
          </div>
          <div className="cr-region-list">
            <div className="cr-rg small t3 cr-rg-head" aria-hidden="true">
              <span>Region</span>
              <span className="r">Req/min</span>
              <span className="r">5xx, 1h</span>
              <span className="r">Share</span>
            </div>
            <ul className="cr-rl-list" aria-label="Regions">
              {regions.map((region) => (
                <li key={region.name} className="cr-rl">
                  <span className="cr-rg">
                    <span className="row">
                      <span className="mono cr-m125">{region.name}</span>
                      {region.degraded ? <Badge tone="bad">Degraded</Badge> : null}
                    </span>
                    <span className="num r t2" aria-label={`${region.rpm} requests a minute`}>{region.rpm}</span>
                    <span className={region.degraded ? "num r dn" : "num r t3"} aria-label={`${region.err} 5xx in the last hour`}>{region.err}</span>
                    <span className="num r" aria-label={`${region.share}% of requests`}>{region.share}%</span>
                  </span>
                  <Pill parts={[[region.share]]} small />
                </li>
              ))}
            </ul>
          </div>
          <div className="cr-budget">
            <Gauge variant="ring" value={72} aria-label="Error budget, 72 percent left" />
            <div className="cr-title cr-title--4">
              <span className="h3">Error budget left</span>
              <span className="small t3 num">Burn 0.8× · resets 1 Dec</span>
              <span className="small am num">−19&nbsp;pts in 7&nbsp;days</span>
            </div>
          </div>
        </article>

        <article className="card s7 cr-incidents" id="cr-incidents" aria-labelledby="cr-incidents-h">
          <div className="hd cr-inc-head">
            <div className="row cr-gap12">
              <h2 className="h3" id="cr-incidents-h">Open incidents</h2>
              <span className="small t3">3 open · 1 at SEV-1</span>
            </div>
            <button type="button" className="small link cr-linkbtn" onClick={() => setDrawer("all")}>
              View all
            </button>
          </div>
          <Table className="cr-tbl" aria-label="Open incidents">
            <thead>
              <tr>
                <th scope="col">Incident</th>
                <th scope="col">Severity</th>
                <th scope="col">Owner</th>
                <th scope="col" className="r">Open for</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <span className="cr-cell">
                      <button type="button" className="cr-inc-title" onClick={() => setDrawer(incident.id)}>
                        {incident.title}
                      </button>
                      <span className="small t3">
                        {mono(incident.id)} · {mono(incident.service)} · {incident.region === "all regions" ? "all regions" : mono(incident.region)}
                      </span>
                    </span>
                  </td>
                  <td>
                    <StatusIndicator tone={incident.tone} label={incident.sev} role="none" />
                  </td>
                  <td>
                    {incident.owner ? (
                      <span className="row">
                        <Avatar className="cr-av" size="sm" name={incident.owner.name} />
                        <span className="t2">{incident.owner.short}</span>
                      </span>
                    ) : (
                      <span className="mono t2 cr-m12">ops-agent</span>
                    )}
                  </td>
                  <td className="r num">{incident.open}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="hd small cr-oncall" id="cr-oncall">
            <span className="row t3">
              <Avatar className="cr-av" size="sm" name="Rafael Achebe" />
              <span>
                <span className="cr-hi">Rafael Achebe</span> is primary on call · Priya Raman is backup
              </span>
            </span>
            <Button finish="graphite" size="sm" onClick={() => setPaged(true)} disabled={paged}>
              {paged ? "Paged" : "Page on-call"}
            </Button>
          </div>
          <span className="chrome-visually-hidden" role="status">
            {paged ? "Rafael Achebe has been paged." : ""}
          </span>
        </article>

        <article className="card s5 cr-panel cr-run" id="cr-run" aria-labelledby="cr-run-h">
          <div className="hd cr-top">
            <div className="cr-title cr-title--4">
              <h2 className="h3" id="cr-run-h">Agent run · INC-418</h2>
              <span className="small t3">
                Rollback check · {mono("ops-agent")} · started 6&nbsp;min ago
              </span>
            </div>
            <StatusIndicator
              className="small t2 cr-stepof"
              tone={paused ? "warn" : "info"}
              role="none"
              label={<span className="num">{paused ? "Paused at step 3 of 5" : "Step 3 of 5"}</span>}
            />
          </div>
          <Pill parts={[[60, "cobalt"]]} label="Rollback check progress" />
          <ol className="d2-steps">
            {steps.map((step, index) => (
              <li key={index} className="d2-step" data-state={step.state}>
                {step.state === "done" ? (
                  <D2Icon name="check" data-done="" />
                ) : step.state === "active" ? (
                  paused ? <D2Icon name="pause" className="co" /> : <Spinner size="md" label="In progress" />
                ) : (
                  <span className="d2-ring" aria-hidden="true" />
                )}
                <span className={step.state === "active" ? "trunc cr-f1" : "cr-f1"}>{step.label}</span>
                {step.time ? <span className={step.state === "active" ? "small num co" : "num t3 small"}>{step.time}</span> : null}
                <span className="chrome-visually-hidden">{step.state === "done" ? ", done" : step.state === "active" ? ", in progress" : ", not started"}</span>
              </li>
            ))}
          </ol>
          <div className="hd cr-run-foot">
            <Link className="small link" to="/templates/agent-console">
              Open thread
            </Link>
            <div className="row">
              <Button finish="graphite" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button finish="enamel" onClick={() => setRollback("confirm")} disabled={rollback === "started"}>
                {rollback === "started" ? "Rolling back…" : "Roll back now"}
              </Button>
            </div>
          </div>
        </article>
      </div>

      <Dialog.Root open={rollback === "confirm"} onOpenChange={(next) => !next && setRollback("idle")}>
        <Dialog.Content className="pg-control-dialog">
          <Dialog.Title>Roll back search-indexer?</Dialog.Title>
          <Dialog.Description>
            Production in ap-south-1 goes back to v4.17.3 now, before the replay on staging finishes. INC-418 stays open until health checks pass.
          </Dialog.Description>
          <div className="cr-dialog-actions">
            <Dialog.Close asChild>
              <Button finish="ghost">Cancel</Button>
            </Dialog.Close>
            <Button finish="enamel" onClick={() => setRollback("started")}>
              Roll back now
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Drawer.Root open={drawer !== null} onOpenChange={(next) => !next && setDrawer(null)}>
        <Drawer.Content className="pg-control-drawer">
          <Drawer.Header eyebrow={open ? open.id : "3 open · 1 at SEV-1"}>
            <Drawer.Title>{open ? open.title : "Open incidents"}</Drawer.Title>
            <Drawer.Description>{open ? `${open.service} · ${open.region}` : "Production · all regions"}</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>
            <ul className="cr-drawer-list">
              {(open ? [open] : incidents).map((incident) => (
                <li key={incident.id}>
                  {!open ? (
                    <button type="button" className="cr-inc-title" onClick={() => setDrawer(incident.id)}>
                      {incident.title}
                    </button>
                  ) : null}
                  <dl className="cr-dl small">
                    <dt className="t3">Incident</dt>
                    <dd className="mono cr-m12">{incident.id}</dd>
                    <dt className="t3">Severity</dt>
                    <dd>
                      <StatusIndicator tone={incident.tone} label={incident.sev} role="none" />
                    </dd>
                    <dt className="t3">Service</dt>
                    <dd className="mono cr-m12">{incident.service}</dd>
                    <dt className="t3">Region</dt>
                    <dd>{incident.region}</dd>
                    <dt className="t3">Owner</dt>
                    <dd>{incident.owner?.name ?? "ops-agent"}</dd>
                    <dt className="t3">Open for</dt>
                    <dd className="num">{incident.open}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          </Drawer.Body>
          <Drawer.Footer>
            {open?.id === "INC-418" ? (
              <Button finish="graphite" asChild>
                <Link to="/templates/agent-console">Open agent thread</Link>
              </Button>
            ) : open ? (
              <Button finish="ghost" onClick={() => setDrawer("all")}>
                All open incidents
              </Button>
            ) : null}
            <Drawer.Close asChild>
              <Button finish="polished">Done</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </AppShell>
  );
}
