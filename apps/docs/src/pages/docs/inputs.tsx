import {
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  Combobox,
  DatePicker,
  IconButton,
  InputOTP,
  KeyHint,
  NumberField,
  SegmentedControl,
  Slider,
  StatusIndicator,
  Switch,
  TextField,
  Textarea,
  ToggleButton
} from "@loreanai/chrome-ui";
import { Icon } from "../../components/Icon";
import { G } from "./glyphs";
import type { ComponentDoc, PropRow } from "./types";

const AA = "WCAG 2.2 AA";
const nov = (day: number) => new Date(2026, 10, day);
// fields with an error line are taller: align their tops so the labels line up
const top = { alignItems: "flex-start" } as const;

// Shared rows for the field family (label, hint and error render the same everywhere).
const fieldRows = (labelType = "ReactNode"): PropRow[] => [
  { name: "label", type: labelType, description: "Visible label, tied to the control." },
  { name: "hint", type: labelType, description: "Quiet line under the control, read as its description." },
  { name: "error", type: labelType, description: "Replaces the hint in enamel and sets `aria-invalid`." }
];

const buttonRows: PropRow[] = [
  { name: "finish", type: '"polished" | "smoked" | "cobalt" | "enamel" | "graphite" | "ghost"', default: '"graphite"', description: "Material and intent. Replaces `variant`." },
  { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Height 30, 36, 44 or 52 px." },
  { name: "loading", type: "boolean", default: "false", description: "Spinner, keeps width, sets `aria-busy`." },
  { name: "leadingIcon", type: "ReactNode", description: "Icon before the label, `aria-hidden`." },
  { name: "trailingIcon", type: "ReactNode", description: "Icon after the label, `aria-hidden`." },
  { name: "asChild", type: "boolean", default: "false", description: "Renders its child, such as a router link." },
  { name: "static", type: "boolean", default: "false", description: "No press travel, for dense toolbars." }
];

export const inputDocs: Record<string, ComponentDoc> = {
  button: {
    tags: ["Radix Slot", AA, "Reduced motion"],
    lead: "A decisive control for actions that move the interface forward. Polished for the one action that matters; graphite for everything else.",
    imports: ["Button"],
    code: "",
    installFile: {
      filename: "deploy-button.tsx",
      code: `import { Button } from "@loreanai/chrome-ui";
import { ArrowRight } from "./icons";

<Button finish="polished" size="xl" trailingIcon={<ArrowRight />}>
  Deploy to production
</Button>`
    },
    sections: [
      {
        id: "finishes",
        title: "Finishes",
        text: "One polished button per panel. Smoked leads on Satin pages, cobalt confirms, enamel destroys, and graphite or ghost carry everything else.",
        samples: [
          { label: "polished", node: <Button finish="polished">Deploy</Button> },
          { label: "smoked", node: <Button finish="smoked">Open console</Button> },
          { label: "cobalt", node: <Button finish="cobalt">Approve</Button> },
          { label: "enamel", node: <Button finish="enamel">Roll back</Button> },
          { label: "graphite", node: <Button finish="graphite">Preview</Button> },
          { label: "ghost", node: <Button finish="ghost">Dismiss</Button> }
        ]
      },
      {
        kind: "usage",
        id: "usage",
        title: "Usage",
        do: {
          node: (
            <>
              <Button finish="graphite">Cancel</Button>
              <Button finish="polished">Deploy</Button>
            </>
          ),
          text: "pair one polished action with a graphite alternative."
        },
        dont: {
          node: (
            <>
              <Button finish="polished">Save</Button>
              <Button finish="polished">Deploy</Button>
            </>
          ),
          text: "put two polished parts in one panel."
        }
      },
      {
        id: "sizes",
        title: "Sizes",
        style: { alignItems: "flex-end" },
        samples: [
          { label: "sm · 30 px", node: <Button size="sm">Deploy</Button> },
          { label: "md · 36 px", node: <Button>Deploy</Button> },
          { label: "lg · 44 px", node: <Button size="lg">Deploy</Button> },
          { label: "xl · 52 px", node: <Button size="xl">Deploy</Button> }
        ]
      },
      {
        id: "states",
        title: "States",
        text: "Hover brightens the inner pill by 7%. Press sinks the part one pixel and pulls the glow in. Loading keeps the width; disabled removes the metal entirely.",
        samples: [
          { label: "rest", node: <Button finish="polished">Deploy</Button> },
          { label: "hover", node: <Button finish="polished" data-hover="">Deploy</Button> },
          { label: "pressed", node: <Button finish="polished" data-active="">Deploy</Button> },
          { label: "focus-visible", node: <Button finish="polished" data-focus-visible="">Deploy</Button> },
          { label: "loading", node: <Button finish="polished" loading>Deploy</Button> },
          { label: "disabled", node: <Button finish="polished" disabled>Deploy</Button> }
        ]
      },
      {
        id: "icons",
        title: "With icons",
        samples: [
          { label: "leadingIcon", node: <Button leadingIcon={<Icon name="plus" />}>New service</Button> },
          { label: "trailingIcon", node: <Button trailingIcon={<Icon name="arrow-right" />}>Continue</Button> },
          { label: "IconButton", node: <IconButton aria-label="Settings"><Icon name="sliders" /></IconButton> },
          { label: "KeyHint", node: <Button>Deploy<KeyHint>⌘↵</KeyHint></Button> }
        ]
      }
    ],
    props: [{ rows: buttonRows }],
    a11y: [
      { keys: ["Enter", "Space"], text: "Activates the button. A loading button stays focusable but ignores presses." },
      { keys: ["Tab"], text: "Focus draws a 2 px cobalt outline at 2 px offset on every finish." },
      { badge: "4.5:1", text: "Labels hold 4.5:1 on every finish. Forced-colors mode swaps metal for system borders." }
    ]
  },

  "button-group": {
    tags: ["New", AA],
    imports: ["Button", "ButtonGroup", "IconButton"],
    code: `import { Button, ButtonGroup, IconButton } from "@loreanai/chrome-ui";
import { ChevronDown, MoreHorizontal, RotateCw } from "./icons";

export function RunActions() {
  return (
    <>
      <ButtonGroup aria-label="Run actions">
        <Button size="sm" leadingIcon={<RotateCw />}>Rerun</Button>
        <Button size="sm">Logs</Button>
        <IconButton size="sm" aria-label="More actions"><MoreHorizontal /></IconButton>
      </ButtonGroup>
      <ButtonGroup variant="split" aria-label="Promote">
        <Button size="sm" finish="polished">Promote to eu-west-1</Button>
        <IconButton size="sm" finish="polished" aria-label="Choose region"><ChevronDown /></IconButton>
      </ButtonGroup>
    </>
  );
}`,
    sections: [
      {
        id: "variants",
        title: "Variants",
        text: "Attached segments share one chrome rim and suit graphite or ghost parts. A split button keeps each part’s finish and joins them at a seam.",
        samples: [
          {
            label: "attached",
            node: (
              <ButtonGroup aria-label="Run actions">
                <Button size="sm" leadingIcon={<G name="rerun" />}>Rerun</Button>
                <Button size="sm">Logs</Button>
                <IconButton size="sm" aria-label="More actions"><G name="more" /></IconButton>
              </ButtonGroup>
            )
          },
          {
            label: "split",
            node: (
              <ButtonGroup variant="split" aria-label="Promote">
                <Button size="sm" finish="polished">Promote to eu-west-1</Button>
                <IconButton size="sm" finish="polished" aria-label="Choose region"><G name="chevron" /></IconButton>
              </ButtonGroup>
            )
          }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `div` attribute. Children are `Button` and `IconButton` parts.",
        rows: [
          { name: "variant", type: '"attached" | "split"', default: '"attached"', description: "Attached: one rim around joined segments. Split: each part keeps its finish and they share one seam." },
          { name: "role", type: "AriaRole", default: '"group"', description: "Groups the actions for assistive tech." },
          { name: "aria-label", type: "string", description: "Names the group, such as “Run actions”." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab"], text: "Every part stays its own tab stop, in reading order. The group adds no roving focus." },
      { badge: "role=group", text: "The wrapper is a `group`; name it with `aria-label` so the joined actions are announced together." },
      { badge: "aria-label", text: "Icon-only segments such as More actions need an `aria-label` of their own." }
    ]
  },

  checkbox: {
    tags: ["Radix Checkbox", AA],
    imports: ["Checkbox"],
    code: `import { useState } from "react";
import { Checkbox } from "@loreanai/chrome-ui";

const regions = ["eu-west-1", "us-east-2", "ap-south-1"];

export function RolloutRegions() {
  const [chosen, setChosen] = useState(["eu-west-1", "us-east-2"]);
  const all = chosen.length === regions.length ? true : chosen.length ? "indeterminate" : false;
  return (
    <fieldset>
      <Checkbox checked={all} onCheckedChange={(next) => setChosen(next === true ? regions : [])}>
        Rollout regions
      </Checkbox>
      {regions.map((region) => (
        <Checkbox
          key={region}
          checked={chosen.includes(region)}
          onCheckedChange={(next) => setChosen(next ? [...chosen, region] : chosen.filter((r) => r !== region))}
        >
          {region}
        </Checkbox>
      ))}
    </fieldset>
  );
}`,
    sections: [
      {
        id: "states",
        title: "States",
        samples: [
          { label: "unchecked", node: <Checkbox aria-label="Unchecked" /> },
          { label: "checked", node: <Checkbox aria-label="Checked" defaultChecked /> },
          { label: "indeterminate", node: <Checkbox aria-label="Indeterminate" checked="indeterminate" /> },
          { label: "hover", node: <Checkbox aria-label="Hover" data-hover="" /> },
          { label: "disabled", node: <Checkbox aria-label="Disabled" disabled defaultChecked /> }
        ]
      }
    ],
    props: [
      {
        part: "Checkbox",
        extends: "Extends Radix `Checkbox.Root`; every Radix prop passes through. The whole row renders as a `label`.",
        rows: [
          { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state. `\"indeterminate\"` draws the mixed dash." },
          { name: "defaultChecked", type: 'boolean | "indeterminate"', description: "Starting state when uncontrolled." },
          { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Called on every toggle." },
          { name: "disabled", type: "boolean", default: "false", description: "Dims the box and skips it in the tab order." },
          { name: "required", type: "boolean", default: "false", description: "Marks the box as required for form validation." },
          { name: "name", type: "string", description: "Submits with forms through a hidden input." },
          { name: "value", type: "string", default: '"on"', description: "Value sent when checked." },
          { name: "children", type: "ReactNode", description: "Label beside the box; clicking it toggles." }
        ]
      }
    ],
    a11y: [
      { keys: ["Space"], text: "Toggles the focused box. Enter does not, as with a native checkbox." },
      { badge: "aria-checked", text: "Mixed state is announced as `aria-checked=\"mixed\"`; derive it from the children, as in the example." },
      { badge: "label", text: "The label wraps the box, so the whole row is the hit area and names the control." }
    ]
  },

  "color-picker": {
    tags: ["New", AA],
    imports: ["ColorPicker"],
    code: `import { useState } from "react";
import { ColorPicker } from "@loreanai/chrome-ui";

export function AccentColor() {
  const [accent, setAccent] = useState("#1447E6");
  return <ColorPicker aria-label="Workspace accent" value={accent} onValueChange={setAccent} />;
}`,
    sections: [
      {
        id: "alpha",
        title: "With alpha",
        text: "`alpha` adds an opacity slider and switches the output to 8-digit hex.",
        samples: [{ label: "alpha", node: <ColorPicker alpha defaultValue="#0F8A5FB3" aria-label="Lamp color" /> }]
      }
    ],
    props: [
      {
        extends: "Also takes every `div` attribute.",
        rows: [
          { name: "value", type: "string", description: "Hex color, `#RRGGBB` or `#RRGGBBAA`." },
          { name: "defaultValue", type: "string", default: '"#1447E6"', description: "Starting color when uncontrolled." },
          { name: "onValueChange", type: "(hex: string) => void", description: "Called with the new hex on every move." },
          { name: "swatches", type: "readonly (string | ColorSwatch)[]", default: "7 tokens", description: "Token swatches under the pad; `{ value, label }` names one for assistive tech." },
          { name: "alpha", type: "boolean", default: "false", description: "Adds an opacity slider and 8-digit hex output." },
          { name: "disabled", type: "boolean", description: "Locks the pad, slider, swatches and hex field." },
          { name: "aria-label", type: "string", default: '"Color"', description: "Names the picker." }
        ]
      }
    ],
    a11y: [
      { keys: ["←", "→", "↑", "↓"], text: "Move the pad and hue knobs one step; hold Shift for ten. PageUp, PageDown, Home and End jump." },
      { keys: ["Enter", "Esc"], text: "Commit a typed hex, or put the last valid color back." },
      { badge: "role=slider", text: "The pad (“Saturation and brightness”) and the hue knob are sliders with spoken values." }
    ]
  },

  combobox: {
    tags: ["New", AA],
    imports: ["Avatar", "Combobox"],
    code: `import { useState } from "react";
import { Avatar, Combobox } from "@loreanai/chrome-ui";

const people = ["Rafael Achebe", "Priya Raman", "Mara Lindqvist", "Kwame Mensah", "Hana Sato"];
const options = people.map((name) => ({
  value: name.toLowerCase().replace(" ", "-"),
  label: name,
  icon: <Avatar name={name} size="sm" />
}));

export function AssigneeField() {
  const [assignee, setAssignee] = useState<string | null>(null);
  return (
    <Combobox
      label="Assignee"
      placeholder="Search people"
      options={options}
      value={assignee}
      onValueChange={setAssignee}
    />
  );
}`,
    sections: [
      {
        id: "states",
        title: "Field states",
        style: top,
        samples: [
          { label: "selected", node: <div style={{ width: 220 }}><Combobox aria-label="Owner" options={[{ value: "hana-sato", label: "Hana Sato" }]} defaultValue="hana-sato" /></div> },
          { label: "error", node: <div style={{ width: 220 }}><Combobox aria-label="Reviewer" options={[]} error="Pick someone on call" placeholder="Search people" /></div> },
          { label: "disabled", node: <div style={{ width: 220 }}><Combobox aria-label="Approver" options={[]} placeholder="Search people" disabled /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `input` attributes (`placeholder`, `name`, `disabled` …); `name` submits the chosen value.",
        rows: [
          { name: "options", type: "readonly ComboboxOption[]", description: "`{ value, label, icon?, description?, keywords?, disabled? }` in list order." },
          { name: "value", type: "string | null", description: "Controlled value of the chosen option." },
          { name: "defaultValue", type: "string | null", default: "null", description: "Starting value when uncontrolled." },
          { name: "onValueChange", type: "(value: string | null) => void", description: "Called on choose, and with `null` when the field is cleared." },
          ...fieldRows(),
          { name: "icon", type: "ReactNode", description: "Leading glyph inside the field." },
          { name: "emptyMessage", type: "ReactNode", default: '"No matches"', description: "Shown when nothing matches the query." },
          { name: "filter", type: "(option: ComboboxOption, query: string) => boolean", default: "label or keywords", description: "Case-insensitive “contains” on the label and keywords by default." },
          { name: "open", type: "boolean", description: "Controlled list visibility." },
          { name: "defaultOpen", type: "boolean", default: "false", description: "Starts with the list open." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the list opens or closes." },
          { name: "defaultInputValue", type: "string", description: "Starting text when uncontrolled, such as a query in progress." }
        ]
      }
    ],
    a11y: [
      { keys: ["↓", "↑"], text: "Move through matches; Alt+↓ opens the list without moving." },
      { keys: ["Enter", "Esc"], text: "Enter chooses the highlighted match. Escape closes the list, then clears the text." },
      { badge: "role=combobox", text: "The input owns a `listbox` and points at the active option with `aria-activedescendant`, so focus never leaves the field." }
    ]
  },

  "date-picker": {
    tags: ["Radix Popover", "New", AA],
    imports: ["DatePicker"],
    code: `import { useState } from "react";
import { DatePicker, type DateRange } from "@loreanai/chrome-ui";

export function RolloutWindow() {
  const [range, setRange] = useState<DateRange | null>({
    from: new Date(2026, 10, 16),
    to: new Date(2026, 10, 20)
  });
  return <DatePicker label="Rollout window" mode="range" value={range} onValueChange={setRange} name="window" />;
}`,
    sections: [
      {
        id: "modes",
        title: "Single and range",
        style: top,
        text: "A single date closes the popover on pick; a range closes once both ends are set. `min`, `max` and `isDateDisabled` grey out days.",
        samples: [
          { label: 'mode="single"', node: <div style={{ width: 220 }}><DatePicker label="Deploy date" defaultValue={nov(17)} min={nov(2)} /></div> },
          { label: 'mode="range"', node: <div style={{ width: 220 }}><DatePicker label="Freeze window" mode="range" defaultValue={{ from: nov(23), to: nov(27) }} /></div> },
          { label: "error", node: <div style={{ width: 220 }}><DatePicker label="Review by" error="Pick a weekday" /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "The popover is a Radix `Popover`; the grid takes every Calendar prop (`min`, `max`, `isDateDisabled`, `isDateMarked`, `weekStartsOn`, `locale` …). The ref goes to the trigger button.",
        rows: [
          { name: "mode", type: '"single" | "range"', default: '"single"', description: "One date, or a `{ from, to }` range." },
          { name: "value", type: "Date | DateRange | null", description: "Controlled selection; the type follows `mode`." },
          { name: "defaultValue", type: "Date | DateRange | null", default: "null", description: "Starting selection when uncontrolled." },
          { name: "onValueChange", type: "(value) => void", description: "Called with a `Date`, or a `DateRange` whose `to` is unset until the second pick." },
          ...fieldRows(),
          { name: "placeholder", type: "string", default: '"Pick a date"', description: "Trigger text with nothing chosen; “Pick dates” in range mode." },
          { name: "disabled", type: "boolean", description: "Locks the trigger." },
          { name: "open", type: "boolean", description: "Controlled popover state." },
          { name: "defaultOpen", type: "boolean", default: "false", description: "Starts open (catalog previews)." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the popover opens or closes." },
          { name: "name", type: "string", description: "Submits ISO dates through a hidden input; a range as `start/end`." },
          { name: "formatOptions", type: "Intl.DateTimeFormatOptions", default: "{ month: \"short\", day: \"numeric\", year: \"numeric\" }", description: "How the trigger prints the date." },
          { name: "size", type: '"sm" | "md"', default: '"sm"', description: "Calendar size inside the popover." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Open the popover from the trigger; focus lands on the selected day, or today." },
      { keys: ["←", "→", "↑", "↓"], text: "Move by day and week. PageUp and PageDown change month; with Shift, year." },
      { keys: ["Esc"], text: "Closes the popover and returns focus to the trigger." }
    ]
  },

  "file-dropzone": {
    tags: [AA],
    imports: ["FileDropzone"],
    code: `import { FileDropzone } from "@loreanai/chrome-ui";

const LIMIT = 20 * 1024 * 1024;

export function RunbookUpload({ onUpload }: { onUpload: (files: File[]) => void }) {
  return (
    <FileDropzone
      label="Drop runbooks or browse"
      description="Markdown or PDF, up to 20 MB"
      accept=".md,.pdf"
      multiple
      onFiles={(files) => onUpload(files.filter((file) => file.size <= LIMIT))}
    />
  );
}`,
    props: [
      {
        extends: "Also takes `label` element attributes. The ref goes to the hidden file `input`. There is no size limit prop: filter in `onFiles`.",
        rows: [
          { name: "label", type: "ReactNode", default: '"Drop files to upload"', description: "Bold first line." },
          { name: "description", type: "ReactNode", default: '"or choose files from your device"', description: "Second line, read as the zone’s description." },
          { name: "browseLabel", type: "string", default: '"Browse files"', description: "Text of the browse pill." },
          { name: "accept", type: "string", description: "File types, as on a file input (`.md,.pdf`, `image/*`)." },
          { name: "multiple", type: "boolean", description: "Allows several files at once." },
          { name: "disabled", type: "boolean", description: "Ignores drops and clicks and leaves the tab order." },
          { name: "name", type: "string", description: "Form name of the file input." },
          { name: "inputId", type: "string", description: "id of the file input; generated when omitted." },
          { name: "onFiles", type: "(files: File[]) => void", description: "Called with dropped or chosen files." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Open the file browser from the focused zone." },
      { badge: "role=button", text: "The zone is one button; its description lists the accepted types and size." },
      { badge: "drag", text: "Dragging is never the only way in: the browse path does the same job." }
    ]
  },

  "icon-button": {
    tags: ["Radix Slot", AA],
    imports: ["IconButton"],
    code: `import { IconButton } from "@loreanai/chrome-ui";
import { Settings } from "./icons";

<IconButton finish="ghost" aria-label="Service settings">
  <Settings />
</IconButton>`,
    sections: [
      {
        id: "finishes",
        title: "Finishes",
        samples: [
          { label: "graphite", node: <IconButton aria-label="Settings"><Icon name="sliders" /></IconButton> },
          { label: "ghost", node: <IconButton finish="ghost" aria-label="Search"><Icon name="search" /></IconButton> },
          { label: "smoked", node: <IconButton finish="smoked" aria-label="Notifications"><Icon name="bell" /></IconButton> },
          { label: "polished", node: <IconButton finish="polished" aria-label="Add service"><Icon name="plus" /></IconButton> }
        ]
      },
      {
        id: "sizes",
        title: "Sizes",
        text: "Square at every size: 30, 36, 44 and 52 px.",
        style: { alignItems: "flex-end" },
        samples: (["sm", "md", "lg", "xl"] as const).map((size) => ({
          label: size,
          node: <IconButton size={size} aria-label={`Settings, ${size}`}><Icon name="sliders" /></IconButton>
        }))
      }
    ],
    props: [
      {
        extends: "Takes every Button prop. `aria-label` is required because there is no visible text.",
        rows: [
          { name: "aria-label", type: "string", description: "Required. Names the action, such as “Service settings”." },
          buttonRows[0]!,
          { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Square 30, 36, 44 or 52 px." },
          buttonRows[2]!,
          buttonRows[5]!,
          buttonRows[6]!
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Activates the button, as any Button." },
      { badge: "aria-label", text: "The label is the only name; pair it with a Tooltip that says the same thing for sighted users." },
      { badge: "24 px", text: "The smallest size is 30 px, above the 24 px minimum target." }
    ]
  },

  "input-otp": {
    tags: ["New", AA],
    imports: ["InputOTP"],
    code: `import { InputOTP } from "@loreanai/chrome-ui";

export function VerifyCode({ onVerify }: { onVerify: (code: string) => void }) {
  return <InputOTP label="Verification code" hint="Expires in 4:52" autoFocus onComplete={onVerify} name="code" />;
}`,
    sections: [
      {
        id: "states",
        title: "Lengths and states",
        style: top,
        samples: [
          { label: "length={6}", node: <InputOTP aria-label="Verification code" defaultValue="418" /> },
          { label: "length={4} · error", node: <InputOTP aria-label="Recovery code" length={4} defaultValue="72" error="That code has expired" /> },
          { label: "disabled", node: <InputOTP aria-label="Locked code" length={4} defaultValue="1234" disabled /> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `div` attribute.",
        rows: [
          { name: "length", type: "number", default: "6", description: "Number of cells." },
          { name: "value", type: "string", description: "Controlled code." },
          { name: "defaultValue", type: "string", default: '""', description: "Starting code when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called on every typed, pasted or deleted character." },
          { name: "onComplete", type: "(value: string) => void", description: "Called once every cell is filled." },
          ...fieldRows(),
          { name: "groupSize", type: "number", default: "length / 2", description: "A dash after every n cells when the length is even; 0 for none." },
          { name: "pattern", type: '"numeric" | "alphanumeric"', default: '"numeric"', description: "Characters a cell accepts; alphanumeric is upper-cased." },
          { name: "disabled", type: "boolean", description: "Locks every cell." },
          { name: "autoFocus", type: "boolean", description: "Focuses the first empty cell on mount." },
          { name: "name", type: "string", description: "Submits the code through a hidden input." },
          { name: "cellLabel", type: "(index: number, length: number) => string", default: "“Digit 1 of 6”", description: "Accessible name of each cell." }
        ]
      }
    ],
    a11y: [
      { keys: ["←", "→", "Backspace"], text: "Move between cells; Backspace clears and steps back. Home and End jump to the ends." },
      { badge: "paste", text: "Pasting a whole code fills every cell from the first; typing advances on its own." },
      { badge: "one-time-code", text: "The first cell takes `autocomplete=\"one-time-code\"`, so phones offer the code from a text message." }
    ]
  },

  "number-field": {
    tags: ["New", AA],
    imports: ["NumberField"],
    code: `import { NumberField } from "@loreanai/chrome-ui";

<NumberField label="Replicas per region" defaultValue={6} min={2} max={12} hint="Between 2 and 12" />`,
    sections: [
      {
        id: "units",
        title: "Units and steps",
        style: top,
        samples: [
          { label: 'unit="ms" · step={50}', node: <div style={{ width: 200 }}><NumberField label="p95 threshold" defaultValue={300} min={100} max={1000} step={50} unit="ms" /></div> },
          { label: "error", node: <div style={{ width: 200 }}><NumberField label="Error budget" defaultValue={14} unit="%" error="Keep it under 10%" /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes `input` attributes except `type`, `size`, `min`, `max` and `step`, which are typed here.",
        rows: [
          { name: "value", type: "number | null", description: "Controlled value; `null` is empty." },
          { name: "defaultValue", type: "number | null", default: "null", description: "Starting value when uncontrolled." },
          { name: "onValueChange", type: "(value: number | null) => void", description: "Called on commit: a step, Enter or blur." },
          ...fieldRows(),
          { name: "min", type: "number", description: "Lower bound; disables the minus stepper at the floor." },
          { name: "max", type: "number", description: "Upper bound; disables the plus stepper at the ceiling." },
          { name: "step", type: "number", default: "1", description: "Arrow-key and stepper increment." },
          { name: "largeStep", type: "number", default: "10 × step", description: "PageUp and PageDown increment." },
          { name: "unit", type: "ReactNode", description: "Unit after the number, such as `ms` or `%`; read in the value text." },
          { name: "formatOptions", type: "Intl.NumberFormatOptions", description: "How the committed number prints." },
          { name: "locale", type: "string", description: "Locale for formatting and parsing." },
          { name: "decrementLabel", type: "string", default: '"Decrease"', description: "Name of the minus stepper." },
          { name: "incrementLabel", type: "string", default: '"Increase"', description: "Name of the plus stepper." }
        ]
      }
    ],
    a11y: [
      { keys: ["↑", "↓"], text: "Nudge by one step; PageUp and PageDown by the large step." },
      { keys: ["Home", "End"], text: "Jump to `min` or `max` when they are set." },
      { badge: "role=spinbutton", text: "The input is a spinbutton with `aria-valuenow`, bounds and a value text that includes the unit." }
    ]
  },

  "radio-group": {
    tags: ["Radix Radio Group", AA],
    imports: ["RadioGroup"],
    code: `import { RadioGroup } from "@loreanai/chrome-ui";

<RadioGroup.Root defaultValue="canary" aria-label="Rollout strategy" name="strategy">
  <RadioGroup.Item value="canary">Canary</RadioGroup.Item>
  <RadioGroup.Item value="rolling">Rolling</RadioGroup.Item>
  <RadioGroup.Item value="blue-green">Blue-green</RadioGroup.Item>
</RadioGroup.Root>`,
    props: [
      {
        part: "RadioGroup.Root",
        extends: "Extends Radix `RadioGroup.Root`.",
        rows: [
          { name: "value", type: "string", description: "Controlled choice." },
          { name: "defaultValue", type: "string", description: "Starting choice when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called when the choice changes." },
          { name: "name", type: "string", description: "Submits the choice with forms." },
          { name: "disabled", type: "boolean", default: "false", description: "Disables every item." },
          { name: "required", type: "boolean", default: "false", description: "Requires a choice for form validation." },
          { name: "orientation", type: '"horizontal" | "vertical"', description: "Limits arrow keys to one axis; both work when unset." },
          { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap from the last item to the first." }
        ]
      },
      {
        part: "RadioGroup.Item",
        extends: "Extends Radix `RadioGroup.Item`; renders inside a `label`.",
        rows: [
          { name: "value", type: "string", description: "Required. The value this item selects." },
          { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
          { name: "children", type: "ReactNode", description: "Label text beside the dot." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab"], text: "The group is one tab stop; focus lands on the chosen item." },
      { keys: ["↑", "↓", "←", "→"], text: "Move to the next or previous item and choose it." },
      { badge: "radiogroup", text: "Name the group with `aria-label` or `aria-labelledby` pointing at its visible title." }
    ]
  },

  "search-field": {
    tags: [AA],
    imports: ["KeyHint", "SearchField"],
    code: `import { useState } from "react";
import { KeyHint, SearchField } from "@loreanai/chrome-ui";

export function ServiceSearch() {
  const [query, setQuery] = useState("");
  return (
    <SearchField
      placeholder="Search services and runs"
      value={query}
      onValueChange={setQuery}
      shortcut={<KeyHint>/</KeyHint>}
    />
  );
}`,
    props: [
      {
        extends: "Also takes `input` attributes except `type`, `size` and `onChange`.",
        rows: [
          { name: "label", type: "string", description: "Visible label above the field." },
          { name: "value", type: "string", description: "Controlled query." },
          { name: "defaultValue", type: "string", default: '""', description: "Starting query when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called on every keystroke and on clear." },
          { name: "onClear", type: "() => void", description: "Called after the clear button empties the field." },
          { name: "clearLabel", type: "string", default: '"Clear search"', description: "Name of the clear button." },
          { name: "shortcut", type: "ReactNode", description: "Keycap shown while empty, such as `/`. Display only: bind the key yourself." },
          { name: "aria-label", type: "string", default: '"Search"', description: "Used when there is no visible label." }
        ]
      }
    ],
    a11y: [
      { keys: ["Esc"], text: "Native search clearing: empties the field." },
      { keys: ["/"], text: "The keycap is a hint; focusing the field on `/` is the page’s own key handler." },
      { badge: "type=search", text: "The input is `type=\"search\"`; the clear button returns focus to it." }
    ]
  },

  "segmented-control": {
    tags: [AA],
    imports: ["SegmentedControl"],
    code: `import { useState } from "react";
import { SegmentedControl } from "@loreanai/chrome-ui";

const ranges = [
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" }
];

export function RangePicker() {
  const [range, setRange] = useState("24h");
  return <SegmentedControl aria-label="Time range" items={ranges} value={range} onValueChange={setRange} />;
}`,
    sections: [
      {
        id: "sizes",
        title: "Sizes and icons",
        samples: [
          { label: 'size="md"', node: <SegmentedControl aria-label="Time range" defaultValue="24h" items={["1h", "24h", "7d", "30d"].map((value) => ({ value, label: value }))} /> },
          { label: 'size="sm"', node: <SegmentedControl size="sm" aria-label="Time range, small" defaultValue="24h" items={["1h", "24h", "7d", "30d"].map((value) => ({ value, label: value }))} /> },
          {
            label: "icons",
            node: (
              <SegmentedControl
                aria-label="Layout"
                defaultValue="list"
                items={[
                  { value: "list", label: <span className="chrome-visually-hidden">List view</span>, icon: <G name="list" /> },
                  { value: "grid", label: <span className="chrome-visually-hidden">Grid view</span>, icon: <G name="grid" /> }
                ]}
              />
            )
          }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `div` attribute.",
        rows: [
          { name: "items", type: "readonly SegmentedControlItem[]", description: "`{ value, label, icon?, disabled? }` per segment." },
          { name: "value", type: "string", description: "Controlled choice." },
          { name: "defaultValue", type: "string", default: "first enabled", description: "Starting choice when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called when a segment is pressed." },
          { name: "disabled", type: "boolean", description: "Disables every segment." },
          { name: "size", type: '"sm" | "md"', default: '"md"', description: "Segment height 24 or 28 px." },
          { name: "aria-label", type: "string", default: '"View"', description: "Names the group." }
        ]
      }
    ],
    a11y: [
      { keys: ["Tab"], text: "Each segment is a button in the tab order; Enter or Space chooses it." },
      { badge: "aria-pressed", text: "The chosen segment is `aria-pressed=\"true\"` inside a named `group`." },
      { badge: "icons", text: "Icon-only segments need a label; a visually hidden span keeps it out of sight." }
    ]
  },

  select: {
    tags: ["Radix Select", AA],
    imports: ["Select"],
    code: `import { Select } from "@loreanai/chrome-ui";

<Select.Root defaultValue="eu-west-1" name="region">
  <Select.Trigger aria-label="Region">
    <Select.Value placeholder="Choose a region" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="eu-west-1">eu-west-1</Select.Item>
    <Select.Item value="us-east-2">us-east-2</Select.Item>
    <Select.Item value="ap-south-1">ap-south-1 · degraded</Select.Item>
  </Select.Content>
</Select.Root>`,
    props: [
      {
        part: "Select.Root",
        extends: "Radix `Select.Root`, unchanged.",
        rows: [
          { name: "value", type: "string", description: "Controlled value." },
          { name: "defaultValue", type: "string", description: "Starting value when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called when an item is chosen." },
          { name: "open", type: "boolean", description: "Controlled list state." },
          { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the list opens or closes." },
          { name: "name", type: "string", description: "Submits the value with forms." },
          { name: "disabled", type: "boolean", description: "Locks the trigger." },
          { name: "required", type: "boolean", description: "Requires a value for form validation." }
        ]
      },
      {
        part: "Select.Trigger · Select.Value",
        extends: "Radix `Select.Trigger` with the chevron built in; `Select.Value` takes `placeholder`.",
        rows: []
      },
      {
        part: "Select.Content",
        extends: "Radix `Select.Content` in a portal; `Select.Item`, `Select.Group`, `Select.Label` and `Select.Separator` go inside.",
        rows: [
          { name: "position", type: '"popper" | "item-aligned"', default: '"popper"', description: "Popper opens below the trigger (Radix itself defaults to item-aligned)." },
          { name: "sideOffset", type: "number", default: "6", description: "Gap to the trigger in px." }
        ]
      },
      {
        part: "Select.Item",
        extends: "Radix `Select.Item`; the check is built in.",
        rows: [
          { name: "value", type: "string", description: "Required. The value this item selects." },
          { name: "disabled", type: "boolean", description: "Skips the item." },
          { name: "textValue", type: "string", description: "Typeahead text when the children are not plain text." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space", "↓"], text: "Open the list from the trigger with the chosen item focused." },
      { keys: ["↑", "↓"], text: "Move through items; typing jumps to the first match." },
      { keys: ["Esc"], text: "Closes the list and returns focus to the trigger." }
    ]
  },

  slider: {
    tags: ["Radix Slider", AA],
    imports: ["Slider"],
    code: `import { useState } from "react";
import { Slider } from "@loreanai/chrome-ui";

export function TrafficShift() {
  const [shift, setShift] = useState([64]);
  return (
    <div>
      <span>Traffic shift</span> <output>{shift[0]}%</output>
      <Slider aria-label="Traffic shift" value={shift} onValueChange={setShift} />
    </div>
  );
}`,
    sections: [
      {
        id: "range",
        title: "Range",
        text: "Two values make two thumbs; `thumbLabels` names each one.",
        samples: [
          { label: "defaultValue={[20, 80]}", node: <div style={{ width: 260 }}><Slider aria-label="Canary window" defaultValue={[20, 80]} thumbLabels={["Start", "End"]} /></div> },
          { label: "disabled", node: <div style={{ width: 200 }}><Slider aria-label="Locked shift" defaultValue={[40]} disabled /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Extends Radix `Slider.Root`.",
        rows: [
          { name: "value", type: "number[]", description: "Controlled values, one per thumb." },
          { name: "defaultValue", type: "number[]", description: "Starting values when uncontrolled." },
          { name: "onValueChange", type: "(value: number[]) => void", description: "Called while dragging or on keys." },
          { name: "onValueCommit", type: "(value: number[]) => void", description: "Called once at the end of a drag." },
          { name: "min", type: "number", default: "0", description: "Lowest value." },
          { name: "max", type: "number", default: "100", description: "Highest value." },
          { name: "step", type: "number", default: "1", description: "Increment." },
          { name: "minStepsBetweenThumbs", type: "number", default: "0", description: "Keeps range thumbs apart." },
          { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Track direction." },
          { name: "disabled", type: "boolean", default: "false", description: "Locks the thumbs." },
          { name: "thumbLabels", type: "string[]", description: "Accessible name per thumb; defaults to `aria-label`, numbered when there are several." }
        ]
      }
    ],
    a11y: [
      { keys: ["←", "→", "↑", "↓"], text: "Move the focused thumb by one step." },
      { keys: ["PageUp", "PageDown"], text: "Move by ten steps; Home and End jump to the ends." },
      { badge: "role=slider", text: "Each thumb is a slider with its own name and `aria-valuenow`." }
    ]
  },

  switch: {
    tags: ["Radix Switch", AA],
    imports: ["Switch"],
    code: `import { Switch } from "@loreanai/chrome-ui";

export function PagingSettings() {
  return (
    <>
      <label htmlFor="auto-rollback">Auto-rollback</label>
      <Switch id="auto-rollback" defaultChecked />
      <label htmlFor="quiet-hours">Quiet hours</label>
      <Switch id="quiet-hours" onCheckedChange={(on) => console.log("quiet hours", on)} />
    </>
  );
}`,
    sections: [
      {
        id: "states",
        title: "States",
        text: "On, the knob slides into a cobalt groove. Hover lifts the rim; disabled keeps the position and drops the contrast.",
        samples: [
          { label: "off", node: <Switch aria-label="Off" /> },
          { label: "on", node: <Switch aria-label="On" defaultChecked /> },
          { label: "hover", node: <Switch aria-label="Hover" data-hover="" /> },
          { label: "focus-visible", node: <Switch aria-label="Focus" data-focus-visible="" defaultChecked /> },
          { label: "disabled", node: <Switch aria-label="Disabled" disabled defaultChecked /> }
        ]
      }
    ],
    props: [
      {
        extends: "Extends Radix `Switch.Root`; the thumb is built in. Name it with a `label` or `aria-label`.",
        rows: [
          { name: "checked", type: "boolean", description: "Controlled state." },
          { name: "defaultChecked", type: "boolean", description: "Starting state when uncontrolled." },
          { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called on every flip." },
          { name: "disabled", type: "boolean", default: "false", description: "Locks the switch." },
          { name: "required", type: "boolean", default: "false", description: "Requires it on for form validation." },
          { name: "name", type: "string", description: "Submits with forms." },
          { name: "value", type: "string", default: '"on"', description: "Value sent when on." }
        ]
      }
    ],
    a11y: [
      { keys: ["Space", "Enter"], text: "Flips the focused switch." },
      { badge: "role=switch", text: "Announced as a switch with `aria-checked`; the change takes effect at once, so no save button." },
      { badge: "label", text: "Give it a visible label with `htmlFor`, as in the example; clicking the label flips it too." }
    ]
  },

  "tag-input": {
    tags: ["New", AA],
    imports: ["TagInput"],
    code: `import { useState } from "react";
import { TagInput } from "@loreanai/chrome-ui";

const regions = ["eu-west-1", "us-east-2", "ap-south-1", "ap-northeast-1"];

export function RegionTags() {
  const [tags, setTags] = useState(["eu-west-1", "us-east-2"]);
  return (
    <TagInput
      label="Regions"
      hint="Press Enter to add a region"
      value={tags}
      onValueChange={setTags}
      validate={(tag) => regions.includes(tag)}
    />
  );
}`,
    props: [
      {
        extends: "Also takes `input` attributes for the text field (`placeholder`, `disabled` …).",
        rows: [
          { name: "value", type: "string[]", description: "Controlled tags." },
          { name: "defaultValue", type: "string[]", default: "[]", description: "Starting tags when uncontrolled." },
          { name: "onValueChange", type: "(tags: string[]) => void", description: "Called when a tag is added or removed." },
          ...fieldRows(),
          { name: "validate", type: "(tag: string, tags: readonly string[]) => boolean", description: "Return false to refuse a tag. Blanks and duplicates are always refused." },
          { name: "maxTags", type: "number", description: "Stops adding at this many." },
          { name: "removeLabel", type: "(tag: string) => string", default: "“Remove {tag}”", description: "Name of each remove button." },
          { name: "mono", type: "boolean", default: "true", description: "Monospaced tokens for identifiers such as regions." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter"], text: "Adds the typed text as a tag." },
      { keys: ["Backspace"], text: "In an empty field, removes the last tag." },
      { badge: "remove", text: "Every tag has its own labelled remove button in the tab order." }
    ]
  },

  "text-field": {
    tags: [AA],
    imports: ["TextField"],
    code: `import { TextField } from "@loreanai/chrome-ui";

<TextField
  label="Repository"
  leading="orbital-ops/"
  defaultValue="cache-warm"
  hint="Lowercase, numbers and dashes"
  pattern="[a-z0-9-]+"
/>`,
    sections: [
      {
        id: "states",
        title: "Affixes and states",
        style: top,
        text: "A string affix renders as a recessed text segment; an element sits inline as an icon.",
        samples: [
          { label: "leading text", node: <div style={{ width: 230 }}><TextField aria-label="Repository" leading="orbital-ops/" defaultValue="cache-warm" /></div> },
          { label: "trailing unit", node: <div style={{ width: 150 }}><TextField aria-label="Timeout" trailing="ms" defaultValue="380" inputMode="numeric" /></div> },
          { label: "error", node: <div style={{ width: 230 }}><TextField aria-label="Service name" defaultValue="Cache Warm" error="Use lowercase and dashes" /></div> },
          { label: "disabled", node: <div style={{ width: 200 }}><TextField aria-label="Region" defaultValue="eu-west-1" disabled /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `input` attribute except `size`; the ref goes to the input.",
        rows: [
          { name: "label", type: "string", description: "Visible label, tied to the input." },
          { name: "hint", type: "string", description: "Quiet line under the field, read as its description." },
          { name: "error", type: "string", description: "Replaces the hint in enamel and sets `aria-invalid`." },
          { name: "leading", type: "ReactNode", description: "Before the text. A string is a recessed segment (`orbital-ops/`); an element, an inline icon." },
          { name: "trailing", type: "ReactNode", description: "After the text, such as a unit (`ms`) or a status icon." }
        ]
      }
    ],
    a11y: [
      { badge: "label", text: "The label is a real `label`; hint and error are tied with `aria-describedby`." },
      { badge: "aria-invalid", text: "An error sets `aria-invalid` and is announced with the field." },
      { badge: "affix", text: "Affixes are visual; put the full meaning in the label (“Timeout in ms”) when it matters." }
    ]
  },

  textarea: {
    tags: ["New", AA],
    imports: ["Textarea"],
    code: `import { Textarea } from "@loreanai/chrome-ui";

<Textarea
  label="Rollback note"
  hint="Shown in the deploy log"
  maxLength={280}
  defaultValue="Reverting v4.18.0: p95 hit 380 ms in ap-south-1 after the cache change."
/>`,
    sections: [
      {
        id: "sizes",
        title: "Sizes",
        text: "`lg` is the roomy composer of the Agent console: 14 px text on 22 px lines.",
        samples: [
          { label: 'size="md"', node: <div style={{ width: 280 }}><Textarea aria-label="Note" rows={2} defaultValue="Reverting v4.18.0 in ap-south-1." /></div> },
          { label: 'size="lg" · resize="none"', node: <div style={{ width: 320 }}><Textarea aria-label="Message to ops-agent" size="lg" rows={2} resize="none" placeholder="Ask a follow-up, or type / for commands" /></div> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `textarea` attribute.",
        rows: [
          { name: "value", type: "string", description: "Controlled text." },
          { name: "defaultValue", type: "string", default: '""', description: "Starting text when uncontrolled." },
          { name: "onValueChange", type: "(value: string) => void", description: "Called on every change." },
          ...fieldRows(),
          { name: "maxLength", type: "number", description: "Hard limit; turns the counter on." },
          { name: "showCount", type: "boolean", description: "Live “71 / 280” counter; on by default when `maxLength` is set." },
          { name: "resize", type: '"vertical" | "none"', default: '"vertical"', description: "Vertical shows the engraved grip." },
          { name: "size", type: '"md" | "lg"', default: '"md"', description: "`lg` is the composer: 14 px text, 22 px lines." },
          { name: "rows", type: "number", default: "3", description: "Visible lines before it scrolls." }
        ]
      }
    ],
    a11y: [
      { badge: "label", text: "Label, hint, error and the counter are tied to the textarea with `aria-describedby`." },
      { badge: "counter", text: "The count is part of the field’s description, so it is read on focus rather than on every keystroke." },
      { keys: ["Tab"], text: "Tab leaves the field; it is never trapped for indentation." }
    ]
  },

  "toggle-button": {
    tags: [AA],
    imports: ["StatusIndicator", "ToggleButton"],
    code: `import { useState } from "react";
import { StatusIndicator, ToggleButton } from "@loreanai/chrome-ui";

export function LogControls() {
  const [live, setLive] = useState(true);
  return (
    <>
      <ToggleButton size="sm" pressed={live} onPressedChange={setLive}>
        <StatusIndicator tone="ok" pulse={live} />
        Live tail
      </ToggleButton>
      <ToggleButton size="sm" defaultPressed>UTC</ToggleButton>
    </>
  );
}`,
    sections: [
      {
        id: "states",
        title: "States",
        text: "Pressed, the graphite part sits pushed into a rimmed well until it is clicked again.",
        samples: [
          { label: "off", node: <ToggleButton size="sm"><G name="eye" size={14} />Watch</ToggleButton> },
          { label: "pressed", node: <ToggleButton size="sm" defaultPressed><G name="pin" size={14} />Pinned</ToggleButton> },
          { label: "with lamp", node: <ToggleButton size="sm" defaultPressed><StatusIndicator tone="ok" pulse />Live tail</ToggleButton> },
          { label: 'size="md"', node: <ToggleButton defaultPressed>UTC</ToggleButton> }
        ]
      }
    ],
    props: [
      {
        extends: "Also takes every `button` attribute.",
        rows: [
          { name: "pressed", type: "boolean", description: "Controlled state." },
          { name: "defaultPressed", type: "boolean", default: "false", description: "Starting state when uncontrolled." },
          { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Called on every press." },
          { name: "size", type: '"sm" | "md"', default: '"md"', description: "Height 30 or 36 px; inside a Toolbar it becomes a quiet 28 px key." },
          { name: "disabled", type: "boolean", description: "Locks the button." }
        ]
      }
    ],
    a11y: [
      { keys: ["Enter", "Space"], text: "Toggles the pressed state." },
      { badge: "aria-pressed", text: "State is `aria-pressed`, so the label must not change with it (“Live tail”, not “Pause”)." },
      { badge: "icon only", text: "An icon-only toggle such as Wrap lines needs an `aria-label`." }
    ]
  }
};
