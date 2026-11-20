import {
  AreaChart,
  BarChart,
  BarList,
  ChartLegend,
  ChartTooltipRow,
  ChartWell,
  ChromeProvider,
  DonutChart,
  FunnelChart,
  Gauge,
  Heatmap,
  HeatmapLegend,
  LineChart,
  RadialRings,
  ScatterChart,
  Sparkline,
  Waveform,
  formatCompact,
  type ChartLegendItem
} from "@loreanai/chrome-ui";
import type { ReactNode } from "react";

/* Dev sheet: the Charts artboard grid (work/canvas/project/Charts.dc.html), in Satin and in an Ink island,
   then the chart usages from the templates. Every number below comes from the artboards. */

const css = `
.dcs{min-height:100vh;background:#e8e9e9}
.dcs-island{padding:40px clamp(16px,4vw,56px) 56px;background:var(--chrome-bg);color:var(--chrome-text)}
.dcs h1{margin:0 0 8px;font:500 40px/48px var(--chrome-font-sans);letter-spacing:-.02em}
.dcs h2{margin:0 0 24px;font:500 13px/18px var(--chrome-font-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--chrome-text-3)}
.dcs h2.dcs-sub{margin:48px 0 24px}
.dcs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:16px;max-width:1064px}
.dcs-wide{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(480px,100%),1fr));gap:16px;max-width:1064px}
.dcs-card{position:relative;display:flex;flex-direction:column;min-width:0;overflow:hidden;border-radius:24px;background:var(--dcs-card-bg);box-shadow:var(--dcs-card-shadow)}
.dcs-satin{--dcs-card-bg:linear-gradient(180deg,#e4e5e5,#dcdddd);--dcs-card-shadow:inset 0 1px 0 rgba(255,255,255,.85),inset 0 0 0 1px rgba(255,255,255,.35),0 1px 2px rgba(0,0,0,.05)}
.dcs-ink{--dcs-card-bg:#0c0c0e;--dcs-card-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.05)}
.dcs-pv{height:220px;margin:6px 6px 0;padding:16px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.dcs-meta{padding:12px 16px 16px;display:flex;flex-direction:column;gap:4px}
.dcs-meta h3{margin:0;display:flex;align-items:baseline;gap:8px;font-size:15px;line-height:22px;font-weight:500;letter-spacing:-.005em}
.dcs-cat{margin-left:auto;font-size:12px;font-weight:400;color:var(--chrome-text-3)}
.dcs-meta p{margin:0;font-size:13px;line-height:19px;color:var(--chrome-text-2)}
.dcs-meta .chrome-chart-legend,.dcs-meta .chrome-heatmap-legend{margin-top:6px}
.dcs-fw{width:100%;padding-top:8px}
.dcs-spr{display:grid;grid-template-columns:104px 1fr 52px;align-items:center;gap:12px;height:38px;border-bottom:1px solid var(--chrome-line)}
.dcs-spr:last-child{border-bottom:0}
.dcs-spr.dcs-head{height:22px;font-size:11px;color:var(--chrome-text-3)}
.dcs-mono{font-family:var(--chrome-font-mono);font-size:12px}
.dcs-num{font-variant-numeric:tabular-nums;font-size:12.5px;text-align:right}
.dcs-panel{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.dcs-panel h3{margin:0;font-size:15px;line-height:22px;font-weight:500}
.dcs-small{font-size:13px;line-height:18px;color:var(--chrome-text-3)}
.dcs-plot{padding:16px 28px 6px 12px;border-radius:10px;--chrome-chart-font-size:13px;--chrome-chart-tick-gap:10px;--chrome-chart-label-gap:8px}
.dcs-plot .chrome-chart{line-height:18px}
.dcs-xl{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:13px;line-height:18px}
.dcs-up{color:var(--chrome-mint)}.dcs-dn{color:var(--chrome-enamel-text)}
.dcs-row{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
`;

/* ---- catalog data ---- */
const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];
const mon16 = [12000, 9000, 8000, 10000, 18000, 27000, 31000, 33000, 35000, 38200, 34000, 26000, 20000];
const mon9 = [11000, 9000, 8000, 9000, 15000, 23000, 26000, 28000, 30000, 29000, 27000, 22000, 17000];
const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const scatterOther: [number, number][] = [[24, 38], [40, 52], [55, 44], [70, 61], [88, 49], [102, 72], [118, 58], [130, 80], [146, 66], [160, 90], [175, 74], [190, 96], [204, 83], [220, 104], [236, 92], [250, 118], [268, 101], [284, 126], [300, 112], [322, 138], [346, 124], [370, 150]];
const scatterAp: [number, number][] = [[140, 248], [176, 286], [198, 232], [226, 312], [258, 268], [290, 344], [318, 296], [352, 362]];
const peaks = [0.18, 0.639, 0.246, 0.557, 0.475, 0.557, 0.705, 0.393, 0.525, 0.689, 1, 0.885, 0.41, 0.967, 0.803, 0.541, 0.787, 0.459, 0.541, 0.328, 0.475, 0.344, 0.311, 0.213, 0.18, 0.279, 0.393, 0.197, 0.295, 0.475, 0.852, 0.738, 0.475, 0.574, 0.426, 0.705, 1, 0.951, 0.623, 0.803, 0.672, 0.852, 0.508, 0.344, 0.557, 0.557, 0.279, 0.328, 0.164, 0.131, 0.23, 0.197, 0.525, 0.459, 0.426, 0.721, 0.541, 0.41, 0.475, 0.41];
// Deploys by weekday (rows, Mon first) and hour: busy 09–18 on weekdays, quiet at night and weekends (same generator as the artboard).
const deploys = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const busy = h >= 9 && h <= 18 ? 1 : h >= 7 && h <= 21 ? 0.45 : 0.08;
    const n = Math.sin((d * 24 + h) * 12.9898) * 43758.5453;
    return Math.round(busy * (d < 5 ? 1 : 0.25) * (0.55 + 0.6 * (n - Math.floor(n))) * 1000) / 1000;
  })
);
// sparkline rows: y coordinates in a 24 px box, drawn as 24 − y on a fixed 0–24 domain
const spark = (ys: number[]) => ys.map((y) => 24 - y);
const sparkRows = [
  { name: "api-gateway", value: "42 ms", label: "api-gateway p95 steady near 42 ms", data: spark([14, 13, 15, 12, 13, 11, 13, 12, 14, 12, 13]) },
  { name: "auth-service", value: "58 ms", label: "auth-service p95 steady near 58 ms", data: spark([12, 14, 11, 13, 10, 12, 11, 13, 10, 12, 11]) },
  { name: "edge-renderer", value: "112 ms", label: "edge-renderer p95 drifting up to 112 ms", data: spark([16, 15, 13, 14, 11, 12, 10, 11, 9, 10, 9]) },
  { name: "search-indexer", value: "380 ms", label: "search-indexer p95 rising sharply to 380 ms in the last hours", data: spark([18, 18, 17, 18, 17, 16, 17, 15, 12, 6, 2]), focus: true }
];

function Card({ title, cat, desc, legend, children }: { title: string; cat: string; desc: string; legend: ReactNode; children: ReactNode }) {
  return (
    <article className="dcs-card">
      <ChartWell className="dcs-pv">{children}</ChartWell>
      <div className="dcs-meta">
        <h3>{title}<span className="dcs-cat">{cat}</span></h3>
        <p>{desc}</p>
        {legend}
      </div>
    </article>
  );
}

const Legend = ({ items }: { items: ChartLegendItem[] }) => <ChartLegend items={items} />;

function Catalog() {
  return (
    <div className="dcs-grid">
      <Card title="Area" cat="Trend" desc="Volume over time against a comparison period." legend={<Legend items={[{ label: "Mon 16 Nov", kind: "line", finish: "cobalt" }, { label: "Mon 9 Nov", kind: "line", finish: "dashed" }]} />}>
        <AreaChart
          aria-label="Area chart of requests per hour. Monday 16 November peaks at 38.2k at 18:00, about 9k above Monday 9 November at the same hour."
          caption="Requests / hour"
          labels={hours}
          xTicks={[0, 3, 6, 9, 12]}
          yTicks={[0, 20000, 40000]}
          series={[{ label: "Mon 16 Nov", data: mon16 }, { label: "Mon 9 Nov", data: mon9, finish: "dashed" }]}
          highlight={{ index: 9, label: "38.2k" }}
          dataTable
        />
      </Card>
      <Card title="Line" cat="Trend" desc="Several series on one scale, one in focus." legend={<Legend items={[{ label: "ap-south-1", finish: "cobalt" }, { label: "us-east-2", finish: "smoked" }, { label: "eu-west-1", finish: "silver" }]} />}>
        <LineChart
          aria-label="Line chart of p95 latency by region, 10 to 16 November. ap-south-1 climbs from 88 ms to 312 ms, over the 300 ms budget; us-east-2 and eu-west-1 stay flat near 70 and 45 ms."
          caption="p95, ms · 10–16 Nov"
          labels={days}
          yTicks={[0, 200, 400]}
          threshold={{ value: 300, label: "Budget 300" }}
          series={[
            { label: "ap-south-1", data: [88, 92, 90, 96, 139, 259, 312] },
            { label: "us-east-2", data: [62, 65, 70, 66, 64, 68, 71], finish: "smoked" },
            { label: "eu-west-1", data: [43, 46, 43, 48, 45, 42, 43], finish: "silver" }
          ]}
          highlight={{ index: 6, label: "312 ms", crosshair: false }}
        />
      </Card>
      <Card title="Bar" cat="Comparison" desc="Discrete periods side by side." legend={<Legend items={[{ label: "Last 7 days", kind: "pill", finish: "cobalt" }, { label: "Prior 7 days", kind: "pill" }]} />}>
        <BarChart
          aria-label="Grouped bar chart of deploys per day for the last 7 days against the prior 7 days. Weekdays run 27 to 38 deploys; weekends drop to 4 to 8."
          caption="Deploys"
          labels={days}
          yTicks={[0, 20, 40]}
          series={[{ label: "Last 7 days", data: [34, 38, 29, 31, 8, 5, 27] }, { label: "Prior 7 days", data: [30, 33, 31, 26, 6, 4, 29] }]}
        />
      </Card>
      <Card title="Bar List" cat="Comparison" desc="Ranked items with values beside the bars." legend={<Legend items={[{ label: "Top endpoint", kind: "pill-h", finish: "cobalt" }, { label: "Others", kind: "pill-h" }, { label: "Requests, 24 h", note: true }]} />}>
        <BarList
          aria-label="Top API endpoints by requests over 24 hours"
          items={[
            { label: "/v1/deploys", value: 12400 },
            { label: "/v1/runs", value: 8100 },
            { label: "/v1/services", value: 5600 },
            { label: "/v1/auth/token", value: 3200 },
            { label: "/v1/billing", value: 1900 }
          ]}
        />
      </Card>
      <Card title="Gauge" cat="Part of whole" desc="One score in a satin bezel against its threshold." legend={<Legend items={[{ label: "Remaining", kind: "gauge", finish: "cobalt" }, { label: "Page at 25%", kind: "tick" }]} />}>
        <Gauge aria-label="Gauge: 72 percent of the error budget remains. On-call is paged below 25 percent." value={72} label="error budget left" threshold={{ value: 25, label: "25%" }} />
      </Card>
      <Card title="Radial Rings" cat="Part of whole" desc="A few percentages as nested chrome rings." legend={<Legend items={[{ label: "Capacity used in eu-west-1, last 5 min", note: true }]} />}>
        <RadialRings
          aria-label="Radial rings for eu-west-1 capacity used: CPU 72 percent, memory 58 percent, disk 41 percent."
          center={{ title: "eu-west-1", caption: "capacity" }}
          rings={[{ label: "CPU", value: 72 }, { label: "Memory", value: 58 }, { label: "Disk", value: 41 }]}
        />
      </Card>
      <Card title="Heatmap" cat="Distribution" desc="Deploys by hour, graded satin to cobalt." legend={<HeatmapLegend />}>
        <Heatmap
          aria-label="Heatmap of deploys by hour and weekday. Most deploys land between 09:00 and 18:00 on weekdays; nights and weekends are quiet."
          caption="Deploys by hour, UTC"
          values={deploys}
          thresholds={[0.12, 0.3, 0.55, 0.8]}
          rowLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          columnLabels={["00:00", "06:00", "12:00", "18:00"]}
        />
      </Card>
      <Card title="Sparkline" cat="Trend" desc="Tiny polished wires inline with a label and value." legend={<Legend items={[{ label: "search-indexer", finish: "cobalt" }, { label: "Other services", finish: "silver" }]} />}>
        <div className="dcs-fw">
          <div className="dcs-spr dcs-head"><span>Service</span><span>p95, 24 h</span><span style={{ textAlign: "right" }}>Now</span></div>
          {sparkRows.map((r) => (
            <div className="dcs-spr" key={r.name}>
              <span className="dcs-mono" style={r.focus ? { fontWeight: 500, color: "var(--chrome-text)" } : undefined}>{r.name}</span>
              <Sparkline data={r.data} domain={[0, 24]} finish={r.focus ? "cobalt" : "silver"} aria-label={r.label} />
              <span className="dcs-num" style={r.focus ? { fontWeight: 600, color: "var(--chrome-cobalt-text)" } : undefined}>{r.value}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Donut" cat="Part of whole" desc="Share of a total in chrome segments." legend={<Legend items={[{ label: "Cloud spend by service, November", note: true }]} />}>
        <DonutChart
          aria-label="Donut chart of November cloud spend, 48.2 thousand dollars: edge-renderer 41 percent, api-gateway 27 percent, search-indexer 19 percent, other 13 percent."
          centerLabel="$48.2k"
          centerCaption="November"
          segments={[{ label: "edge-renderer", value: 41 }, { label: "api-gateway", value: 27 }, { label: "search-indexer", value: 19 }, { label: "Other", value: 13 }]}
        />
      </Card>
      <Card title="Scatter" cat="Distribution" desc="Paired measures as beads, outliers in cobalt." legend={<Legend items={[{ label: "ap-south-1", kind: "bead", finish: "cobalt" }, { label: "Other regions", kind: "bead" }]} />}>
        <ScatterChart
          aria-label="Scatter plot of p95 latency against payload size. Other regions stay under 160 ms; ap-south-1 requests sit between 230 and 360 ms from 140 to 350 KB."
          caption="p95, ms"
          xTicks={[0, 100, 200, 300, 400]}
          formatX={(v) => (v === 400 ? "400 KB" : String(v))}
          yTicks={[0, 200, 400]}
          series={[{ label: "ap-south-1", points: scatterAp }, { label: "Other regions", points: scatterOther }]}
        />
      </Card>
      <Card title="Funnel" cat="Comparison" desc="Drop-off between steps in chrome columns." legend={<Legend items={[{ label: "Order placed", kind: "column", finish: "cobalt" }, { label: "Earlier steps", kind: "column" }]} />}>
        <FunnelChart
          aria-label="Checkout funnel for Tidewater Goods in November: 6,130 carts, 4,420 entered shipping, 3,050 entered payment, 2,410 orders placed, 39.3 percent overall."
          steps={[{ label: "Cart", value: 6130 }, { label: "Shipping", value: 4420 }, { label: "Payment", value: 3050 }, { label: "Order", value: 2410 }]}
        />
      </Card>
      <Card title="Waveform" cat="Trend" desc="Amplitude as a chrome equaliser with a playhead." legend={<Legend items={[{ label: "Played", kind: "eq", finish: "cobalt" }, { label: "Remaining", kind: "eq" }, { label: "INC-418 bridge call", note: true }]} />}>
        <Waveform aria-label="Waveform of the INC-418 incident bridge recording, 2 minutes 18 seconds long, played to 0:51." peaks={peaks} duration={138} position={51} />
      </Card>
    </div>
  );
}

/* ---- template usages ---- */
const nov = Array.from({ length: 15 }, (_, i) => `${i + 1} Nov`);
const usage = [19.6, 24.8, 26.1, 26.9, 27.4, 25.8, 21.2, 20.4, 27.6, 28.9, 29.3, 30.1, 28.2, 22.7, 21.9].map((v) => v * 1000);
const usageOct = [22.4, 21.6, 17.9, 17.2, 22.9, 23.6, 24.1, 24.4, 23.1, 18.8, 18.1, 24, 25.2, 25.5, 25.9].map((v) => v * 1000);
const money = (v: number) => (v === 0 ? "$0" : `${v < 0 ? "−" : ""}$${formatCompact(Math.abs(v))}`);
const crY = [77.8, 65.7, 56.9, 51.4, 50.2, 51.9, 48.6, 42.6, 35.9, 29.9, 34.3, 41.4, 53.0, 66.8, 79.4, 89.8, 98.1, 103.6, 105.8, 104.2, 96.4, 84.3, 70.6, 59.6, 55.2];
const crLastY = [82.0, 72.1, 64.4, 60.0, 59.5, 62.2, 63.3, 69.9, 74.9, 78.3, 76.5, 72.1, 72.7, 79.8, 87.5, 95.2, 101.8, 106.2, 107.9, 106.2, 99.6, 88.6, 76.0, 65.5, 61.1];
const req = (y: number) => Math.round(((240 - y) / 5.5) * 100) * 10;
const crHours = Array.from({ length: 25 }, (_, i) => (i === 24 ? "Now" : `${String((9 + i) % 24).padStart(2, "0")}:00`)).map((l, i) => (i === 15 ? "Mon 00:00" : l));
const err5xx = [51.8, 53.6, 52.7, 50.9, 50.0, 51.8, 52.7, 50.9, 49.1, 50.0, 51.8, 52.7, 53.6, 54.5, 55.4, 55.4, 56.3, 55.4, 54.5, 53.6, 51.8, 50.0, 47.3, 11.3].map((y) => Math.round(((68.5 - y) / 910) * 10000) / 10000);
const weeks = ["28 Sep", "5 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov", "9 Nov", "16 Nov"];
const net = ["+$230k", "−$260k", "+$510k", "−$250k", "+$490k", "−$80k", "+$550k", "+$413k"];
const sessY = [173.1, 171.1, 183.1, 189.2, 191.2, 183.0, 161.2, 174.5, 169.3, 176.6, 187.0, 192.6, 179.4, 154.4, 174.4, 170.0, 171.0, 182.4, 193.7, 178.2, 147.1, 171.4, 171.7, 167.8, 176.0, 106.0, 141.9, 141.4];
const sessPrevY = [185.9, 194.6, 200.7, 194.9, 212.4, 203.7, 170.4, 193.3, 189.8, 194.9, 202.4, 203.7, 203.5, 175.5, 182.0, 194.8, 194.2, 193.4, 211.0, 197.5, 170.5, 189.4, 184.4, 195.5, 196.8, 200.8, 203.3, 168.0];
const sess = (y: number) => Math.round(25000 - ((y - 20) / 220) * 15000);
const octNov = Array.from({ length: 28 }, (_, i) => { const d = new Date(Date.UTC(2026, 9, 19 + i)); return `${d.getUTCDate()} ${d.getUTCMonth() === 9 ? "Oct" : "Nov"}`; });
const cohorts: [string, number][] = [["21 Sep", 1842], ["28 Sep", 1906], ["5 Oct", 1775], ["12 Oct", 2031], ["19 Oct", 2118], ["26 Oct", 2264], ["2 Nov", 2190], ["9 Nov", 2947]];
const cohortValues = cohorts.map((_, i) => Array.from({ length: 7 }, (_, w) => (i + w + 1 > 7 ? null : [38, 29, 25, 22, 20, 19, 18][w]! + [0, 1, -1, 2, 0, 1, -1, 0][i]! + (i + w + 1 === 7 ? 6 : 0))));

function Usages({ ink }: { ink: boolean }) {
  return (
    <div className="dcs-wide">
      {!ink ? (
        <article className="dcs-card" style={{ gridColumn: "1 / -1" }}>
          <div className="dcs-panel">
            <h3>Billable usage <span className="dcs-small">Dashboard · lg wire, weekend bands, two beads, bottom readout</span></h3>
            <ChartLegend items={[{ label: "1–15 Nov", finish: "cobalt" }, { label: "1–15 Oct", finish: "dashed" }, { label: "Weekend", kind: "square", finish: "band" }]} />
            <ChartWell className="dcs-plot">
              <AreaChart
                aria-label="Daily billable usage for 1 to 15 November, peaking at 30.1 thousand dollars on 12 November, 25.4 percent above the same date in October"
                height={304}
                weight="lg"
                padding={{ top: 20, bottom: 30, left: 50, right: 0 }}
                labels={nov}
                xTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
                edgeLabels={false}
                yTicks={[0, 10000, 20000, 30000, 40000]}
                formatY={money}
                bands={[{ from: 0, to: 0.5 }, { from: 5.5, to: 7.5 }, { from: 12.5, to: 14 }]}
                series={[{ label: "Usage", data: usage }, { label: "October", data: usageOct, finish: "dashed" }]}
                highlight={{
                  index: 11,
                  series: [0, 1],
                  align: "bottom",
                  tooltip: (
                    <>
                      <ChartTooltipRow label={<span style={{ color: "var(--chrome-text-3)" }}>Thu 12 Nov</span>} value="+25.4%" tone="up" />
                      <ChartTooltipRow swatch="cobalt" label="Usage" value="$30.1k" strong />
                      <ChartTooltipRow swatch="dashed" label="Mon 12 Oct" value="$24.0k" muted />
                    </>
                  )
                }}
              />
            </ChartWell>
          </div>
        </article>
      ) : (
        <article className="dcs-card" style={{ gridColumn: "1 / -1" }}>
          <div className="dcs-panel">
            <h3>Traffic and errors <span className="dcs-small">Control room · Ink area, readout in the middle, enamel alert bars</span></h3>
            <ChartLegend items={[{ label: "Requests", finish: "cobalt" }, { label: "Same hour last week", finish: "dashed" }, { label: "5xx rate", kind: "square" }]} />
            <ChartWell className="dcs-plot">
              <AreaChart
                aria-label="Requests a minute over the last 24 hours. Traffic peaked at 38.2 thousand at 18:00 on Sunday, against 29.4 thousand at the same hour last week."
                height={248}
                weight="lg"
                padding={{ top: 20, bottom: 8, left: 50, right: 0 }}
                yTicks={[0, 10000, 20000, 30000, 40000]}
                series={[{ label: "Requests", data: crY.map(req) }, { label: "Last week", data: crLastY.map(req), finish: "dashed" }]}
                highlight={{
                  index: 9,
                  series: [0, 1],
                  side: "right",
                  align: "middle",
                  tooltip: (
                    <>
                      <ChartTooltipRow label={<span style={{ color: "var(--chrome-text-3)" }}>Sun 15 Nov, 18:00</span>} value="+29.9%" tone="up" />
                      <ChartTooltipRow swatch="cobalt" label="Requests" value="38.2k" strong />
                      <ChartTooltipRow swatch="dashed" label="Sun 8 Nov" value="29.4k" muted />
                      <ChartTooltipRow label="5xx rate" value="0.02%" muted rule />
                    </>
                  )
                }}
              />
              <BarChart
                aria-label="5xx error rate by hour. It held near 0.02 percent until 08:00, then rose to 0.06 percent in the last hour, above the 0.05 percent alert line."
                height={98}
                barWidth={8}
                yLabels={false}
                yDomain={[0, 0.075]}
                yTicks={[]}
                padding={{ top: 12, bottom: 26, left: 50, right: 0 }}
                labels={crHours.slice(0, 24).map((l, i) => (i === 23 ? "Now" : l))}
                xTicks={[3, 9, 15, 21, 23]}
                threshold={{ value: 0.05, label: "0.05%", tone: "danger", labelPlacement: "axis" }}
                series={[{ label: "5xx rate", data: err5xx.map((v, i) => (i === 23 ? { value: v, finish: "enamel" as const } : v)), finish: "silver" }]}
              />
            </ChartWell>
            <div className="dcs-row">
              <Gauge variant="ring" value={72} aria-label="Error budget, 72 percent left" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180, flex: 1 }}>
                <span>Error rate</span>
                <Sparkline height={32} data={[22.8, 23.6, 23.2, 22.4, 22, 22.8, 23.2, 22.4, 21.6, 22, 22.8, 23.2, 23.6, 24, 24.4, 24.4, 24.8, 24.4, 24, 23.6, 22.8, 22, 20.8, 4.8].map((y) => 32 - y)} domain={[0, 32]} tail={{ from: 22, finish: "enamel" }} />
                <span className="dcs-small">0.06% in the last hour · ap-south-1</span>
              </div>
            </div>
          </div>
        </article>
      )}
      <article className="dcs-card">
        <div className="dcs-panel">
          <h3>Cash in and out <span className="dcs-small">Finance desk · wide bars, band, pending week</span></h3>
          <ChartLegend items={[{ label: "Cash in", kind: "square", finish: "cobalt" }, { label: "Cash out", kind: "square" }, { label: "Week to date", kind: "square", finish: "flat" }]} />
          <ChartWell className="dcs-plot" style={{ padding: "8px 16px 6px 8px" }}>
            <BarChart
              aria-label="Weekly cash in and out for the 8 weeks from 28 September. Cash out beat cash in during the three payroll weeks."
              height={286}
              barWidth={22}
              barGap={4}
              padding={{ top: 20, bottom: 66, left: 54, right: 0 }}
              yTicks={[0, 500000, 1000000, 1500000, 2000000, 2500000]}
              formatY={money}
              labels={weeks}
              bands={[{ from: 4.5, to: 5.5 }]}
              renderXLabel={(l, i) => (
                <span className="dcs-xl">
                  <span style={i === 5 ? { color: "var(--chrome-text)", fontWeight: 500 } : undefined}>{l}</span>
                  <span className={net[i]!.startsWith("+") ? "dcs-up" : "dcs-dn"}>{net[i]}</span>
                </span>
              )}
              series={[
                { label: "Cash in", data: [1840000, 1720000, 2050000, 1960000, 2180000, 2240000, 2310000, { value: 640900, pending: true }] },
                { label: "Cash out", data: [1610000, 1980000, 1540000, 2210000, 1690000, 2320000, 1760000, { value: 228000, pending: true }] }
              ]}
              dataTable
            />
          </ChartWell>
        </div>
      </article>
      <article className="dcs-card">
        <div className="dcs-panel">
          <h3>Net cash <span className="dcs-small">negative values hang from the zero axis</span></h3>
          <ChartWell className="dcs-plot" style={{ padding: "8px 16px 6px 8px" }}>
            <BarChart
              aria-label="Weekly net cash for the 8 weeks from 28 September, between minus 260 and plus 550 thousand dollars."
              height={220}
              barWidth={16}
              padding={{ left: 54, right: 0, top: 20 }}
              yTicks={[-400000, 0, 400000, 800000]}
              formatY={money}
              labels={weeks}
              valueLabel={(v) => (v < 0 ? <span className="dcs-dn">{money(v)}</span> : null)}
              series={[{ label: "Net", data: [230000, -260000, 510000, -250000, 490000, { value: -80000, finish: "enamel" }, 550000, 413000] }]}
            />
          </ChartWell>
        </div>
      </article>
      <article className="dcs-card">
        <div className="dcs-panel">
          <h3>Sessions <span className="dcs-small">Analytics · non-zero domain, campaign marker</span></h3>
          <ChartLegend items={[{ label: "This period", finish: "cobalt" }, { label: "Previous 28 days", finish: "dashed" }, { label: "Campaign", kind: "marker" }]} />
          <ChartWell className="dcs-plot">
            <LineChart
              aria-label="Daily sessions from 19 October to 15 November, mostly between 13 and 16 thousand a day, peaking at 19,140 on 13 November."
              height={248}
              weight="lg"
              padding={{ top: 20, bottom: 34, left: 50, right: 0 }}
              labels={octNov}
              xTicks={[0, 7, 14, 21, 27]}
              edgeLabels={false}
              yTicks={[10000, 15000, 20000, 25000]}
              markers={[25]}
              series={[{ label: "Sessions", data: sessY.map(sess) }, { label: "Previous 28 days", data: sessPrevY.map(sess), finish: "dashed" }]}
              highlight={{
                index: 25,
                series: [0, 1],
                crosshair: false,
                tooltip: (
                  <>
                    <ChartTooltipRow label={<span style={{ color: "var(--chrome-text-3)" }}>Fri 13 Nov</span>} value="+51.0%" tone="up" />
                    <ChartTooltipRow swatch="cobalt" label="Sessions" value="19,140" strong />
                    <ChartTooltipRow swatch="dashed" label="Fri 16 Oct" value="12,673" muted />
                    <ChartTooltipRow label="Fall restock email, 08:00" muted rule />
                  </>
                )
              }}
            />
          </ChartWell>
        </div>
      </article>
      <article className="dcs-card">
        <div className="dcs-panel">
          <h3>Conversion funnel <span className="dcs-small">rows layout</span></h3>
          <FunnelChart
            layout="rows"
            aria-label="Conversion funnel: 412,380 sessions, 238,180 viewed a product, 46,920 added to cart, 21,480 started checkout, 11,712 purchased."
            formatShare={(v, i) => (i === 4 ? "2.84%" : `${Number((v * 100).toFixed(1))}%`)}
            steps={[
              { label: "Sessions", value: 412380 },
              { label: "Viewed a product", value: 238180 },
              { label: "Added to cart", value: 46920 },
              { label: "Started checkout", value: 21480 },
              { label: "Purchased", value: 11712 }
            ]}
          />
        </div>
      </article>
      <article className="dcs-card">
        <div className="dcs-panel">
          <h3>Returning customers <span className="dcs-small">cohort heatmap with values</span></h3>
          <HeatmapLegend low="Lower" high="Higher" levels={[1, 2, 3, 4]} />
          <Heatmap
            aria-label="Share of each weekly cohort that came back, by week since first order, 18 to 44 percent."
            values={cohortValues}
            thresholds={[0, 22, 28, 36]}
            formatCell={(v) => `${v}%`}
            cellHeight={30}
            cellGap={4}
            rowLabelWidth={112}
            corner={<><span>Cohort</span><span>New</span></>}
            rowLabels={cohorts.map(([c, n]) => <><span style={{ marginRight: "auto" }}>{c}</span><span>{n.toLocaleString("en-US")}</span></>)}
            columnLabels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]}
            style={{ fontSize: 12, lineHeight: "16px" }}
            dataTable
          />
        </div>
      </article>
    </div>
  );
}

export default function Page() {
  return (
    <main className="dcs">
      <style>{css}</style>
      <ChromeProvider theme="satin" className="dcs-island dcs-satin">
        <h1>Charts sheet</h1>
        <h2>Satin · catalog</h2>
        <Catalog />
        <h2 className="dcs-sub">Satin · template usages</h2>
        <Usages ink={false} />
      </ChromeProvider>
      <ChromeProvider theme="ink" className="dcs-island dcs-ink">
        <h2>Ink · catalog</h2>
        <Catalog />
        <h2 className="dcs-sub">Ink · template usages</h2>
        <Usages ink />
      </ChromeProvider>
    </main>
  );
}
