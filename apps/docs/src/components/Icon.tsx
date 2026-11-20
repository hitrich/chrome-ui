import type { ReactNode, SVGProps } from "react";

// The artboards' stroke icon set (24-unit grid, drawn by the `.i` utility: 16px, 1.6 stroke, round caps).
const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  "chevron-up-down": <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  calendar: <><path d="M8 3v3M16 3v3" /><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /></>,
  sliders: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4M7 12l3-3 2 2 4-4" /></>,
  bank: <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />,
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6" />,
  pie: <><path d="M12 3v9h9A9 9 0 1 1 12 3Z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" /></>,
  bag: <path d="M6 7h12l-1 13H7L6 7ZM9 7a3 3 0 0 1 6 0" />,
  box: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9" />,
  users: <><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20v-1.5A3.5 3.5 0 0 1 7 15h6a3.5 3.5 0 0 1 3.5 3.5V20M16 4.6a3.5 3.5 0 0 1 0 6.8M20.5 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
  message: <path d="M4 4h16v12H8l-4 4V4Z" />,
  bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  plus: <path d="M12 5v14M5 12h14" />,
  link: <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** 16 by default (the `.i` utility); 14 and 12 match the design's `.s14` / `.s12`. */
  size?: number;
}

export function Icon({ name, size, className, style, ...props }: IconProps) {
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
