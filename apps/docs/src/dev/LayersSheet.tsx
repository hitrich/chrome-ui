import {
  Accordion,
  Avatar,
  Button,
  ChromeProvider,
  CommandPalette,
  ContextMenu,
  Divider,
  Drawer,
  HoverCard,
  Popover,
  SegmentedControl,
  StatusIndicator,
  TreeView,
  type CommandPaletteGroup,
  type TreeViewNode
} from "@loreanai/chrome-ui";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const css = `
.ls{min-height:100vh;padding:32px 24px 96px;background:var(--chrome-bg);font-family:var(--chrome-font-sans)}
.ls h1{margin:0 0 24px;font-size:20px;font-weight:500}
.ls__cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(560px,100%),1fr));gap:24px;align-items:start}
.ls__island{display:flex;flex-direction:column;gap:20px;padding:24px;border-radius:24px;background:var(--chrome-bg);min-width:0}
.ls__h{margin:0;font:500 11px/16px var(--chrome-font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--chrome-text-3)}
.ls__grid{display:flex;flex-wrap:wrap;gap:16px}
.ls__cell{display:flex;flex-direction:column;gap:8px;min-width:0}
.ls__stage{position:relative;width:242px;max-width:100%;height:192px;padding:16px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:8px;overflow:hidden;
  background:linear-gradient(180deg,#d9dbdb 0%,#e4e5e5 38%,#e9eaea 100%);box-shadow:inset 0 1px 3px rgba(0,0,0,.14),inset 0 -1px 0 rgba(255,255,255,.85)}
.ls__island[data-chrome-theme="ink"] .ls__stage{background:radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px) 0 0/14px 14px,#0b0b0d;box-shadow:inset 0 1px 3px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,255,255,.05)}
.ls__stage--wide{width:512px;height:320px}
.ls__live{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:16px;border-radius:18px;border:1px solid var(--chrome-line)}
:is(.ls,.chrome-portal-layer) .v{display:flex;flex-direction:column;gap:8px}
:is(.ls,.chrome-portal-layer) .h{display:flex;align-items:center;gap:8px}
:is(.ls,.chrome-portal-layer) .sm{font-size:12.5px;line-height:18px}
:is(.ls,.chrome-portal-layer) .xs{font-size:12px;line-height:16px}
:is(.ls,.chrome-portal-layer) .b{font-weight:600}
:is(.ls,.chrome-portal-layer) .t2{color:var(--chrome-text-2)}
:is(.ls,.chrome-portal-layer) .t3{color:var(--chrome-text-3)}
:is(.ls,.chrome-portal-layer) .mono{font-family:var(--chrome-font-mono)}
:is(.ls,.chrome-portal-layer) .num{font-variant-numeric:tabular-nums}
:is(.ls,.chrome-portal-layer) .link{color:var(--chrome-cobalt-text);text-decoration:underline;text-underline-offset:2px}
.chrome-root{--ls-ok:var(--chrome-mint);--ls-bz:0 0 0 .75px rgba(0,0,0,.6),0 -.5px 0 1.75px #686b6c,0 .5px 0 1.75px #1e2021}
.chrome-root[data-chrome-theme="satin"]{--ls-ok:#0d7c55;--ls-bz:0 0 0 .75px rgba(0,0,0,.3),0 -.5px 0 1.75px #fbfbfb,0 .5px 0 1.75px #949b9a}
.ls-lamp{display:block;width:6px;height:6px;border-radius:50%;flex:none;color:var(--ls-ok);box-shadow:var(--ls-bz);
  background:radial-gradient(circle at 50% 28%,rgba(255,255,255,.85),rgba(255,255,255,0) 1.4px),radial-gradient(circle at 50% 45%,currentColor 50%,color-mix(in srgb,currentColor 82%,#000))}
.ls-lamp[data-tone="bad"]{color:var(--chrome-enamel)}
.ls .ls-target{display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border:1px solid transparent;border-radius:8px}
.ls .ls-sk{display:block;height:8px;border-radius:4px;background:linear-gradient(180deg,#cdd0d0,#d9dbdb);box-shadow:inset 0 1px 1px rgba(0,0,0,.1),0 1px 0 rgba(255,255,255,.8)}
.ls__island[data-chrome-theme="ink"] .ls-sk{background:linear-gradient(180deg,#1a1b1d,#202124);box-shadow:inset 0 1px 1px rgba(0,0,0,.6)}
.ls .ls-kv{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:2px 0 0}
.ls .ls-kv dt{color:var(--chrome-text-3)}.ls .ls-kv dd{margin:0}
.ls .ls-fill{display:flex}.ls .ls-fill>button{flex:1}
.ls .ls-ntf{display:flex;align-items:center;gap:10px;padding:9px 14px}
.ls .ls-ntf+.ls-ntf{border-top:1px solid var(--chrome-line)}
`;

function Icon({ children }: { children: ReactNode }) {
  // attributes, not sheet CSS: portalled layers render outside .ls
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const icons = {
  rotate: <Icon><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></Icon>,
  pause: <Icon><path d="M9 5v14M15 5v14" /></Icon>,
  layers: <Icon><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></Icon>,
  terminal: <Icon><path d="m4 17 6-5-6-5M12 19h8" /></Icon>,
  copy: <Icon><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></Icon>,
  trash: <Icon><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icon>,
  clock: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  upload: <Icon><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></Icon>,
  folder: <Icon><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></Icon>,
  branch: <Icon><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 8v8M18 10c0 4-6 3-10 6" /></Icon>,
  bell: <Icon><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></Icon>
};

const Lamp = ({ tone = "ok" }: { tone?: "ok" | "bad" }) => <span className="ls-lamp" data-tone={tone} />;

const paletteGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back v4.18.0", icon: icons.rotate, shortcut: "↵" },
      { id: "pause", label: "Pause rollout", icon: icons.pause },
      { id: "restart", label: "Rolling restart", icon: icons.layers },
      { id: "deploy", label: "Deploy billing-worker", icon: icons.upload, shortcut: ["⌘", "↵"] }
    ]
  },
  {
    label: "Services",
    items: [
      { id: "svc-billing", label: "billing-worker", icon: <Lamp />, mono: true, meta: "us-east-2" },
      { id: "svc-search", label: "search-indexer", icon: <Lamp tone="bad" />, mono: true, meta: "ap-south-1" }
    ]
  }
];

const barGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback-bill", label: "Roll back billing-worker to v4.17.2", icon: icons.rotate },
      { id: "deploy-bill", label: "Deploy billing-worker to production", icon: icons.upload, shortcut: ["⌘", "↵"] },
      { id: "pause", label: "Pause rollout", icon: icons.pause }
    ]
  },
  {
    label: "Services",
    items: [
      { id: "svc-billing", label: "billing-worker", icon: <Lamp />, mono: true, meta: "us-east-2 · v4.17.3" },
      { id: "svc-search", label: "search-indexer", icon: <Lamp tone="bad" />, mono: true, meta: "ap-south-1 · v4.18.0" }
    ]
  }
];

const tree: TreeViewNode[] = [
  {
    id: "orbital-ops",
    label: "orbital-ops",
    icon: icons.folder,
    children: [
      {
        id: "services",
        label: "services",
        icon: icons.folder,
        children: [
          { id: "api-gateway", label: "api-gateway", icon: <Lamp /> },
          { id: "billing-worker", label: "billing-worker", icon: <Lamp /> },
          { id: "search-indexer", label: "search-indexer", icon: <Lamp tone="bad" /> }
        ]
      },
      {
        id: "agents",
        label: "agents",
        icon: icons.folder,
        meta: "3",
        children: [
          { id: "ops-agent", label: "ops-agent", icon: <Lamp /> },
          { id: "triage-agent", label: "triage-agent", icon: <Lamp /> },
          { id: "cost-agent", label: "cost-agent", icon: <Lamp /> }
        ]
      }
    ]
  }
];

function Cell({ label, wide, style, children }: { label: string; wide?: boolean; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className="ls__cell">
      <div className={wide ? "ls__stage ls__stage--wide" : "ls__stage"} style={style}>{children}</div>
      <h3 className="ls__h">{label}</h3>
    </div>
  );
}

function Previews() {
  return (
    <div className="ls__grid">
      <Cell label="Command Palette">
        <CommandPalette inline size="sm" defaultQuery="roll" groups={paletteGroups} label="Command palette preview" />
      </Cell>

      <Cell label="Context Menu" style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <ContextMenu.Root inline>
            <ContextMenu.Trigger asChild>
              <div className="ls-target">
                <Lamp tone="bad" />
                <span className="mono xs" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>search-indexer</span>
                <span className="xs t3 num">380&nbsp;ms</span>
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content style={{ position: "absolute", left: 44, top: 22, width: 164, minWidth: 0 }}>
              <ContextMenu.Item icon={icons.terminal} shortcut="L" data-highlighted="">Open logs</ContextMenu.Item>
              <ContextMenu.Item icon={icons.copy}>Copy service ID</ContextMenu.Item>
              <ContextMenu.Item icon={icons.rotate}>Restart</ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item icon={icons.trash} destructive>Delete service</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
          <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" style={{ position: "absolute", left: 38, top: 15 }}>
            <path d="M1 1v14l4-3.5 2.6 5.5 2.2-1-2.6-5.4H13z" fill="#202222" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
      </Cell>

      <Cell label="Drawer">
        <div className="v" style={{ position: "absolute", top: 16, left: 16, right: 16, gap: 10 }} aria-hidden="true">
          {[36, 120, 38, 120, 28].map((width, index) => <span key={index} className="ls-sk" style={{ width, height: index === 0 ? 10 : 8 }} />)}
        </div>
        <Drawer.Root inline>
          <Drawer.Content>
            <Drawer.Header eyebrow="INC-418">
              <Drawer.Title>Indexer timeouts</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <StatusIndicator tone="danger" label={<>SEV-1 · <span className="num">14&nbsp;min</span></>} />
              <dl className="ls-kv xs">
                <dt>Owner</dt><dd>M. Lindqvist</dd>
                <dt>Region</dt><dd className="mono">ap-south-1</dd>
              </dl>
            </Drawer.Body>
            <Drawer.Footer>
              <Button finish="graphite" size="sm">Open runbook</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>
      </Cell>

      <Cell label="Hover Card">
        <div className="v" style={{ width: "100%", gap: 12, marginTop: -6 }}>
          <HoverCard.Root inline>
            <span className="sm">Assigned to <HoverCard.Trigger asChild><a className="link" href="/templates/settings">@rafael</a></HoverCard.Trigger></span>
            <HoverCard.Content arrowOffset={94} style={{ width: "100%" }}>
              <div className="h" style={{ gap: 10 }}>
                <Avatar name="Rafael Achebe" style={{ width: 36, height: 36, fontSize: 12 }} />
                <span className="v" style={{ gap: 0 }}>
                  <span className="sm b">Rafael Achebe</span>
                  <span className="xs t3">SRE lead · Lisbon</span>
                </span>
              </div>
              <Divider />
              <span className="h xs" style={{ justifyContent: "space-between" }}>
                <StatusIndicator tone="success" label="On call until 18:00" />
                <span className="t3 num">14:32</span>
              </span>
            </HoverCard.Content>
          </HoverCard.Root>
        </div>
      </Cell>

      <Cell label="Popover">
        <div className="v" style={{ alignItems: "center", gap: 10 }}>
          <Popover.Root inline>
            <Popover.Trigger asChild>
              <Button finish="graphite" size="sm">{icons.clock}Snooze</Button>
            </Popover.Trigger>
            <Popover.Content style={{ width: 184 }} aria-label="Snooze cache-warm">
              <span className="sm b">Snooze <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>cache-warm</span></span>
              <span className="xs t2">Pages resume when it ends.</span>
              <SegmentedControl
                className="ls-fill"
                style={{ marginTop: 6 }}
                aria-label="Snooze for"
                defaultValue="1h"
                items={[{ value: "30m", label: "30m" }, { value: "1h", label: "1h" }, { value: "4h", label: "4h" }]}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
      </Cell>

      <Cell label="Tree View">
        <TreeView
          aria-label="Workspace"
          items={tree}
          defaultExpanded={["orbital-ops", "services"]}
          defaultSelected="search-indexer"
          style={{ width: "100%" }}
        />
      </Cell>

      <Cell label="Accordion">
        <Accordion.Root type="single" collapsible defaultValue="triggers" style={{ width: "100%" }}>
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
      </Cell>

      <Cell label="Popover · flush (Notification Center)" wide style={{ justifyContent: "flex-end" }}>
        <div className="v" style={{ alignItems: "flex-end" }}>
          <Popover.Root inline>
            <Popover.Trigger asChild>
              <Button finish="graphite" size="sm" aria-label="Notifications, 2 unread">{icons.bell}</Button>
            </Popover.Trigger>
            <Popover.Content flush arrow={false} style={{ width: 360 }} aria-label="Notifications">
              <div className="h" style={{ height: 42, padding: "0 14px", borderBottom: "1px solid var(--chrome-line)" }}>
                <span className="sm b">Notifications</span>
              </div>
              <div className="ls-ntf"><Avatar name="Rafael Achebe" size="sm" /><span className="sm"><b>Rafael Achebe</b> assigned you INC-418</span></div>
              <div className="ls-ntf"><Avatar name="Priya Raman" size="sm" /><span className="sm"><b>Priya Raman</b> commented on the v4.18.0 rollout</span></div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </Cell>

      <Cell label="Command Bar (block)" wide>
        <CommandPalette inline footer defaultQuery="deploy bill" groups={barGroups} label="Command bar preview" style={{ width: 404 }} />
      </Cell>
    </div>
  );
}

function Live({ hotkey }: { hotkey: boolean }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ran, setRan] = useState("nothing yet");

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  return (
    <div className="ls__live">
      <Button finish="graphite" size="sm" onClick={() => setPaletteOpen(true)}>Command palette{hotkey ? " ⌘K" : ""}</Button>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={barGroups} footer onSelect={(item) => setRan(item.label)} />

      <Drawer.Root>
        <Drawer.Trigger asChild><Button finish="graphite" size="sm">Drawer</Button></Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header eyebrow="INC-418">
            <Drawer.Title>Indexer timeouts</Drawer.Title>
            <Drawer.Description>search-indexer in ap-south-1 is timing out on 38% of queries.</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>
            <StatusIndicator tone="danger" label="SEV-1 · 14 min" />
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild><Button finish="graphite" size="sm">Close</Button></Drawer.Close>
            <Button finish="cobalt" size="sm">Open runbook</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>

      <Popover.Root>
        <Popover.Trigger asChild><Button finish="graphite" size="sm">{icons.clock}Snooze</Button></Popover.Trigger>
        <Popover.Content showClose aria-label="Snooze cache-warm" style={{ width: 200 }}>
          <span className="sm b">Snooze cache-warm</span>
          <span className="xs t2">Pages resume when it ends.</span>
        </Popover.Content>
      </Popover.Root>

      <HoverCard.Root openDelay={200}>
        <span className="sm">Owner <HoverCard.Trigger asChild><a className="link" href="/templates/settings">@mara</a></HoverCard.Trigger></span>
        <HoverCard.Content>
          <span className="sm b">Mara Lindqvist</span>
          <span className="xs t3">Flight director</span>
        </HoverCard.Content>
      </HoverCard.Root>

      <ContextMenu.Root>
        <ContextMenu.Trigger className="ls-target xs" style={{ border: "1px dashed var(--chrome-line-2)" }}>Right-click this row</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item icon={icons.terminal} shortcut="L" onSelect={() => setRan("Open logs")}>Open logs</ContextMenu.Item>
          <ContextMenu.Item icon={icons.copy}>Copy service ID</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger icon={icons.branch}>Move to region</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>us-east-2</ContextMenu.Item>
              <ContextMenu.Item>eu-west-1</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
          <ContextMenu.Separator />
          <ContextMenu.Item icon={icons.trash} destructive>Delete service</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>

      <span className="xs t3" role="status">Last command: {ran}</span>
    </div>
  );
}

function Island({ title }: { title: string }) {
  return (
    <>
      <h2 className="ls__h">{title}</h2>
      <Previews />
      <h2 className="ls__h">Live</h2>
      <Live hotkey={title === "Satin"} />
    </>
  );
}

export default function Page() {
  return (
    <main className="ls">
      <style>{css}</style>
      <h1>Layers sheet</h1>
      <div className="ls__cols">
        <ChromeProvider theme="satin" className="ls__island"><Island title="Satin" /></ChromeProvider>
        <ChromeProvider theme="ink" className="ls__island"><Island title="Ink" /></ChromeProvider>
      </div>
    </main>
  );
}
