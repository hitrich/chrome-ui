import { ChromeProvider, Tooltip, type ChromeTheme } from "@loreanai/chrome-ui";
import { lazy, Suspense, useEffect, useLayoutEffect, useState, type ComponentType, type LazyExoticComponent } from "react";
import { matchPath, Navigate, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { findBaseComponent } from "./data";

/** "toggle" pages follow the reader's theme switch; the rest are designed for one theme. */
type RouteTheme = Exclude<ChromeTheme, "arctic"> | "toggle";
type PageRoute = { path: string; theme: RouteTheme; title: string; page: LazyExoticComponent<ComponentType> };

// Keep the Ink routes in step with the no-flash script in index.html.
const routes: PageRoute[] = [
  { path: "/", theme: "satin", title: "Chrome UI · Satin chrome React components", page: lazy(() => import("./pages/Home")) },
  { path: "/foundations", theme: "ink", title: "Foundations", page: lazy(() => import("./pages/Foundations")) },
  { path: "/foundations/buttons", theme: "satin", title: "Chrome buttons", page: lazy(() => import("./pages/ChromeButtons")) },
  { path: "/components", theme: "toggle", title: "Components", page: lazy(() => import("./pages/ComponentsOverview")) },
  { path: "/components/base", theme: "toggle", title: "Base components", page: lazy(() => import("./pages/BaseCatalog")) },
  { path: "/components/blocks", theme: "toggle", title: "Blocks", page: lazy(() => import("./pages/BlocksCatalog")) },
  { path: "/components/charts", theme: "toggle", title: "Charts", page: lazy(() => import("./pages/ChartsCatalog")) },
  { path: "/components/:slug", theme: "toggle", title: "Component", page: lazy(() => import("./pages/ComponentPage")) },
  { path: "/templates/dashboard", theme: "satin", title: "Home Dashboard template", page: lazy(() => import("./pages/templates/Dashboard")) },
  { path: "/templates/control-room", theme: "ink", title: "Control Room template", page: lazy(() => import("./pages/templates/ControlRoom")) },
  { path: "/templates/finance-desk", theme: "satin", title: "Finance Desk template", page: lazy(() => import("./pages/templates/FinanceDesk")) },
  { path: "/templates/agent-console", theme: "ink", title: "Agent Console template", page: lazy(() => import("./pages/templates/AgentConsole")) },
  { path: "/templates/analytics", theme: "satin", title: "Analytics template", page: lazy(() => import("./pages/templates/Analytics")) },
  { path: "/templates/settings", theme: "satin", title: "Settings template", page: lazy(() => import("./pages/templates/Settings")) },
  ...(import.meta.env.DEV
    ? [
        { path: "/dev/sheet", theme: "toggle", title: "Primitives sheet", page: lazy(() => import("./dev/Sheet")) },
        { path: "/dev/inputs", theme: "toggle", title: "Inputs sheet", page: lazy(() => import("./dev/InputsSheet")) },
        { path: "/dev/layers", theme: "toggle", title: "Layers sheet", page: lazy(() => import("./dev/LayersSheet")) },
        { path: "/dev/charts", theme: "toggle", title: "Charts sheet", page: lazy(() => import("./dev/ChartsSheet")) }
      ] satisfies PageRoute[]
    : [])
];

function readTheme(): Exclude<ChromeTheme, "arctic"> {
  try {
    return window.localStorage.getItem("chrome-theme") === "ink" ? "ink" : "satin";
  } catch {
    return "satin";
  }
}

/** New pages open at the top, or at their #anchor once the (lazy) page has rendered it. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    // back/forward keeps the browser's own scroll restore; a first load or a link to an #anchor still seeks it
    if (navigationType === "POP" && !hash) return;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    let tries = 0;
    const seek = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
      else if (tries++ < 120) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, navigationType]);
}

export function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(readTheme);
  const route = routes.find((entry) => matchPath(entry.path, location.pathname));
  const routeTheme = route?.theme ?? "satin";
  const activeTheme = routeTheme === "toggle" ? theme : routeTheme;
  const slugName = route?.path === "/components/:slug" ? findBaseComponent(location.pathname.split("/")[2])?.name : undefined;
  const title = route && route.path !== "/" ? `${slugName ?? route.title} · Chrome UI` : routes[0]!.title;
  useScrollOnNavigate();

  useEffect(() => {
    try {
      window.localStorage.setItem("chrome-theme", theme);
    } catch {
      // storage can be unavailable (private mode); the toggle still works for this visit
    }
  }, [theme]);

  // The page behind the app (overscroll, short pages) takes the active theme's background.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <ChromeProvider
      className="app-root"
      theme={activeTheme}
      onThemeChange={(next) => setTheme(next === "ink" ? "ink" : "satin")}
    >
      <Tooltip.Provider delayDuration={220}>
        <Suspense fallback={null}>
          <Routes>
            {routes.map(({ path, page: Page }) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </Suspense>
      </Tooltip.Provider>
    </ChromeProvider>
  );
}
