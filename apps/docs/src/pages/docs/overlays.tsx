import {
  Avatar,
  Button,
  CommandPalette,
  ContextMenu,
  Dialog,
  Divider,
  Drawer,
  DropdownMenu,
  HoverCard,
  IconButton,
  KeyHint,
  Popover,
  SegmentedControl,
  StatusIndicator,
  Toast,
  Tooltip,
  type CommandPaletteGroup
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { G } from "./glyphs";
import type { ComponentDoc } from "./types";

const AA = "WCAG 2.2 AA";
// Portalled layers render outside .pg-doc, so their inner layout is inline.
const stack = { display: "flex", flexDirection: "column", gap: 8 } as const;
const actions = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 } as const;

const paletteGroups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back v4.18.0", icon: <G name="rerun" size={14} />, shortcut: "↵" },
      { id: "pause", label: "Pause rollout", icon: <Icon name="layers" size={14} /> },
      { id: "deploy", label: "Deploy billing-worker", icon: <Icon name="arrow-up-right" size={14} />, shortcut: ["⌘", "↵"] }
    ]
  },
  {
    label: "Services",
    items: [
      { id: "billing-worker", label: "billing-worker", icon: <StatusIndicator tone="ok" />, mono: true, meta: "us-east-2" },
      { id: "search-indexer", label: "search-indexer", icon: <StatusIndicator tone="bad" />, mono: true, meta: "ap-south-1" }
    ]
  }
];

function LivePalette() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState<string | null>(null);
  return (
    <div style={{ ...stack, alignItems: "center" }}>
      <Button onClick={() => setOpen(true)} trailingIcon={<KeyHint keys={["⌘", "K"]} />}>
        Open command palette
      </Button>
      <span className="small t3" role="status">{ran ? `Ran “${ran}”` : "Nothing run yet"}</span>
      <CommandPalette groups={paletteGroups} open={open} onOpenChange={setOpen} onSelect={(item) => setRan(item.label)} footer />
    </div>
  );
}

function LiveContextMenu() {
  const [last, setLast] = useState("Right-click the row, or focus it and press Shift+F10");
  return (
    <div style={{ ...stack, alignItems: "center" }}>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div className="doc-target" tabIndex={0} aria-label="search-indexer, 380 ms, has a context menu">
            <StatusIndicator tone="bad" />
            <span className="mono">search-indexer</span>
            <span className="t3 num">380&nbsp;ms</span>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item icon={<G name="terminal" size={14} />} shortcut="L" onSelect={() => setLast("Opened logs")}>Open logs</ContextMenu.Item>
          <ContextMenu.Item icon={<G name="copy" size={14} />} onSelect={() => setLast("Copied the service ID")}>Copy service ID</ContextMenu.Item>
          <ContextMenu.Item icon={<G name="rerun" size={14} />} onSelect={() => setLast("Restart queued")}>Restart</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item icon={<G name="trash" size={14} />} destructive onSelect={() => setLast("Delete needs a second confirmation")}>Delete service</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      <span className="small t3" role="status">{last}</span>
    </div>
  );
}

function LiveDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button finish="enamel">Roll back…</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Roll back v4.18.0?</Dialog.Title>
        <Dialog.Description>billing-worker returns to v4.17.3 in all 5 regions.</Dialog.Description>
        <div style={actions}>
          <Dialog.Close asChild>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button finish="enamel" onClick={() => setOpen(false)}>Roll back</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function LiveDrawer({ side }: { side: "left" | "right" }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button size="sm">{side === "left" ? "Open from the left" : "Open from the right"}</Button>
      </Drawer.Trigger>
      <Drawer.Content side={side}>
        <Drawer.Header eyebrow="INC-418">
          <Drawer.Title>Indexer timeouts</Drawer.Title>
          <Drawer.Description>ap-south-1 health checks have timed out for 14&nbsp;min.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <StatusIndicator tone="bad" label="SEV-1 · 14 min" />
          <span className="small">Owner: M. Lindqvist</span>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="sm" finish="ghost">Close</Button>
          </Drawer.Close>
          <Button size="sm">Open runbook</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}

function LiveDropdown() {
  const [region, setRegion] = useState("eu-west-1");
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button finish="ghost" leadingIcon={<Avatar name="Mara Lindqvist" size="sm" />}>Mara Lindqvist</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" style={{ minWidth: 200 }}>
        <DropdownMenu.Label>Flight director</DropdownMenu.Label>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Shortcuts</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Home region</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={region} onValueChange={setRegion}>
          {["eu-west-1", "us-east-2", "ap-south-1"].map((value) => (
            <DropdownMenu.RadioItem key={value} value={value}>{value}</DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.Item data-tone="danger">Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function LiveHoverCard() {
  return (
    <span className="small">
      Assigned to{" "}
      <HoverCard.Root openDelay={300}>
        <HoverCard.Trigger asChild>
          <a className="link" href="/templates/settings">@rafael</a>
        </HoverCard.Trigger>
        <HoverCard.Content style={{ width: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="Rafael Achebe" size="lg" />
            <span style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ fontSize: 13, fontWeight: 600 }}>Rafael Achebe</strong>
              <span style={{ fontSize: 12, color: "var(--chrome-text-3)" }}>SRE lead · Lisbon</span>
            </span>
          </div>
          <Divider />
          <StatusIndicator tone="ok" label="On call until 18:00" />
        </HoverCard.Content>
      </HoverCard.Root>
    </span>
  );
}

function LivePopover() {
  const [snooze, setSnooze] = useState("1h");
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button size="sm" leadingIcon={<Icon name="bell" size={14} />}>Snooze</Button>
      </Popover.Trigger>
      <Popover.Content style={{ width: 200 }} aria-label="Snooze cache-warm" showClose>
        <div style={stack}>
          <strong style={{ fontSize: 13, fontWeight: 600 }}>Snooze cache-warm</strong>
          <span style={{ fontSize: 12, color: "var(--chrome-text-2)" }}>Pages resume when it ends.</span>
          <SegmentedControl
            aria-label="Snooze for"
            value={snooze}
            onValueChange={setSnooze}
            items={["30m", "1h", "4h"].map((value) => ({ value, label: value }))}
          />
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

function LiveToast() {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  return (
    <Toast.Provider swipeDirection="right">
      <Button
        onClick={() => {
          setPaused(true);
          setOpen(false);
          window.setTimeout(() => setOpen(true), 30);
        }}
      >
        {paused ? "Rollout paused" : "Pause rollout"}
      </Button>
      <Toast.Root open={open} onOpenChange={setOpen}>
        <Toast.Title>Rollout paused</Toast.Title>
        <Toast.Description>v4.18.0 at 62%</Toast.Description>
        <Toast.Action altText="Undo pausing the rollout" onClick={() => setPaused(false)}>Undo</Toast.Action>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

function LiveTooltip() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="mono small">a41f9c2</span>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton size="sm" finish="ghost" aria-label="Copy commit SHA"><G name="copy" size={14} /></IconButton>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Copy commit SHA <KeyHint keys={["⌘", "C"]} />
        </Tooltip.Content>
      </Tooltip.Root>
    </span>
  );
}

const live = (title: string, label: string, node: ReactNode, text?: string) => ({ id: "live", title, text, samples: [{ label, node }] });

export const overlayDocs: Record<string, ComponentDoc> = {
  "command-palette": {
    tags: ["Radix Dialog", "New", AA],
    imports: ["CommandPalette"],
    code: `import { useEffect, useState } from "react";
import { CommandPalette, type CommandPaletteGroup } from "@loreanai/chrome-ui";
import { Pause, RotateCcw, Upload } from "./icons";

const groups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back v4.18.0", icon: <RotateCcw />, shortcut: "↵" },
      { id: "pause", label: "Pause rollout", icon: <Pause /> },
      { id: "deploy", label: "Deploy billing-worker", icon: <Upload />, shortcut: ["⌘", "↵"] }
    ]
  },
  {
    label: "Services",
    items: [{ id: "search-indexer", label: "search-indexer", mono: true, meta: "ap-south-1" }]
  }
];

export function Commands({ run }: { run: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return <CommandPalette groups={groups} open={open} onOpenChange={setOpen} onSelect={(item) => run(item.id)} footer />;
}`,
    sections: [live("Try it", "open · footer", <LivePalette />, "The palette has no hotkey of its own: bind ⌘K in your app, as the Code view above shows.")],
    props: [
      {
        extends: "A Radix `Dialog` with a search field and a listbox; matching is an OR over the query words, matched words in bold.",
        rows: [
          { name: "groups", type: "readonly CommandPaletteGroup[]", description: "`{ id?, label, items }`; items are `{ id, label, icon?, shortcut?, meta?, keywords?, mono?, disabled? }`." },
          { name: "open", type: "boolean", description: "Controlled visibility." },
          { name: "defaultOpen", type: "boolean", default: "false", description: "Starts open when uncontrolled." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on open, Escape, outside click and after a run." },
          { name: "onSelect", type: "(item: CommandPaletteItem) => void", description: "Runs the chosen item (Enter or click); the palette then closes." },
          { name: "defaultQuery", type: "string", default: '""', description: "Starting query." },
          { name: "placeholder", type: "string", default: '"Search actions and services…"', description: "Search field placeholder." },
          { name: "label", type: "string", default: '"Command palette"', description: "Accessible name of the dialog, field and list." },
          { name: "emptyMessage", type: "ReactNode", default: "“No results for …”", description: "Shown when nothing matches." },
          { name: "footer", type: "boolean", default: "false", description: "Keyboard hints and the result count under the list." },
          { name: "size", type: '"sm" | "md"', default: '"md"', description: "`sm` is the catalog-card palette." },
          { name: "inline", type: "boolean", default: "false", description: "Renders open in place, without portal or scrim (previews)." }
        ]
      }
    ],
    a11y: [
      { keys: ["↑", "↓"], text: "Move through results, wrapping at the ends; the list scrolls, the page does not." },
      { keys: ["Enter", "Esc"], text: "Enter runs the highlighted item. Escape closes and returns focus to where it was." },
      { badge: "listbox", text: "Options carry `aria-selected`; the result count is a polite status after each keystroke." }
    ]
  },

  "context-menu": {
    tags: ["Radix Context Menu", "New", AA],
    imports: ["ContextMenu"],
    code: `import { ContextMenu } from "@loreanai/chrome-ui";
import { Copy, RotateCw, Terminal, Trash } from "./icons";

export function ServiceRow({ name, onRestart }: { name: string; onRestart: () => void }) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div tabIndex={0}>{name}</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item icon={<Terminal />} shortcut="L">Open logs</ContextMenu.Item>
        <ContextMenu.Item icon={<Copy />} onSelect={() => navigator.clipboard.writeText(name)}>Copy service ID</ContextMenu.Item>
        <ContextMenu.Item icon={<RotateCw />} onSelect={onRestart}>Restart</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item icon={<Trash />} destructive>Delete service</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}`,
    sections: [live("Try it", "right-click", <LiveContextMenu />)],
    props: [
      {
        part: "ContextMenu.Root",
        extends: "Radix `ContextMenu.Root` (`onOpenChange`, `modal`, `dir`).",
        rows: [{ name: "inline", type: "boolean", default: "false", description: "Renders the menu open in place as static markup (previews)." }]
      },
      {
        part: "ContextMenu.Trigger",
        extends: "Radix `ContextMenu.Trigger`; the target gets a cobalt wash while its menu is open.",
        rows: [
          { name: "asChild", type: "boolean", default: "false", description: "Use your own row element as the target." },
          { name: "disabled", type: "boolean", default: "false", description: "Lets the browser menu through." }
        ]
      },
      {
        part: "ContextMenu.Item",
        extends: "Radix `ContextMenu.Item`. `Content`, `Separator`, `Label`, `Group`, `Sub`, `SubTrigger` (with `icon`) and `SubContent` wrap their Radix parts.",
        rows: [
          { name: "icon", type: "ReactNode", description: "Leading glyph." },
          { name: "shortcut", type: "string | readonly string[]", description: "Keycaps at the right; an array is one chord." },
          { name: "destructive", type: "boolean", default: "false", description: "Enamel text for actions that destroy something." },
          { name: "onSelect", type: "(event: Event) => void", description: "Runs the action; the menu then closes." },
          { name: "disabled", type: "boolean", default: "false", description: "Skips the item." }
        ]
      }
    ],
    a11y: [
      { keys: [["⇧", "F10"]], text: "Shift+F10 or the Menu key opens it on a focused target; long press does on touch." },
      { keys: ["↑", "↓", "Enter"], text: "Move through items and run one; typing jumps to a match. Escape closes." },
      { badge: "elsewhere", text: "A context menu is hidden by nature: offer the same actions in a visible row menu too." }
    ]
  },

  dialog: {
    tags: ["Radix Dialog", AA],
    imports: ["Button", "Dialog"],
    code: `import { Button, Dialog } from "@loreanai/chrome-ui";

export function RollbackDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button finish="enamel">Roll back…</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Roll back v4.18.0?</Dialog.Title>
        <Dialog.Description>billing-worker returns to v4.17.3 in all 5 regions.</Dialog.Description>
        <div className="dialog-actions">
          <Dialog.Close asChild>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button finish="enamel" onClick={onConfirm}>Roll back</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}`,
    sections: [live("Try it", "enamel confirm", <LiveDialog />, "There is no footer part: lay the actions out in your own row, safe action first.")],
    props: [
      {
        part: "Dialog.Root",
        extends: "Radix `Dialog.Root`, unchanged.",
        rows: [
          { name: "open", type: "boolean", description: "Controlled state." },
          { name: "defaultOpen", type: "boolean", description: "Starts open when uncontrolled." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on open, close, Escape and outside click." },
          { name: "modal", type: "boolean", default: "true", description: "Traps focus and hides the page from assistive tech." }
        ]
      },
      {
        part: "Dialog.Content",
        extends: "Radix `Dialog.Content` in a portal over the scrim (`onOpenAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside` …). `Trigger`, `Title`, `Description` and `Close` wrap their Radix parts.",
        rows: [{ name: "showClose", type: "boolean", default: "true", description: "The round close button in the corner, named “Close dialog”." }]
      }
    ],
    a11y: [
      { keys: ["Esc"], text: "Closes the dialog and returns focus to the trigger." },
      { keys: ["Tab"], text: "Focus stays inside while it is open and starts on the first control, so put Cancel first." },
      { badge: "aria-modal", text: "Named by `Dialog.Title` and described by `Dialog.Description`; always render both." }
    ]
  },

  drawer: {
    tags: ["Radix Dialog", "New", AA],
    imports: ["Button", "Drawer", "StatusIndicator"],
    code: `import { Button, Drawer, StatusIndicator } from "@loreanai/chrome-ui";

export function IncidentDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button size="sm">Open INC-418</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right">
        <Drawer.Header eyebrow="INC-418">
          <Drawer.Title>Indexer timeouts</Drawer.Title>
          <Drawer.Description>ap-south-1 health checks have timed out for 14 min.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <StatusIndicator tone="bad" label="SEV-1 · 14 min" />
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="sm" finish="ghost">Close</Button>
          </Drawer.Close>
          <Button size="sm">Open runbook</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}`,
    sections: [
      {
        id: "sides",
        title: "Sides",
        text: "A drawer slides in from the right by default; `side=\"left\"` mirrors it for navigation.",
        samples: [
          { label: 'side="left"', node: <LiveDrawer side="left" /> },
          { label: 'side="right"', node: <LiveDrawer side="right" /> }
        ]
      }
    ],
    props: [
      {
        part: "Drawer.Root",
        extends: "Radix `Dialog.Root` (`open`, `defaultOpen`, `onOpenChange`, `modal`).",
        rows: [{ name: "inline", type: "boolean", default: "false", description: "Renders open in place, absolutely positioned in the nearest positioned ancestor, with its own scrim." }]
      },
      {
        part: "Drawer.Content",
        extends: "Radix `Dialog.Content` in a portal; focus returns to the opener on close.",
        rows: [
          { name: "side", type: '"left" | "right"', default: '"right"', description: "Edge it slides from." },
          { name: "showClose", type: "boolean", default: "true", description: "Close button in the corner." }
        ]
      },
      {
        part: "Drawer.Header",
        extends: "`Title`, `Description`, `Body`, `Footer`, `Trigger` and `Close` lay out the panel.",
        rows: [{ name: "eyebrow", type: "ReactNode", description: "Small mono line above the title, such as an incident ID." }]
      }
    ],
    a11y: [
      { keys: ["Esc"], text: "Closes the drawer and returns focus to whatever opened it." },
      { keys: ["Tab"], text: "Focus is trapped in the panel while it is modal." },
      { badge: "dialog", text: "A modal dialog named by its title; the page behind is inert." }
    ]
  },

  "dropdown-menu": {
    tags: ["Radix Dropdown Menu", AA],
    imports: ["Avatar", "Button", "DropdownMenu"],
    code: `import { Avatar, Button, DropdownMenu } from "@loreanai/chrome-ui";

export function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button finish="ghost" leadingIcon={<Avatar name="Mara Lindqvist" size="sm" />}>Mara Lindqvist</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>Flight director</DropdownMenu.Label>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Shortcuts</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item data-tone="danger" onSelect={onSignOut}>Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}`,
    sections: [live("Try it", "with a radio group", <LiveDropdown />)],
    props: [
      {
        part: "DropdownMenu.Root",
        extends: "Radix `DropdownMenu.Root`, unchanged.",
        rows: [
          { name: "open", type: "boolean", description: "Controlled state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the menu opens or closes." },
          { name: "modal", type: "boolean", default: "true", description: "Blocks the page while open." }
        ]
      },
      {
        part: "DropdownMenu.Content",
        extends: "Radix `DropdownMenu.Content` in a portal (`side`, `align`, `loop` …).",
        rows: [{ name: "sideOffset", type: "number", default: "6", description: "Gap to the trigger in px." }]
      },
      {
        part: "DropdownMenu.Item",
        extends: "Radix `DropdownMenu.Item`. `Label`, `Separator`, `RadioGroup` and `RadioItem` (check built in) wrap their Radix parts. Items have no icon or shortcut slot.",
        rows: [
          { name: "onSelect", type: "(event: Event) => void", description: "Runs the action; the menu then closes." },
          { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
          { name: "data-tone", type: '"danger"', description: "Enamel text for a destructive row." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space", "↓"], text: "Open from the trigger with the first item focused." },
      { keys: ["↑", "↓"], text: "Move through items; typing jumps to a match." },
      { keys: ["Esc"], text: "Closes the menu and returns focus to the trigger." }
    ]
  },

  "hover-card": {
    tags: ["Radix Hover Card", "New", AA],
    imports: ["Avatar", "HoverCard"],
    code: `import { Avatar, HoverCard } from "@loreanai/chrome-ui";

<HoverCard.Root>
  <HoverCard.Trigger asChild>
    <a href="/people/rafael">@rafael</a>
  </HoverCard.Trigger>
  <HoverCard.Content>
    <Avatar name="Rafael Achebe" size="lg" />
    <strong>Rafael Achebe</strong>
    <span>SRE lead · Lisbon</span>
  </HoverCard.Content>
</HoverCard.Root>`,
    sections: [live("Try it", "hover or focus the link", <LiveHoverCard />)],
    props: [
      {
        part: "HoverCard.Root",
        extends: "Radix `HoverCard.Root`.",
        rows: [
          { name: "openDelay", type: "number", default: "700", description: "Hover time before it opens, in ms." },
          { name: "closeDelay", type: "number", default: "300", description: "Grace time after the pointer leaves, in ms." },
          { name: "open", type: "boolean", description: "Controlled state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes." },
          { name: "inline", type: "boolean", default: "false", description: "Renders open in place (previews)." }
        ]
      },
      {
        part: "HoverCard.Content",
        extends: "Radix `HoverCard.Content` in a portal (`side`, `align` …); `HoverCard.Trigger` is the Radix trigger.",
        rows: [
          { name: "arrow", type: "boolean", default: "true", description: "Chrome arrow toward the trigger." },
          { name: "arrowOffset", type: "number", description: "Inline only: arrow centre in px from the left edge." },
          { name: "sideOffset", type: "number", default: "2 (6 without arrow)", description: "Gap to the trigger in px." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab"], text: "Focusing the trigger opens the card too; its content is not in the tab order." },
      { badge: "supplementary", text: "Keep the card a preview: the link itself must lead to the full profile." },
      { badge: "pointer", text: "Touch screens never see it, so nothing essential may live only here." }
    ]
  },

  popover: {
    tags: ["Radix Popover", "New", AA],
    imports: ["Button", "Popover", "SegmentedControl"],
    code: `import { useState, type ReactNode } from "react";
import { Button, Popover, SegmentedControl } from "@loreanai/chrome-ui";

const lengths = ["30m", "1h", "4h"].map((value) => ({ value, label: value }));

export function SnoozeButton() {
  const [length, setLength] = useState("1h");
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button size="sm">Snooze</Button>
      </Popover.Trigger>
      <Popover.Content aria-label="Snooze cache-warm" showClose>
        <strong>Snooze cache-warm</strong>
        <p>Pages resume when it ends.</p>
        <SegmentedControl aria-label="Snooze for" items={lengths} value={length} onValueChange={setLength} />
      </Popover.Content>
    </Popover.Root>
  );
}`,
    sections: [live("Try it", "with showClose", <LivePopover />)],
    props: [
      {
        part: "Popover.Root",
        extends: "Radix `Popover.Root`; `Trigger`, `Anchor` and `Close` are its parts.",
        rows: [
          { name: "open", type: "boolean", description: "Controlled state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes." },
          { name: "modal", type: "boolean", default: "false", description: "Traps focus inside the panel." },
          { name: "inline", type: "boolean", default: "false", description: "Renders open in place (previews)." }
        ]
      },
      {
        part: "Popover.Content",
        extends: "Radix `Popover.Content` in a portal (`side`, `align`, `onOpenAutoFocus` …).",
        rows: [
          { name: "arrow", type: "boolean", default: "true", description: "Chrome arrow toward the trigger." },
          { name: "arrowOffset", type: "number", description: "Inline only: arrow centre in px from the left edge." },
          { name: "showClose", type: "boolean", default: "false", description: "Close button in the top-right corner." },
          { name: "flush", type: "boolean", default: "false", description: "No padding, for panels with their own header and rows." },
          { name: "sideOffset", type: "number", default: "2 (6 without arrow)", description: "Gap to the trigger in px." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Open from the trigger; focus moves into the panel." },
      { keys: ["Esc"], text: "Closes it and returns focus to the trigger." },
      { badge: "aria-expanded", text: "The trigger reports `aria-expanded`; name the panel with `aria-label`." }
    ]
  },

  toast: {
    tags: ["Radix Toast", AA],
    imports: ["Toast"],
    code: `import { useState, type ReactNode } from "react";
import { Button, Toast } from "@loreanai/chrome-ui";

export function PauseRollout({ onUndo }: { onUndo: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Toast.Provider>
      <Button onClick={() => setOpen(true)}>Pause rollout</Button>
      <Toast.Root open={open} onOpenChange={setOpen}>
        <Toast.Title>Rollout paused</Toast.Title>
        <Toast.Description>v4.18.0 at 62%</Toast.Description>
        <Toast.Action altText="Undo pausing the rollout" onClick={onUndo}>Undo</Toast.Action>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}`,
    sections: [live("Try it", "with an undo action", <LiveToast />)],
    props: [
      {
        part: "Toast.Provider",
        extends: "Radix `Toast.Provider`; wrap the app once.",
        rows: [
          { name: "duration", type: "number", default: "5000", description: "Time before a toast closes, in ms." },
          { name: "swipeDirection", type: '"right" | "left" | "up" | "down"', default: '"right"', description: "Swipe to dismiss; also sets the slide-in side." },
          { name: "label", type: "string", default: '"Notification"', description: "Announced before each toast." }
        ]
      },
      {
        part: "Toast.Root",
        extends: "Radix `Toast.Root`; `Title`, `Description` and `Close` wrap their parts.",
        rows: [
          { name: "open", type: "boolean", description: "Controlled state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on timeout, swipe and close." },
          { name: "duration", type: "number", description: "Overrides the provider’s duration." },
          { name: "type", type: '"foreground" | "background"', default: '"foreground"', description: "Background toasts are announced politely." }
        ]
      },
      {
        part: "Toast.Action · Toast.Viewport",
        extends: "Radix parts.",
        rows: [
          { name: "altText", type: "string", description: "Required on Action: how to do it without the toast, read by screen readers." },
          { name: "hotkey", type: "string[]", default: '["F8"]', description: "On Viewport: jumps focus to the toasts." }
        ]
      }
    ],
    a11y: [
      { keys: ["F8"], text: "Moves focus to the toast region; Escape dismisses the focused toast." },
      { badge: "status", text: "Toasts are announced without stealing focus; hover or focus pauses the timer." },
      { badge: "altText", text: "Undo must also exist somewhere permanent; `altText` says where." }
    ]
  },

  tooltip: {
    tags: ["Radix Tooltip", AA],
    imports: ["IconButton", "KeyHint", "Tooltip"],
    code: `import { IconButton, KeyHint, Tooltip } from "@loreanai/chrome-ui";
import { Copy } from "./icons";

<Tooltip.Provider delayDuration={220}>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <IconButton finish="ghost" size="sm" aria-label="Copy commit SHA"><Copy /></IconButton>
    </Tooltip.Trigger>
    <Tooltip.Content>
      Copy commit SHA <KeyHint keys={["⌘", "C"]} />
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`,
    sections: [live("Try it", "hover or focus", <LiveTooltip />)],
    props: [
      {
        part: "Tooltip.Provider · Tooltip.Root",
        extends: "Radix parts; one Provider at the root sets the delays.",
        rows: [
          { name: "delayDuration", type: "number", default: "700", description: "Hover time before it shows, in ms (these docs use 220)." },
          { name: "skipDelayDuration", type: "number", default: "300", description: "On Provider: moving between triggers within this time shows the next one at once." },
          { name: "open", type: "boolean", description: "On Root: controlled state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "On Root: called when it shows or hides." }
        ]
      },
      {
        part: "Tooltip.Content",
        extends: "Radix `Tooltip.Content` in a portal, drawn as a smoked capsule (`side`, `align` …). No arrow.",
        rows: [{ name: "sideOffset", type: "number", default: "8", description: "Gap to the trigger in px." }]
      }
    ],
    a11y: [
      { keys: ["Tab", "Esc"], text: "Shows on keyboard focus as well as hover; Escape hides it." },
      { badge: "aria-describedby", text: "The text describes the trigger; the trigger still needs its own `aria-label`." },
      { badge: "no actions", text: "Never put links or buttons inside: a tooltip cannot be reached." }
    ]
  }
};
