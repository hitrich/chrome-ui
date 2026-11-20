import {
  AreaChart,
  BarChart,
  BarList,
  ChartLegend,
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
  SegmentedControl,
  Sparkline,
  Waveform,
  useChrome
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { DocsShell } from "../components/DocsShell";
import { charts } from "../data";
import "./ChartsCatalog.css";

/* Data from work/canvas/project/Charts.dc.html (the same setup as dev/ChartsSheet.tsx). */
const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];
const mon16 = [12000, 9000, 8000, 10000, 18000, 27000, 31000, 33000, 35000, 38200, 34000, 26000, 20000];
const mon9 = [11000, 9000, 8000, 9000, 15000, 23000, 26000, 28000, 30000, 29000, 27000, 22000, 17000];
const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const scatterOther: [number, number][] = [[24, 38], [40, 52], [55, 44], [70, 61], [88, 49], [102, 72], [118, 58], [130, 80], [146, 66], [160, 90], [175, 74], [190, 96], [204, 83], [220, 104], [236, 92], [250, 118], [268, 101], [284, 126], [300, 112], [322, 138], [346, 124], [370, 150]];
const scatterAp: [number, number][] = [[140, 248], [176, 286], [198, 232], [226, 312], [258, 268], [290, 344], [318, 296], [352, 362]];
const peaks = [0.18, 0.639, 0.246, 0.557, 0.475, 0.557, 0.705, 0.393, 0.525, 0.689, 1, 0.885, 0.41, 0.967, 0.803, 0.541, 0.787, 0.459, 0.541, 0.328, 0.475, 0.344, 0.311, 0.213, 0.18, 0.279, 0.393, 0.197, 0.295, 0.475, 0.852, 0.738, 0.475, 0.574, 0.426, 0.705, 1, 0.951, 0.623, 0.803, 0.672, 0.852, 0.508, 0.344, 0.557, 0.557, 0.279, 0.328, 0.164, 0.131, 0.23, 0.197, 0.525, 0.459, 0.426, 0.721, 0.541, 0.41, 0.475, 0.41];
// Deploys by weekday (rows, Mon first) and hour: busy 09–18 on weekdays, quiet at night and weekends (the artboard's generator).
const deploys = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const busy = h >= 9 && h <= 18 ? 1 : h >= 7 && h <= 21 ? 0.45 : 0.08;
    const n = Math.sin((d * 24 + h) * 12.9898) * 43758.5453;
    return Math.round(busy * (d < 5 ? 1 : 0.25) * (0.55 + 0.6 * (n - Math.floor(n))) * 1000) / 1000;
  })
);
// sparkline rows: the artboard's y coordinates in a 24 px box, drawn as 24 − y on a fixed 0–24 domain
const spark = (ys: number[]) => ys.map((y) => 24 - y);
const sparkRows = [
  { name: "api-gateway", value: "42 ms", label: "api-gateway p95 steady near 42 ms", data: spark([14, 13, 15, 12, 13, 11, 13, 12, 14, 12, 13]) },
  { name: "auth-service", value: "58 ms", label: "auth-service p95 steady near 58 ms", data: spark([12, 14, 11, 13, 10, 12, 11, 13, 10, 12, 11]) },
  { name: "edge-renderer", value: "112 ms", label: "edge-renderer p95 drifting up to 112 ms", data: spark([16, 15, 13, 14, 11, 12, 10, 11, 9, 10, 9]) },
  { name: "search-indexer", value: "380 ms", label: "search-indexer p95 rising sharply to 380 ms in the last hours", data: spark([18, 18, 17, 18, 17, 16, 17, 15, 12, 6, 2]), focus: true }
];

const previews: Record<string, { chart: ReactNode; legend: ReactNode }> = {
  area: {
    chart: (
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
    ),
    legend: <ChartLegend items={[{ label: "Mon 16 Nov", kind: "line", finish: "cobalt" }, { label: "Mon 9 Nov", kind: "line", finish: "dashed" }]} />
  },
  line: {
    chart: (
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
        dataTable
      />
    ),
    legend: <ChartLegend items={[{ label: "ap-south-1", finish: "cobalt" }, { label: "us-east-2", finish: "smoked" }, { label: "eu-west-1", finish: "silver" }]} />
  },
  bar: {
    chart: (
      <BarChart
        aria-label="Grouped bar chart of deploys per day for the last 7 days against the prior 7 days. Weekdays run 27 to 38 deploys; weekends drop to 4 to 8."
        caption="Deploys"
        labels={days}
        yTicks={[0, 20, 40]}
        series={[{ label: "Last 7 days", data: [34, 38, 29, 31, 8, 5, 27] }, { label: "Prior 7 days", data: [30, 33, 31, 26, 6, 4, 29] }]}
        dataTable
      />
    ),
    legend: <ChartLegend items={[{ label: "Last 7 days", kind: "pill", finish: "cobalt" }, { label: "Prior 7 days", kind: "pill" }]} />
  },
  "bar-list": {
    chart: (
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
    ),
    legend: <ChartLegend items={[{ label: "Top endpoint", kind: "pill-h", finish: "cobalt" }, { label: "Others", kind: "pill-h" }, { label: "Requests, 24 h", note: true }]} />
  },
  gauge: {
    chart: <Gauge aria-label="Gauge: 72 percent of the error budget remains. On-call is paged below 25 percent." value={72} label="error budget left" threshold={{ value: 25, label: "25%" }} />,
    legend: <ChartLegend items={[{ label: "Remaining", kind: "gauge", finish: "cobalt" }, { label: "Page at 25%", kind: "tick" }]} />
  },
  "radial-rings": {
    chart: (
      <RadialRings
        aria-label="Radial rings for eu-west-1 capacity used: CPU 72 percent, memory 58 percent, disk 41 percent."
        center={{ title: "eu-west-1", caption: "capacity" }}
        rings={[{ label: "CPU", value: 72 }, { label: "Memory", value: 58 }, { label: "Disk", value: 41 }]}
      />
    ),
    legend: <ChartLegend items={[{ label: "Capacity used in eu-west-1, last 5 min", note: true }]} />
  },
  heatmap: {
    chart: (
      <Heatmap
        aria-label="Heatmap of deploys by hour and weekday. Most deploys land between 09:00 and 18:00 on weekdays; nights and weekends are quiet."
        caption="Deploys by hour, UTC"
        values={deploys}
        thresholds={[0.12, 0.3, 0.55, 0.8]}
        rowLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        columnLabels={["00:00", "06:00", "12:00", "18:00"]}
      />
    ),
    legend: <HeatmapLegend />
  },
  sparkline: {
    chart: (
      <div className="pg-charts__spark">
        <div className="pg-charts__spr pg-charts__spr--head"><span>Service</span><span>p95, 24 h</span><span className="pg-charts__r">Now</span></div>
        {sparkRows.map((row) => (
          <div className="pg-charts__spr" key={row.name} data-focus={row.focus || undefined}>
            <span className="pg-charts__svc">{row.name}</span>
            <Sparkline data={row.data} domain={[0, 24]} finish={row.focus ? "cobalt" : "silver"} aria-label={row.label} />
            <span className="pg-charts__now">{row.value}</span>
          </div>
        ))}
      </div>
    ),
    legend: <ChartLegend items={[{ label: "search-indexer", finish: "cobalt" }, { label: "Other services", finish: "silver" }]} />
  },
  donut: {
    chart: (
      <DonutChart
        aria-label="Donut chart of November cloud spend, 48.2 thousand dollars: edge-renderer 41 percent, api-gateway 27 percent, search-indexer 19 percent, other 13 percent."
        centerLabel="$48.2k"
        centerCaption="November"
        segments={[{ label: "edge-renderer", value: 41 }, { label: "api-gateway", value: 27 }, { label: "search-indexer", value: 19 }, { label: "Other", value: 13 }]}
      />
    ),
    legend: <ChartLegend items={[{ label: "Cloud spend by service, November", note: true }]} />
  },
  scatter: {
    chart: (
      <ScatterChart
        aria-label="Scatter plot of p95 latency against payload size. Other regions stay under 160 ms; ap-south-1 requests sit between 230 and 360 ms from 140 to 350 KB."
        caption="p95, ms"
        xTicks={[0, 100, 200, 300, 400]}
        formatX={(v) => (v === 400 ? "400 KB" : String(v))}
        yTicks={[0, 200, 400]}
        series={[{ label: "ap-south-1", points: scatterAp }, { label: "Other regions", points: scatterOther }]}
      />
    ),
    legend: <ChartLegend items={[{ label: "ap-south-1", kind: "bead", finish: "cobalt" }, { label: "Other regions", kind: "bead" }]} />
  },
  funnel: {
    chart: (
      <FunnelChart
        aria-label="Checkout funnel for Tidewater Goods in November: 6,130 carts, 4,420 entered shipping, 3,050 entered payment, 2,410 orders placed, 39.3 percent overall."
        steps={[{ label: "Cart", value: 6130 }, { label: "Shipping", value: 4420 }, { label: "Payment", value: 3050 }, { label: "Order", value: 2410 }]}
      />
    ),
    legend: <ChartLegend items={[{ label: "Order placed", kind: "column", finish: "cobalt" }, { label: "Earlier steps", kind: "column" }]} />
  },
  waveform: {
    chart: <Waveform aria-label="Waveform of the INC-418 incident bridge recording, 2 minutes 18 seconds long, played to 0:51." peaks={peaks} duration={138} position={51} />,
    legend: <ChartLegend items={[{ label: "Played", kind: "eq", finish: "cobalt" }, { label: "Remaining", kind: "eq" }, { label: "INC-418 bridge call", note: true }]} />
  }
};

const filters = ["All", "Trend", "Comparison", "Part of whole", "Distribution"].map((value) => ({ value, label: value }));
const themes = [{ value: "satin", label: "Satin" }, { value: "ink", label: "Ink" }];

/** /components/charts — the twelve chart components with the artboard's data, filterable, previews on their own theme. */
export default function ChartsCatalog() {
  const { theme } = useChrome();
  const { hash } = useLocation();
  const [filter, setFilter] = useState("All");
  const [preview, setPreview] = useState<string>();
  const stageTheme = preview === "ink" || (!preview && theme === "ink") ? "ink" : "satin";

  // a sidebar link to a chart the current filter hides shows them all again
  const [seenHash, setSeenHash] = useState(hash);
  if (hash !== seenHash) {
    setSeenHash(hash);
    const target = charts.find((entry) => `#${entry.slug}` === hash);
    if (target && filter !== "All" && filter !== target.category) setFilter("All");
  }

  return (
    <DocsShell className="pg-charts">
      <header className="pg-charts__hd">
        <h1 className="h1">Charts</h1>
        <p className="lead">Twelve charts machined from the same satin chrome as the buttons: polished wires, pill bars, bezel gauges and metal beads, with one cobalt series in focus.</p>
      </header>

      <div className="pg-charts__bar">
        <div className="pg-charts__scroll">
          <SegmentedControl aria-label="Show category" items={filters} value={filter} onValueChange={setFilter} />
        </div>
        <div className="pg-charts__theme">
          <span className="small t3" aria-hidden="true">Preview</span>
          <SegmentedControl aria-label="Preview theme" items={themes} value={stageTheme} onValueChange={setPreview} />
        </div>
      </div>

      <div className="pg-charts__grid">
        {charts
          .filter((entry) => filter === "All" || entry.category === filter)
          .map((entry) => {
            const { chart, legend } = previews[entry.slug]!;
            return (
              <article key={entry.slug} id={entry.slug} className="card pg-charts__tile" aria-labelledby={`${entry.slug}-title`}>
                <ChromeProvider theme={stageTheme} className="pg-charts__island">
                  <ChartWell className="pg-charts__pv">{chart}</ChartWell>
                </ChromeProvider>
                <div className="pg-charts__meta">
                  <h2 className="h3" id={`${entry.slug}-title`}>
                    <Link to={`#${entry.slug}`}>{entry.name}</Link>
                    <span className="pg-charts__cat">{entry.category}</span>
                  </h2>
                  <p>{entry.blurb}</p>
                  {legend}
                </div>
              </article>
            );
          })}
      </div>
    </DocsShell>
  );
}
