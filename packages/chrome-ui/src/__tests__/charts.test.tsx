import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  BarList,
  ChartLegend,
  ChartTooltipRow,
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
  niceTicks
} from "../index";

type Case = { name: string; role: "img" | "figure" | "list"; full: ReactElement; empty: ReactElement; one: ReactElement };

const label = (n: string) => `${n} chart for the test`;

const cases: Case[] = [
  {
    name: "Area",
    role: "img",
    full: <AreaChart aria-label={label("Area")} labels={["00:00", "06:00", "12:00"]} series={[{ label: "Mon", data: [12000, 38200, 20000] }, { label: "Prior", data: [11000, 29000, 17000], finish: "dashed" }]} highlight={{ index: 1, label: "38.2k" }} />,
    empty: <AreaChart aria-label={label("Area")} series={[]} />,
    one: <AreaChart aria-label={label("Area")} labels={["Now"]} series={[{ label: "Mon", data: [5] }]} highlight={{ index: 0, label: "5" }} />
  },
  {
    name: "Line",
    role: "img",
    full: <LineChart aria-label={label("Line")} labels={["Tue", "Wed"]} threshold={{ value: 300, label: "Budget 300" }} series={[{ label: "a", data: [88, 312] }, { label: "b", data: [62, null], finish: "smoked" }]} />,
    empty: <LineChart aria-label={label("Line")} series={[{ label: "a", data: [] }]} />,
    one: <LineChart aria-label={label("Line")} series={[{ label: "a", data: [1] }]} curve="smooth" />
  },
  {
    name: "Bar",
    role: "img",
    full: <BarChart aria-label={label("Bar")} labels={["Tue", "Wed"]} series={[{ label: "Last", data: [34, { value: 38, pending: true }] }, { label: "Prior", data: [30, 33] }]} />,
    empty: <BarChart aria-label={label("Bar")} series={[]} />,
    one: <BarChart aria-label={label("Bar")} labels={["Tue"]} series={[{ label: "Last", data: [34] }]} />
  },
  {
    name: "Bar List",
    role: "list",
    full: <BarList aria-label={label("Bar List")} items={[{ label: "/v1/deploys", value: 12400 }, { label: "/v1/runs", value: 8100 }]} />,
    empty: <BarList aria-label={label("Bar List")} items={[]} />,
    one: <BarList aria-label={label("Bar List")} items={[{ label: "/v1/deploys", value: 0 }]} />
  },
  {
    name: "Gauge",
    role: "img",
    full: <Gauge aria-label={label("Gauge")} value={72} label="error budget left" threshold={{ value: 25, label: "25%" }} />,
    empty: <Gauge aria-label={label("Gauge")} value={0} />,
    one: <Gauge aria-label={label("Gauge")} value={100} variant="ring" />
  },
  {
    name: "Radial Rings",
    role: "figure",
    full: <RadialRings aria-label={label("Radial Rings")} center={{ title: "eu-west-1", caption: "capacity" }} rings={[{ label: "CPU", value: 72 }, { label: "Memory", value: 58 }, { label: "Disk", value: 41 }]} />,
    empty: <RadialRings aria-label={label("Radial Rings")} rings={[]} />,
    one: <RadialRings aria-label={label("Radial Rings")} rings={[{ label: "CPU", value: 72 }]} />
  },
  {
    name: "Heatmap",
    role: "img",
    full: <Heatmap aria-label={label("Heatmap")} rowLabels={["Mon", "Tue"]} columnLabels={["00:00", "12:00"]} values={[[0, 1, 2, 3], [4, null, 6, 7]]} />,
    empty: <Heatmap aria-label={label("Heatmap")} values={[]} />,
    one: <Heatmap aria-label={label("Heatmap")} values={[[5]]} formatCell={(v) => `${v}%`} />
  },
  {
    name: "Sparkline",
    role: "img",
    full: <Sparkline aria-label={label("Sparkline")} data={[1, 3, 2, 5]} finish="cobalt" tail={{ from: 2, finish: "enamel" }} />,
    empty: <Sparkline aria-label={label("Sparkline")} data={[]} />,
    one: <Sparkline aria-label={label("Sparkline")} data={[4]} />
  },
  {
    name: "Donut",
    role: "figure",
    full: <DonutChart aria-label={label("Donut")} centerLabel="$48.2k" centerCaption="November" segments={[{ label: "edge", value: 41 }, { label: "api", value: 27 }, { label: "Other", value: 32 }]} />,
    empty: <DonutChart aria-label={label("Donut")} segments={[]} />,
    one: <DonutChart aria-label={label("Donut")} segments={[{ label: "edge", value: 41 }]} />
  },
  {
    name: "Scatter",
    role: "img",
    full: <ScatterChart aria-label={label("Scatter")} series={[{ label: "ap-south-1", points: [[140, 248], [176, 286]] }, { label: "Other", points: [[24, 38]] }]} />,
    empty: <ScatterChart aria-label={label("Scatter")} series={[]} />,
    one: <ScatterChart aria-label={label("Scatter")} series={[{ label: "ap-south-1", points: [[1, 1]] }]} />
  },
  {
    name: "Funnel",
    role: "img",
    full: <FunnelChart aria-label={label("Funnel")} steps={[{ label: "Cart", value: 6130 }, { label: "Order", value: 2410 }]} />,
    empty: <FunnelChart aria-label={label("Funnel")} steps={[]} />,
    one: <FunnelChart aria-label={label("Funnel")} steps={[{ label: "Cart", value: 6130 }]} />
  },
  {
    name: "Funnel rows",
    role: "figure",
    full: <FunnelChart layout="rows" aria-label={label("Funnel rows")} steps={[{ label: "Sessions", value: 412380 }, { label: "Viewed", value: 238180 }, { label: "Purchased", value: 11712 }]} />,
    empty: <FunnelChart layout="rows" aria-label={label("Funnel rows")} steps={[]} />,
    one: <FunnelChart layout="rows" aria-label={label("Funnel rows")} steps={[{ label: "Sessions", value: 0 }]} />
  },
  {
    name: "Waveform",
    role: "img",
    full: <Waveform aria-label={label("Waveform")} peaks={[0.2, 1, 0.5, 0.7]} duration={138} position={51} />,
    empty: <Waveform aria-label={label("Waveform")} peaks={[]} duration={0} />,
    one: <Waveform aria-label={label("Waveform")} peaks={[1]} duration={10} position={10} />
  }
];

describe("charts", () => {
  it.each(cases)("$name renders with an accessible name", ({ name, role, full }) => {
    render(full);
    expect(screen.getByRole(role, { name: label(name) })).toBeInTheDocument();
  });

  it.each(cases)("$name handles empty data", ({ name, role, empty }) => {
    render(empty);
    expect(screen.getByRole(role, { name: label(name) })).toBeInTheDocument();
    expect(document.body.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it.each(cases)("$name handles a single point", ({ name, role, one }) => {
    render(one);
    expect(screen.getByRole(role, { name: label(name) })).toBeInTheDocument();
    expect(document.body.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("gives each instance its own defs ids, and every url() reference resolves", () => {
    const { container } = render(
      <>
        {cases.map((c) => <div key={c.name}>{c.full}</div>)}
        {cases.map((c) => <div key={`${c.name}-2`}>{c.full}</div>)}
      </>
    );
    const ids = [...container.querySelectorAll("defs [id]")].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    const refs = [...container.innerHTML.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(ids).toContain(ref);
  });

  it("renders the highlight readout, legends and an optional data table", () => {
    render(
      <>
        <AreaChart
          aria-label="Usage"
          dataTable
          description="Peaks on 12 November."
          labels={["11 Nov", "12 Nov"]}
          series={[{ label: "Usage", data: [29300, 30100] }]}
          highlight={{ index: 1, tooltip: <ChartTooltipRow swatch="cobalt" label="Usage" value="$30.1k" strong /> }}
        />
        <ChartLegend aria-label="Series" items={[{ label: "1–15 Nov", finish: "cobalt" }, { label: "Weekend", kind: "square", finish: "band" }]} />
        <HeatmapLegend />
      </>
    );
    expect(screen.getByRole("img", { name: "Usage" })).toHaveAccessibleDescription("Peaks on 12 November.");
    expect(screen.getByText("$30.1k")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Usage" })).toHaveTextContent("30,100");
    expect(screen.getByRole("list", { name: "Series" }).querySelectorAll("li")).toHaveLength(2);
  });

  it("hangs negative bars from the zero axis", () => {
    const { container } = render(<BarChart aria-label="Net" labels={["a", "b"]} yTicks={[-400, 0, 400]} series={[{ label: "Net", data: [300, -200] }]} />);
    const axisY = Number(container.querySelector(".chrome-chart__axis")!.getAttribute("d")!.split(" ")[1]!.replace(/H.*/, ""));
    const rings = [...container.querySelectorAll("svg rect[rx]")].filter((r) => r.getAttribute("fill")?.endsWith("bring-x)"));
    expect(rings).toHaveLength(2);
    const [up, down] = rings.map((r) => ({ y: Number(r.getAttribute("y")), h: Number(r.getAttribute("height")) }));
    expect(up!.y + up!.h).toBeCloseTo(axisY - 0.5, 0);
    expect(down!.y).toBeCloseTo(axisY - 0.5, 0);
  });

  it("formats compact numbers and nice ticks", () => {
    expect([40000, 38200, 0, 2500000, -80000, 0.05, 312].map(formatCompact)).toEqual(["40k", "38.2k", "0", "2.5M", "−80k", "0.05", "312"]);
    expect(niceTicks(0, 38200)).toEqual([0, 20000, 40000]);
    expect(niceTicks(0, 312)).toEqual([0, 200, 400]);
    expect(niceTicks(0, 0)).toEqual([0, 0.5, 1]);
  });

  it("has no axe violations in either theme", async () => {
    const { container } = render(
      <main>
        <ChromeProvider theme="satin">{cases.map((c) => <div key={c.name}>{c.full}</div>)}</ChromeProvider>
        <ChromeProvider theme="ink">{cases.map((c) => <div key={c.name}>{c.full}</div>)}</ChromeProvider>
      </main>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
