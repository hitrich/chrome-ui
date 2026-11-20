import {
  Avatar,
  Badge,
  Button,
  ChartSwatch,
  Checkbox,
  DropdownMenu,
  IconButton,
  Popover,
  SegmentedControl,
  Spinner,
  StatusIndicator,
  Table,
  Textarea
} from "@loreanai/chrome-ui";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Icon } from "../../components/Icon";
import { D2Icon, Pill, type PillFinish } from "./d2-shared";
import "./AgentConsole.css";

const NB = " ";
const online = <StatusIndicator tone="success" pulse />;
const mono = (text: string) => <span className="mono ac-m12">{text}</span>;
const ic = (text: string) => <code className="ac-ic">{text}</code>;

const nav: AppNavItem[] = [
  { label: "Home", icon: "home", to: "/templates/dashboard" },
  { label: "Deployments", icon: "layers", to: "/templates/control-room", badge: { value: 48 } },
  { label: "Incidents", icon: "alert", to: "/templates/control-room", badge: { value: 3, tone: "danger" } },
  { label: "Agents", icon: "cpu", to: "/templates/agent-console", active: true, meta: online },
  { label: "Analytics", icon: "chart", to: "/templates/analytics" },
  { label: "On-call", icon: "calendar", to: "/templates/control-room#cr-oncall" }
];

const threads = [
  { label: "INC-418 rollback check" },
  { label: "GPU pool cost review" },
  { label: "Scope cert-rotation write access to auth-service secrets" }
];

type Status = "Running" | "Queued" | "Failed" | "Idle";
const statusTone = { Running: "info", Queued: "warn", Failed: "bad", Idle: "off" } as const;

interface Agent {
  id: string;
  status: Status;
  age?: string;
  task: string;
  taskTitle?: string;
  parts?: readonly (readonly [number, PillFinish?])[];
  progress: string;
}

const fleet: Agent[] = [
  { id: "ops-agent", status: "Running", age: "6m", task: "INC-418 rollback check", parts: [[60, "cobalt"]], progress: "Step 3 of 5" },
  { id: "rollout-pilot", status: "Running", age: "9m", task: "edge-renderer rollout", parts: [[62]], progress: "3 of 5 regions · 62%" },
  { id: "rebalancer", status: "Running", age: "18m", task: "nightly-rebalance", parts: [[72]], progress: "412 of 572 shards · 72%" },
  { id: "cert-rotation", status: "Queued", age: "3h", task: "Needs secrets approval", parts: [], progress: "Starts when approved" },
  { id: "indexer-doctor", status: "Failed", age: "38m", task: "Reindex timed out", taskTitle: "search-indexer reindex timed out after 600s", parts: [[40, "enamel"]], progress: "Stopped at 40%" }
];

const schedules = [
  { agent: "cache-warm", when: "Daily at 05:00", last: "done", tone: "ok" as const },
  { agent: "rebalancer", when: "nightly-rebalance", last: "running · 72%", tone: "info" as const },
  { agent: "cert-rotation", when: "When approved", last: "queued", tone: "warn" as const }
];

type RunState = "running" | "paused" | "stopped";
type Approval = "pending" | "approved" | "rejected";

interface SentMessage {
  id: number;
  text: string;
  files: string[];
}

function PlanSteps({ run, approval, onApproval }: { run: RunState; approval: Approval; onApproval: (next: Approval) => void }) {
  const active = run === "running" ? <Spinner size="md" label="In progress" /> : <D2Icon name="pause" className="co" />;
  return (
    <ol className="d2-steps ac-steps">
      <li className="d2-step">
        <D2Icon name="check" data-done="" />
        <span className="ac-f1">Read {mono("incident-418.log")}</span>
        <span className="num t3 small">4s</span>
      </li>
      <li className="d2-step">
        <D2Icon name="check" data-done="" />
        <span className="ac-f1">Diff config v4.17.3 → v4.18.0</span>
        <span className="num t3 small">11s</span>
      </li>
      <li className="d2-step" data-state="active">
        {active}
        <span className="ac-f1">
          Replay <span className="ac-nowrap">ap-south-1</span> traffic on staging
          <span className="chrome-visually-hidden">{run === "running" ? ", in progress" : run === "paused" ? ", paused" : ", stopped"}</span>
        </span>
        <span className="small num co">2m 14s</span>
      </li>
      <li className="d2-step" data-state="todo">
        <span className="d2-ring" aria-hidden="true" />
        Compare error budgets
      </li>
      <li className="d2-step" data-state={approval === "rejected" ? "rejected" : "todo"}>
        <span className="d2-ring" aria-hidden="true" />
        <span className="ac-stepcol">
          Draft rollback plan for review
          <span className="small" role="status">
            {approval === "pending"
              ? "Needs your approval before production"
              : approval === "approved"
                ? "Approved by Mara · goes to production after review"
                : "Rejected · the agent stops before production"}
          </span>
          {approval === "pending" ? (
            <span className="ac-approve">
              <Button size="sm" finish="graphite" onClick={() => onApproval("approved")}>
                Approve
              </Button>
              <Button size="sm" finish="ghost" onClick={() => onApproval("rejected")}>
                Reject
              </Button>
            </span>
          ) : (
            <button type="button" className="ac-undo small" onClick={() => onApproval("pending")}>
              Undo
            </button>
          )}
        </span>
      </li>
    </ol>
  );
}

export default function Page() {
  const [view, setView] = useState("threads");
  const [thread, setThread] = useState(threads[0]!.label);
  const [selected, setSelected] = useState("ops-agent");
  const [hidden, setHidden] = useState<Status[]>([]);
  const [run, setRun] = useState<RunState>("running");
  const [approval, setApproval] = useState<Approval>("pending");
  const [model, setModel] = useState("balanced");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState(["runbooks/rollback.md"]);
  const [sent, setSent] = useState<SentMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const running = run === "running";
  const runLabel = run === "running" ? "Running" : run === "paused" ? "Paused" : "Stopped";
  const runTone = run === "running" ? "info" : run === "paused" ? "warn" : "off";

  const pick = (id: string) => {
    setSelected(id);
    setView(id === "ops-agent" ? "threads" : "runs");
  };

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return textRef.current?.focus();
    setSent((list) => [...list, { id: list.length + 1, text, files }]);
    setDraft("");
    setFiles([]);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "nearest" }));
  };

  const copyId = () => {
    void navigator.clipboard?.writeText("run_7f3a21c9").catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const shown = fleet.filter((agent) => !hidden.includes(agent.status));
  const idleShown = !hidden.includes("Idle");

  return (
    <AppShell
      className="pg-agents"
      workspace={{ name: "Orbital Ops", sub: "Production" }}
      nav={nav}
      sections={[
        {
          label: "Recent threads",
          items: threads.map((t, index) => ({
            label: t.label,
            lamp: index === 0 ? ("accent" as const) : ("neutral" as const),
            current: thread === t.label,
            title: index === 2 ? t.label : undefined,
            onSelect: () => {
              setThread(t.label);
              setView("threads");
            }
          }))
        }
      ]}
      card={
        <>
          <span className="small ac-cardline">
            <span className="t2">Agent spend, Nov</span>
            <span className="num">$412.80</span>
          </span>
          <Pill parts={[[27.5, "cobalt"]]} label="Agent spend this month" />
          <span className="small t3 num">of $1,500 · resets 1 Dec</span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", to: "/templates/settings" }]}
      search={{ label: "Search agents, threads and runs", placeholder: "Search agents, threads, runs" }}
      actions={
        <>
          <span className="small t2 hide-sm">
            <StatusIndicator tone="accent" role="none" label="3 runs in progress" />
          </span>
          <IconButton finish="ghost" aria-label="Notifications, 4 unread">
            <Icon name="bell" />
          </IconButton>
          <Button finish="polished" leadingIcon={<Icon name="plus" style={{ strokeWidth: 2 }} />}>
            New run
          </Button>
        </>
      }
      user={{ name: "Mara Lindqvist" }}
    >
      <div className="hd ac-head">
        <div className="ac-title">
          <h1 className="ac-h1">Agent console</h1>
          <span className="small t3">18 online · 3 running · 1 waiting for approval · 1 failed today</span>
        </div>
        <div className="row ac-tools">
          <SegmentedControl
            aria-label="View"
            items={[
              { value: "threads", label: "Threads" },
              { value: "runs", label: "Runs" },
              { value: "schedules", label: "Schedules" }
            ]}
            value={view}
            onValueChange={setView}
          />
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button finish="graphite" leadingIcon={<D2Icon name="filter" />} aria-label={hidden.length ? `Filter, ${hidden.length} hidden` : undefined}>
                Filter
              </Button>
            </Popover.Trigger>
            <Popover.Content align="end" className="pg-agents-pop">
              <fieldset className="ac-filter">
                <legend className="field-label">Show agents</legend>
                {(["Running", "Queued", "Failed", "Idle"] as const).map((status) => (
                  <Checkbox
                    key={status}
                    checked={!hidden.includes(status)}
                    onCheckedChange={(on) => setHidden((list) => (on ? list.filter((s) => s !== status) : [...list, status]))}
                  >
                    {status}
                  </Checkbox>
                ))}
              </fieldset>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>

      <nav className="card ac-fleet" aria-label="Agents">
        {shown.map((agent) => (
          <button key={agent.id} type="button" className="ac-ag" aria-current={selected === agent.id ? "true" : undefined} onClick={() => pick(agent.id)}>
            <span className="row">
              <StatusIndicator tone={statusTone[agent.status]} role="none" label={agent.status} className="small" />
              <span className="small t3 num ac-end">{agent.age}</span>
            </span>
            <span className="mono ac-agid">{agent.id}</span>
            <span className="small t2 trunc" title={agent.taskTitle}>
              {agent.task}
            </span>
            <Pill className="ac-agpill" parts={agent.parts ?? []} />
            <span className="small t3 num">{agent.progress}</span>
          </button>
        ))}
        {idleShown ? (
          <button type="button" className="ac-ag" onClick={() => setView("runs")}>
            <span className="row">
              <StatusIndicator tone="off" role="none" label="Idle" className="small t2" />
            </span>
            <span className="ac-agcount">13 agents</span>
            <span className="small t2 trunc">cache-warm at 05:00</span>
            <span className="ac-agpill ac-agpill--blank" aria-hidden="true" />
            <span className="small co">Show all 18</span>
          </button>
        ) : null}
        {!shown.length && !idleShown ? <span className="small t3 ac-none">No agents match the filter.</span> : null}
      </nav>

      {view === "threads" ? (
        <div className="ac-split">
          <section className="card card-lit ac-thread" aria-labelledby="ac-thread">
            <div className="row ac-thread-head">
              <div className="ac-title ac-title--4">
                <h2 className="h3" id="ac-thread">
                  INC-418 · rollback check
                </h2>
                <span className="small t3 trunc">
                  {mono("ops-agent")} · started 09:12 by Mara Lindqvist · production read-only, staging write
                </span>
              </div>
              <div className="row ac-thread-actions">
                <StatusIndicator tone={runTone} role="status" label={`${runLabel} · step 3 of 5`} className="small ac-mr8" />
                <IconButton
                  finish="ghost"
                  size="sm"
                  aria-label={running ? "Pause run" : "Resume run"}
                  disabled={run === "stopped"}
                  onClick={() => setRun(running ? "paused" : "running")}
                >
                  <D2Icon name={running ? "pause" : "play"} />
                </IconButton>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <IconButton finish="ghost" size="sm" aria-label="More thread actions">
                      <D2Icon name="more" />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onSelect={copyId}>Copy run ID</DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/templates/control-room">Open INC-418 in Control room</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item data-tone="danger" disabled={run === "stopped"} onSelect={() => setRun("stopped")}>
                      Stop run
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>

            <div className="ac-messages">
              <div className="ac-msg">
                <Avatar name="Mara Lindqvist" className="ac-av" />
                <div className="ac-mb">
                  <span className="small row ac-who">
                    <span className="ac-name">Mara Lindqvist</span>
                    <span className="t3 num">09:12</span>
                  </span>
                  <div className="ac-bubble">
                    search-indexer health checks have been timing out in ap-south-1 since the v4.18.0 deploy. Find out whether rolling back to v4.17.3 is safe and draft a plan. Don’t touch production.
                  </div>
                  <span className="row small t2">
                    <Badge className="ac-file">
                      <D2Icon name="file" className="t3" size={13} />
                      incident-418.log<span className="t3 num">2,184 lines</span>
                    </Badge>
                  </span>
                </div>
              </div>

              <div className="ac-msg">
                <span className="logo ac-logo" aria-hidden="true">
                  <span />
                </span>
                <div className="ac-mb">
                  <span className="small row ac-who">
                    <span className="mono ac-agent">ops-agent</span>
                    <Badge>Balanced</Badge>
                    <span className="t3 num">09:12</span>
                  </span>
                  <p>I’ll stay read-only in production. First I’m reading the incident log and comparing the two configs.</p>
                  <div className="ac-well">
                    <div className="ac-wh">
                      <D2Icon name="terminal" size={14} />
                      <span className="ac-whtitle">3 tool calls</span>
                      <span className="num">2 done · 1 running</span>
                    </div>
                    <div className="ac-scroll" role="region" aria-label="Tool calls" tabIndex={0}>
                      <ul className="ac-tcs">
                        <li className="ac-tc">
                          <D2Icon name="check" size={14} className="up" />
                          <span className="co">read_file</span>
                          <span className="trunc">logs/incident-418.log</span>
                          <span className="t3">2,184 lines</span>
                          <span className="t3 ac-r">4.1s</span>
                        </li>
                        <li className="ac-tc">
                          <D2Icon name="check" size={14} className="up" />
                          <span className="co">diff_config</span>
                          <span className="trunc">search-indexer v4.17.3..v4.18.0</span>
                          <span className="t3">1 change</span>
                          <span className="t3 ac-r">11.2s</span>
                        </li>
                        <li className="ac-tc" data-live="">
                          {running ? <Spinner size="sm" label="Running" className="co" /> : <D2Icon name="pause" size={14} className="co" />}
                          <span className="co">replay</span>
                          <span className="trunc" title="staging · profile=ap-south-1 · 1,200 rps · timeout_ms=2000">
                            staging · profile=ap-south-1 · 1,200{NB}rps · timeout_ms=2000
                          </span>
                          <span className="co">{running ? "running" : run}</span>
                          <span className="t3 num ac-r">2m 14s</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p>
                    Found the cause. v4.18.0 lowers {ic("health_check.timeout_ms")} from 2000 to 500. In ap-south-1 the p95 for {ic("/healthz")} is 740{NB}ms, so checks fail there
                    and pass in every other region.
                  </p>
                  <div className="ac-well">
                    <div className="ac-wh">
                      <D2Icon name="file" size={14} />
                      <span className="mono trunc ac-whtitle">config/search-indexer.yaml</span>
                      <span className="t3 ac-hide-xs">v4.17.3 → v4.18.0</span>
                      <span className="num mono up" aria-label="1 line added">+1</span>
                      <span className="num mono dn" aria-label="1 line removed">−1</span>
                    </div>
                    <div className="ac-scroll" role="region" aria-label="Diff of config/search-indexer.yaml" tabIndex={0}>
                      <div className="ac-dg">
                        <span className="ac-dl" data-kind="hunk">
                          <span />
                          <span />
                          <span />
                          <span>@@ -14,5 +14,5 @@ health_check:</span>
                        </span>
                        {[
                          ["14", "14", "", "  path: /healthz"],
                          ["15", "15", "", "  interval_s: 10"],
                          ["16", "", "−", "  timeout_ms: 2000", "del"],
                          ["", "16", "+", "  timeout_ms: 500", "add"],
                          ["17", "17", "", "  unhealthy_threshold: 3"],
                          ["18", "18", "", "  healthy_threshold: 2"]
                        ].map(([a, b, sign, text, kind]) => (
                          <span key={`${a}-${b}`} className="ac-dl" data-kind={kind}>
                            <span>{a}</span>
                            <span>{b}</span>
                            <span>{sign}</span>
                            <span>
                              {kind ? <span className="chrome-visually-hidden">{kind === "add" ? "Added: " : "Removed: "}</span> : null}
                              {text}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p>
                    Next I’m replaying ap-south-1 traffic on staging with {ic("timeout_ms")} back at 2000. If checks pass at production latency, rolling back to v4.17.3 is safe.
                  </p>
                  <div className="ac-well">
                    <div className="ac-wh">
                      <StatusIndicator tone="info" pulse={running} />
                      <span className="ac-whtitle">replay · live output</span>
                      <span className="mono trunc ac-m12">staging · 1,200{NB}rps</span>
                    </div>
                    <pre className="code ac-pre" tabIndex={0} aria-label="Replay output">
                      <span className="c">09:16:02</span>  replay   <span className="a">profile=ap-south-1  rps=1200  timeout_ms=2000</span>
                      {"\n"}
                      <span className="c">09:16:32</span>  healthz  p95=742ms  <span className="a">fail=0/180</span>
                      {"\n"}
                      <span className="c">09:17:02</span>  healthz  p95=738ms  <span className="a">fail=0/180</span>
                      {"\n"}
                      <span className="c">09:17:32</span>  healthz  p95=745ms  <span className="a">fail=0/180</span>
                      {"\n"}
                      <span className="c">09:18:02</span>  healthz  p95=740ms  <span className="a">fail=0/180</span>
                    </pre>
                  </div>
                  <span className="row small t3 ac-gap10">
                    {running ? <Spinner size="sm" label="Replaying" className="ac-spin-muted" /> : <D2Icon name="pause" size={12} />}
                    {running
                      ? `Replaying traffic · 0 failed checks so far · about 3${NB}min left`
                      : run === "paused"
                        ? "Replay paused · 0 failed checks so far"
                        : "Run stopped · 0 failed checks before it stopped"}
                  </span>
                </div>
              </div>

              {sent.map((message) => (
                <div className="ac-msg" key={message.id}>
                  <Avatar name="Mara Lindqvist" className="ac-av" />
                  <div className="ac-mb">
                    <span className="small row ac-who">
                      <span className="ac-name">Mara Lindqvist</span>
                      <span className="t3 num">09:18</span>
                    </span>
                    <div className="ac-bubble">{message.text}</div>
                    {message.files.length ? (
                      <span className="row small t2 ac-wrap">
                        {message.files.map((name) => (
                          <Badge key={name} className="ac-file">
                            <D2Icon name="file" className="t3" size={13} />
                            {name}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form className="ac-composer" aria-label="Message ops-agent" onSubmit={send}>
              <Textarea
                ref={textRef}
                size="lg"
                resize="none"
                rows={2}
                aria-label="Message to ops-agent"
                placeholder="Ask a follow-up, or type / for commands"
                value={draft}
                onValueChange={setDraft}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) send(event);
                }}
              />
              <div className="row ac-composer-row">
                <IconButton finish="ghost" size="sm" type="button" aria-label="Attach files" onClick={() => fileInput.current?.click()}>
                  <D2Icon name="attach" />
                </IconButton>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  onChange={(event) => {
                    const names = Array.from(event.currentTarget.files ?? [], (file) => file.name);
                    setFiles((list) => [...list, ...names.filter((name) => !list.includes(name))]);
                    event.currentTarget.value = "";
                  }}
                />
                {files.map((name) => (
                  <Badge key={name} className="ac-attach">
                    {name}
                    <IconButton finish="ghost" size="sm" type="button" className="ac-attach-x" aria-label={`Remove ${name}`} onClick={() => setFiles((list) => list.filter((f) => f !== name))}>
                      <D2Icon name="close" size={12} />
                    </IconButton>
                  </Badge>
                ))}
                <span className="ac-f1" />
                <span className="small t3" aria-hidden="true">
                  Model
                </span>
                <SegmentedControl
                  aria-label="Model"
                  items={[
                    { value: "fast", label: "Fast" },
                    { value: "balanced", label: "Balanced" },
                    { value: "deep", label: "Deep" }
                  ]}
                  value={model}
                  onValueChange={setModel}
                />
                <IconButton finish="cobalt" type="submit" aria-label="Send message">
                  <D2Icon name="arrow-up" style={{ strokeWidth: 2 }} />
                </IconButton>
              </div>
            </form>
          </section>

          <aside className="card ac-details" aria-labelledby="ac-run">
            <div className="hd">
              <h2 className="h3" id="ac-run">
                Run details
              </h2>
              <span className="row ac-gap2">
                <span className="mono t3 ac-m12">run_7f3a21c9</span>
                <IconButton finish="ghost" size="sm" aria-label={copied ? "Run ID copied" : "Copy run ID"} className="ac-copy" onClick={copyId}>
                  <D2Icon name={copied ? "check" : "copy"} size={14} />
                </IconButton>
              </span>
            </div>
            <div>
              <div className="ac-kvr">
                <span className="t3">Status</span>
                <StatusIndicator tone={runTone} role="none" label={runLabel} />
              </div>
              <div className="ac-kvr">
                <span className="t3">Started</span>
                <span className="num">09:12:40 by Mara</span>
              </div>
              <div className="ac-kvr">
                <span className="t3">Duration</span>
                <span className="num">5m 36s</span>
              </div>
              <div className="ac-kvr">
                <span className="t3">Model</span>
                <span>Balanced</span>
              </div>
              <div className="ac-kvr">
                <span className="t3">Scope</span>
                <span className="row ac-gap4">
                  <Badge>prod:read</Badge>
                  <Badge tone="new">staging:write</Badge>
                </span>
              </div>
            </div>
            <div className="ac-group">
              <span className="hd">
                <span className="ac-sl">Plan</span>
                <span className="small t3 num">3 of 5</span>
              </span>
              <Pill parts={[[60, "cobalt"]]} label="Plan progress" />
              <PlanSteps run={run} approval={approval} onApproval={setApproval} />
            </div>
            <div className="ac-group">
              <span className="hd">
                <span className="ac-sl">Tokens</span>
                <span className="small num">192,260</span>
              </span>
              <Pill parts={[[73.4, "graphite"], [21.4, "cobalt"], [5.1]]} />
              <div className="small ac-legend">
                <span className="hd">
                  <span className="row t3 ac-gap6">
                    <ChartSwatch kind="square" finish="smoked" />
                    Input, cached
                  </span>
                  <span className="num">141,200</span>
                </span>
                <span className="hd">
                  <span className="row t3 ac-gap6">
                    <ChartSwatch kind="square" finish="cobalt" />
                    Input, new
                  </span>
                  <span className="num">41,200</span>
                </span>
                <span className="hd">
                  <span className="row t3 ac-gap6">
                    <ChartSwatch kind="square" finish="silver" />
                    Output
                  </span>
                  <span className="num">9,860</span>
                </span>
              </div>
            </div>
            <div className="ac-group">
              <span className="hd">
                <span className="ac-sl">Cost</span>
                <span className="small num">
                  <span className="ac-hi">$0.71</span> <span className="t3">of $5.00 cap</span>
                </span>
              </span>
              <Pill parts={[[14.2]]} />
            </div>
            <div className="ac-col">
              <span className="ac-sl ac-pb8">Linked</span>
              <Link className="ac-f ac-f--link" to="/templates/control-room">
                <Badge tone="bad" className="ac-kind">
                  SEV-1
                </Badge>
                <span className="ac-linked">
                  <span className="mono ac-hi">INC-418</span>
                  <span className="small t3 trunc">search-indexer health checks timing out</span>
                </span>
              </Link>
              <Link className="ac-f ac-f--link" to="/templates/control-room">
                <Badge className="ac-kind">deploy</Badge>
                <span className="ac-linked">
                  <span className="mono ac-hi">search-indexer v4.18.0</span>
                  <span className="small trunc">
                    <span className="dn">Failed</span> <span className="t3">· ap-south-1 · 08:40</span>
                  </span>
                </span>
              </Link>
            </div>
            <div className="ac-col">
              <span className="hd ac-pb8">
                <span className="ac-sl">Files touched</span>
                <span className="small t3 num">4</span>
              </span>
              <ul className="ac-files">
                <FileRow kind="read" path="logs/incident-418.log" />
                <FileRow kind="read" path="config/search-indexer.yaml" />
                <FileRow kind="write" path="staging/replay/ap-south-1-2026-11-16.json" />
                <FileRow kind="next" path="runbooks/rollback.md" />
              </ul>
            </div>
            <div className="row ac-details-foot">
              <Button finish="graphite" size="sm" className="ac-f1" disabled={run === "stopped"} onClick={() => setRun(running ? "paused" : "running")}>
                {running ? "Pause" : "Resume"}
              </Button>
              <Button finish="ghost" size="sm" className="ac-f1 ac-stop" disabled={run === "stopped"} onClick={() => setRun("stopped")}>
                {run === "stopped" ? "Stopped" : "Stop run"}
              </Button>
            </div>
            <span className="chrome-visually-hidden" role="status">
              {copied ? "Run ID copied" : ""}
            </span>
          </aside>
        </div>
      ) : view === "runs" ? (
        <section className="card ac-list" aria-labelledby="ac-runs">
          <div className="hd ac-list-head">
            <h2 className="h3" id="ac-runs">
              Runs
            </h2>
            <span className="small t3">3 running · 1 queued · 1 failed today</span>
          </div>
          <Table aria-label="Runs" className="ac-tbl">
            <thead>
              <tr>
                <th scope="col">Agent</th>
                <th scope="col">Task</th>
                <th scope="col">Status</th>
                <th scope="col">Progress</th>
                <th scope="col" className="r">
                  Age
                </th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((agent) => (
                <tr key={agent.id} aria-current={selected === agent.id ? "true" : undefined} data-current={selected === agent.id || undefined}>
                  <td>
                    <button type="button" className="ac-rowbtn mono" onClick={() => pick(agent.id)}>
                      {agent.id}
                    </button>
                  </td>
                  <td className="t2">{agent.task}</td>
                  <td>
                    <StatusIndicator tone={statusTone[agent.status]} role="none" label={agent.status} />
                  </td>
                  <td className="t3 num">{agent.progress}</td>
                  <td className="r num t3">{agent.age}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <span className="small t3 ac-list-foot">13 idle agents · next scheduled run: cache-warm at 05:00</span>
        </section>
      ) : (
        <section className="card ac-list" aria-labelledby="ac-schedules">
          <div className="hd ac-list-head">
            <h2 className="h3" id="ac-schedules">
              Schedules
            </h2>
            <span className="small t3">3 scheduled agents</span>
          </div>
          <Table aria-label="Schedules" className="ac-tbl">
            <thead>
              <tr>
                <th scope="col">Agent</th>
                <th scope="col">Runs</th>
                <th scope="col">Last run</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((row) => (
                <tr key={row.agent}>
                  <td className="mono">{row.agent}</td>
                  <td className="t2">{row.when}</td>
                  <td>
                    <StatusIndicator tone={row.tone} role="none" label={row.last} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}
    </AppShell>
  );
}

function FileRow({ kind, path }: { kind: "read" | "write" | "next"; path: ReactNode }) {
  return (
    <li className="ac-f" data-kind={kind}>
      <Badge tone={kind === "write" ? "new" : "neutral"} className="ac-kind">
        {kind}
      </Badge>
      <span className="mono trunc ac-f1" title={typeof path === "string" ? path : undefined}>
        {path}
      </span>
    </li>
  );
}
