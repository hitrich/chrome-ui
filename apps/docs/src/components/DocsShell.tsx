import { Badge, Button, IconButton, SearchField, KeyHint, useChrome } from "@loreanai/chrome-ui";
import { Fragment, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { baseComponents, baseSections, blocks, charts, findBaseComponent, templates } from "../data";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { GITHUB_URL, useDrawer, useSearchHotkey } from "./shell";

export interface TocItem {
  /** id of the heading or section in the page */
  id: string;
  label: string;
}

export interface DocsShellProps {
  children: ReactNode;
  /** "On this page" rail beside the content (component pages). Hidden under 1180px. */
  toc?: readonly TocItem[];
  /** Page root class, so page CSS can be scoped (`pg-…`). */
  className?: string;
}

type NavEntry = { label: string; to: string; group?: string };

const INSTALL = "/components/button#installation";

const gettingStarted: NavEntry[] = [
  { label: "Introduction", to: "/" },
  { label: "Installation", to: INSTALL },
  { label: "Theming", to: "/foundations" },
  { label: "Accessibility", to: "/components/button#accessibility" }
];

const foundations: NavEntry[] = [
  { label: "Color", to: "/foundations#color" },
  { label: "Typography", to: "/foundations#typography" },
  { label: "Finishes", to: "/foundations/buttons" },
  { label: "Components", to: "/components" }
];

const alphabetical = [...baseComponents].sort((a, b) => a.name.localeCompare(b.name));
const COLLAPSED = 16;

const searchIndex: NavEntry[] = [
  ...gettingStarted.map((entry) => ({ ...entry, group: "Guide" })),
  ...foundations.slice(0, 3).map((entry) => ({ ...entry, group: "Foundations" })),
  ...alphabetical.map((entry) => ({ label: entry.name, to: `/components/${entry.slug}`, group: "Base" })),
  ...blocks.map((entry) => ({ label: entry.name, to: `/components/blocks#${entry.slug}`, group: "Blocks" })),
  ...charts.map((entry) => ({ label: entry.name, to: `/components/charts#${entry.slug}`, group: "Charts" })),
  ...templates.map((entry) => ({ label: entry.title, to: entry.route, group: "Templates" }))
];

function NavItem({ to, current, onClick, children }: { to: string; current: string; onClick?: () => void; children: ReactNode }) {
  const active = to === current;
  return (
    <Link className={active ? "nav-item active" : "nav-item"} to={to} aria-current={active ? "page" : undefined} onClick={onClick}>
      {children}
    </Link>
  );
}

function GroupLabel({ label, count, to, open }: { label: string; count: number; to: string; open: boolean }) {
  const content = (
    <>
      {label} <span className="num">{count}</span>
    </>
  );
  return open ? <span className="group-label">{content}</span> : <Link className="group-label" to={to}>{content}</Link>;
}

/** Breadcrumb trail for the docs routes, derived from the URL. */
function crumbsFor(pathname: string): { label: string; to?: string }[] {
  const trail: { label: string; to?: string }[] = [{ label: "Docs", to: "/" }, { label: "Components", to: "/components" }];
  const leaf = pathname.split("/")[2];
  if (!leaf) return trail;
  const base = { label: "Base", to: "/components/base" };
  if (leaf === "base" || leaf === "blocks" || leaf === "charts") trail.push({ label: leaf[0]!.toUpperCase() + leaf.slice(1) });
  else trail.push(base, { label: findBaseComponent(leaf)?.name ?? leaf });
  return trail.map((crumb, index, all) => (index === all.length - 1 ? { label: crumb.label } : crumb));
}

function useActiveSection(ids: readonly TocItem[] | undefined) {
  const key = ids?.map((item) => item.id).join(" ") ?? "";
  const [active, setActive] = useState<string | undefined>(ids?.[0]?.id);
  useEffect(() => {
    const targets = key ? key.split(" ").flatMap((id) => document.getElementById(id) ?? []) : [];
    if (!targets.length) return;
    // Current = the last section (in page order) that reaches into the upper third of the window.
    const inBand = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target) : inBand.delete(entry.target)));
        const hit = [...targets].reverse().find((target) => inBand.has(target));
        if (hit) setActive(hit.id);
      },
      { rootMargin: "0px 0px -66% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [key]);
  return active;
}

/**
 * The docs layout (Components overview, Base/Blocks/Charts catalogs, component pages): sidebar with search and
 * the catalog tree, top bar with breadcrumb, theme switch, GitHub and Get started, then the page in `<main id="main">`.
 * Which group is open, the active item and the breadcrumb all follow the current route.
 */
export function DocsShell({ children, toc, className }: DocsShellProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useChrome();
  const { open, setOpen, menuRef, panelRef, onPanelClick } = useDrawer();
  const searchRef = useSearchHotkey();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const activeSection = useActiveSection(toc);

  const leaf = pathname.split("/")[2] ?? "";
  const component = findBaseComponent(leaf);
  const openGroup = leaf === "base" || component ? "base" : leaf === "blocks" || leaf === "charts" ? leaf : undefined;
  const activeIndex = component ? alphabetical.indexOf(component) : -1;
  const listForced = activeIndex >= COLLAPSED;
  const listOpen = showAll || listForced;
  const ink = theme === "ink";

  const needle = query.trim().toLowerCase();
  const results = needle ? searchIndex.filter((entry) => entry.label.toLowerCase().includes(needle)) : [];
  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const first = results[0];
    if (first) {
      setQuery("");
      setOpen(false);
      navigate(first.to);
    }
  };

  const crumbs = crumbsFor(pathname);
  const main = (
    <main id="main" tabIndex={-1}>
      {children}
    </main>
  );

  return (
    <div className={className ? `shell docs-shell ${className}` : "shell docs-shell"} data-drawer={open ? "open" : undefined}>
      <a className="shell__skip" href="#main">
        Skip to content
      </a>
      <aside id="docs-sidebar" className="shell__side" aria-label="Documentation" ref={panelRef} onClick={onPanelClick}>
        <div className="shell__side-inner">
          <div className="docs-brand">
            <Link className="docs-brand__home" to="/" aria-label="Chrome UI home">
              <Logo />
              <span className="disp docs-brand__word">CHROME</span>
              <Badge className="docs-brand__version">1.0</Badge>
            </Link>
            <IconButton className="shell__close" finish="ghost" size="sm" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </IconButton>
          </div>

          <form className="docs-search" role="search" onSubmit={onSearch}>
            <SearchField
              ref={searchRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search"
              aria-label="Search documentation"
              shortcut={<KeyHint>⌘K</KeyHint>}
            />
          </form>

          <nav className="docs-nav" aria-label="Docs navigation">
            {needle ? (
              <>
                <p className="chrome-visually-hidden" aria-live="polite">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </p>
                {results.map((entry) => (
                  <NavItem key={entry.to} to={entry.to} current={pathname} onClick={() => setQuery("")}>
                    <span className="f1 trunc">{entry.label}</span>
                    <span className="docs-nav__count">{entry.group}</span>
                  </NavItem>
                ))}
                {results.length ? null : <p className="docs-nav__empty">Nothing matches “{query.trim()}”.</p>}
              </>
            ) : (
              <>
                <span className="group-label">Getting started</span>
                {gettingStarted.map((entry) => (
                  <NavItem key={entry.label} to={entry.to} current={pathname}>
                    {entry.label}
                  </NavItem>
                ))}
                <span className="group-label">Foundations</span>
                {foundations.map((entry) => (
                  <NavItem key={entry.label} to={entry.to} current={pathname}>
                    {entry.label}
                  </NavItem>
                ))}

                <GroupLabel label="Base" count={baseComponents.length} to="/components/base" open={openGroup === "base"} />
                {openGroup === "base" && !component ? (
                  <>
                    <NavItem to="/components/base" current={pathname}>
                      Overview
                    </NavItem>
                    {baseSections.map((section) => (
                      <NavItem key={section.id} to={`/components/base#${section.id}`} current={pathname}>
                        <span className="f1">{section.title}</span>
                        <span className="num docs-nav__count">{section.count}</span>
                      </NavItem>
                    ))}
                  </>
                ) : null}
                {component ? (
                  <>
                    {(listOpen ? alphabetical : alphabetical.slice(0, COLLAPSED)).map((entry) => (
                      <NavItem key={entry.slug} to={`/components/${entry.slug}`} current={pathname}>
                        <span className="f1">{entry.name}</span>
                        {entry.isNew ? <Badge tone="accent">New</Badge> : null}
                      </NavItem>
                    ))}
                    {listForced ? null : (
                      <button className="nav-item" type="button" aria-expanded={listOpen} onClick={() => setShowAll(!showAll)}>
                        {listOpen ? "Show fewer" : `Show ${alphabetical.length - COLLAPSED} more`}
                      </button>
                    )}
                  </>
                ) : null}

                <GroupLabel label="Blocks" count={blocks.length} to="/components/blocks" open={openGroup === "blocks"} />
                {openGroup === "blocks" ? (
                  <>
                    <NavItem to="/components/blocks" current={pathname}>
                      Overview
                    </NavItem>
                    {blocks.map((entry) => (
                      <NavItem key={entry.slug} to={`/components/blocks#${entry.slug}`} current={pathname}>
                        {entry.name}
                      </NavItem>
                    ))}
                  </>
                ) : null}

                <GroupLabel label="Charts" count={charts.length} to="/components/charts" open={openGroup === "charts"} />
                {openGroup === "charts" ? (
                  <>
                    <NavItem to="/components/charts" current={pathname}>
                      Overview
                    </NavItem>
                    {charts.map((entry) => (
                      <NavItem key={entry.slug} to={`/components/charts#${entry.slug}`} current={pathname}>
                        {entry.name}
                      </NavItem>
                    ))}
                  </>
                ) : null}

                <GroupLabel label="Templates" count={templates.length} to={templates[0]!.route} open={false} />
              </>
            )}
          </nav>
        </div>
      </aside>
      <div className="shell__scrim" aria-hidden="true" onClick={() => setOpen(false)} />

      <div className="shell__body" inert={open}>
        <header className="docs-top">
          <div className="docs-top__start">
            <IconButton
              ref={menuRef}
              className="shell__menu"
              finish="ghost"
              size="sm"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="docs-sidebar"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </IconButton>
            <nav className="docs-crumbs small" aria-label="Breadcrumb">
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.label}>
                  {index > 0 ? (
                    <span className="docs-crumbs__sep" aria-hidden="true">
                      /
                    </span>
                  ) : null}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                </Fragment>
              ))}
            </nav>
          </div>
          <div className="docs-top__actions">
            <IconButton
              finish="ghost"
              size="sm"
              aria-label={ink ? "Switch to Satin theme" : "Switch to Ink theme"}
              onClick={() => setTheme(ink ? "satin" : "ink")}
            >
              <Icon name={ink ? "sun" : "moon"} />
            </IconButton>
            <Button finish="ghost" size="sm" asChild>
              <a href={GITHUB_URL}>GitHub</a>
            </Button>
            <Button finish="smoked" size="sm" asChild>
              <Link to={INSTALL}>Get started</Link>
            </Button>
          </div>
        </header>

        {toc ? (
          <div className="docs-columns">
            {main}
            <nav className="docs-toc" aria-label="On this page">
              <span className="eyebrow">On this page</span>
              {toc.map((item) => (
                <a key={item.id} href={`#${item.id}`} aria-current={item.id === activeSection ? "true" : undefined}>
                  {item.label}
                </a>
              ))}
              <a className="link" href={GITHUB_URL}>
                Edit on GitHub
              </a>
            </nav>
          </div>
        ) : (
          main
        )}
      </div>
    </div>
  );
}
