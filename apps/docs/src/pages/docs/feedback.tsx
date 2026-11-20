import { Alert, Badge, EmptyState, Meter, Progress, Skeleton, Spinner, StatusIndicator } from "@loreanai/chrome-ui";
import type { ComponentDoc } from "./types";

const AA = "WCAG 2.2 AA";
const wide = { flexDirection: "column", alignItems: "center" } as const;

export const feedbackDocs: Record<string, ComponentDoc> = {
  alert: {
    tags: [AA],
    imports: ["Alert", "Button"],
    code: `import { Alert, Button } from "@loreanai/chrome-ui";

<Alert
  tone="danger"
  title="search-indexer failing"
  action={<Button finish="graphite" size="sm">View INC-418</Button>}
>
  ap-south-1 health checks have timed out for 14 min.
</Alert>`,
    sections: [
      {
        id: "tones",
        title: "Tones",
        text: "Each tone has its own glyph in the chrome emblem, so color is never the only signal.",
        style: wide,
        samples: [
          { label: 'tone="accent"', node: <div style={{ width: 380, maxWidth: "100%" }}><Alert tone="accent" title="Maintenance window tonight">eu-west-1 deploys pause from 02:00 to 03:00 UTC.</Alert></div> },
          { label: 'tone="success"', node: <div style={{ width: 380, maxWidth: "100%" }}><Alert tone="success" title="Canary passed">12 of 12 checks in us-east-2.</Alert></div> },
          { label: 'tone="warning"', node: <div style={{ width: 380, maxWidth: "100%" }}><Alert tone="warning" title="Disk above 80%">eu-west-1 volumes are at 86%.</Alert></div> },
          { label: 'tone="danger"', node: <div style={{ width: 380, maxWidth: "100%" }}><Alert tone="danger" title="search-indexer failing" role="status">ap-south-1 health checks have timed out for 14&nbsp;min.</Alert></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes.",
        rows: [
          { name: "tone", type: '"accent" | "success" | "warning" | "danger"', default: '"accent"', description: "Intent and glyph." },
          { name: "title", type: "ReactNode", description: "Required. The one-line summary." },
          { name: "children", type: "ReactNode", description: "Description under the title." },
          { name: "icon", type: "ReactNode", default: "per tone", description: "Glyph inside the chrome emblem." },
          { name: "action", type: "ReactNode", description: "Links or buttons under the description." },
          { name: "role", type: "AriaRole", default: '"alert" | "status"', description: "`alert` for danger, `status` for the rest." }
        ]
      }
    ],
    a11y: [
      { badge: "role=alert", text: "A danger alert interrupts the screen reader. Render it when the problem appears, not on page load." },
      { badge: "role=status", text: "Other tones are polite and wait for a pause. Pass `role` to override either." },
      { badge: "glyph", text: "Glyph and title carry the meaning; the tone color only reinforces it." }
    ]
  },

  badge: {
    tags: [AA],
    imports: ["Badge"],
    code: `import { Badge } from "@loreanai/chrome-ui";

<>
  <Badge>v4.18.0</Badge>
  <Badge tone="new">Beta</Badge>
  <Badge tone="bad">SEV-1</Badge>
</>`,
    sections: [
      {
        id: "tones",
        title: "Tones",
        text: "`accent` and `danger` still work as the 0.1 names of `new` and `bad`.",
        samples: [
          { label: "neutral", node: <Badge>v4.18.0</Badge> },
          { label: "new", node: <Badge tone="new">Beta</Badge> },
          { label: "bad", node: <Badge tone="bad">SEV-1</Badge> },
          { label: "success", node: <Badge tone="success">Passing</Badge> },
          { label: "warning", node: <Badge tone="warning">Degraded</Badge> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `span` attributes.",
        rows: [
          { name: "tone", type: '"neutral" | "new" | "bad" | "success" | "warning" | "accent" | "danger"', default: '"neutral"', description: "Neutral metal, cobalt `new`, enamel `bad`, mint and amber text." },
          { name: "children", type: "ReactNode", description: "Short text: a version, a count, a severity." }
        ]
      }
    ],
    a11y: [
      { badge: "text", text: "The text is the meaning; a badge is read inline and never announced on its own." },
      { badge: "counts", text: "Give a bare count its context, such as “3 unread” in the parent’s label." },
      { badge: "4.5:1", text: "Mono text holds 4.5:1 on its plate in both themes." }
    ]
  },

  "empty-state": {
    tags: [AA],
    imports: ["Button", "EmptyState"],
    code: `import { Button, EmptyState } from "@loreanai/chrome-ui";

<EmptyState
  title="No open incidents"
  description="Pages from on-call land here. The last one closed 6 days ago."
  action={<Button finish="graphite" size="sm">View runbooks</Button>}
/>`,
    sections: [
      {
        id: "compact",
        title: "Compact",
        text: "For a panel inside a page; `icon={null}` drops the emblem.",
        samples: [
          { label: "compact", node: <EmptyState compact title="No deploys yet" description="Merges to main deploy here." /> },
          { label: "compact · icon={null}", node: <EmptyState compact icon={null} title="Nothing matches “ap-east”" description="Try another region." /> }
        ]
      }
    ],
    props: [
      {
        extends: "Renders a `section`; also takes its attributes. Extra children go between the description and the action.",
        rows: [
          { name: "title", type: "ReactNode", description: "Required. Rendered as an `h3`." },
          { name: "description", type: "ReactNode", description: "What belongs here." },
          { name: "icon", type: "ReactNode", default: "chrome emblem", description: "Shown unframed above the title; `null` for none." },
          { name: "action", type: "ReactNode", description: "The next thing to do." },
          { name: "compact", type: "boolean", default: "false", description: "Tighter padding for panels." }
        ]
      }
    ],
    a11y: [
      { badge: "h3", text: "The title is an `h3`; place the empty state under the section’s `h2`." },
      { badge: "icon", text: "The emblem is decorative and hidden from assistive tech." },
      { badge: "action", text: "Name the action by its result (“View runbooks”), not “Click here”." }
    ]
  },

  meter: {
    tags: [AA],
    imports: ["Meter"],
    code: `import { Meter } from "@loreanai/chrome-ui";

<>
  <Meter label="CPU quota" value={46} />
  <Meter label="Disk · eu-west-1" value={86} tone="warning" segments={10} />
</>`,
    sections: [
      {
        id: "tones",
        title: "Tones and segments",
        style: wide,
        samples: [
          { label: 'tone="accent"', node: <div style={{ width: 260 }}><Meter label="CPU quota" value={46} /></div> },
          { label: 'tone="warning" · segments={10}', node: <div style={{ width: 260 }}><Meter label="Disk · eu-west-1" value={86} tone="warning" segments={10} /></div> },
          { label: 'tone="danger" · formatValue', node: <div style={{ width: 260 }}><Meter label="Error budget used" value={0.94} max={1} tone="danger" formatValue={(v) => `${Math.round(v * 100)}% of 30 days`} /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes.",
        rows: [
          { name: "value", type: "number", description: "Required. Clamped between `min` and `max`." },
          { name: "min", type: "number", default: "0", description: "Lower limit." },
          { name: "max", type: "number", default: "100", description: "Upper limit." },
          { name: "label", type: "ReactNode", description: "Shown above the track; a string also names the meter." },
          { name: "tone", type: '"neutral" | "accent" | "success" | "warning" | "danger"', default: '"accent"', description: "Fill color." },
          { name: "showValue", type: "boolean", default: "true", description: "The value readout at the right." },
          { name: "formatValue", type: "(value: number) => ReactNode", default: "rounded %", description: "Readout text." },
          { name: "segments", type: "number", description: "Recessed cells instead of a continuous track." }
        ]
      }
    ],
    a11y: [
      { badge: "role=meter", text: "`role=\"meter\"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`." },
      { badge: "label", text: "A string label names it; otherwise pass `aria-label`." },
      { badge: "words", text: "Say the limit in words too (“Warns above 80%”); the amber tone alone is not enough." }
    ]
  },

  progress: {
    tags: [AA, "Reduced motion"],
    imports: ["Progress"],
    code: `import { Progress } from "@loreanai/chrome-ui";

<>
  <Progress value={62} aria-label="Rolling out v4.18.0" />
  <Progress indeterminate aria-label="Preparing canary" />
</>`,
    sections: [
      {
        id: "modes",
        title: "Determinate and indeterminate",
        style: wide,
        samples: [
          { label: "value={62}", node: <div style={{ width: 280 }}><Progress value={62} aria-label="Rolling out v4.18.0" /></div> },
          { label: "indeterminate", node: <div style={{ width: 280 }}><Progress indeterminate aria-label="Preparing canary" /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes. A bar only; there is no ring variant yet.",
        rows: [
          { name: "value", type: "number", default: "0", description: "Done so far, clamped to `max`." },
          { name: "max", type: "number", default: "100", description: "The total." },
          { name: "indeterminate", type: "boolean", default: "false", description: "A cobalt run sweeping the groove; omits `aria-valuenow`." }
        ]
      }
    ],
    a11y: [
      { badge: "progressbar", text: "`role=\"progressbar\"` with the value; name it with `aria-label`." },
      { badge: "indeterminate", text: "No value is announced, so keep a text line such as “About 4 min left” beside it." },
      { badge: "motion", text: "Reduced motion stops the sweep; the bar stays visible." }
    ]
  },

  skeleton: {
    tags: [AA, "Reduced motion"],
    imports: ["Skeleton"],
    code: `import { Skeleton } from "@loreanai/chrome-ui";

<div aria-busy="true" aria-label="Loading service">
  <Skeleton variant="circle" width={32} height={32} />
  <Skeleton variant="text" width="60%" />
  <Skeleton variant="block" height={64} />
</div>`,
    sections: [
      {
        id: "variants",
        title: "Variants",
        samples: [
          { label: 'variant="text"', node: <div style={{ width: 160 }}><Skeleton variant="text" /></div> },
          { label: 'variant="block"', node: <Skeleton width={160} height={56} /> },
          { label: 'variant="circle"', node: <Skeleton variant="circle" width={40} height={40} /> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `div` attributes. Always `aria-hidden`.",
        rows: [
          { name: "variant", type: '"text" | "block" | "circle"', default: '"block"', description: "A line, a box or a disc." },
          { name: "width", type: 'CSSProperties["width"]', description: "Any CSS width." },
          { name: "height", type: 'CSSProperties["height"]', description: "Any CSS height." }
        ]
      }
    ],
    a11y: [
      { badge: "aria-hidden", text: "Placeholders are hidden from assistive tech; mark the region `aria-busy` while it loads." },
      { badge: "status", text: "Announce the finished load with a polite status if it changes what the reader can do." },
      { badge: "motion", text: "The shimmer stops under reduced motion." }
    ]
  },

  spinner: {
    tags: [AA, "Reduced motion"],
    imports: ["Spinner"],
    code: `import { Spinner } from "@loreanai/chrome-ui";

<Spinner finish="cobalt" label="Replaying traffic" />`,
    sections: [
      {
        id: "finishes",
        title: "Finishes",
        text: "`line` is a ring in the current text color; `cobalt` and `silver` are chrome comets in a recessed groove.",
        samples: [
          { label: "line", node: <Spinner label="Loading" /> },
          { label: "cobalt", node: <Spinner finish="cobalt" label="Replaying traffic" /> },
          { label: "silver", node: <Spinner finish="silver" label="Syncing" /> }
        ]
      },
      {
        id: "sizes",
        title: "Sizes",
        text: "Line: 12, 14 and 18 px. Comets: 16, 24 and 32 px.",
        style: { alignItems: "flex-end" },
        samples: (["sm", "md", "lg"] as const).map((size) => ({ label: size, node: <Spinner finish="cobalt" size={size} label={`Loading, ${size}`} /> }))
      }
    ],
    props: [
      {
        extends: "Also takes `span` attributes.",
        rows: [
          { name: "finish", type: '"line" | "cobalt" | "silver"', default: '"line"', description: "Ring, or a chrome comet." },
          { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "See the sizes above." },
          { name: "label", type: "string", default: '"Loading"', description: "Accessible name and visually hidden text." }
        ]
      }
    ],
    a11y: [
      { badge: "role=status", text: "Announced politely with its label; say what is loading (“Replaying traffic”)." },
      { badge: "motion", text: "Under reduced motion the spinner keeps turning, slowly, so the wait still reads." },
      { badge: "buttons", text: "Inside a button use `loading` instead; it keeps the width and sets `aria-busy`." }
    ]
  },

  "status-indicator": {
    tags: [AA],
    imports: ["StatusIndicator"],
    code: `import { StatusIndicator } from "@loreanai/chrome-ui";

const services = [
  { name: "api-gateway", tone: "ok", state: "Live" },
  { name: "search-indexer", tone: "bad", state: "Failed" },
  { name: "billing-worker", tone: "off", state: "Paused" }
] as const;

export function ServiceStates() {
  return (
    <ul>
      {services.map((service) => (
        <li key={service.name}>
          {service.name} <StatusIndicator tone={service.tone} label={service.state} pulse={service.tone === "ok"} />
        </li>
      ))}
    </ul>
  );
}`,
    sections: [
      {
        id: "tones",
        title: "Tones",
        text: "Only failures turn red. `pulse` adds the live halo outside the bezel.",
        samples: [
          { label: "ok · pulse", node: <StatusIndicator tone="ok" pulse label="Live" /> },
          { label: "info", node: <StatusIndicator tone="info" label="Rolling" /> },
          { label: "warn", node: <StatusIndicator tone="warn" label="Queued" /> },
          { label: "bad", node: <StatusIndicator tone="bad" label="Failed" /> },
          { label: "off", node: <StatusIndicator tone="off" label="Paused" /> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `span` attributes.",
        rows: [
          { name: "tone", type: '"ok" | "info" | "warn" | "bad" | "off" | ChromeTone', default: '"neutral"', description: "Lamp color; `success`, `accent`, `warning` and `danger` alias the design names." },
          { name: "label", type: "ReactNode", description: "The word beside the lamp. Without it only the lamp renders, hidden from assistive tech." },
          { name: "pulse", type: "boolean", default: "false", description: "Live: a soft halo outside the bezel." }
        ]
      }
    ],
    a11y: [
      { badge: "role=status", text: "With a label it is a polite status, so a change from Live to Failed is announced." },
      { badge: "aria-hidden", text: "A bare lamp is decorative; put the state in nearby text." },
      { badge: "word", text: "Lamp and word always travel together; color never carries the state alone." }
    ]
  }
};
