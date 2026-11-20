import * as React from "react";
import { cx } from "./utils";

/* Chrome charts: pure SVG in the satin chrome of the buttons (work/CHROME-CHARTS.md).
   Plots measure their container and draw in real pixels, so hairlines stay crisp and text never stretches. */

export type ChartFinish = "cobalt" | "smoked" | "silver" | "enamel" | "dashed";
export type BarFinish = "cobalt" | "silver" | "enamel";
export type ChartWeight = "sm" | "md" | "lg";
/** A pixel height, or "fill" to take the parent's height (the parent needs a definite height). */
export type ChartHeight = number | "fill";
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

type Pt = readonly [number, number];
type DivProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "aria-label">;

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const r1 = (n: number) => Math.round(n * 10) / 10;
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/* ---------------------------------------------------------------- formatting */

/** 38200 → "38.2k", 2500000 → "2.5M", −80 → "−80" (real minus). */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const [div, unit] = abs >= 1e9 ? [1e9, "B"] : abs >= 1e6 ? [1e6, "M"] : abs >= 1e3 ? [1e3, "k"] : [1, ""];
  const n = abs / div;
  const text = Number.isInteger(n) || n >= 100 ? String(Math.round(n)) : String(Number(n.toFixed(n < 10 && div === 1 ? 2 : 1)));
  return (value < 0 ? "−" : "") + text + unit;
}

const formatNumber = (v: number) => v.toLocaleString("en-US");
const formatPercent = (v: number) => `${Number((v * 100).toFixed(1))}%`;

function niceStep(raw: number) {
  if (!(raw > 0)) return 1;
  const e = 10 ** Math.floor(Math.log10(raw));
  const f = raw / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}

/** Round tick values covering [min, max], about `count` of them. */
export function niceTicks(min: number, max: number, count = 3): number[] {
  if (!(max > min)) max = min === 0 ? 1 : min + Math.abs(min);
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const start = Math.floor(min / step);
  const end = Math.ceil(max / step);
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(Number((i * step).toPrecision(12)));
  return out;
}

function resolveY(values: number[], ticks?: readonly number[], domain?: readonly [number, number]) {
  if (!domain && ticks?.length) domain = [Math.min(...ticks), Math.max(...ticks)];
  if (!domain) {
    const t = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 3);
    return { domain: [t[0] ?? 0, t[t.length - 1] ?? 1] as const, ticks: t };
  }
  return { domain, ticks: ticks ?? niceTicks(domain[0], domain[1], 3) };
}

const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/** Whole pixel + .5 so a 1 px hairline lands on one row of pixels. */
const crisp = (y: number) => Math.round(y) + 0.5;

/* ---------------------------------------------------------------- hooks */

/** Ids for this chart's own <defs>; several charts share a page. */
function useChartIds() {
  const id = "cx" + React.useId().replace(/[^\w-]/g, "");
  return React.useMemo(() => ({ ref: (n: string) => `${id}-${n}`, url: (n: string) => `url(#${id}-${n})` }), [id]);
}

/** Measured layout size of the chart root (falls back before layout and in tests). */
function useSize(fallbackWidth: number) {
  const node = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: fallbackWidth, height: 0, font: 10 });
  const measure = React.useCallback(() => {
    const el = node.current;
    if (!el || el.clientWidth <= 0) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const font = parseFloat(getComputedStyle(el).fontSize) || 10;
    setSize((s) => (s.width === width && s.height === height && s.font === font ? s : { width, height, font }));
  }, []);
  useIsoLayoutEffect(() => {
    measure();
    const el = node.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);
  return [node, size] as const;
}

const CARTESIAN_KEYS = ["height", "labels", "xTicks", "renderXLabel", "edgeLabels", "yTicks", "yDomain", "formatY", "yLabels", "caption", "padding", "threshold", "bands", "markers", "highlight", "aria-label", "description", "dataTable", "className"];

/** The DOM attributes left after a chart's own props are taken out. */
function domProps(props: object, keys: readonly string[]): DivProps {
  return Object.fromEntries(Object.entries(props).filter(([k]) => !keys.includes(k))) as DivProps;
}

/** Hands the chart root to the consumer's ref while the chart keeps its own for measuring. */
function useExposedRef<T>(forwardedRef: React.ForwardedRef<T>, innerRef: React.RefObject<T | null>) {
  React.useImperativeHandle(forwardedRef, () => innerRef.current as T, [innerRef]);
}

/* ---------------------------------------------------------------- materials */

type Stop = readonly [offset: number, color: string, opacity?: number | string];
function Grad({ id, stops, x2 = 0, y2 = 1, x1 = 0, y1 = 0, ...rest }: { id: string; stops: readonly Stop[]; x1?: number; y1?: number; x2?: number; y2?: number } & React.SVGProps<SVGLinearGradientElement>) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} {...rest}>
      {stops.map(([o, c, a]) => <stop key={o} offset={o} style={{ stopColor: c, stopOpacity: a }} />)}
    </linearGradient>
  );
}

const RING: readonly Stop[] = [[0, "#F4F4F4"], [0.5, "#565656"], [1, "#93B3AE"]];
const RING_CO: readonly Stop[] = [[0, "#EEF2FF"], [0.5, "#1A37A8"], [1, "#7F9CFF"]];
const RING_EN: readonly Stop[] = [[0, "#FFE6E2"], [0.5, "#A3231A"], [1, "#FF8A80"]];
const CORE_X: readonly Stop[] = [[0, "#8a9391"], [0.22, "#e4e7e7"], [0.36, "#ffffff"], [0.55, "#c2c7c7"], [0.78, "#7f8887"], [1, "#aebab8"]];
const CORE_X_CO: readonly Stop[] = [[0, "#2346d8"], [0.22, "#8fa9ff"], [0.36, "#e3eaff"], [0.55, "#4f7bff"], [0.78, "#1c44d6"], [1, "#5f86ff"]];
const CORE_X_EN: readonly Stop[] = [[0, "#b8241b"], [0.22, "#ff9a90"], [0.36, "#ffe6e2"], [0.55, "#ec5548"], [0.78, "#b8241b"], [1, "#e86a5e"]];
const SEG_B: readonly Stop[] = [[0, "#c9d5ff"], [0.5, "#1a37a8"], [1, "#7f9cff"]];
const SEG_D: readonly Stop[] = [[0, "var(--chrome-chart-smoke-seg-0)"], [0.5, "var(--chrome-chart-smoke-seg-1)"], [1, "var(--chrome-chart-smoke-seg-2)"]];
const SEG_S: readonly Stop[] = [[0, "#F4F4F4"], [0.5, "#9aa0a0"], [1, "#ABC9C4"]];
const DISC: readonly Stop[] = [[0, "var(--chrome-chart-disc-0)"], [0.7, "var(--chrome-chart-disc-1)"], [1, "var(--chrome-chart-disc-2)"]];
const EQ: readonly Stop[] = [[0, "#F4F4F4"], [0.44, "#8d9393"], [0.5, "#565656"], [0.56, "#8d9393"], [1, "#ABC9C4"]];
const EQ_B: readonly Stop[] = [[0, "#c9d5ff"], [0.44, "#3f6dff"], [0.5, "#1a37a8"], [0.56, "#3f6dff"], [1, "#8fa9ff"]];

type Ids = ReturnType<typeof useChartIds>;
type DefsNeed = { wire?: boolean; bar?: boolean; gauge?: boolean; seg?: boolean; eq?: readonly [number, number] };

/** The kit's shared defs, only the groups this chart draws with. */
function ChartDefs({ ids, wire, bar, gauge, seg, eq }: DefsNeed & { ids: Ids }) {
  const i = ids.ref;
  const radial = (id: string, stops: readonly Stop[]) => (
    <radialGradient id={id} cx=".36" cy=".3" r=".78">
      {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
    </radialGradient>
  );
  return (
    <defs>
      {wire || eq ? radial(i("bead"), [[0, "#ffffff"], [0.22, "#eef0f0"], [0.55, "#9aa0a2"], [0.85, "#3e4244"], [1, "#25282a"]]) : null}
      {wire ? (
        <>
          {radial(i("bead-b"), [[0, "#ffffff"], [0.2, "#c9d5ff"], [0.55, "#3f6dff"], [0.85, "#1238c4"], [1, "#0b2687"]])}
          <Grad id={i("area")} stops={[[0, "var(--chrome-chart-area-top)", "var(--chrome-chart-area-top-opacity)"], [0.6, "var(--chrome-chart-area-mid)", "var(--chrome-chart-area-mid-opacity)"], [1, "var(--chrome-chart-area-mid)", 0]]} />
          <filter id={i("blur2")} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter>
        </>
      ) : null}
      {bar ? (
        <>
          <Grad id={i("ring-x")} stops={RING} x2={1} y2={0} />
          <Grad id={i("in-x")} stops={CORE_X} x2={1} y2={0} />
          <Grad id={i("bring-x")} stops={RING_CO} x2={1} y2={0} />
          <Grad id={i("bin-x")} stops={CORE_X_CO} x2={1} y2={0} />
          <Grad id={i("ering-x")} stops={RING_EN} x2={1} y2={0} />
          <Grad id={i("ein-x")} stops={CORE_X_EN} x2={1} y2={0} />
          <pattern id={i("etch")} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1.4" height="4" fill="#fff" fillOpacity=".6" />
          </pattern>
        </>
      ) : null}
      {gauge ? (
        <>
          <Grad id={i("bezel")} stops={RING} />
          <Grad id={i("bezel-s")} stops={[[0, "#C9C9C9"], [0.5, "#686A69"], [1, "#ABC9C4"]]} />
        </>
      ) : null}
      {seg ? (
        <>
          {/* segment metals for a ring rotated −90° (dash starts at 12 o'clock), so light still falls from above */}
          <Grad id={i("seg-b-r")} stops={SEG_B} x1={1} x2={0} y2={0} />
          <Grad id={i("seg-d-r")} stops={SEG_D} x1={1} x2={0} y2={0} />
          <Grad id={i("seg-s-r")} stops={SEG_S} x1={1} x2={0} y2={0} />
        </>
      ) : null}
      {gauge || seg ? (
        <radialGradient id={i("disc")} cx=".5" cy=".34" r=".72">
          {DISC.map(([o, c]) => <stop key={o} offset={o} style={{ stopColor: c }} />)}
        </radialGradient>
      ) : null}
      {bar || gauge || seg ? (
        <filter id={i("blur")} x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="4" /></filter>
      ) : null}
      {eq ? (
        <>
          <Grad id={i("eq")} stops={EQ} gradientUnits="userSpaceOnUse" y1={eq[0]} y2={eq[1]} />
          <Grad id={i("eq-b")} stops={EQ_B} gradientUnits="userSpaceOnUse" y1={eq[0]} y2={eq[1]} />
        </>
      ) : null}
    </defs>
  );
}

/* polished wires: dark core, metal body, specular line nudged up */
const WIRE_COLORS: Record<Exclude<ChartFinish, "dashed">, readonly [string, string, string]> = {
  cobalt: ["#0d2a8a", "#2f5fff", "#c3d1ff"],
  smoked: ["var(--chrome-chart-smoke-0)", "var(--chrome-chart-smoke-1)", "var(--chrome-chart-smoke-2)"],
  silver: ["#7d8384", "#c9cdd0", "#ffffff"],
  enamel: ["#8A2620", "#EC5548", "#FFE6E2"]
};
type WireWeight = ChartWeight | "spark";
const WIRE_WIDTHS: Record<WireWeight, { focus: readonly number[]; other: readonly number[]; lift: readonly [number, number]; shadow: number; drop: number; dash: number; bead: readonly [number, number] }> = {
  sm: { focus: [2.2, 1.6, 0.45], other: [1.8, 1.2, 0.4], lift: [0.3, 0.3], shadow: 0, drop: 0, dash: 1, bead: [5.5, 4] },
  md: { focus: [4.4, 3, 1], other: [3.2, 2, 0.8], lift: [0.7, 0.5], shadow: 7, drop: 3, dash: 1.4, bead: [5.5, 4.5] },
  lg: { focus: [6, 4.2, 1.4], other: [4.4, 2.8, 1.1], lift: [1, 0.7], shadow: 10, drop: 4, dash: 1.5, bead: [7, 5] },
  spark: { focus: [3.4, 2.2, 0.8], other: [2.8, 1.7, 0.6], lift: [0.5, 0.4], shadow: 0, drop: 0, dash: 1.2, bead: [4, 3] }
};

function Wire({ d, finish, weight, ids, scaling = true }: { d: string; finish: ChartFinish; weight: WireWeight; ids: Ids; scaling?: boolean }) {
  const w = WIRE_WIDTHS[weight];
  const ve = scaling ? undefined : "non-scaling-stroke";
  if (finish === "dashed") {
    return <path className="chrome-chart__dash" d={d} strokeWidth={w.dash} strokeDasharray={weight === "sm" ? "2 2" : "3 3"} vectorEffect={ve} />;
  }
  const focus = finish === "cobalt";
  const [a, b, c] = focus ? w.focus : w.other;
  const colors = WIRE_COLORS[finish];
  const lift = focus ? w.lift[0] : w.lift[1];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {focus && w.shadow ? (
        <path d={d} transform={`translate(0 ${w.drop})`} style={{ stroke: "#0b2687" }} strokeOpacity={0.28} strokeWidth={w.shadow} filter={ids.url("blur2")} vectorEffect={ve} />
      ) : null}
      <path d={d} style={{ stroke: colors[0] }} strokeWidth={a} vectorEffect={ve} />
      <path d={d} style={{ stroke: colors[1] }} strokeWidth={b} vectorEffect={ve} />
      <path d={d} style={{ stroke: colors[2] }} strokeWidth={c} transform={`translate(0 ${-lift})`} vectorEffect={ve} />
    </g>
  );
}

function Bead({ x, y, r, focus, ids }: { x: number; y: number; r: number; focus: boolean; ids: Ids }) {
  return (
    <circle cx={r1(x)} cy={r1(y)} r={r} fill={ids.url(focus ? "bead-b" : "bead")} style={{ stroke: focus ? "#0b2687" : "var(--chrome-chart-bead-edge)" }} strokeWidth={focus ? 0.6 : 0.4} />
  );
}

/** Satin pill: bezel ring at full size plus a polished core inset by 2 px (wide bars 3 px). */
function Pill({ x, y, w, h, finish, ids, pending, rx }: { x: number; y: number; w: number; h: number; finish: BarFinish; ids: Ids; pending?: boolean; rx?: number }) {
  if (!(h >= 0.5) || !(w > 0)) return null;
  const inset = w >= 20 ? 3 : w <= 8 ? 1.5 : 2;
  const r = rx ?? w / 2;
  const [ring, core] = finish === "cobalt" ? ["bring-x", "bin-x"] : finish === "enamel" ? ["ering-x", "ein-x"] : ["ring-x", "in-x"];
  const ci = { x: r1(x + inset), y: r1(y + inset), width: r1(w - 2 * inset), height: r1(h - 2 * inset), rx: Math.max(0, r - inset) };
  return (
    <>
      <rect x={r1(x)} y={r1(y)} width={r1(w)} height={r1(h)} rx={r} fill={ids.url(ring)} />
      {h > inset * 2 && w > inset * 2 ? <rect {...ci} fill={ids.url(core)} /> : null}
      {pending && h > inset * 2 && w > inset * 2 ? <rect {...ci} fill={ids.url("etch")} /> : null}
    </>
  );
}

/* ---------------------------------------------------------------- shared shell */

function DataTable({ caption, head, rows }: { caption: string; head: readonly string[]; rows: ReadonlyArray<readonly React.ReactNode[]> }) {
  return (
    // the 1px clip box is a wrapper: a table sizes to its caption and would widen the page
    <div className="chrome-chart__sr">
      <table>
        <caption>{caption}</caption>
        {/* an empty corner is a td: an empty th fails axe's empty-table-header rule */}
        <thead><tr>{head.map((h, i) => (h ? <th key={i} scope="col">{h}</th> : <td key={i} />))}</tr></thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>{row.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface A11yProps {
  /** Accessible name: one sentence that states what the chart shows and its key numbers. */
  "aria-label": string;
  /** Longer summary, read after the name (aria-describedby). */
  description?: string;
  /** Also render a visually hidden data table for screen readers. */
  dataTable?: boolean;
}

type ShellProps = DivProps & { kind: string; label: string; description?: string; table?: React.ReactNode; stage?: React.CSSProperties; fill?: boolean; stageRole?: "img" | "figure"; children: React.ReactNode };

const ChartShell = React.forwardRef<HTMLDivElement, ShellProps>(function ChartShell(
  { kind, label, description, table, stage, fill, stageRole = "img", className, children, ...props },
  ref
) {
  const descId = React.useId();
  return (
    <div ref={ref} className={cx("chrome-chart", className)} data-chart={kind} data-fill={fill || undefined} {...props}>
      <div className="chrome-chart__stage" role={stageRole} aria-label={label} aria-describedby={description ? descId : undefined} style={stage}>
        {children}
      </div>
      {description ? <p id={descId} className="chrome-chart__sr">{description}</p> : null}
      {table}
    </div>
  );
});

/* ---------------------------------------------------------------- cartesian frame */

export interface ChartPadding { top: number; right: number; bottom: number; left: number }
export interface ChartThreshold {
  value: number;
  label?: React.ReactNode;
  /** "danger" draws an enamel alert line. */
  tone?: "neutral" | "danger";
  /** "inside": above the line at the left of the plot (default); "axis": in the y-label gutter. */
  labelPlacement?: "inside" | "axis";
}
/** A shaded x range in index units, e.g. weekends: { from: 5.5, to: 7.5 }. */
export interface ChartBand { from: number; to: number }
export interface ChartHighlight {
  /** Data index of the highlighted point. */
  index: number;
  /** Series that get a bead at the index (default: the focus series). */
  series?: readonly number[];
  /** Value label beside the focus bead, in cobalt. */
  label?: React.ReactNode;
  /** Floating readout; compose it from <ChartTooltipRow>. */
  tooltip?: React.ReactNode;
  side?: "left" | "right";
  align?: "top" | "middle" | "bottom";
  /** Dashed drop line from the bead to the axis (default true). */
  crosshair?: boolean;
}

interface CartesianProps extends A11yProps, DivProps {
  height?: ChartHeight;
  /** One name per data index: x labels, tooltip and table rows. */
  labels?: readonly string[];
  /** Indices that show an x label (default: all). */
  xTicks?: readonly number[];
  renderXLabel?: (label: string, index: number) => React.ReactNode;
  /** Tuck the first and last x labels inside the plot (default true); false centres them on their points. */
  edgeLabels?: boolean;
  yTicks?: readonly number[];
  yDomain?: readonly [number, number];
  formatY?: (value: number) => React.ReactNode;
  /** false hides the y labels (the gridlines stay). */
  yLabels?: boolean;
  /** Small title over the plot, top left. */
  caption?: React.ReactNode;
  padding?: Partial<ChartPadding>;
  threshold?: ChartThreshold;
  bands?: readonly ChartBand[];
  /** Vertical event lines (dotted) at these indices. */
  markers?: readonly number[];
  highlight?: ChartHighlight;
}

type Geometry = { W: number; H: number; x0: number; x1: number; y0: number; y1: number; y: (v: number) => number; axis: number; font: number };

function useCartesian(props: CartesianProps, values: number[], fallbackWidth = 300) {
  const [node, size] = useSize(fallbackWidth);
  const { height = 180, yTicks, yDomain, threshold, yLabels = true, labels, padding } = props;
  const all = threshold ? [...values, threshold.value] : values;
  const { domain, ticks } = resolveY(all, yTicks, yDomain);
  const W = size.width;
  const H = height === "fill" ? size.height || 180 : height;
  const showX = Boolean(labels?.length);
  const pad: ChartPadding = { top: 19, right: 4, bottom: showX ? 21 : 4, left: yLabels ? 34 : 0, ...padding };
  const x0 = pad.left;
  const x1 = Math.max(x0 + 1, W - pad.right);
  const y0 = pad.top;
  const y1 = Math.max(y0 + 1, H - pad.bottom);
  const y = scale(domain[0], domain[1], y1, y0);
  const axis = domain[0] <= 0 && domain[1] >= 0 ? 0 : domain[0];
  const geo: Geometry = { W, H, x0, x1, y0, y1, y, axis, font: size.font };
  return { node, geo, ticks, fill: height === "fill" };
}

function Gridlines({ geo, ticks }: { geo: Geometry; ticks: readonly number[] }) {
  const d = ticks.filter((t) => t !== geo.axis).map((t) => `M${geo.x0} ${crisp(geo.y(t))}H${geo.x1}`).join("");
  return d ? <path className="chrome-chart__grid" d={d} /> : null;
}

const Axis = ({ geo }: { geo: Geometry }) => <path className="chrome-chart__axis" d={`M${geo.x0} ${crisp(geo.y(geo.axis))}H${geo.x1}`} />;

function Bands({ geo, bands, x }: { geo: Geometry; bands?: readonly ChartBand[]; x: (i: number) => number }) {
  if (!bands?.length) return null;
  return (
    <>
      {bands.map((b, i) => {
        const a = Math.max(geo.x0, Math.min(x(b.from), x(b.to)));
        const z = Math.min(geo.x1, Math.max(x(b.from), x(b.to)));
        return z > a ? <rect key={i} className="chrome-chart__band" x={r1(a)} y={geo.y0} width={r1(z - a)} height={geo.y1 - geo.y0} /> : null;
      })}
    </>
  );
}

function ThresholdLine({ geo, threshold }: { geo: Geometry; threshold?: ChartThreshold }) {
  if (!threshold) return null;
  return <path className="chrome-chart__rule" data-tone={threshold.tone === "danger" ? "danger" : undefined} d={`M${geo.x0} ${crisp(geo.y(threshold.value))}H${geo.x1}`} />;
}

/** HTML labels over the plot: y ticks, x labels, caption, threshold label. */
function AxisLabels({ geo, ticks, props, x, edgeAnchor }: { geo: Geometry; ticks: readonly number[]; props: CartesianProps; x: (i: number) => number; edgeAnchor: boolean }) {
  const { labels, xTicks, renderXLabel, formatY = formatCompact, yLabels = true, caption, threshold, edgeLabels = true } = props;
  const n = labels?.length ?? 0;
  const wanted = xTicks ?? Array.from({ length: n }, (_, i) => i);
  // shortcut: label width estimated from character count (0.6 em a glyph), good enough for dates and times
  const longest = Math.max(0, ...wanted.map((i) => labels?.[i]?.length ?? 0));
  const span = wanted.length > 1 ? Math.abs(x(wanted[wanted.length - 1]!) - x(wanted[0]!)) / (wanted.length - 1) : Infinity;
  const stride = Math.max(1, Math.ceil((longest * geo.font * 0.6 + 8) / span));
  const xIdx = wanted.filter((_, k) => k % stride === 0);
  const yRight = `calc(100% - ${geo.x0}px + var(--chrome-chart-tick-gap, 6px))`;
  return (
    <>
      {caption ? <span className="chrome-chart__caption" style={{ left: geo.x0 }}>{caption}</span> : null}
      {yLabels
        ? ticks.map((t) => (
            <span key={t} className="chrome-chart__label" data-axis="y" style={{ top: crisp(geo.y(t)), right: yRight }}>{formatY(t)}</span>
          ))
        : null}
      {threshold?.label ? (
        threshold.labelPlacement === "axis" ? (
          <span className="chrome-chart__label" data-axis="y" style={{ top: crisp(geo.y(threshold.value)), right: yRight }}>{threshold.label}</span>
        ) : (
          <span className="chrome-chart__label" data-kind="rule" style={{ left: geo.x0 + 4, top: crisp(geo.y(threshold.value)) - 3 }}>{threshold.label}</span>
        )
      ) : null}
      {xIdx.map((i) => {
        const label = labels?.[i];
        if (label == null) return null;
        const anchor = edgeAnchor && edgeLabels && n > 1 ? (i === 0 ? "start" : i === n - 1 ? "end" : undefined) : undefined;
        return (
          <span key={i} className="chrome-chart__label" data-axis="x" data-anchor={anchor} style={{ left: r1(x(i)), top: `calc(${geo.y1}px + var(--chrome-chart-label-gap, 8px))` }}>
            {renderXLabel ? renderXLabel(label, i) : label}
          </span>
        );
      })}
    </>
  );
}

function Readout({ geo, x, y, highlight }: { geo: Geometry; x: number; y: number; highlight: ChartHighlight }) {
  const mid = (geo.x0 + geo.x1) / 2;
  const side = highlight.side ?? (x > mid ? "left" : "right");
  const labelSide = x > mid ? "left" : "right";
  const align = highlight.align ?? "top";
  const pos: React.CSSProperties = side === "left" ? { right: r1(geo.W - x + 16) } : { left: r1(x + 16) };
  if (align === "bottom") pos.bottom = r1(geo.H - geo.y1 + 16);
  else if (align === "middle") pos.top = r1(geo.H / 2);
  else pos.top = Math.max(0, geo.y0 - 10);
  return (
    <>
      {highlight.label != null ? (
        <span className="chrome-chart__label" data-kind="value" data-side={labelSide} data-accent="" style={{ left: r1(labelSide === "left" ? x - 8 : x + 8), top: r1(y - 8.5) }}>
          {highlight.label}
        </span>
      ) : null}
      {highlight.tooltip != null ? <div className="chrome-chart__tooltip" style={pos}>{highlight.tooltip}</div> : null}
    </>
  );
}

function seriesTable(caption: string, labels: readonly string[] | undefined, series: ReadonlyArray<{ label: string; data: ReadonlyArray<unknown> }>) {
  const n = Math.max(labels?.length ?? 0, ...series.map((s) => s.data.length));
  const cell = (v: unknown) => {
    const value = v !== null && typeof v === "object" ? (v as { value?: unknown }).value : v;
    return isNum(value) ? formatNumber(value) : "–";
  };
  return (
    <DataTable
      caption={caption}
      head={["", ...series.map((s) => s.label)]}
      rows={Array.from({ length: n }, (_, i) => [labels?.[i] ?? String(i + 1), ...series.map((s) => cell(s.data[i]))])}
    />
  );
}

/* ---------------------------------------------------------------- line and area */

export interface ChartSeries {
  label: string;
  data: ReadonlyArray<number | null>;
  /** cobalt (focus), smoked, silver, enamel or dashed (comparison). Default: first series cobalt, the rest silver. */
  finish?: ChartFinish;
  /** Fill under the wire with the cobalt-to-mint area gradient. */
  area?: boolean;
}

export interface LineChartProps extends CartesianProps {
  series: readonly ChartSeries[];
  curve?: "linear" | "smooth";
  /** Wire weight: sm for thumbnails, md for cards (default), lg for full-width template plots. */
  weight?: ChartWeight;
}

function runs(data: ReadonlyArray<number | null>, x: (i: number) => number, y: (v: number) => number) {
  const out: Pt[][] = [];
  let cur: Pt[] = [];
  data.forEach((v, i) => {
    if (isNum(v)) cur.push([x(i), y(v)]);
    else if (cur.length) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
}

function linePath(pts: readonly Pt[], curve: "linear" | "smooth") {
  const f = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;
  const first = pts[0];
  if (!first) return "";
  if (pts.length === 1) return `M${f(first)}L${f(first)}`;
  if (curve === "linear") return `M${f(first)}` + pts.slice(1).map((p) => `L${f(p)}`).join("");
  // Catmull-Rom through every point, as Bézier segments (tension 1/6)
  let d = `M${f(first)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += `C${f([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${f([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${f(p2)}`;
  }
  return d;
}

const LineLike = React.forwardRef<HTMLDivElement, LineChartProps & { kind: "line" | "area" }>(function LineLike({ kind, ...props }, ref) {
  const { series, curve = "linear", weight = "md", labels, threshold, bands, markers, highlight, "aria-label": label, description, dataTable, className } = props;
  const rest = domProps(props, [...CARTESIAN_KEYS, "series", "curve", "weight"]);
  const ids = useChartIds();
  const values = series.flatMap((s) => s.data.filter(isNum));
  const { node, geo, ticks, fill } = useCartesian(props, values);
  useExposedRef(ref, node);
  const n = Math.max(labels?.length ?? 0, ...series.map((s) => s.data.length));
  const x = (i: number) => (n <= 1 ? (geo.x0 + geo.x1) / 2 : geo.x0 + (i * (geo.x1 - geo.x0)) / (n - 1));
  const finishOf = (s: ChartSeries, i: number): ChartFinish => s.finish ?? (i === 0 ? "cobalt" : "silver");
  const focusIndex = Math.max(0, series.findIndex((s, i) => finishOf(s, i) === "cobalt"));
  const base = geo.y(geo.axis);
  const ww = WIRE_WIDTHS[weight];

  const hi = highlight && highlight.index >= 0 && highlight.index < n ? highlight : undefined;
  const beads = hi
    ? (hi.series ?? [focusIndex]).flatMap((si) => {
        const s = series[si];
        const v = s?.data[hi.index];
        return s && isNum(v) ? [{ x: x(hi.index), y: geo.y(v), focus: finishOf(s, si) === "cobalt" }] : [];
      })
    : [];
  const focusBead = beads.find((b) => b.focus) ?? beads[0];
  const topBead = beads.reduce<(typeof beads)[number] | undefined>((a, b) => (!a || b.y < a.y ? b : a), undefined);

  return (
    <ChartShell
      ref={node}
      kind={kind}
      label={label}
      description={description}
      fill={fill}
      className={cx(`chrome-${kind}-chart`, className)}
      stage={{ height: geo.H }}
      table={dataTable ? seriesTable(label, labels, series) : null}
      {...rest}
    >
      <svg viewBox={`0 0 ${geo.W} ${geo.H}`} height={geo.H} aria-hidden="true" focusable="false">
        <ChartDefs ids={ids} wire />
        <Bands geo={geo} bands={bands} x={x} />
        <Gridlines geo={geo} ticks={ticks} />
        <Axis geo={geo} />
        {series.map((s, si) =>
          s.area ?? (kind === "area" && si === 0)
            ? runs(s.data, x, geo.y).map((pts, ri) => {
                const head = pts[0]!;
                const tail = pts[pts.length - 1]!;
                return <path key={`${si}-${ri}`} d={`${linePath(pts, curve)}L${r1(tail[0])} ${r1(base)}L${r1(head[0])} ${r1(base)}Z`} fill={ids.url("area")} />;
              })
            : null
        )}
        <ThresholdLine geo={geo} threshold={threshold} />
        {markers?.map((m) => <path key={m} className="chrome-chart__marker" d={`M${r1(x(m))} ${geo.y0}V${geo.y1}`} />)}
        {series
          .map((s, si) => ({ s, si }))
          .reverse()
          .map(({ s, si }) => (
            <g key={si}>
              {runs(s.data, x, geo.y).map((pts, ri) => <Wire key={ri} d={linePath(pts, curve)} finish={finishOf(s, si)} weight={weight} ids={ids} />)}
            </g>
          ))}
        {hi && topBead && hi.crosshair !== false ? (
          <path className="chrome-chart__cross" d={`M${r1(topBead.x)} ${r1(topBead.y + ww.bead[0] + 1.5)}V${r1(base)}`} />
        ) : null}
        {beads.map((b, i) => <Bead key={i} x={b.x} y={b.y} r={b.focus ? ww.bead[0] : ww.bead[1]} focus={b.focus} ids={ids} />)}
      </svg>
      <AxisLabels geo={geo} ticks={ticks} props={props} x={x} edgeAnchor />
      {hi && focusBead ? <Readout geo={geo} x={focusBead.x} y={focusBead.y} highlight={hi} /> : null}
    </ChartShell>
  );
});

/** Several series on one scale; one cobalt wire in focus. */
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(function LineChart(props, ref) {
  return <LineLike ref={ref} kind="line" {...props} />;
});

/** A line chart whose first series is filled to the axis. */
export const AreaChart = React.forwardRef<HTMLDivElement, LineChartProps>(function AreaChart(props, ref) {
  return <LineLike ref={ref} kind="area" {...props} />;
});

/* ---------------------------------------------------------------- bars */

export interface BarDatum { value: number | null; finish?: BarFinish; /** Etched overlay: pending, partial or week-to-date. */ pending?: boolean }
export interface BarSeries { label: string; data: ReadonlyArray<number | null | BarDatum>; finish?: BarFinish }

export interface BarChartProps extends CartesianProps {
  series: readonly BarSeries[];
  /** Bar width in px (default 12; the core insets 2 px, 3 px from 20 px up). */
  barWidth?: number;
  /** Gap between bars of one group (default 2). */
  barGap?: number;
  /** Text above each bar, e.g. its value; return null to skip. */
  valueLabel?: (value: number, index: number, seriesIndex: number) => React.ReactNode;
  /** Mint floor glow under the bars (default true). */
  glow?: boolean;
}

const datum = (d: number | null | BarDatum | undefined): BarDatum => (d !== null && typeof d === "object" ? d : { value: d ?? null });

/** Grouped satin pill bars; values below zero hang from the axis. */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(function BarChart(props, ref) {
  const { series, barWidth = 12, barGap = 2, valueLabel, glow = true, labels, threshold, bands, markers, "aria-label": label, description, dataTable, className } = props;
  const rest = domProps(props, [...CARTESIAN_KEYS, "series", "barWidth", "barGap", "valueLabel", "glow"]);
  const ids = useChartIds();
  const values = series.flatMap((s) => s.data.map((d) => datum(d).value).filter(isNum));
  const { node, geo, ticks, fill } = useCartesian(props, values);
  useExposedRef(ref, node);
  const n = Math.max(labels?.length ?? 0, ...series.map((s) => s.data.length), 1);
  const bw = (geo.x1 - geo.x0) / n;
  const x = (i: number) => geo.x0 + (i + 0.5) * bw;
  const k = Math.max(1, series.length);
  const barW = Math.max(2, Math.min(barWidth, (bw * 0.84 - (k - 1) * barGap) / k));
  const group = k * barW + (k - 1) * barGap;
  const base = geo.y(geo.axis);
  const finishOf = (s: BarSeries, i: number): BarFinish => s.finish ?? (i === 0 ? "cobalt" : "silver");

  const bars = series.flatMap((s, si) =>
    s.data.map((d, i) => {
      const { value, finish, pending } = datum(d);
      if (!isNum(value)) return null;
      const top = Math.min(geo.y(value), base);
      const h = Math.abs(geo.y(value) - base);
      return { key: `${si}-${i}`, si, i, value, x: x(i) - group / 2 + si * (barW + barGap), top, h, finish: finish ?? finishOf(s, si), pending };
    })
  ).filter((b): b is NonNullable<typeof b> => b !== null);

  return (
    <ChartShell
      ref={node}
      kind="bar"
      label={label}
      description={description}
      fill={fill}
      className={cx("chrome-bar-chart", className)}
      stage={{ height: geo.H }}
      table={dataTable ? seriesTable(label, labels, series) : null}
      {...rest}
    >
      <svg viewBox={`0 0 ${geo.W} ${geo.H}`} height={geo.H} aria-hidden="true" focusable="false">
        <ChartDefs ids={ids} bar />
        <Bands geo={geo} bands={bands} x={x} />
        <Gridlines geo={geo} ticks={ticks} />
        <ThresholdLine geo={geo} threshold={threshold} />
        {markers?.map((m) => <path key={m} className="chrome-chart__marker" d={`M${r1(x(m))} ${geo.y0}V${geo.y1}`} />)}
        {glow && bars.length ? (
          <ellipse className="chrome-chart__glow" cx={r1((geo.x0 + geo.x1) / 2 + 1)} cy={r1(base + 1)} rx={r1(Math.max(1, (geo.x1 - geo.x0) / 2 - 7))} ry="4" filter={ids.url("blur")} />
        ) : null}
        {bars.map((b) => <Pill key={b.key} x={b.x} y={b.top} w={barW} h={b.h} finish={b.finish} pending={b.pending} ids={ids} />)}
        <Axis geo={geo} />
      </svg>
      <AxisLabels geo={geo} ticks={ticks} props={props} x={x} edgeAnchor={false} />
      {valueLabel
        ? bars.map((b) => {
            const text = valueLabel(b.value, b.i, b.si);
            return text == null ? null : (
              <span key={b.key} className="chrome-chart__label" data-axis="x" data-strong="" style={{ left: r1(b.x + barW / 2), top: r1((b.value < 0 ? b.top + b.h + 4 : b.top - 16)) }}>
                {text}
              </span>
            );
          })
        : null}
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- scatter */

export interface ScatterSeries { label: string; points: ReadonlyArray<readonly [x: number, y: number]>; finish?: "cobalt" | "silver" | "smoked" }

export interface ScatterChartProps extends A11yProps, DivProps {
  series: readonly ScatterSeries[];
  edgeLabels?: boolean;
  height?: ChartHeight;
  xDomain?: readonly [number, number];
  yDomain?: readonly [number, number];
  xTicks?: readonly number[];
  yTicks?: readonly number[];
  formatX?: (value: number) => React.ReactNode;
  formatY?: (value: number) => React.ReactNode;
  caption?: React.ReactNode;
  padding?: Partial<ChartPadding>;
}

/** Paired measures as metal beads; the cobalt series stands out. */
export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(function ScatterChart(props, ref) {
  const { series, xDomain, xTicks, formatX = formatCompact, yDomain, yTicks, formatY, caption, padding, "aria-label": label, description, dataTable, className } = props;
  const rest = domProps(props, [...CARTESIAN_KEYS, "series", "xDomain", "formatX"]);
  const ids = useChartIds();
  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = series.flatMap((s) => s.points.map((p) => p[1]));
  const xr = resolveY(xs, xTicks, xDomain);
  const xLabels = xr.ticks.map((t) => String(t));
  const cart: CartesianProps = { "aria-label": label, height: props.height, yDomain, yTicks, formatY, caption, padding, labels: xLabels, edgeLabels: props.edgeLabels };
  const { node, geo, ticks, fill } = useCartesian(cart, ys);
  useExposedRef(ref, node);
  const sx = scale(xr.domain[0], xr.domain[1], geo.x0, geo.x1);
  const ordered = series.map((s, si) => ({ s, si, finish: s.finish ?? (si === 0 ? "cobalt" : "silver") })).reverse();
  const tickX = (i: number) => sx(xr.ticks[i] ?? 0);
  return (
    <ChartShell
      ref={node}
      kind="scatter"
      label={label}
      description={description}
      fill={fill}
      className={cx("chrome-scatter-chart", className)}
      stage={{ height: geo.H }}
      table={
        dataTable ? (
          <DataTable caption={label} head={["Series", "x", "y"]} rows={series.flatMap((s) => s.points.map((p) => [s.label, formatNumber(p[0]), formatNumber(p[1])]))} />
        ) : null
      }
      {...rest}
    >
      <svg viewBox={`0 0 ${geo.W} ${geo.H}`} height={geo.H} aria-hidden="true" focusable="false">
        <ChartDefs ids={ids} wire />
        <Gridlines geo={geo} ticks={ticks} />
        <Axis geo={geo} />
        {ordered.map(({ s, si, finish }) => (
          <g key={si} fill={ids.url(finish === "cobalt" ? "bead-b" : "bead")} style={{ stroke: finish === "cobalt" ? "#0b2687" : "var(--chrome-chart-bead-edge)", filter: finish === "smoked" ? "brightness(.6)" : undefined }} strokeWidth={finish === "cobalt" ? 0.5 : 0.4}>
            {s.points.map((p, i) => <circle key={i} cx={r1(sx(p[0]))} cy={r1(geo.y(p[1]))} r={finish === "cobalt" ? 4.6 : 3.8} />)}
          </g>
        ))}
      </svg>
      <AxisLabels geo={geo} ticks={ticks} props={{ ...cart, renderXLabel: (_l, i) => formatX(xr.ticks[i] ?? 0) }} x={tickX} edgeAnchor />
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- waveform */

export interface WaveformProps extends A11yProps, DivProps {
  /** Amplitudes 0–1, one bar each, spread across the width. */
  peaks: readonly number[];
  /** Length in seconds. */
  duration: number;
  /** Playhead in seconds; bars before it are cobalt. */
  position?: number;
  height?: number;
  /** Seconds between time labels (default 30). */
  tickEvery?: number;
  formatTime?: (seconds: number) => string;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Amplitude as a chrome equaliser with a playhead. */
export const Waveform = React.forwardRef<HTMLDivElement, WaveformProps>(function Waveform(
  { peaks, duration, position, height = 180, tickEvery = 30, formatTime = mmss, "aria-label": label, description, dataTable: _table, className, ...rest },
  ref
) {
  const ids = useChartIds();
  const [node, size] = useSize(300);
  useExposedRef(ref, node);
  const W = size.width;
  const H = height;
  const axis = H - 21;
  const top = 20;
  const bottom = axis - 17;
  const mid = (top + bottom) / 2;
  const half = (bottom - top) / 2;
  const pitch = peaks.length ? W / peaks.length : W;
  const head = isNum(position) && duration > 0 ? Math.max(0, Math.min(W, (position / duration) * W)) : null;
  const played: string[] = [];
  const rest_: string[] = [];
  peaks.forEach((p, i) => {
    const cx_ = r1(pitch * (i + 0.5));
    const a = r1(Math.max(0.02, Math.min(1, p)) * half);
    (head !== null && cx_ < head ? played : rest_).push(`M${cx_} ${r1(mid - a)}V${r1(mid + a)}`);
  });
  const ticks = duration > 0 && tickEvery > 0 ? Array.from({ length: Math.floor(duration / tickEvery) + 1 }, (_, i) => i * tickEvery).filter((t) => t < duration) : [];
  const tx = (t: number) => (duration > 0 ? (t / duration) * W : 0);
  const stroke = Math.min(3.4, pitch * 0.7);
  return (
    <ChartShell ref={node} kind="waveform" label={label} description={description} className={cx("chrome-waveform", className)} stage={{ height: H }} {...rest}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} aria-hidden="true" focusable="false">
        <ChartDefs ids={ids} eq={[top, bottom]} />
        {played.length ? <path d={played.join("")} stroke={ids.url("eq-b")} strokeWidth={stroke} strokeLinecap="round" /> : null}
        {rest_.length ? <path d={rest_.join("")} stroke={ids.url("eq")} strokeWidth={stroke} strokeLinecap="round" /> : null}
        {head !== null ? (
          <>
            <path className="chrome-chart__tickmark" d={`M${r1(head)} ${top - 1}V${axis - 8}`} strokeWidth="1.2" strokeLinecap="butt" />
            <circle cx={r1(head)} cy={top - 6} r="5" fill={ids.url("bead")} stroke="#25282a" strokeWidth=".5" />
          </>
        ) : null}
        <path className="chrome-chart__axis" d={`M0 ${axis + 0.5}H${W}${ticks.slice(1).map((t) => `M${Math.round(tx(t)) + 0.5} ${axis}v4`).join("")}`} />
      </svg>
      {head !== null ? (
        <span className="chrome-chart__label" data-strong="" style={{ left: r1(head + 9), top: top - 12 }}>
          {formatTime(position ?? 0)} <span style={{ color: "var(--chrome-text-3)", fontWeight: 400 }}>/ {formatTime(duration)}</span>
        </span>
      ) : null}
      {ticks.map((t, i) => (
        <span key={t} className="chrome-chart__label" data-axis="x" data-anchor={i === 0 ? "start" : undefined} style={{ left: r1(tx(t)), top: `calc(${axis}px + var(--chrome-chart-label-gap, 8px))` }}>
          {formatTime(t)}
        </span>
      ))}
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- sparkline */

export interface SparklineProps extends Omit<React.SVGProps<SVGSVGElement>, "ref" | "height"> {
  data: ReadonlyArray<number | null>;
  /** silver by default; cobalt marks the one series in focus. */
  finish?: Exclude<ChartFinish, "dashed">;
  /** Recolour the line from this index on, e.g. an enamel tail for a spike. */
  tail?: { from: number; finish: Exclude<ChartFinish, "dashed"> };
  height?: number;
  /** Value range; defaults to the data's min and max with a little air. */
  domain?: readonly [number, number];
  /** Without a label the sparkline is decorative (aria-hidden), as beside a stat value. */
  "aria-label"?: string;
}

/** A tiny polished wire, stretched to its container's width. */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  { data, finish = "silver", tail, height = 24, domain, className, style, "aria-label": label, ...props },
  ref
) {
  const ids = useChartIds();
  const vals = data.filter(isNum);
  const lo = domain?.[0] ?? (vals.length ? Math.min(...vals) : 0);
  const hi = domain?.[1] ?? (vals.length ? Math.max(...vals) : 1);
  const pad = domain ? 0 : Math.min(4, height * 0.15);
  const y = scale(lo, hi === lo ? lo + 1 : hi, height - pad, pad);
  const n = data.length;
  const x = (i: number) => (n <= 1 ? 50 : (i * 100) / (n - 1));
  const from = tail ? Math.max(0, Math.min(n - 1, tail.from)) : n;
  const head = runs(data.slice(0, from + 1), x, y);
  const end = tail ? runs(data.map((v, i) => (i >= from ? v : null)), x, y) : [];
  return (
    <svg
      ref={ref}
      className={cx("chrome-sparkline", className)}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height, overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      {head.map((pts, i) => <Wire key={i} d={linePath(pts, "linear")} finish={finish} weight="spark" ids={ids} scaling={false} />)}
      {end.map((pts, i) => <Wire key={`t${i}`} d={linePath(pts, "linear")} finish={tail!.finish} weight="spark" ids={ids} scaling={false} />)}
    </svg>
  );
});

/* ---------------------------------------------------------------- bar list */

export interface BarListItem { label: React.ReactNode; value: number; /** Shown instead of the formatted value. */ display?: React.ReactNode }
export interface BarListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  items: readonly BarListItem[];
  "aria-label": string;
  /** Index drawn in cobalt (default 0); null for none. */
  focus?: number | null;
  /** Value of a full-width bar (default: the largest item). */
  max?: number;
  formatValue?: (value: number) => React.ReactNode;
}

/** Ranked items with satin pill bars and values beside them. */
export const BarList = React.forwardRef<HTMLUListElement, BarListProps>(function BarList(
  { items, focus = 0, max, formatValue = formatCompact, className, ...props },
  ref
) {
  const top = max ?? Math.max(0, ...items.map((it) => it.value));
  return (
    <ul ref={ref} className={cx("chrome-bar-list", className)} {...props}>
      {items.map((it, i) => (
        <li key={i} data-focus={i === focus || undefined}>
          <span className="chrome-bar-list__label">{it.label}</span>
          <span className="chrome-bar-list__track" aria-hidden="true">
            <span className="chrome-pill" data-finish={i === focus ? "cobalt" : undefined} style={{ width: `${top > 0 ? Math.max(0, Math.min(1, it.value / top)) * 100 : 0}%` }} />
          </span>
          <span className="chrome-bar-list__value">{it.display ?? formatValue(it.value)}</span>
        </li>
      ))}
    </ul>
  );
});

/* ---------------------------------------------------------------- gauge */

export interface GaugeProps extends A11yProps, DivProps {
  value: number;
  min?: number;
  max?: number;
  /** Big number in the dial (default: the value as a whole percent of the range). */
  valueText?: string;
  unit?: string;
  /** Sub-label under the number. */
  label?: string;
  /** A marked level, e.g. the paging threshold. */
  threshold?: { value: number; label?: string };
  /** Scale labels at the start, middle and end of the arc; false hides them. Dial only. */
  scaleLabels?: readonly [string, string, string] | false;
  /** dial: 270° gauge in a 300×180 stage. ring: full-circle bezel, compact (see size). */
  variant?: "dial" | "ring";
  /** Rendered height in px (dial default 180, ring default 88). */
  size?: number;
}

/** One score in a satin bezel against its threshold. */
export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  { value, min = 0, max = 100, valueText, unit = "%", label, threshold, scaleLabels = ["0%", "50%", "100%"], variant = "dial", size, "aria-label": ariaLabel, description, dataTable: _t, className, style, ...rest },
  ref
) {
  const ids = useChartIds();
  const frac = (v: number) => (max === min ? 0 : Math.max(0, Math.min(1, (v - min) / (max - min))));
  const f = frac(value);
  const text = valueText ?? String(Math.round(f * 100));
  const ring = variant === "ring";
  const box = ring ? 176 : 300;
  const boxH = ring ? 176 : 180;
  const c = ring ? { x: 88, y: 88 } : { x: 150, y: 96 };
  const g = ring
    ? { bezel: 80, bezelW: 12, outer: 86.6, inner: 73.4, hair: 1.6, disc: 72.8, track: 58, w: 13, mid: 9.2, spec: 2.4, nudge: 1.3, sweep: 1, start: -90 }
    : { bezel: 72, bezelW: 10, outer: 77.5, inner: 66.5, hair: 1, disc: 66, track: 54, w: 9, mid: 6.4, spec: 1.6, nudge: 0.9, sweep: 0.75, start: 135 };
  const C = 2 * Math.PI * g.track;
  const arc = (len: number) => `${r1(len)} ${r1(C)}`;
  const rot = `rotate(${g.start} ${c.x} ${c.y})`;
  const polar = (v: number, r: number) => {
    const a = ((g.start + frac(v) * 360 * g.sweep) * Math.PI) / 180;
    return [c.x + r * Math.cos(a), c.y + r * Math.sin(a)] as const;
  };
  const h = size ?? (ring ? 88 : 180);
  const t = threshold ? { a: polar(threshold.value, 48), b: polar(threshold.value, 60), l: polar(threshold.value, 85) } : null;
  return (
    <div ref={ref} className={cx("chrome-chart", "chrome-gauge", className)} data-chart="gauge" data-variant={variant} style={{ width: ring ? h : undefined, ...style }} {...rest}>
      <svg viewBox={`0 0 ${box} ${boxH}`} height={h} width={ring ? h : "100%"} role="img" aria-label={ariaLabel} style={{ display: "block", overflow: "visible" }}>
        {description ? <desc>{description}</desc> : null}
        <ChartDefs ids={ids} gauge />
        {!ring ? <ellipse className="chrome-chart__glow" cx={c.x} cy="170" rx="70" ry="5" filter={ids.url("blur")} /> : null}
        <circle cx={c.x} cy={c.y} r={g.bezel} fill="none" stroke={ids.url("bezel")} strokeWidth={g.bezelW} />
        <circle cx={c.x} cy={c.y} r={g.outer} fill="none" stroke={ids.url("bezel-s")} strokeWidth={g.hair} />
        <circle cx={c.x} cy={c.y} r={g.inner} fill="none" stroke="#686A69" strokeWidth={g.hair} />
        <circle cx={c.x} cy={c.y} r={g.disc} fill={ids.url("disc")} />
        <g fill="none" strokeLinecap={ring ? "butt" : "round"} strokeDasharray={arc(C * g.sweep)}>
          <circle cx={c.x} cy={c.y} r={g.track} style={{ stroke: "var(--chrome-chart-track-shade)" }} strokeWidth={g.w} transform={rot} />
          <circle cx={c.x} cy={c.y} r={g.track} style={{ stroke: "var(--chrome-chart-track)" }} strokeWidth={g.w * 0.82} transform={`translate(0 ${r1(g.w * 0.09)}) ${rot}`} />
        </g>
        {f > 0 ? (
          <g fill="none" strokeLinecap="round" strokeDasharray={arc(C * g.sweep * f)}>
            <circle cx={c.x} cy={c.y} r={g.track} stroke="#0d2a8a" strokeWidth={g.w} transform={rot} />
            <circle cx={c.x} cy={c.y} r={g.track} stroke="#2f5fff" strokeWidth={g.mid} transform={rot} />
            <circle cx={c.x} cy={c.y} r={g.track} stroke="#c3d1ff" strokeWidth={g.spec} transform={`translate(0 ${-g.nudge}) ${rot}`} />
          </g>
        ) : null}
        {t ? (
          <>
            <path className="chrome-chart__tickmark" d={`M${r1(t.a[0])} ${r1(t.a[1])} ${r1(t.b[0])} ${r1(t.b[1])}`} strokeWidth="2" />
            {threshold?.label ? (
              <text x={r1(t.l[0])} y={r1(t.l[1] + 0.5)} fontSize="10" textAnchor={Math.abs(t.l[0] - c.x) < 10 ? "middle" : t.l[0] < c.x ? "end" : "start"}>{threshold.label}</text>
            ) : null}
          </>
        ) : null}
        {!ring && scaleLabels ? (
          <g fontSize="10" textAnchor="middle">
            <text x={c.x - 51} y="172">{scaleLabels[0]}</text>
            <text x={c.x} y="12">{scaleLabels[1]}</text>
            <text x={c.x + 51} y="172">{scaleLabels[2]}</text>
          </g>
        ) : null}
        <text className="chrome-chart__strong" x={c.x} y={ring ? 101 : 104} textAnchor="middle" fontSize={ring ? 36 : 32} style={{ fontWeight: ring ? 500 : 600, letterSpacing: "-0.02em" }}>
          {text}
          {unit ? <tspan dx="1" fontSize={ring ? 17 : 14} style={{ fontWeight: 500, fill: ring ? "var(--chrome-text-2)" : "var(--chrome-text-3)" }}>{unit}</tspan> : null}
        </text>
        {label && !ring ? <text x={c.x} y="121" textAnchor="middle" fontSize="10">{label}</text> : null}
      </svg>
    </div>
  );
});

/* ---------------------------------------------------------------- rings and donut */

export interface RingDatum { label: string; value: number; max?: number; /** Shown instead of the percent. */ display?: string; finish?: "cobalt" | "smoked" | "silver" }

export interface RadialRingsProps extends A11yProps, DivProps {
  rings: readonly RingDatum[];
  /** Two lines in the middle: a mono title and a caption. */
  center?: { title: string; caption?: string };
  /** Legend beside the rings (default true). */
  legend?: boolean;
}

const RING_METAL = {
  cobalt: ["#0d2a8a", "#2f5fff", "#c3d1ff"],
  smoked: ["var(--chrome-chart-ring-smoke-0)", "var(--chrome-chart-ring-smoke-1)", "var(--chrome-chart-ring-smoke-2)"],
  silver: ["#6b7072", "#c3c8c9", "#ffffff"]
} as const;
const RING_ORDER = ["cobalt", "smoked", "silver"] as const;

/** A few percentages as nested chrome rings, with a legend. */
export const RadialRings = React.forwardRef<HTMLDivElement, RadialRingsProps>(function RadialRings(
  { rings, center, legend = true, "aria-label": label, description, dataTable: _t, className, ...rest },
  ref
) {
  const shown = rings.slice(0, 4);
  const fin = (r: RingDatum, i: number) => r.finish ?? RING_ORDER[Math.min(i, 2)]!;
  const pct = (r: RingDatum) => Math.max(0, Math.min(1, r.value / (r.max ?? 100)));
  const rot = "rotate(-90 80 90)";
  return (
    <ChartShell ref={ref} kind="rings" label={label} description={description} stageRole="figure" className={cx("chrome-rings", className)} {...rest}>
      <div className="chrome-dial">
        <svg width="160" height="180" viewBox="0 0 160 180" aria-hidden="true" focusable="false">
          <g fill="none" strokeWidth="11" style={{ stroke: "var(--chrome-chart-grid)" }}>
            {shown.map((_, i) => <circle key={i} cx="80" cy="90" r={72 - 16 * i} />)}
          </g>
          <g fill="none" strokeWidth="1" style={{ stroke: "var(--chrome-chart-rim)" }}>
            {shown.map((_, i) => <circle key={i} cx="80" cy="90" r={78 - 16 * i} />)}
          </g>
          {shown.map((r, i) => {
            const rad = 72 - 16 * i;
            const C = 2 * Math.PI * rad;
            const dash = `${r1(pct(r) * C)} ${r1(C)}`;
            const [a, b, s] = RING_METAL[fin(r, i)];
            return pct(r) > 0 ? (
              <g key={i} fill="none" strokeLinecap="round" strokeDasharray={dash}>
                <circle cx="80" cy="90" r={rad} style={{ stroke: a }} strokeWidth="11" transform={rot} />
                <circle cx="80" cy="90" r={rad} style={{ stroke: b }} strokeWidth="8" transform={rot} />
                <circle cx="80" cy="90" r={rad} style={{ stroke: s }} strokeWidth="1.6" transform={`translate(0 -1.2) ${rot}`} />
              </g>
            ) : null;
          })}
          {center ? (
            <g fontSize="10" textAnchor="middle">
              <text className="chrome-chart__mono" x="80" y="88">{center.title}</text>
              {center.caption ? <text x="80" y="101">{center.caption}</text> : null}
            </g>
          ) : null}
        </svg>
        {legend ? (
          <ul className="chrome-dial__legend">
            {shown.map((r, i) => (
              <li key={i} data-focus={fin(r, i) === "cobalt" || undefined}>
                <ChartSwatch kind="bead" finish={fin(r, i)} />
                <span>{r.label}</span>
                <span>{r.display ?? `${Math.round(pct(r) * 100)}%`}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ChartShell>
  );
});

export interface DonutSegment { label: string; value: number; /** Shown instead of the share. */ display?: string; finish?: "cobalt" | "smoked" | "silver" | "flat" }
export interface DonutChartProps extends A11yProps, DivProps {
  segments: readonly DonutSegment[];
  /** Big number in the centre, e.g. the total. */
  centerLabel?: string;
  centerCaption?: string;
  legend?: boolean;
}

const SEG_ORDER = ["cobalt", "smoked", "silver", "flat"] as const;

/** Share of a total in chrome segments. */
export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(function DonutChart(
  { segments, centerLabel, centerCaption, legend = true, "aria-label": label, description, dataTable, className, ...rest },
  ref
) {
  const ids = useChartIds();
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const C = 2 * Math.PI * 62;
  const fin = (s: DonutSegment, i: number) => s.finish ?? SEG_ORDER[Math.min(i, 3)]!;
  const share = (s: DonutSegment) => (total > 0 ? Math.max(0, s.value) / total : 0);
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 2 : 0;
  let offset = 0;
  const arcs = segments.map((s, i) => {
    const len = share(s) * C;
    const a = { i, dash: `${r1(Math.max(0, len - gap))} ${r1(C)}`, offset: r1(-offset), finish: fin(s, i), len };
    offset += len;
    return a;
  });
  const stroke = (f: ReturnType<typeof fin>) => (f === "flat" ? "var(--chrome-chart-flat)" : ids.url(f === "cobalt" ? "seg-b-r" : f === "smoked" ? "seg-d-r" : "seg-s-r"));
  return (
    <ChartShell
      ref={ref}
      kind="donut"
      label={label}
      description={description}
      stageRole="figure"
      className={cx("chrome-donut-chart", className)}
      table={dataTable ? <DataTable caption={label} head={["Segment", "Value", "Share"]} rows={segments.map((s) => [s.label, formatNumber(s.value), formatPercent(share(s))])} /> : null}
      {...rest}
    >
      <div className="chrome-dial">
        <svg width="160" height="180" viewBox="0 0 160 180" aria-hidden="true" focusable="false">
          <ChartDefs ids={ids} seg />
          <ellipse className="chrome-chart__glow" cx="80" cy="166" rx="56" ry="5" filter={ids.url("blur")} />
          <g fill="none" strokeWidth="20" transform="rotate(-90 80 90)">
            {total > 0 ? (
              arcs.map((a) => (a.len > 0 ? <circle key={a.i} cx="80" cy="90" r="62" style={{ stroke: stroke(a.finish) }} strokeDasharray={a.dash} strokeDashoffset={a.offset} /> : null))
            ) : (
              <circle cx="80" cy="90" r="62" style={{ stroke: "var(--chrome-chart-flat)" }} />
            )}
          </g>
          <circle cx="80" cy="90" r="72.5" fill="none" style={{ stroke: "var(--chrome-chart-rim-2)" }} strokeWidth="1" />
          <circle cx="80" cy="90" r="51.5" fill="none" style={{ stroke: "var(--chrome-chart-hairline)" }} strokeWidth="1" />
          <circle cx="80" cy="90" r="51" fill={ids.url("disc")} />
          {centerLabel ? <text className="chrome-chart__strong" x="80" y="94" textAnchor="middle" fontSize="21" style={{ letterSpacing: "-0.02em" }}>{centerLabel}</text> : null}
          {centerCaption ? <text x="80" y="110" textAnchor="middle" fontSize="10">{centerCaption}</text> : null}
        </svg>
        {legend ? (
          <ul className="chrome-dial__legend">
            {segments.map((s, i) => (
              <li key={i} data-focus={fin(s, i) === "cobalt" || undefined}>
                <ChartSwatch kind="segment" finish={fin(s, i)} />
                <span>{s.label}</span>
                <span>{s.display ?? `${Math.round(share(s) * 100)}%`}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- heatmap */

export interface HeatmapProps extends A11yProps, DivProps {
  /** Rows × columns; null is an empty (not yet observed) slot. */
  values: ReadonlyArray<ReadonlyArray<number | null>>;
  rowLabels?: readonly React.ReactNode[];
  /** One per column (centred above), or fewer, each spanning an equal share (start-aligned below). */
  columnLabels?: readonly React.ReactNode[];
  /** Four ascending cut points: a value at or above the nth is level n (0 recessed … 4 deep cobalt). */
  thresholds?: readonly [number, number, number, number];
  /** Text inside a cell. */
  formatCell?: (value: number) => React.ReactNode;
  caption?: React.ReactNode;
  /** Header over the row labels when column labels sit on top. */
  corner?: React.ReactNode;
  cellHeight?: number;
  cellGap?: number;
  rowLabelWidth?: number;
}

/** Graded chips from recessed satin to deep cobalt chrome. */
export const Heatmap = React.forwardRef<HTMLDivElement, HeatmapProps>(function Heatmap(
  { values, rowLabels, columnLabels, thresholds, formatCell, caption, corner, cellHeight, cellGap, rowLabelWidth, "aria-label": label, description, dataTable, className, style, ...rest },
  ref
) {
  const cols = Math.max(0, ...values.map((r) => r.length));
  const flat = values.flatMap((r) => r.filter(isNum));
  const top = Math.max(0, ...flat);
  const cuts = thresholds ?? ([0.1, 0.26, 0.48, 0.7].map((f) => f * top) as unknown as readonly [number, number, number, number]);
  const level = (v: number) => (top === 0 && !thresholds ? 0 : cuts.filter((c) => v >= c).length);
  const each = columnLabels?.length === cols;
  const vars = {
    "--chrome-heatmap-cell": cellHeight ? `${cellHeight}px` : undefined,
    "--chrome-heatmap-gap": cellGap ? `${cellGap}px` : undefined,
    "--chrome-heatmap-label": rowLabelWidth ? `${rowLabelWidth}px` : undefined,
    // chips that hold text get the rounder 6 px corner
    "--chrome-heatmap-radius": cellHeight && cellHeight >= 24 ? "6px" : undefined
  } as React.CSSProperties;
  const colRow = columnLabels?.length ? (
    <div className="chrome-heatmap__cols" data-each={each || undefined} style={{ gridTemplateColumns: `repeat(${columnLabels.length}, minmax(0, 1fr))` }}>
      {columnLabels.map((c, i) => <span key={i}>{c}</span>)}
    </div>
  ) : null;
  return (
    <ChartShell
      ref={ref}
      kind="heatmap"
      label={label}
      description={description}
      className={className}
      style={{ ...vars, ...style }}
      table={
        dataTable ? (
          <DataTable caption={label} head={["", ...Array.from({ length: cols }, (_, i) => (typeof columnLabels?.[i] === "string" ? (columnLabels[i] as string) : `Column ${i + 1}`))]} rows={values.map((r, ri) => [typeof rowLabels?.[ri] === "string" ? rowLabels[ri] : `Row ${ri + 1}`, ...r.map((v) => (isNum(v) ? formatNumber(v) : "–"))])} />
        ) : null
      }
      {...rest}
    >
      <div className="chrome-heatmap">
        {caption ? <span className="chrome-heatmap__caption">{caption}</span> : null}
        {each ? (
          <>
            <span className="chrome-heatmap__corner">{corner}</span>
            {colRow}
          </>
        ) : null}
        <div className="chrome-heatmap__rows" style={{ gridTemplateRows: `repeat(${values.length}, var(--chrome-heatmap-cell, 14px))` }}>
          {values.map((_, i) => <span key={i}>{rowLabels?.[i]}</span>)}
        </div>
        <div className="chrome-heatmap__grid" style={{ gridTemplateColumns: `repeat(${cols || 1}, minmax(0, 1fr))` }}>
          {values.flatMap((row, ri) =>
            Array.from({ length: cols }, (_, ci) => {
              const v = row[ci];
              return (
                <span key={`${ri}-${ci}`} className="chrome-heat" data-heat={isNum(v) ? level(v) : "empty"}>
                  {isNum(v) && formatCell ? formatCell(v) : null}
                </span>
              );
            })
          )}
        </div>
        {!each && colRow ? (
          <>
            <span />
            {colRow}
          </>
        ) : null}
      </div>
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- funnel */

export interface FunnelStep { label: React.ReactNode; value: number; /** Shown instead of the formatted value. */ display?: React.ReactNode }
export interface FunnelChartProps extends A11yProps, DivProps {
  steps: readonly FunnelStep[];
  /** columns: chrome columns with step conversion (catalog); rows: horizontal pills with drop-off notes. */
  layout?: "columns" | "rows";
  height?: number;
  formatValue?: (value: number) => React.ReactNode;
  /** Share of the first step (rows) or of the previous step (columns), 0–1. */
  formatShare?: (share: number, index: number) => React.ReactNode;
  /** Note between two rows; default "42.2% dropped off · 57.8% continued". */
  dropLabel?: (drop: number, index: number, largest: boolean) => React.ReactNode;
}

/** Drop-off between steps, the last step in cobalt. */
export const FunnelChart = React.forwardRef<HTMLDivElement, FunnelChartProps>(function FunnelChart(
  { steps, layout = "columns", height = 180, formatValue = formatNumber, formatShare, dropLabel, "aria-label": label, description, dataTable, className, ...rest },
  ref
) {
  const ids = useChartIds();
  const [node, size] = useSize(300);
  useExposedRef(ref, node);
  const first = steps[0]?.value ?? 0;
  const ratio = (v: number, of: number) => (of > 0 ? Math.max(0, v / of) : 0);
  const table = dataTable ? (
    <DataTable caption={label} head={["Step", "Count", "Share"]} rows={steps.map((s, i) => [typeof s.label === "string" ? s.label : `Step ${i + 1}`, formatNumber(s.value), formatPercent(ratio(s.value, first))])} />
  ) : null;

  if (layout === "rows") {
    const drops = steps.map((s, i) => (i === 0 ? 0 : 1 - ratio(s.value, steps[i - 1]!.value)));
    const largest = drops.indexOf(Math.max(...drops.slice(1)));
    const share = formatShare ?? ((v: number) => `${Number((v * 100).toFixed(1))}%`);
    return (
      <ChartShell ref={node} kind="funnel" label={label} description={description} stageRole="figure" className={cx("chrome-funnel", className)} table={table} {...rest}>
        <ol className="chrome-funnel-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {steps.map((s, i) => {
            const sh = ratio(s.value, first);
            const thin = i === steps.length - 1 && sh < 0.05;
            return (
              <li key={i}>
                {i > 0 ? (
                  <div className="chrome-funnel-rows__drop" data-largest={(i === largest && steps.length > 2) || undefined}>
                    {dropLabel
                      ? dropLabel(drops[i]!, i, i === largest)
                      : i === largest && steps.length > 2
                        ? `${formatPercent(drops[i]!)} dropped off · largest drop`
                        : `${formatPercent(drops[i]!)} dropped off · ${formatPercent(1 - drops[i]!)} continued`}
                  </div>
                ) : null}
                <div className="chrome-funnel-rows__step" data-last={i === steps.length - 1 || undefined}>
                  <span className="chrome-funnel-rows__head">
                    <span>{s.label}</span>
                    <span>
                      {s.display ?? formatValue(s.value)} <span className="chrome-funnel-rows__share">{share(sh, i)}</span>
                    </span>
                  </span>
                  <div className="chrome-funnel-rows__bar" aria-hidden="true">
                    <span className="chrome-pill" data-finish={i === steps.length - 1 ? "cobalt" : undefined} data-thin={thin || undefined} style={{ width: `${sh * 100}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </ChartShell>
    );
  }

  const W = size.width;
  const H = height;
  const n = Math.max(1, steps.length);
  const colW = 52;
  const left = 20;
  const right = 10;
  const pitch = n > 1 ? (W - left - right - colW) / (n - 1) : 0;
  const colX = (i: number) => (n > 1 ? left + i * pitch : (W - colW) / 2);
  const top = 24;
  const bottom = H - 44;
  const colTop = (v: number) => bottom - ratio(v, first) * (bottom - top);
  const share = formatShare ?? ((v: number) => `${Math.round(v * 100)}%`);
  return (
    <ChartShell ref={node} kind="funnel" label={label} description={description} className={cx("chrome-funnel", className)} stage={{ height: H }} table={table} {...rest}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} aria-hidden="true" focusable="false">
        <ChartDefs ids={ids} bar />
        <g className="chrome-chart__ghost">
          {steps.map((_, i) => <rect key={i} x={r1(colX(i))} y={top} width={colW} height={bottom - top} rx="14" />)}
        </g>
        <g className="chrome-chart__ghost-2">
          {steps.slice(1).map((s, i) => {
            const a = colX(i) + colW;
            const b = colX(i + 1);
            return <path key={i} d={`M${r1(a)} ${r1(colTop(steps[i]!.value) + 14)} ${r1(b)} ${r1(colTop(s.value) + 14)}V${bottom}H${r1(a)}Z`} />;
          })}
        </g>
        {steps.length ? <ellipse className="chrome-chart__glow" cx={r1(W / 2 + 5)} cy={bottom + 1} rx={r1(Math.max(1, (W - 36) / 2))} ry="4" filter={ids.url("blur")} /> : null}
        {steps.map((s, i) => (
          <Pill key={i} x={colX(i)} y={colTop(s.value)} w={colW} h={bottom - colTop(s.value)} rx={14} finish={i === steps.length - 1 ? "cobalt" : "silver"} ids={ids} />
        ))}
      </svg>
      {steps.map((s, i) => {
        const cxp = r1(colX(i) + colW / 2);
        const last = i === steps.length - 1;
        return (
          <React.Fragment key={i}>
            <span className="chrome-chart__label" data-axis="x" data-strong="" data-accent={last || undefined} style={{ left: cxp, top: r1(colTop(s.value) - 16), fontSize: 10.5 }}>
              {share(i === 0 ? 1 : ratio(s.value, steps[i - 1]!.value), i)}
            </span>
            <span className="chrome-chart__label" data-axis="x" style={{ left: cxp, top: bottom + 6 }}>{s.label}</span>
            <span className="chrome-chart__label" data-axis="x" data-strong="" style={{ left: cxp, top: bottom + 22, fontSize: 11 }}>{s.display ?? formatValue(s.value)}</span>
          </React.Fragment>
        );
      })}
    </ChartShell>
  );
});

/* ---------------------------------------------------------------- legend, swatches, tooltip rows, well */

export type ChartSwatchKind = "line" | "gauge" | "pill" | "pill-h" | "column" | "eq" | "bead" | "tick" | "marker" | "square" | "segment" | "chip";
export interface ChartSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: ChartSwatchKind;
  finish?: ChartFinish | "flat" | "band";
  /** Heat level for kind="chip". */
  level?: HeatLevel;
}

/** A legend key: a miniature of its mark in the same material. */
export function ChartSwatch({ kind = "line", finish = "silver", level = 0, className, ...props }: ChartSwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("chrome-swatch", kind === "chip" && "chrome-heat", className)}
      data-kind={kind}
      data-finish={finish}
      data-heat={kind === "chip" ? level : undefined}
      {...props}
    />
  );
}

export interface ChartLegendItem { label: React.ReactNode; kind?: ChartSwatchKind; finish?: ChartSwatchProps["finish"]; /** Plain muted note without a key. */ note?: boolean }
export interface ChartLegendProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> { items: readonly ChartLegendItem[] }

export const ChartLegend = React.forwardRef<HTMLUListElement, ChartLegendProps>(function ChartLegend({ items, className, ...props }, ref) {
  return (
    <ul ref={ref} className={cx("chrome-chart-legend", className)} {...props}>
      {items.map((it, i) => (
        <li key={i} data-note={it.note || undefined}>
          {it.note ? null : <ChartSwatch kind={it.kind} finish={it.finish} />}
          {it.label}
        </li>
      ))}
    </ul>
  );
});

export interface HeatmapLegendProps extends React.HTMLAttributes<HTMLSpanElement> { low?: React.ReactNode; high?: React.ReactNode; levels?: readonly HeatLevel[] }

/** "Less ▢▢▢▢▢ More" scale for a heatmap. */
export function HeatmapLegend({ low = "Less", high = "More", levels = [0, 1, 2, 3, 4], className, ...props }: HeatmapLegendProps) {
  return (
    <span className={cx("chrome-heatmap-legend", className)} {...props}>
      <span>{low}</span>
      {levels.map((l) => <ChartSwatch key={l} kind="chip" level={l} />)}
      <span>{high}</span>
    </span>
  );
}

export interface ChartTooltipRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Wire key before the label. */
  swatch?: ChartFinish;
  /** Colours the value: up (mint) or down (enamel). */
  tone?: "up" | "down";
  muted?: boolean;
  strong?: boolean;
  /** Hairline above the row. */
  rule?: boolean;
}

/** One line of a chart readout: key, label, value. */
export function ChartTooltipRow({ label, value, swatch, tone, muted, strong, rule, className, ...props }: ChartTooltipRowProps) {
  return (
    <div className={cx("chrome-chart-tooltip-row", className)} data-muted={muted || undefined} data-strong={strong || undefined} data-rule={rule || undefined} {...props}>
      <span>
        {swatch ? <ChartSwatch kind="line" finish={swatch} /> : null}
        {label}
      </span>
      {value != null ? <span data-tone={tone}>{value}</span> : null}
    </div>
  );
}

/** Recessed satin (or Ink) stage that a plot sits in. */
export const ChartWell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ChartWell({ className, ...props }, ref) {
  return <div ref={ref} className={cx("chrome-chart-well", className)} {...props} />;
});
