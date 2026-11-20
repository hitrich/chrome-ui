import { useEffect, useRef, useState, type MouseEvent } from "react";

export const GITHUB_URL = "https://github.com/hitrich/chrome-ui";

/** The sidebar drawer used under 900px: Escape, a scrim click or a followed link closes it; focus moves in and back. */
export function useDrawer() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const desktop = window.matchMedia("(min-width: 900px)");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    panelRef.current?.querySelector<HTMLElement>("a[href], button, input")?.focus();
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      menu?.focus();
    };
  }, [open]);

  return {
    open,
    setOpen,
    menuRef,
    panelRef,
    /** Put on the drawer: following any link inside it closes the drawer. */
    onPanelClick: (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a[href]")) setOpen(false);
    }
  };
}

/** ⌘K / Ctrl+K focuses the shell's search field. */
export function useSearchHotkey() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return ref;
}
