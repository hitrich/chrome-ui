import type { SVGProps } from "react";

export type IconName =
  | "arrow-right"
  | "bookmark"
  | "check"
  | "close"
  | "copy"
  | "external"
  | "folder"
  | "gear"
  | "library"
  | "menu"
  | "mic"
  | "pause"
  | "play"
  | "record"
  | "sliders"
  | "sparkle"
  | "star"
  | "synth"
  | "trash"
  | "upload"
  | "wave";

export interface UiIconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function UiIcon({ name, ...props }: UiIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      {name === "arrow-right" ? <path d="M4 12h16M14 6l6 6-6 6" /> : null}
      {name === "bookmark" ? <path d="M6 3h12v18l-6-4-6 4V3Z" /> : null}
      {name === "check" ? <path d="m5 12 4 4L19 6" /> : null}
      {name === "close" ? <path d="M5 5l14 14M19 5 5 19" /> : null}
      {name === "copy" ? <><rect x="8" y="8" width="11" height="11" /><path d="M16 8V5H5v11h3" /></> : null}
      {name === "external" ? <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v7H4V6h7" /></> : null}
      {name === "folder" ? <path d="M3 7h7l2-2h9v14H3V7Z" /> : null}
      {name === "gear" ? <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></> : null}
      {name === "library" ? <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" /></> : null}
      {name === "menu" ? <path d="M4 6h16M4 12h16M4 18h16" /> : null}
      {name === "mic" ? <><rect x="8" y="3" width="8" height="13" rx="4" /><path d="M5 12a7 7 0 0 0 14 0M12 19v3" /></> : null}
      {name === "pause" ? <path d="M8 5v14M16 5v14" strokeWidth="3" /> : null}
      {name === "play" ? <path d="m8 5 11 7-11 7V5Z" /> : null}
      {name === "record" ? <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" /> : null}
      {name === "sliders" ? <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6M16 9v6M10 15v6" strokeWidth="2.5" /></> : null}
      {name === "sparkle" ? <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></> : null}
      {name === "star" ? <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /> : null}
      {name === "synth" ? <><rect x="3" y="5" width="18" height="14" /><path d="M7 5v14M11 5v14M15 5v14M19 5v14" /></> : null}
      {name === "trash" ? <><path d="M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14M10 10v7M14 10v7" /></> : null}
      {name === "upload" ? <><path d="M12 16V3M7 8l5-5 5 5" /><path d="M4 14v7h16v-7" /></> : null}
      {name === "wave" ? <path d="M2 12h2l1-5 2 10 2-14 2 18 2-16 2 12 2-8 2 6 1-3h2" /> : null}
    </svg>
  );
}
