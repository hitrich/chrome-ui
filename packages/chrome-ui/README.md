# @loreanai/chrome-ui

Satin chrome components for React. Every chrome part is built like the thing it imitates: a pill frame with a gradient stroke, a bezel ring, a satin inner pill and a tinted glow underneath. Everyday actions are graphite or ghost; cobalt confirms, enamel destroys, and one polished part leads each panel.

## Install

```sh
npm install @loreanai/chrome-ui
```

Import the stylesheet once at the root of your application, then wrap the interface in `ChromeProvider`.

```tsx
import { Button, ChromeProvider } from "@loreanai/chrome-ui";
import "@loreanai/chrome-ui/styles.css";

export function App() {
  return (
    <ChromeProvider defaultTheme="satin" motion="system">
      <Button finish="polished">Deploy</Button>
    </ChromeProvider>
  );
}
```

React and React DOM are peer dependencies. The styles use Plus Jakarta Sans, Oxanium and JetBrains Mono through `--chrome-font-sans`, `--chrome-font-display` and `--chrome-font-mono`; load the fonts yourself (for example from Fontsource) or override those tokens.

## Themes

`theme` is `"satin"` (light) or `"ink"` (dark). `"arctic"` is the 0.1 name for Satin and renders the same. The provider renders `.chrome-root[data-chrome-theme]`, which paints `--chrome-bg` and sets text colour, font smoothing, the cobalt `::selection` and one focus ring for every control (2 px `--chrome-focus` at 2 px offset). Every theme difference lives in tokens, so a nested `<ChromeProvider theme="ink">` makes an Ink island on a Satin page (floats inside it soften their edge automatically). Motion follows the system preference, or is forced `full` or `reduced`.

## Button

| Prop | Type | Default | |
|---|---|---|---|
| `finish` | `"polished" \| "smoked" \| "cobalt" \| "enamel" \| "graphite" \| "ghost"` | `"graphite"` | Material and intent. Exported as `ButtonFinish`. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Height 30, 36, 44 or 52 px. |
| `loading` | `boolean` | `false` | Centred spinner over the hidden label (keeps the width), sets `aria-busy`, stays focusable, ignores presses. |
| `leadingIcon` / `trailingIcon` | `ReactNode` | — | Icons before or after the label, `aria-hidden`. |
| `asChild` | `boolean` | `false` | Renders its child (a router link) with the button look; icons and the spinner still render inside it. |
| `static` | `boolean` | `false` | No press travel, for dense toolbars. |
| `variant` | `"primary" \| "secondary" \| "quiet" \| "danger"` | — | Deprecated alias: primary → polished, secondary → graphite, quiet → ghost, danger → enamel. `finish` wins. |

`IconButton` takes the same props plus a required `aria-label`; it is square at every size. Both use an `HTMLElement` ref because `asChild` can slot a link. The chrome finishes read the design's short custom properties (`--s0…--s2` stroke, `--f0…--f2` frame, `--i0/--i1` inner pill, `--g0/--g1` glow), so a class that sets them re-tints the part.

The element carries `data-finish`, `data-size`, and `data-loading` / `data-static` when set.

## Other props added in 1.0 (all optional)

- `Badge` `tone`: `"neutral" | "new" | "bad" | "success" | "warning"`; `"accent"` and `"danger"` remain as aliases of new and bad.
- `Avatar` `size`: `sm` 24, `md` 32, `lg` 40 px.
- `Progress` `indeterminate`: a cobalt run sweeping the groove; `aria-valuenow` is omitted.
- `Meter` `segments`: render that many recessed cells instead of a continuous track.
- `Spinner` `finish`: `"line"` (a ring in the current colour, default) or `"cobalt"` / `"silver"` chrome comets.
- `StatusIndicator` `tone` also takes the design names `ok`, `info`, `warn`, `bad`, `off`; `pulse` draws the live halo; `label` is optional (a bare lamp is decorative and hidden from assistive tech).
- `TextField` `leading` / `trailing`: a string renders as a recessed text segment (`orbital-ops/`, `ms`), an element sits inline as an icon.
- `EmptyState` `icon`: shown unframed; omitted, the chrome emblem renders; `null` renders none.
- `Alert` `action` now sits under the description; each tone has a default glyph in its chrome emblem.
- `DropdownMenu.Item` with `data-tone="danger"` renders in enamel.
- `ToggleButton` is a graphite button that sits pushed into a rimmed well when pressed; inside a `Toolbar` it becomes a quiet 28 px key.

## Static samples for documentation

Docs can show states without a pointer: `data-hover`, `data-active` and `data-focus-visible` on a `Button`, `IconButton`, `ToggleButton`, `Switch`, `Checkbox`, radio item or table row draw hover, pressed and focus. On `TextField` and `SearchField` the attribute lands on the input and the well follows. An open menu can be rendered without Radix from the same classes: `.chrome-dropdown` > `.chrome-dropdown__item` (`data-highlighted` for the keyboard row), `.chrome-dropdown__label`, `.chrome-dropdown__separator`; a listbox is `.chrome-select__content` > `.chrome-select__item`; a trigger shown open is `.chrome-select__trigger[data-state="open"]`; a tooltip is `.chrome-tooltip`; a toast is `.chrome-toast`; a dialog panel in the flow is `.chrome-dialog__content[data-inline]`.

## Components

`ChromeProvider` plus core controls (`Button`, `IconButton`, `TextField`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Tabs`, `Select`, `Badge`, `Avatar`, `Progress`, `Surface`), overlays (`Dialog`, `DropdownMenu`, `Toast`, `Tooltip`), navigation (`Breadcrumb`, `Pagination`, `Stepper`), feedback (`Alert`, `EmptyState`, `Skeleton`, `Spinner`, `StatusIndicator`), data display (`CodeBlock`, `Meter`, `Stat`, `Table`, `Timeline`, `KeyHint`, `Divider`) and workspace controls (`FileDropzone`, `SearchField`, `SegmentedControl`, `ToggleButton`, `Toolbar`).

New inputs: `ButtonGroup`, `Calendar`, `Chip`, `ColorPicker`, `Combobox`, `DatePicker`, `InputOTP`, `NumberField`, `TagInput`, `Textarea`. New layers and navigation: `Accordion`, `CommandPalette`, `ContextMenu`, `Drawer`, `HoverCard`, `Popover`, `TreeView` (each floating one takes `inline` on its root to render open in the page flow, for documentation). Charts, pure SVG in the same chrome: `AreaChart`, `LineChart`, `BarChart`, `BarList`, `Gauge`, `RadialRings`, `Heatmap`, `Sparkline`, `DonutChart`, `ScatterChart`, `FunnelChart`, `Waveform`, plus `ChartLegend`, `ChartWell`, `ChartTooltipRow` and `HeatmapLegend`. Every chart requires an `aria-label`; `description` and `dataTable` add a text summary or a visually hidden table.
