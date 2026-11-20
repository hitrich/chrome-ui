import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 9 6 6 6-6" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 5 5 9-10" /></IconBase>;
}

export function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 6l12 12M18 6 6 18" /></IconBase>;
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 12h16M14 6l6 6-6 6" /></IconBase>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="M20 12H4M10 6l-6 6 6 6" /></IconBase>;
}

export function ChevronLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="m15 6-6 6 6 6" /></IconBase>;
}

export function AlertIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 7v6M12 17h.01" /></IconBase>;
}

export function InfoIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 11v6M12 7h.01" /></IconBase>;
}

export function ChevronRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 6 6 6-6 6" /></IconBase>;
}

export function CopyIcon(props: IconProps) {
  return <IconBase {...props}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></IconBase>;
}

export function SearchIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></IconBase>;
}

export function UploadIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></IconBase>;
}

/** The empty-state emblem: a small satin console with a dark display and a bead, lit from above. */
export function EmblemIcon(props: IconProps) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" className="chrome-emblem" width="80" height="44" viewBox="0 7 88 48" {...props}>
      <defs>
        <linearGradient id={`${id}ry`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4F4F4" /><stop offset=".5" stopColor="#565656" /><stop offset="1" stopColor="#93B3AE" /></linearGradient>
        <linearGradient id={`${id}rs`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9C9C9" /><stop offset=".5" stopColor="#686A69" /><stop offset="1" stopColor="#ABC9C4" /></linearGradient>
        <linearGradient id={`${id}iy`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6e9e9" /><stop offset="1" stopColor="#8e9896" /></linearGradient>
        <linearGradient id={`${id}lcd`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060607" /><stop offset="1" stopColor="#1a1d1d" /></linearGradient>
        <radialGradient id={`${id}bead`} cx=".36" cy=".3" r=".78"><stop offset="0" stopColor="#ffffff" /><stop offset=".22" stopColor="#eef0f0" /><stop offset=".55" stopColor="#9aa0a2" /><stop offset=".85" stopColor="#3e4244" /><stop offset="1" stopColor="#25282a" /></radialGradient>
        <filter id={`${id}blur`} x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <ellipse cx="44" cy="51" rx="28" ry="3" fill="#5F837D" opacity=".42" filter={`url(#${id}blur)`} />
      <rect x="8.5" y="8.5" width="71" height="38" rx="12" fill={`url(#${id}ry)`} stroke={`url(#${id}rs)`} />
      <rect x="11" y="11" width="66" height="33" rx="9.5" fill={`url(#${id}iy)`} />
      <path d="M17 12.2h54" stroke="#fff" strokeOpacity=".75" strokeLinecap="round" />
      <rect x="16.5" y="17.5" width="39" height="20" rx="4.5" fill={`url(#${id}lcd)`} stroke="#2b2f2f" strokeOpacity=".55" />
      <path d="M19 39.6h34" stroke="#fff" strokeOpacity=".6" strokeLinecap="round" />
      <path d="M21 19.3h30" stroke="#fff" strokeOpacity=".08" strokeLinecap="round" />
      <rect x="23" y="26.5" width="7" height="2.2" rx="1.1" fill="#3fbf8f" opacity=".45" />
      <rect x="32.5" y="26.5" width="7" height="2.2" rx="1.1" fill="#3fbf8f" opacity=".45" />
      <rect x="42" y="26.5" width="7" height="2.2" rx="1.1" fill="#3fbf8f" opacity=".45" />
      <circle cx="67" cy="29.5" r="6" fill={`url(#${id}ry)`} stroke={`url(#${id}rs)`} strokeWidth=".8" />
      <circle cx="67" cy="29.5" r="4.4" fill={`url(#${id}bead)`} />
      <circle cx="67" cy="19" r="1.7" fill="#7f8a88" stroke="#fff" strokeOpacity=".6" strokeWidth=".6" />
    </svg>
  );
}
