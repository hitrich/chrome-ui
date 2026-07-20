import { ChromeProvider, Tooltip, type ChromeTheme } from "@chrome-ui/react";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ComponentExplorer } from "./pages/ComponentExplorer";
import { ControlRoom } from "./pages/ControlRoom";
import { Foundations } from "./pages/Foundations";
import { Home } from "./pages/Home";
import { Playground } from "./pages/Playground";

function ChromeRoutes() {
  const location = useLocation();
  const [theme, setTheme] = useState<ChromeTheme>(() => {
    const saved = window.localStorage.getItem("chrome-theme");
    return saved === "ink" || saved === "arctic" ? saved : "arctic";
  });
  const isHome = location.pathname === "/";
  const isControlRoom = location.pathname.startsWith("/patterns/control-room");
  const activeTheme: ChromeTheme = isHome || isControlRoom ? "ink" : theme;

  useEffect(() => {
    window.localStorage.setItem("chrome-theme", theme);
  }, [theme]);

  return (
    <ChromeProvider theme={activeTheme} onThemeChange={setTheme}>
      <Tooltip.Provider delayDuration={220}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/foundations/:slug" element={<Foundations />} />
          <Route path="/components/:slug" element={<ComponentExplorer />} />
          <Route path="/patterns/control-room" element={<ControlRoom />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Tooltip.Provider>
    </ChromeProvider>
  );
}

export function App() {
  return <ChromeRoutes />;
}
