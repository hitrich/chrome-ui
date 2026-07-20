import { Button, Dialog, useChrome } from "@loreanai/chrome-ui";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { componentDocs, foundationDocs } from "../data";
import { Brand } from "./Brand";
import { UiIcon } from "./UiIcon";

const navItems = [
  { label: "Foundations", to: "/foundations/color" },
  { label: "Components", to: "/components/button" },
  { label: "Patterns", to: "/patterns/control-room" },
  { label: "Playground", to: "/playground" }
];

export function Header({ showThemeToggle = false }: { showThemeToggle?: boolean }) {
  const { theme, setTheme } = useChrome();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
        ))}
      </nav>
      <div className="site-header__actions">
        {showThemeToggle ? (
          <div className="theme-toggle" aria-label="Theme">
            <button aria-pressed={theme === "ink"} onClick={() => setTheme("ink")}>Ink</button>
            <button aria-pressed={theme === "arctic"} onClick={() => setTheme("arctic")}>Arctic</button>
          </div>
        ) : null}
        <Button asChild variant="quiet" size="sm" className="get-started">
          <Link to="/components/button">Get started <UiIcon name="arrow-right" /></Link>
        </Button>
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild>
            <Button className="mobile-menu-trigger" variant="quiet" aria-label="Open navigation">
              <UiIcon name="menu" />
            </Button>
          </Dialog.Trigger>
          <Dialog.Content className="mobile-menu" aria-describedby={undefined}>
            <Dialog.Title>Navigate Chrome</Dialog.Title>
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
            </nav>
            {showThemeToggle ? (
              <div className="mobile-theme-row">
                <span>Theme</span>
                <div className="theme-toggle">
                  <button aria-pressed={theme === "ink"} onClick={() => setTheme("ink")}>Ink</button>
                  <button aria-pressed={theme === "arctic"} onClick={() => setTheme("arctic")}>Arctic</button>
                </div>
              </div>
            ) : null}
            <nav className="mobile-doc-catalog" aria-label="Documentation catalog">
              <section>
                <h3>Foundations</h3>
                <div className="mobile-doc-catalog__links">
                  {foundationDocs.map((item) => (
                    <Link key={item.slug} to={`/foundations/${item.slug}`} onClick={() => setMenuOpen(false)}>{item.title}</Link>
                  ))}
                </div>
              </section>
              <section>
                <h3>Components</h3>
                <div className="mobile-doc-catalog__links">
                  {componentDocs.map((item) => (
                    <Link key={item.slug} to={`/components/${item.slug}`} onClick={() => setMenuOpen(false)}>{item.title}</Link>
                  ))}
                </div>
              </section>
            </nav>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </header>
  );
}
