// Shared parts of the three Satin templates by builder D1 (Dashboard, Analytics, Finance desk).
import { Button, Dialog, DropdownMenu, IconButton, Popover, SegmentedControl, Sparkline, type ButtonProps } from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import "./d1-shared.css";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const DownloadIcon = () => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
  </svg>
);
export const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
  </svg>
);

/** Page title, its date line, the period control and Export. */
export function PageHead({ title, sub, periods, periodLabel, defaultPeriod, onPeriodChange }: {
  title: string;
  sub: ReactNode;
  periods: readonly string[];
  periodLabel: string;
  defaultPeriod: string;
  onPeriodChange?: (value: string) => void;
}) {
  return (
    <div className="d1-hd d1-hd--end">
      <div className="d1-col" style={{ gap: 6 }}>
        <h1 className="d1-ph">{title}</h1>
        <span className="small t3">{sub}</span>
      </div>
      <div className="d1-row d1-wrap">
        <SegmentedControl aria-label={periodLabel} items={periods.map((p) => ({ value: p, label: p }))} defaultValue={defaultPeriod} onValueChange={onPeriodChange} />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button leadingIcon={<DownloadIcon />}>Export</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Label>Export {title.toLowerCase()}</DropdownMenu.Label>
            <DropdownMenu.Item>CSV, one file per panel</DropdownMenu.Item>
            <DropdownMenu.Item>PDF report</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  tone: "up" | "am";
  /** Design y-coordinates in a 200×32 box (y down). */
  spark: readonly number[];
  focus?: boolean;
  note: ReactNode;
}

/** The key-metrics strip: four tiles with a value, its change, a sparkline and a note. */
export function Kpis({ items }: { items: readonly Kpi[] }) {
  return (
    <section className="card d1-kpis d1-cells" aria-label="Key metrics">
      {items.map((k) => (
        <div className="d1-kpi" key={k.label}>
          <span className="small t2">{k.label}</span>
          <div className="d1-kpi__row">
            <span className="d1-kv">{k.value}</span>
            <span className={`small num d1-${k.tone}`}>{k.delta}</span>
          </div>
          <Sparkline data={k.spark.map((y) => 32 - y)} domain={[0, 32]} height={32} finish={k.focus ? "cobalt" : "silver"} className="d1-spark" />
          <span className="small t3 num">{k.note}</span>
        </div>
      ))}
    </section>
  );
}

export type PillFinish = "co" | "si" | "sk" | "fl" | "en" | "am";

/** Thin satin pill (bezel ring around a polished core), as a share of its track. */
export const Pill = ({ value, finish }: { value: number; finish: PillFinish }) => <span className={`d1-pl d1-pl--${finish}`} style={{ width: `${value}%` }} />;

/** The 8px recessed track with one pill. Pass a label to expose it as a progress bar. */
export function Track({ value, finish = "co", label, children }: { value?: number; finish?: PillFinish; label?: string; children?: ReactNode }) {
  const a11y = label ? { role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": value ?? 0 } : { "aria-hidden": true };
  return (
    <div className="d1-track" {...a11y}>
      {value ? <Pill value={value} finish={finish} /> : null}
      {children}
    </div>
  );
}

/** Pills side by side, one per part of a whole. */
export const Split = ({ parts, className }: { parts: readonly (readonly [number, PillFinish])[]; className?: string }) => (
  <div className={className ? `d1-split ${className}` : "d1-split"} aria-hidden="true">
    {parts.map(([v, f], i) => <Pill key={i} value={v} finish={f} />)}
  </div>
);

/** The top bar's bell: a flush package Popover with the unread items. */
export function Notifications({ label, items }: { label: string; items: readonly { text: ReactNode; meta: string }[] }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton finish="ghost" aria-label={label}>
          <Icon name="bell" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content flush arrow={false} align="end" aria-label="Notifications" className="d1-ntf">
        <div className="d1-ntf__head">Notifications</div>
        {items.length ? (
          items.map((it, i) => (
            <div className="d1-ntf__row" key={i}>
              <span>{it.text}</span>
              <span className="t3 num">{it.meta}</span>
            </div>
          ))
        ) : (
          <div className="d1-ntf__row t3">You’re all caught up.</div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}

/** A trigger that asks before it acts: a package Dialog with Cancel and one confirm button. */
export function Confirm({ trigger, title, description, confirm, finish = "cobalt", onConfirm, children }: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirm: string;
  finish?: ButtonProps["finish"];
  onConfirm?: () => void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        {children}
        <div className="d1-dialog-actions">
          <Dialog.Close asChild>
            <Button finish="ghost">Cancel</Button>
          </Dialog.Close>
          <Button finish={finish} onClick={() => { onConfirm?.(); setOpen(false); }}>
            {confirm}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
