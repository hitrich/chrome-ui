// Shared bits for the Control room, Agent console and Settings templates (builder D2).
import { useSyncExternalStore, type SVGProps } from "react";
import "./d2-shared.css";

// Artboard glyphs that the shared Icon set does not have (same 24-unit grid and `.i` stroke).
const paths = {
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  check: <path d="m5 12 5 5 9-10" />,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M7 5v14l11-7L7 5Z" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  terminal: <path d="m4 17 6-5-6-5M12 19h8" />,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  attach: <path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7" />,
  "arrow-up": <path d="M12 19V5M5 12l7-7 7 7" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />
};

export type D2IconName = keyof typeof paths;

export function D2Icon({ name, size, className, style, ...props }: { name: D2IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className ? `i ${className}` : "i"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={size ? { width: size, height: size, ...style } : style}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export type PillFinish = "silver" | "cobalt" | "amber" | "enamel" | "graphite";

/**
 * The artboards' thin satin pill meter (8 px groove, 6 px with `small`), one or more segments.
 * Decorative by default (the numbers sit next to it); pass `label` to expose it as a progress bar.
 */
export function Pill({ parts, small, label, className }: { parts: readonly (readonly [number, PillFinish?])[]; small?: boolean; label?: string; className?: string }) {
  const total = Math.round(parts.reduce((sum, [width]) => sum + width, 0) * 10) / 10;
  return (
    <div
      className={className ? `d2-sp ${className}` : "d2-sp"}
      data-size={small ? "sm" : undefined}
      {...(label
        ? { role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": total }
        : { "aria-hidden": true })}
    >
      {parts.map(([width, finish = "silver"], index) => (
        <i key={index} data-finish={finish} style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}

/** True while the media query matches (re-renders on change). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
