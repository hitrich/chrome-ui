import { Avatar, Badge, Button, DropdownMenu, IconButton, KeyHint, SearchField, StatusIndicator, type StatusIndicatorProps } from "@loreanai/chrome-ui";
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { useDrawer, useSearchHotkey } from "./shell";

export interface AppNavItem {
  label: string;
  /** Route to open. Without one the item is a button that calls `onSelect`. */
  to?: string;
  onSelect?: () => void;
  /** Leading stroke icon (a name from the shared set, or your own `<svg className="i">`). */
  icon?: IconName | ReactNode;
  /** Leading status lamp, drawn by StatusIndicator around the label (services, regions, threads). */
  lamp?: StatusIndicatorProps["tone"];
  /** Breathing halo on the lamp. */
  pulse?: boolean;
  /** Chrome count chip at the end; "danger" for the enamel one. */
  badge?: { value: ReactNode; tone?: "neutral" | "danger" };
  /** Anything else at the end of the row: a value, a version, a lone lamp (`<StatusIndicator tone="ok" pulse />`). Style it with utilities. */
  meta?: ReactNode;
  /** Mono 12.5px label, for service and region names. */
  mono?: boolean;
  /** The page you are on: the satin chrome pill and `aria-current="page"`. */
  active?: boolean;
  /** Selected inside this page (the open thread): bright label and `aria-current="true"`. */
  current?: boolean;
  /** Full text for labels that get cut off. */
  title?: string;
}

export interface AppNavSection {
  label: string;
  items: readonly AppNavItem[];
}

export interface AppShellProps {
  /** Workspace switcher at the top of the sidebar. */
  workspace: { name: string; sub: string };
  /** Primary navigation. */
  nav: readonly AppNavItem[];
  /** Labelled lists under it (Pinned services, Regions, Saved views …). */
  sections?: readonly AppNavSection[];
  /** Content of the status card pinned above the footer items (a `.card`, 14×16 padding, 10px gap). */
  card?: ReactNode;
  /** Items pinned to the bottom of the sidebar, usually Settings. */
  footer?: readonly AppNavItem[];
  /** The top bar's search field. */
  search: { label: string; placeholder: string };
  /** Right side of the top bar, before the avatar: status, notifications, the one polished action. */
  actions?: ReactNode;
  /** Signed-in person, shown as the avatar at the end of the top bar. */
  user: { name: string; title?: string };
  /** Page root class for page-scoped CSS (`pg-…`). */
  className?: string;
  /** The page, rendered in `<main id="main">` (padding 28 / clamp(16–32), column, 16px gap). */
  children: ReactNode;
}

// The template workspaces; switching opens that workspace's screen.
const workspaces = [
  { name: "Orbital Ops", sub: "Production", to: "/templates/dashboard" },
  { name: "Harbor & Pine", sub: "Finance", to: "/templates/finance-desk" },
  { name: "Tidewater Goods", sub: "Online store", to: "/templates/analytics" }
];

function NavRow({ item }: { item: AppNavItem }) {
  const className = item.active ? "nav-item active" : "nav-item";
  const label = <span className={item.mono ? "f1 trunc app-nav__mono" : "f1 trunc"}>{item.label}</span>;
  const content = (
    <>
      {typeof item.icon === "string" ? <Icon name={item.icon as IconName} /> : item.icon}
      {item.lamp ? (
        <StatusIndicator className={item.mono ? "app-nav__status app-nav__mono" : "app-nav__status"} tone={item.lamp} pulse={item.pulse} role="none" label={item.label} />
      ) : (
        label
      )}
      {item.badge ? (
        <Badge className="num" tone={item.badge.tone ?? "neutral"}>
          {item.badge.value}
        </Badge>
      ) : null}
      {item.meta}
    </>
  );
  const current = item.active ? "page" : item.current ? "true" : undefined;
  return item.to ? (
    <Link className={className} to={item.to} aria-current={current} title={item.title}>
      {content}
    </Link>
  ) : (
    <button className={className} type="button" aria-current={current} title={item.title} onClick={item.onSelect}>
      {content}
    </button>
  );
}

function NavList({ items, label }: { items: readonly AppNavItem[]; label: string }) {
  return (
    <nav className="app-nav" aria-label={label}>
      {items.map((item) => (
        <NavRow key={item.label} item={item} />
      ))}
    </nav>
  );
}

/**
 * The app layout shared by the six templates: workspace switcher, nav with counts and lamps, labelled sections,
 * a status card and footer items in the sidebar; search, actions and the avatar in the top bar.
 */
export function AppShell({ workspace, nav, sections, card, footer, search, actions, user, className, children }: AppShellProps) {
  const { open, setOpen, menuRef, panelRef, onPanelClick } = useDrawer();
  const searchRef = useSearchHotkey();

  return (
    <div className={className ? `shell app-shell ${className}` : "shell app-shell"} data-drawer={open ? "open" : undefined}>
      <a className="shell__skip" href="#main">
        Skip to content
      </a>
      <aside id="app-sidebar" className="shell__side" aria-label="App navigation" ref={panelRef} onClick={onPanelClick}>
        <div className="shell__side-inner">
          <div className="app-ws">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button className="app-ws__trigger" finish="ghost" aria-label={`${workspace.name}, ${workspace.sub}. Switch workspace`}>
                  <Logo />
                  <span className="app-ws__text">
                    <span className="app-ws__name">{workspace.name}</span>
                    <span className="app-ws__sub">{workspace.sub}</span>
                  </span>
                  <Icon name="chevron-up-down" className="t3" size={14} />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start">
                <DropdownMenu.Label>Workspaces</DropdownMenu.Label>
                {workspaces.map((entry) => (
                  <DropdownMenu.Item key={entry.name} asChild>
                    <Link to={entry.to} aria-current={entry.name === workspace.name ? "true" : undefined}>
                      {entry.name} · {entry.sub}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
                <DropdownMenu.Item asChild>
                  <Link to="/components">Back to Chrome UI docs</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <IconButton className="shell__close" finish="ghost" size="sm" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </IconButton>
          </div>

          <NavList items={nav} label="Workspace" />
          {sections?.map((section) => (
            <Fragment key={section.label}>
              <span className="group-label" aria-hidden="true">
                {section.label}
              </span>
              <NavList items={section.items} label={section.label} />
            </Fragment>
          ))}
          <div className="app-shell__fill" />
          {card ? <div className="card app-shell__card">{card}</div> : null}
          {footer?.length ? <NavList items={footer} label="More" /> : null}
        </div>
      </aside>
      <div className="shell__scrim" aria-hidden="true" onClick={() => setOpen(false)} />

      <div className="shell__body" inert={open}>
        <header className="app-top">
          <IconButton
            ref={menuRef}
            className="shell__menu"
            finish="ghost"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="app-sidebar"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </IconButton>
          <SearchField
            ref={searchRef}
            className="app-top__search"
            aria-label={search.label}
            placeholder={search.placeholder}
            shortcut={<KeyHint>⌘K</KeyHint>}
          />
          <div className="app-top__actions">
            {actions}
            <Avatar name={user.name} title={user.title ?? user.name} />
          </div>
        </header>
        <main id="main" className="app-page" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
