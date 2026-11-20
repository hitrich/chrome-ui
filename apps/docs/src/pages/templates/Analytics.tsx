// Storefront analytics template (Tidewater Goods, Satin) — work/canvas/project/Analytics.dc.html
import {
  Button,
  ChartLegend,
  ChartTooltipRow,
  ChartWell,
  FunnelChart,
  Heatmap,
  HeatmapLegend,
  LineChart,
  Popover,
  StatusIndicator,
  Table,
  type StatusIndicatorProps
} from "@loreanai/chrome-ui";
import { useState } from "react";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Icon, type IconName } from "../../components/Icon";
import { Kpis, Notifications, PageHead, Track, type Kpi } from "./d1-shared";
import "./Analytics.css";

/* ---- data (every number from the artboard) ---- */
const kpis: Kpi[] = [
  { label: "Sessions", value: "412,380", delta: "+11.6%", tone: "up", focus: true, spark: [23.1, 22.6, 26.0, 27.7, 28.3, 25.9, 19.7, 23.5, 22.1, 24.1, 27.1, 28.7, 24.9, 17.8, 23.5, 22.2, 22.5, 25.8, 29.0, 24.6, 15.7, 22.7, 22.7, 21.6, 24.0, 4.0, 14.2, 14.1], note: "vs 369,516 in the previous 28 days" },
  { label: "Conversion rate", value: "2.84%", delta: "+0.18 pts", tone: "up", spark: [27.8, 28.4, 29.0, 28.1, 28.7, 27.2, 24.5, 26.9, 27.5, 28.4, 28.7, 28.1, 26.6, 23.9, 26.3, 26.6, 27.2, 27.8, 28.4, 26.0, 22.5, 25.1, 25.4, 24.8, 24.5, 4.0, 14.1, 18.0], note: "Orders ÷ sessions · was 2.66%" },
  { label: "Orders", value: "11,712", delta: "+19.2%", tone: "up", spark: [25.8, 25.7, 27.7, 28.2, 28.7, 27.0, 22.7, 25.7, 25.1, 26.5, 28.1, 28.7, 26.3, 21.4, 25.4, 24.9, 25.3, 27.1, 29.0, 25.9, 19.7, 24.5, 24.7, 23.9, 25.0, 4.0, 15.2, 16.8], note: "9,519 first orders · 2,193 repeat" },
  { label: "Revenue", value: "$1.01M", delta: "+18.2%", tone: "up", spark: [25.3, 25.1, 27.4, 28.2, 28.6, 26.6, 21.8, 25.2, 24.8, 26.3, 28.1, 28.7, 25.9, 20.6, 25.0, 24.5, 25.0, 27.0, 29.0, 25.6, 18.8, 24.2, 24.4, 23.6, 24.9, 4.0, 15.1, 16.6], note: "Average order $86.40 · was $87.10" }
];

// daily sessions, read from the artboard's plot (y in a 248-high box, 25k at y=20, 10k at y=240)
const sessY = [173.1, 171.1, 183.1, 189.2, 191.2, 183.0, 161.2, 174.5, 169.3, 176.6, 187.0, 192.6, 179.4, 154.4, 174.4, 170.0, 171.0, 182.4, 193.7, 178.2, 147.1, 171.4, 171.7, 167.8, 176.0, 106.0, 141.9, 141.4];
const sessPrevY = [185.9, 194.6, 200.7, 194.9, 212.4, 203.7, 170.4, 193.3, 189.8, 194.9, 202.4, 203.7, 203.5, 175.5, 182.0, 194.8, 194.2, 193.4, 211.0, 197.5, 170.5, 189.4, 184.4, 195.5, 196.8, 200.8, 203.3, 168.0];
const sess = (y: number) => Math.round(25000 - ((y - 20) / 220) * 15000);
const octNov = Array.from({ length: 28 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 19 + i));
  return `${d.getUTCDate()} ${d.getUTCMonth() === 9 ? "Oct" : "Nov"}`;
});

const sources: [string, string, string, number, boolean?][] = [
  ["Organic search", "148,460", "2.5%", 36],
  ["Direct", "94,850", "3.4%", 23],
  ["Paid social", "70,100", "1.5%", 17],
  ["Email", "49,490", "5.1%", 12, true],
  ["Referral", "28,870", "2.9%", 7],
  ["Paid search", "20,610", "1.7%", 5]
];

const cohorts: [string, number][] = [["21 Sep", 1842], ["28 Sep", 1906], ["5 Oct", 1775], ["12 Oct", 2031], ["19 Oct", 2118], ["26 Oct", 2264], ["2 Nov", 2190], ["9 Nov", 2947]];
// base return by week, a per-cohort jitter, and +6 pts on the 9 Nov diagonal (the restock email); unobserved weeks are null
const cohortValues = cohorts.map((_, i) =>
  Array.from({ length: 7 }, (_, w) => (i + w + 1 > 7 ? null : [38, 29, 25, 22, 20, 19, 18][w]! + [0, 1, -1, 2, 0, 1, -1, 0][i]! + (i + w + 1 === 7 ? 6 : 0)))
);

interface Product { name: string; sku: string; units: string; price: string; revenue: string; bar: number; share: string; tone: StatusIndicatorProps["tone"]; stock: string }
const products: Product[] = [
  { name: "Linen-blend quilted throw, oversized, sea glass", sku: "TWG-2210", units: "612", price: "$130.00", revenue: "$79,560", bar: 78.6, share: "7.9%", tone: "warn", stock: "Low · 46 left" },
  { name: "Waxed canvas tote, olive", sku: "TWG-1042", units: "1,284", price: "$55.00", revenue: "$70,620", bar: 69.8, share: "7.0%", tone: "ok", stock: "820 in stock" },
  { name: "Enamel camp mug, set of 4", sku: "TWG-0871", units: "1,920", price: "$32.00", revenue: "$61,440", bar: 60.7, share: "6.1%", tone: "ok", stock: "2,310 in stock" },
  { name: "Merino watch cap, charcoal", sku: "TWG-3305", units: "1,455", price: "$34.00", revenue: "$49,470", bar: 48.9, share: "4.9%", tone: "bad", stock: "Sold out · back 24 Nov" },
  { name: "Teak serving board, large", sku: "TWG-1188", units: "498", price: "$89.00", revenue: "$44,322", bar: 43.8, share: "4.4%", tone: "ok", stock: "312 in stock" },
  { name: "Stoneware pour-over set", sku: "TWG-2047", units: "377", price: "$95.00", revenue: "$35,815", bar: 35.4, share: "3.5%", tone: "ok", stock: "158 in stock" }
];

const navItems: [string, IconName, number?][] = [["Home", "home"], ["Orders", "bag", 38], ["Products", "box"], ["Customers", "users"], ["Analytics", "chart"], ["Campaigns", "message"]];
const reports = ["Weekly trading", "Email attribution", "Returns by reason and product line"];

function ShareReport() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true), () => setCopied(false));
  };
  return (
    <Popover.Root onOpenChange={() => setCopied(false)}>
      <Popover.Trigger asChild>
        <Button finish="polished" leadingIcon={<Icon name="link" style={{ strokeWidth: 2 }} />}>Share report</Button>
      </Popover.Trigger>
      <Popover.Content align="end" aria-label="Share report" className="an-share">
        <span className="small" style={{ fontWeight: 600 }}>Storefront analytics</span>
        <span className="small t2">19 Oct – 15 Nov 2026 · all channels. Anyone at Tidewater Goods with the link can view it.</span>
        <Button size="sm" leadingIcon={<Icon name="copy" />} onClick={copy} style={{ alignSelf: "flex-start", marginTop: 6 }}>
          {copied ? "Link copied" : "Copy link"}
        </Button>
      </Popover.Content>
    </Popover.Root>
  );
}

export default function Page() {
  const [active, setActive] = useState("Analytics");
  const [report, setReport] = useState<string | null>(null);

  const nav: AppNavItem[] = navItems.map(([label, icon, badge]) => ({
    label,
    icon,
    badge: badge ? { value: badge } : undefined,
    active: active === label,
    ...(label === "Analytics" ? { to: "/templates/analytics" } : { onSelect: () => setActive(label) })
  }));

  return (
    <AppShell
      className="pg-analytics"
      workspace={{ name: "Tidewater Goods", sub: "Online store" }}
      nav={nav}
      sections={[
        {
          label: "Saved reports",
          items: reports.map((label) => ({ label, title: label, current: report === label, onSelect: () => setReport(label) }))
        }
      ]}
      card={
        <>
          <span className="small" style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="t2">Black Friday prep</span>
            <span className="num">7 of 9</span>
          </span>
          <Track value={78} label="Black Friday prep" />
          <span className="small t3">27 Nov · 11 days to go</span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", active: active === "Settings", onSelect: () => setActive("Settings") }]}
      search={{ label: "Search products, orders and customers", placeholder: "Search products, orders, customers" }}
      actions={
        <>
          <Notifications label="Notifications" items={[]} />
          <ShareReport />
        </>
      }
      user={{ name: "Sofia Ekwueme", title: "Sofia Ekwueme, growth lead" }}
    >
      <PageHead
        title="Storefront analytics"
        sub="19 Oct – 15 Nov 2026 compared with the previous 28 days · all channels"
        periods={["7d", "28d", "90d", "12m"]}
        periodLabel="Date range"
        defaultPeriod="28d"
      />

      <Kpis items={kpis} />

      <div className="bento">
        <article className="card card-lit s8 an-sessions">
          <div className="d1-hd d1-hd--start">
            <div className="d1-col">
              <h2 className="h3">Sessions</h2>
              <span className="small t3">Daily · 19 Oct – 15 Nov</span>
            </div>
            <ChartLegend className="d1-legend" items={[{ label: "This period", finish: "cobalt" }, { label: "Previous 28 days", finish: "dashed" }, { label: "Campaign", kind: "marker" }]} />
          </div>
          <ChartWell className="an-plot">
            <LineChart
              aria-label="Daily sessions from 19 October to 15 November, mostly between 13 and 16 thousand a day, peaking at 19,140 on 13 November after the fall restock email. Every week ran above the previous period."
              height={273}
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
                    <ChartTooltipRow label={<span className="t3">Fri 13 Nov</span>} value="+51.0%" tone="up" style={{ minWidth: 172 }} />
                    <ChartTooltipRow swatch="cobalt" label="Sessions" value="19,140" strong />
                    <ChartTooltipRow swatch="dashed" label="Fri 16 Oct" value="12,673" muted />
                    <ChartTooltipRow label="Fall restock email, 08:00" muted rule />
                  </>
                )
              }}
              dataTable
            />
          </ChartWell>
          <div className="small an-stats">
            <span><span className="t3">Daily average </span><span className="num">14,728</span></span>
            <span><span className="t3">Best day </span><span className="num">19,140</span><span className="t3"> · Fri 13 Nov</span></span>
            <span><span className="t3">Lowest </span><span className="num">13,155</span><span className="t3"> · Fri 6 Nov</span></span>
          </div>
        </article>

        <article className="card s4 an-sources">
          <div className="d1-col">
            <h2 className="h3">Traffic sources</h2>
            <span className="small t3">Bars show share of 412,380 sessions</span>
          </div>
          <div className="an-src small t3" style={{ fontSize: 12 }} aria-hidden="true"><span>Source</span><span>Sessions</span><span>Conv.</span></div>
          <ul className="an-src-list" aria-label="Sessions and conversion rate by traffic source">
            {sources.map(([name, sessions, conv, share, focus]) => (
              <li className="an-fs" key={name}>
                <div className="an-src">
                  <span>{name}</span>
                  <span className="num">{sessions}</span>
                  <span className={focus ? "num an-src__focus" : "num t2"}>{conv}</span>
                </div>
                <Track value={share} finish={focus ? "co" : "si"} />
              </li>
            ))}
          </ul>
          <span className="small t3 an-foot">Email converts at 1.8× the store average of 2.84%</span>
        </article>

        <article className="card s5 an-funnel">
          <div className="d1-col">
            <h2 className="h3">Conversion funnel</h2>
            <span className="small t3">Share of all sessions at each step</span>
          </div>
          <FunnelChart
            layout="rows"
            aria-label="Conversion funnel: 412,380 sessions, 238,180 viewed a product, 46,920 added to cart, 21,480 started checkout, 11,712 purchased."
            formatShare={(x, i) => (i === 4 ? "2.84%" : `${Number((x * 100).toFixed(1))}%`)}
            steps={[
              { label: "Sessions", value: 412380 },
              { label: "Viewed a product", value: 238180 },
              { label: "Added to cart", value: 46920 },
              { label: "Started checkout", value: 21480 },
              { label: "Purchased", value: 11712 }
            ]}
            dataTable
          />
        </article>

        <article className="card s7 an-cohorts">
          <div className="d1-hd d1-hd--start">
            <div className="d1-col">
              <h2 className="h3">Returning customers</h2>
              <span className="small t3">Share of each weekly cohort that came back, by week since first order</span>
            </div>
            <HeatmapLegend className="an-heat-legend" low="Lower" high="Higher" levels={[1, 2, 3, 4]} />
          </div>
          <div className="an-heat-scroll">
            <Heatmap
              aria-label="Share of each weekly cohort that came back, by week since first order, 18 to 44 percent."
              values={cohortValues}
              thresholds={[0, 22, 28, 36]}
              formatCell={(x) => `${x}%`}
              cellHeight={30}
              cellGap={4}
              rowLabelWidth={110}
              corner={<><span>Cohort</span><span style={{ paddingRight: 4 }}>New</span></>}
              rowLabels={cohorts.map(([c, n]) => <><span style={{ marginRight: "auto" }}>{c}</span><span style={{ paddingRight: 4 }}>{n.toLocaleString("en-US")}</span></>)}
              columnLabels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]}
              className="an-heat"
              dataTable
            />
          </div>
          <span className="small t3 an-foot" style={{ textWrap: "balance" }}>
            The raised diagonal is the week of 9 Nov, when the fall restock email brought every cohort back. The 9 Nov cohort has no full week yet.
          </span>
        </article>

        <article className="card an-products">
          <div className="d1-hd an-products__head">
            <div className="d1-row d1-wrap" style={{ gap: 12 }}>
              <h2 className="h3">Top products</h2>
              <span className="small t3">By revenue · 6 of 186 products · 33.7% of revenue</span>
            </div>
            <button type="button" className="d1-link" onClick={() => setActive("Products")}>All products</button>
          </div>
          <Table aria-label="Top products by revenue" containerClassName="an-products__table">
            <thead>
              <tr>
                <th scope="col">Product</th><th scope="col">SKU</th><th scope="col" className="r">Units</th><th scope="col" className="r">Price</th>
                <th scope="col" className="r">Revenue</th><th scope="col" style={{ width: "22%" }}>Share of revenue</th><th scope="col">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.sku}>
                  <td><span className="d1-trunc an-product" title={p.name}>{p.name}</span></td>
                  <td className="d1-mono12 t3">{p.sku}</td>
                  <td className="r">{p.units}</td>
                  <td className="r t2">{p.price}</td>
                  <td className="r">{p.revenue}</td>
                  <td>
                    <div className="d1-row">
                      <div style={{ flex: 1 }}><Track value={p.bar} finish={i === 0 ? "co" : "si"} /></div>
                      <span className="num t2 small an-share-pct">{p.share}</span>
                    </div>
                  </td>
                  <td><StatusIndicator tone={p.tone} label={p.stock} role="none" /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </article>
      </div>
    </AppShell>
  );
}
