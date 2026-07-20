import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
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
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 9 6 6 6-6" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6" /></IconBase>;
}

export function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 5l14 14M19 5 5 19" /></IconBase>;
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 12h16M14 6l6 6-6 6" /></IconBase>;
}
