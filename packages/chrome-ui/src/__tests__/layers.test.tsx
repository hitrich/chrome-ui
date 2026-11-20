import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import {
  Accordion,
  ChromeProvider,
  CommandPalette,
  ContextMenu,
  Drawer,
  HoverCard,
  Popover,
  TreeView,
  type CommandPaletteGroup,
  type TreeViewNode
} from "../index";

const groups: CommandPaletteGroup[] = [
  {
    label: "Actions",
    items: [
      { id: "rollback", label: "Roll back v4.18.0", shortcut: "↵" },
      { id: "pause", label: "Pause rollout" },
      { id: "deploy", label: "Deploy billing-worker", keywords: ["ship"] }
    ]
  },
  { label: "Services", items: [{ id: "billing", label: "billing-worker", mono: true, meta: "us-east-2" }] }
];

const tree: TreeViewNode[] = [
  {
    id: "orbital-ops",
    label: "orbital-ops",
    children: [
      {
        id: "services",
        label: "services",
        children: [
          { id: "api-gateway", label: "api-gateway" },
          { id: "billing-worker", label: "billing-worker" }
        ]
      },
      { id: "agents", label: "agents", meta: "3", children: [{ id: "ops-agent", label: "ops-agent" }] }
    ]
  }
];

async function expectNoViolations(container: HTMLElement) {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
}

describe("Accordion", () => {
  it("toggles a section from the keyboard and passes axe", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChromeProvider theme="satin">
        <Accordion.Root type="single" collapsible defaultValue="triggers">
          <Accordion.Item value="triggers">
            <Accordion.Trigger>Rollback triggers</Accordion.Trigger>
            <Accordion.Content>p95 above 300 ms.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="paging">
            <Accordion.Trigger>Paging rules</Accordion.Trigger>
            <Accordion.Content>Page the on-call SRE.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </ChromeProvider>
    );
    const first = screen.getByRole("button", { name: "Rollback triggers" });
    const second = screen.getByRole("button", { name: "Paging rules" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    await expectNoViolations(container);

    second.focus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowUp}");
    expect(first).toHaveFocus();
  });
});

describe("CommandPalette", () => {
  it("filters, highlights matches, runs the active item with Enter and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <ChromeProvider>
          <button type="button" onClick={() => setOpen(true)}>Open palette</button>
          <CommandPalette open={open} onOpenChange={setOpen} groups={groups} onSelect={onSelect} footer />
        </ChromeProvider>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open palette" });
    await user.click(opener);
    const input = await screen.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());

    await user.type(input, "roll");
    const [first, second] = screen.getAllByRole("option");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Roll back v4.18.0↵", "Pause rollout"]);
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", first?.id);
    expect(within(second as HTMLElement).getByText("roll").tagName).toBe("B");
    expect(screen.getByRole("status")).toHaveTextContent("2 results");

    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "pause" }));
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("matches keywords, shows an empty state and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandPalette defaultOpen groups={groups} onOpenChange={onOpenChange} />);
    const input = await screen.findByRole("combobox");
    await user.type(input, "ship");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.clear(input);
    await user.type(input, "zzz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders inline without a dialog and passes axe", async () => {
    const { container } = render(
      <ChromeProvider theme="ink">
        <main>
          <CommandPalette inline size="sm" defaultQuery="roll" groups={groups} />
        </main>
      </ChromeProvider>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("combobox")).not.toHaveFocus();
    await expectNoViolations(container);
  });
});

describe("ContextMenu", () => {
  it("opens on right-click with items, shortcuts and a destructive action", async () => {
    const onSelect = vi.fn();
    render(
      <ChromeProvider>
        <ContextMenu.Root>
          <ContextMenu.Trigger>search-indexer</ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item shortcut="L" onSelect={onSelect}>Open logs</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item destructive>Delete service</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </ChromeProvider>
    );
    fireEvent.contextMenu(screen.getByText("search-indexer"));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Delete service/ })).toHaveAttribute("data-tone", "danger");
    expect(within(menu).getByText("L").tagName).toBe("KBD");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Open logs/ }));
    expect(onSelect).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("renders inline as static markup and passes axe", async () => {
    const { container } = render(
      <ChromeProvider theme="satin">
        <ContextMenu.Root inline>
          <ContextMenu.Trigger>search-indexer</ContextMenu.Trigger>
          <ContextMenu.Content aria-label="Service actions">
            <ContextMenu.Item data-highlighted="">Open logs</ContextMenu.Item>
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger>Move to region</ContextMenu.SubTrigger>
              <ContextMenu.SubContent><ContextMenu.Item>us-east-2</ContextMenu.Item></ContextMenu.SubContent>
            </ContextMenu.Sub>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </ChromeProvider>
    );
    expect(screen.getByRole("menu")).toHaveAttribute("data-chrome-inline");
    expect(screen.getByText("search-indexer")).toHaveAttribute("data-state", "open");
    expect(screen.queryByText("us-east-2")).not.toBeInTheDocument();
    await expectNoViolations(container);
  });
});

describe("Drawer", () => {
  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <ChromeProvider>
        <Drawer.Root>
          <Drawer.Trigger>Open drawer</Drawer.Trigger>
          <Drawer.Content side="left">
            <Drawer.Header eyebrow="INC-418">
              <Drawer.Title>Indexer timeouts</Drawer.Title>
              <Drawer.Description>search-indexer is timing out.</Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>Owner M. Lindqvist</Drawer.Body>
            <Drawer.Footer><button type="button">Open runbook</button></Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>
      </ChromeProvider>
    );
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Indexer timeouts" });
    expect(dialog).toHaveAttribute("data-side", "left");
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus());
    await expectNoViolations(baseElement);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("renders inline in place and passes axe", async () => {
    const { container } = render(
      <ChromeProvider theme="ink">
        <div style={{ position: "relative" }}>
          <Drawer.Root inline>
            <Drawer.Content>
              <Drawer.Header eyebrow="INC-418"><Drawer.Title>Indexer timeouts</Drawer.Title></Drawer.Header>
            </Drawer.Content>
          </Drawer.Root>
        </div>
      </ChromeProvider>
    );
    expect(container.querySelector(".chrome-drawer")).toHaveAttribute("data-chrome-inline");
    expect(screen.getByText("Indexer timeouts")).toBeInTheDocument();
    await expectNoViolations(container);
  });
});

describe("Popover and HoverCard", () => {
  it("opens a popover, closes it with its close button and returns focus", async () => {
    const user = userEvent.setup();
    render(
      <ChromeProvider>
        <Popover.Root>
          <Popover.Trigger>Snooze</Popover.Trigger>
          <Popover.Content showClose aria-label="Snooze cache-warm">Pages resume when it ends.</Popover.Content>
        </Popover.Root>
      </ChromeProvider>
    );
    const trigger = screen.getByRole("button", { name: "Snooze" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(await screen.findByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Pages resume when it ends.")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("renders both inline with an arrow and passes axe", async () => {
    const { container } = render(
      <ChromeProvider theme="satin">
        <main>
          <Popover.Root inline>
            <Popover.Trigger>Snooze</Popover.Trigger>
            <Popover.Content aria-label="Snooze cache-warm" arrowOffset={40}>Pages resume when it ends.</Popover.Content>
          </Popover.Root>
          <HoverCard.Root inline>
            <HoverCard.Trigger href="/team">@rafael</HoverCard.Trigger>
            <HoverCard.Content>Rafael Achebe</HoverCard.Content>
          </HoverCard.Root>
        </main>
      </ChromeProvider>
    );
    expect(screen.getByRole("button", { name: "Snooze" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Snooze" })).not.toHaveAttribute("aria-controls");
    const popover = container.querySelector<HTMLElement>(".chrome-popover");
    expect(popover?.style.getPropertyValue("--chrome-arrow-x")).toBe("40px");
    expect(container.querySelectorAll(".chrome-layer__arrow[data-inline]")).toHaveLength(2);
    await expectNoViolations(container);
  });
});

describe("TreeView", () => {
  function renderTree(onSelectedChange = vi.fn()) {
    const result = render(
      <ChromeProvider>
        <TreeView aria-label="Workspace" items={tree} defaultExpanded={["orbital-ops"]} onSelectedChange={onSelectedChange} />
      </ChromeProvider>
    );
    return { ...result, onSelectedChange };
  }

  it("passes axe and exposes tree semantics", async () => {
    const { container } = renderTree();
    expect(screen.getByRole("tree", { name: "Workspace" })).toBeInTheDocument();
    const root = screen.getByRole("treeitem", { name: "orbital-ops" });
    expect(root).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("treeitem", { name: "services" })).toHaveAttribute("tabindex", "-1");
    await expectNoViolations(container);
  });

  it("moves with arrows, expands and collapses, selects, and jumps with Home, End and type-ahead", async () => {
    const user = userEvent.setup();
    const { onSelectedChange } = renderTree();
    const root = screen.getByRole("treeitem", { name: "orbital-ops" });
    root.focus();

    await user.keyboard("{ArrowDown}");
    const services = screen.getByRole("treeitem", { name: "services" });
    expect(services).toHaveFocus();
    expect(services).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{ArrowRight}");
    expect(services).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: "api-gateway" })).toHaveFocus();

    await user.keyboard("{ArrowDown}{Enter}");
    const billing = screen.getByRole("treeitem", { name: "billing-worker" });
    expect(billing).toHaveAttribute("aria-selected", "true");
    expect(onSelectedChange).toHaveBeenCalledWith("billing-worker", expect.objectContaining({ id: "billing-worker" }));

    await user.keyboard("{ArrowLeft}");
    expect(services).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(services).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "billing-worker" })).not.toBeInTheDocument();

    await user.keyboard("{End}");
    expect(screen.getByRole("treeitem", { name: "agents" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(root).toHaveFocus();
    await user.keyboard("a");
    expect(screen.getByRole("treeitem", { name: "agents" })).toHaveFocus();
  });
});
