import { Accordion, Avatar, Calendar, Chip, Divider, KeyHint, Stat, Surface, Table, Timeline } from "@loreanai/chrome-ui";
import { G } from "./glyphs";
import type { ComponentDoc } from "./types";

const AA = "WCAG 2.2 AA";
const nov = (day: number) => new Date(2026, 10, day);

const services = [
  { name: "search-indexer", p95: 380 },
  { name: "edge-renderer", p95: 112 },
  { name: "api-gateway", p95: 42 }
];

function ServiceTable({ density }: { density?: "compact" | "comfortable" }) {
  return (
    <Table aria-label={`Slowest services, ${density ?? "comfortable"}`} density={density}>
      <thead>
        <tr>
          <th scope="col">Service</th>
          <th scope="col" data-align="right">p95</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.name}>
            <td className="mono">{service.name}</td>
            <td data-align="right">{service.p95} ms</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

const surfaceBox = { display: "grid", placeItems: "center", width: 150, height: 92, fontSize: 13 } as const;

export const dataDocs: Record<string, ComponentDoc> = {
  accordion: {
    tags: ["Radix Accordion", "New", AA],
    imports: ["Accordion"],
    code: `import { Accordion } from "@loreanai/chrome-ui";

<Accordion.Root type="single" collapsible defaultValue="triggers">
  <Accordion.Item value="triggers">
    <Accordion.Trigger>Rollback triggers</Accordion.Trigger>
    <Accordion.Content>p95 above 300 ms or errors above 1% for 5 minutes.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="paging">
    <Accordion.Trigger>Paging rules</Accordion.Trigger>
    <Accordion.Content>Page the on-call SRE after 2 minutes; escalate to the lead after 10.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="regions">
    <Accordion.Trigger>Regions</Accordion.Trigger>
    <Accordion.Content>eu-west-1, us-east-2 and ap-south-1 roll out in that order.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`,
    sections: [
      {
        id: "multiple",
        title: "Several open",
        text: "`type=\"multiple\"` lets readers keep more than one section open; `value` is then an array.",
        samples: [
          {
            label: 'type="multiple"',
            node: (
              <Accordion.Root type="multiple" defaultValue={["triggers", "regions"]} style={{ width: 320 }}>
                <Accordion.Item value="triggers">
                  <Accordion.Trigger>Rollback triggers</Accordion.Trigger>
                  <Accordion.Content>p95 above 300&nbsp;ms or errors above 1% for 5&nbsp;minutes.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="paging">
                  <Accordion.Trigger>Paging rules</Accordion.Trigger>
                  <Accordion.Content>Page the on-call SRE after 2&nbsp;minutes; escalate to the lead after 10.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="regions">
                  <Accordion.Trigger>Regions</Accordion.Trigger>
                  <Accordion.Content>eu-west-1, us-east-2 and ap-south-1 roll out in that order.</Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            )
          }
        ]
      }
    ],
    props: [
      {
        part: "Accordion.Root",
        extends: "Radix `Accordion.Root`.",
        rows: [
          { name: "type", type: '"single" | "multiple"', description: "Required. One section at a time, or several." },
          { name: "value", type: "string | string[]", description: "Controlled open item(s); an array with `multiple`." },
          { name: "defaultValue", type: "string | string[]", description: "Open at first when uncontrolled." },
          { name: "onValueChange", type: "(value) => void", description: "Called when a section opens or closes." },
          { name: "collapsible", type: "boolean", default: "false", description: "With `single`: lets the open section close again." },
          { name: "disabled", type: "boolean", default: "false", description: "Locks every section." }
        ]
      },
      {
        part: "Accordion.Item · Trigger · Content",
        extends: "Radix parts. Trigger renders its `h3` header and the chevron knob; Content wraps the body.",
        rows: [
          { name: "value", type: "string", description: "On Item: required, unique id of the section." },
          { name: "disabled", type: "boolean", default: "false", description: "On Item: locks one section." },
          { name: "children", type: "ReactNode", description: "On Trigger: the title. On Content: the body." },
          { name: "forceMount", type: "true", description: "On Content: keeps a closed body mounted." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Open or close the focused section." },
      { keys: ["↑", "↓"], text: "Move between triggers; Home and End jump to the first and last." },
      { badge: "h3", text: "Every trigger sits in an `h3` with `aria-expanded` and `aria-controls`; nest it under an `h2`." }
    ]
  },

  avatar: {
    tags: [AA],
    imports: ["Avatar"],
    code: `import { Avatar } from "@loreanai/chrome-ui";

<>
  <Avatar name="Kwame Mensah" />
  <Avatar name="Priya Raman" src="/people/priya.jpg" size="lg" />
</>`,
    sections: [
      {
        id: "sizes",
        title: "Sizes",
        style: { alignItems: "flex-end" },
        samples: [
          { label: "sm · 24 px", node: <Avatar name="Mara Lindqvist" size="sm" /> },
          { label: "md · 32 px", node: <Avatar name="Rafael Achebe" /> },
          { label: "lg · 40 px", node: <Avatar name="Priya Raman" size="lg" /> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `span` attributes. There is no presence dot or stack part; compose those around it.",
        rows: [
          { name: "name", type: "string", description: "Required. The first two words make the initials; the full name is the accessible name." },
          { name: "src", type: "string", description: "Photo URL; the name becomes its `alt`." },
          { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "24, 32 or 40 px." }
        ]
      }
    ],
    a11y: [
      { badge: "name", text: "Initials are hidden; the full name is read instead, from visually hidden text or the image `alt`." },
      { badge: "duplicate", text: "Beside a visible name, add `aria-hidden` so the person is not announced twice." },
      { badge: "+2", text: "An overflow count in a stack needs words for screen readers, such as “2 more people”." }
    ]
  },

  calendar: {
    tags: ["New", AA],
    imports: ["Calendar"],
    code: `import { useState } from "react";
import { Calendar } from "@loreanai/chrome-ui";

const isTuesday = (date: Date) => date.getDay() === 2;

export function ReleaseCalendar() {
  const [day, setDay] = useState<Date | null>(new Date(2026, 10, 17));
  return (
    <Calendar
      aria-label="Release calendar"
      value={day}
      onValueChange={setDay}
      isDateMarked={isTuesday}
      markedLabel="release train"
      legend="Release train, every Tuesday"
    />
  );
}`,
    sections: [
      {
        id: "range",
        title: "Range",
        text: "`mode=\"range\"` takes two picks; days between them sit in a cobalt band.",
        samples: [
          { label: 'mode="range" · size="md"', node: <Calendar aria-label="Rollout window" mode="range" defaultValue={{ from: nov(16), to: nov(20) }} defaultMonth={nov(1)} /> },
          { label: 'size="sm" · min', node: <Calendar aria-label="Deploy date" size="sm" defaultValue={nov(24)} defaultMonth={nov(1)} min={nov(18)} weekStartsOn={1} /> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes; name the grid with `aria-label`.",
        rows: [
          { name: "mode", type: '"single" | "range"', default: '"single"', description: "One date, or a `{ from, to }` range." },
          { name: "value", type: "Date | DateRange | null", description: "Controlled selection; the type follows `mode`." },
          { name: "defaultValue", type: "Date | DateRange | null", default: "null", description: "Starting selection when uncontrolled." },
          { name: "onValueChange", type: "(value) => void", description: "Called on every pick." },
          { name: "month", type: "Date", description: "Controlled visible month (any day in it)." },
          { name: "defaultMonth", type: "Date", description: "First month shown; defaults to the selection or today." },
          { name: "onMonthChange", type: "(month: Date) => void", description: "Called when the month changes." },
          { name: "min", type: "Date", description: "Earliest pickable day." },
          { name: "max", type: "Date", description: "Latest pickable day." },
          { name: "isDateDisabled", type: "(date: Date) => boolean", description: "Greys out days, such as weekends." },
          { name: "isDateMarked", type: "(date: Date) => boolean", description: "Cobalt bead under matching days." },
          { name: "markedLabel", type: "string", description: "Read after a marked day’s name, such as “release train”." },
          { name: "legend", type: "ReactNode", description: "Key under the grid, drawn with the bead." },
          { name: "today", type: "Date | null", default: "the current date", description: "Today marker; `null` hides it." },
          { name: "weekStartsOn", type: "0 | 1", default: "0", description: "Sunday or Monday first." },
          { name: "locale", type: "string", description: "Month and weekday names." },
          { name: "size", type: '"sm" | "md"', default: '"md"', description: "26 × 20 or 36 × 32 px days." },
          { name: "autoFocus", type: "boolean", description: "Focuses the active day on mount." }
        ]
      }
    ],
    a11y: [
      { keys: ["←", "→", "↑", "↓"], text: "Move by day and week; Home and End go to the start and end of the week." },
      { keys: ["PageUp", "PageDown"], text: "Change month; with Shift, year. The month title is a polite live region." },
      { keys: ["Enter", "Space"], text: "Pick the focused day. Today carries `aria-current=\"date\"`; every day has its full date as its name." }
    ]
  },

  chip: {
    tags: ["New", AA],
    imports: ["Avatar", "Chip"],
    code: `import { useState } from "react";
import { Avatar, Chip } from "@loreanai/chrome-ui";
import { Plus } from "./icons";

export function DeployFilters({ onAddFilter }: { onAddFilter: () => void }) {
  const [failed, setFailed] = useState(true);
  const [people, setPeople] = useState(["Priya Raman"]);
  return (
    <>
      <Chip selected={failed} onSelectedChange={setFailed}>Failed</Chip>
      <Chip defaultSelected={false}>Rolling</Chip>
      {people.map((name) => (
        <Chip key={name} avatar={<Avatar name={name} size="sm" />} onRemove={() => setPeople(people.filter((p) => p !== name))}>
          {name}
        </Chip>
      ))}
      <Chip variant="dashed" icon={<Plus />} onClick={onAddFilter}>Add filter</Chip>
    </>
  );
}`,
    sections: [
      {
        id: "kinds",
        title: "Kinds",
        text: "A chip with selection props toggles; one with `onRemove` is an entity with its own remove button; anything else is a small button.",
        samples: [
          { label: "toggle · off", node: <Chip defaultSelected={false}>Rolling</Chip> },
          { label: "toggle · on", node: <Chip defaultSelected>Failed</Chip> },
          { label: "entity", node: <Chip avatar={<Avatar name="Priya Raman" size="sm" />} onRemove={() => undefined}>Priya Raman</Chip> },
          { label: 'variant="dashed"', node: <Chip variant="dashed" icon={<G name="plus" size={12} />}>Add filter</Chip> },
          { label: 'size="sm"', node: <Chip size="sm" icon={<G name="filter" size={12} />}>Version: v4.x</Chip> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `button` attributes; an entity chip renders a `span` around its remove button.",
        rows: [
          { name: "selected", type: "boolean", description: "Controlled toggle state; makes the chip a toggle." },
          { name: "defaultSelected", type: "boolean", description: "Starting toggle state; also makes it a toggle." },
          { name: "onSelectedChange", type: "(selected: boolean) => void", description: "Called on every toggle." },
          { name: "onRemove", type: "() => void", description: "Makes it an entity chip with a remove button." },
          { name: "removeLabel", type: "string", default: "“Remove {children}”", description: "Name of the remove button." },
          { name: "icon", type: "ReactNode", description: "Leading glyph; a selected toggle shows a check instead." },
          { name: "avatar", type: "ReactNode", description: "Leading Avatar, shown at 20 px." },
          { name: "variant", type: '"default" | "dashed"', default: '"default"', description: "Dashed is the quiet add-a-filter chip." },
          { name: "size", type: '"sm" | "md"', default: '"md"', description: "`sm` is the 24 px chip of the Blocks filter bar." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Toggle a filter chip, or press the focused remove button." },
      { badge: "aria-pressed", text: "Toggle chips report `aria-pressed`; the check is decorative." },
      { badge: "remove", text: "Remove buttons are named “Remove Priya Raman”; move focus somewhere sensible after removing." }
    ]
  },

  "code-block": {
    tags: [AA],
    imports: ["CodeBlock"],
    code: `import { CodeBlock } from "@loreanai/chrome-ui";

<CodeBlock
  filename="Deploy.tsx"
  language="tsx"
  code={'import { Button } from "@loreanai/chrome-ui";\\n\\n<Button finish="polished">Deploy</Button>'}
/>`,
    props: [
      {
        extends: "Renders a `figure`; also takes its attributes. The code renders as plain text, without syntax colors.",
        rows: [
          { name: "code", type: "string", description: "Required. The source, shown and copied as is." },
          { name: "filename", type: "string", default: '"Snippet"', description: "Header label." },
          { name: "language", type: "string", description: "Quiet tag beside the filename." },
          { name: "copyable", type: "boolean", default: "true", description: "The copy button in the header." },
          { name: "copyLabel", type: "string", default: '"Copy code"', description: "Name of the copy button; it reads “Code copied” for a moment after." },
          { name: "onCopy", type: "(code: string) => void | Promise<void>", description: "Replaces the Clipboard API call." }
        ]
      }
    ],
    a11y: [
      { badge: "figure", text: "A `figure` whose `figcaption` holds the filename, so the snippet has a name." },
      { badge: "copy", text: "The copy button is labelled and swaps its name to “Code copied” or “Copy failed”." },
      { badge: "scroll", text: "Long lines scroll inside the block; the page never scrolls sideways." }
    ]
  },

  divider: {
    tags: [AA],
    imports: ["Divider"],
    code: `import { Divider } from "@loreanai/chrome-ui";

<>
  <Divider />
  <Divider label="Earlier today" />
  <Divider orientation="vertical" />
</>`,
    sections: [
      {
        id: "kinds",
        title: "Plain, labelled and vertical",
        text: "An engraved hairline: a dark line over a light lip, one pixel in the layout.",
        samples: [
          { label: "horizontal", node: <div style={{ width: 200 }}><Divider /></div> },
          { label: "label", node: <div style={{ width: 240 }}><Divider label="Earlier today" /></div> },
          { label: 'orientation="vertical"', node: <div className="doc-row" style={{ height: 24 }}><span className="small">Logs</span><Divider orientation="vertical" /><span className="small">Metrics</span><Divider orientation="vertical" /><span className="small">Traces</span></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes.",
        rows: [
          { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Line direction; vertical stretches to its row." },
          { name: "label", type: "ReactNode", description: "Text set into the line, such as a date group." }
        ]
      }
    ],
    a11y: [
      { badge: "separator", text: "`role=\"separator\"` with `aria-orientation`." },
      { badge: "label", text: "A labelled divider reads its label; use a heading instead when it starts a real section." },
      { badge: "decorative", text: "For a purely visual line, pass `role=\"none\"` so it is skipped." }
    ]
  },

  "key-hint": {
    tags: [AA],
    imports: ["KeyHint"],
    code: `import { KeyHint } from "@loreanai/chrome-ui";

<>
  <KeyHint keys={["⌘", "K"]} />
  <KeyHint>/</KeyHint>
</>`,
    sections: [
      {
        id: "chords",
        title: "Chords",
        text: "One keycap per entry in `keys`; sequences are two hints with a word between.",
        samples: [
          { label: "⌘ K", node: <KeyHint keys={["⌘", "K"]} /> },
          { label: "⌘ ↵", node: <KeyHint keys={["⌘", "↵"]} /> },
          { label: "⇧ ⌘ L", node: <KeyHint keys={["⇧", "⌘", "L"]} /> },
          { label: "G then I", node: <span className="doc-row small t3"><KeyHint>G</KeyHint>then<KeyHint>I</KeyHint></span> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `span` attributes. Each key renders as a `kbd`.",
        rows: [
          { name: "keys", type: "readonly string[]", description: "One keycap per entry, read as one chord." },
          { name: "children", type: "ReactNode", description: "Used as a single keycap when `keys` is empty." }
        ]
      }
    ],
    a11y: [
      { badge: "kbd", text: "Keys are `kbd` elements; symbols such as ⌘ are read inconsistently, so add “Command K” in an `aria-label` where it matters." },
      { badge: "aria-hidden", text: "Hide a hint that repeats a shortcut already named in nearby text." },
      { badge: "platform", text: "Show ⌘ on macOS and Ctrl elsewhere; the hint draws what you pass." }
    ]
  },

  stat: {
    tags: [AA],
    imports: ["Stat"],
    code: `import { Stat } from "@loreanai/chrome-ui";

<Stat
  label="Requests"
  value="31.6k / min"
  delta="+8.2%"
  trend="up"
  sentiment="positive"
  description="29.2k at this time last Monday"
/>`,
    sections: [
      {
        id: "trends",
        title: "Trend and sentiment",
        text: "Trend is the direction; sentiment says whether that is good. A rising p95 is up and negative.",
        samples: [
          { label: "up · positive", node: <Stat label="Requests" value="31.6k / min" delta="+8.2%" trend="up" sentiment="positive" description="29.2k last Monday" /> },
          { label: "up · negative", node: <Stat label="p95 latency" value="380 ms" delta="+41%" trend="up" sentiment="negative" description="ap-south-1" /> },
          { label: "flat", node: <Stat label="Error rate" value="0.42%" delta="0.0 pt" description="Same as yesterday" /> }
        ]
      }
    ],
    props: [
      {
        extends: "Renders an `article`; also takes its attributes.",
        rows: [
          { name: "label", type: "ReactNode", description: "Required. What is measured." },
          { name: "value", type: "ReactNode", description: "Required. The headline number." },
          { name: "delta", type: "ReactNode", description: "Change against the comparison, with its sign." },
          { name: "trend", type: '"up" | "down" | "flat"', default: '"flat"', description: "Direction of the change." },
          { name: "sentiment", type: '"neutral" | "positive" | "negative"', default: '"neutral"', description: "Colors the delta mint or enamel." },
          { name: "description", type: "ReactNode", description: "The comparison in words." }
        ]
      }
    ],
    a11y: [
      { badge: "words", text: "The delta’s color is a hint only; its sign and the description carry the meaning." },
      { badge: "−", text: "Write negatives with a real minus (−8.2%) so they are read as minus, not dash." },
      { badge: "article", text: "Each stat is an `article`; a row of them reads as separate items." }
    ]
  },

  surface: {
    tags: [AA],
    imports: ["Surface"],
    code: `import { Surface } from "@loreanai/chrome-ui";

<Surface finish="edge">
  <h2>Billable usage</h2>
  <p>$18,420 this month</p>
</Surface>`,
    sections: [
      {
        id: "finishes",
        title: "Finishes",
        text: "Card for everyday panels, edge for the one hero tile per screen, chrome for floating panels.",
        samples: [
          { label: 'finish="ink"', node: <Surface style={surfaceBox}>Card</Surface> },
          { label: 'finish="edge"', node: <Surface finish="edge" style={surfaceBox}>Raised</Surface> },
          { label: 'finish="chrome"', node: <Surface finish="chrome" style={surfaceBox}>Float</Surface> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes.",
        rows: [{ name: "finish", type: '"ink" | "edge" | "chrome"', default: '"ink"', description: "Card, top-lit card (once per screen) or floating chrome-rimmed panel." }]
      }
    ],
    a11y: [
      { badge: "div", text: "A surface is presentational; give it a heading or landmark when it holds a section." },
      { badge: "4.5:1", text: "Body text holds 4.5:1 on every level in both themes." },
      { badge: "forced colors", text: "In forced-colors mode the level shows as a system border." }
    ]
  },

  table: {
    tags: [AA],
    imports: ["Table"],
    code: `import { Table } from "@loreanai/chrome-ui";

const services = [
  { name: "search-indexer", p95: 380 },
  { name: "edge-renderer", p95: 112 },
  { name: "api-gateway", p95: 42 }
];

<Table aria-label="Slowest services">
  <thead>
    <tr>
      <th scope="col">Service</th>
      <th scope="col" data-align="right">p95</th>
    </tr>
  </thead>
  <tbody>
    {services.map((service) => (
      <tr key={service.name}>
        <td className="mono">{service.name}</td>
        <td data-align="right">{service.p95} ms</td>
      </tr>
    ))}
  </tbody>
</Table>`,
    sections: [
      {
        id: "density",
        title: "Density",
        text: "Comfortable rows are 44 px, compact 32 px. Sorting is yours: Table styles the rows you give it.",
        samples: [
          { label: 'density="comfortable"', node: <div className="card" style={{ width: 300, overflow: "hidden" }}><ServiceTable /></div> },
          { label: 'density="compact"', node: <div className="card" style={{ width: 300, overflow: "hidden" }}><ServiceTable density="compact" /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `table` attributes. The table sits in its own horizontal scroll region.",
        rows: [
          { name: "density", type: '"compact" | "comfortable"', default: '"comfortable"', description: "Row height 32 or 44 px." },
          { name: "stickyHeader", type: "boolean", default: "false", description: "Header stays put while the body scrolls (480 px tall by default)." },
          { name: "containerClassName", type: "string", description: "Class on the scroll region." },
          { name: "scrollLabel", type: "string", default: "“{aria-label} horizontal scroll area”", description: "Name of the region while it overflows." },
          { name: "scrollHint", type: "string", default: '"Scroll horizontally"', description: "Hint under a table that is cut off." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab", "←", "→"], text: "When the table overflows, its region joins the tab order so the keyboard can scroll it." },
      { badge: "scope", text: "Use `th scope=\"col\"` headers; add `aria-sort` on the column you sort by." },
      { badge: "tabular", text: "Cells use tabular numerals, so figures line up by place value." }
    ]
  },

  timeline: {
    tags: [AA],
    imports: ["Timeline"],
    code: `import { Timeline } from "@loreanai/chrome-ui";

<Timeline
  items={[
    { id: "live", title: "v4.18.0 live in eu-west-1", meta: "14:02 · Ops agent", tone: "accent" },
    { id: "canary", title: "Canary passed in us-east-2", meta: "13:48 · 12 of 12 checks", tone: "success" },
    { id: "build", title: "Build 2,114 finished", meta: "13:31 · 2m 14s" }
  ]}
/>`,
    sections: [
      {
        id: "tones",
        title: "Tones",
        text: "The accent bead is cobalt; the others are metal tinted by their tone.",
        samples: [
          {
            label: "accent · success · warning · danger",
            node: (
              <div style={{ width: 320 }}>
                <Timeline
                  items={[
                    { id: "a", title: "v4.18.0 live in eu-west-1", meta: "14:02", tone: "accent" },
                    { id: "s", title: "Canary passed in us-east-2", meta: "13:48", tone: "success" },
                    { id: "w", title: "Disk above 80% in eu-west-1", meta: "13:40", tone: "warning" },
                    { id: "d", title: "search-indexer health checks failing", meta: "13:36", tone: "danger" }
                  ]}
                />
              </div>
            )
          }
        ]
      }
    ],
    props: [
      {
        extends: "Renders an `ol`; also takes its attributes.",
        rows: [{ name: "items", type: "readonly TimelineItem[]", description: "`{ id, title, description?, meta?, tone? }`, newest first. `meta` renders in a `time` element." }]
      }
    ],
    a11y: [
      { badge: "ol", text: "An ordered list, so readers hear how many events there are and where they are." },
      { badge: "time", text: "Meta sits in a `time` element; put the exact moment in words when it matters." },
      { badge: "beads", text: "Markers are decorative; say what failed in the title, not only with the red bead." }
    ]
  }
};
