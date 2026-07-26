# Chrome UI

![Chrome UI — Reactive Metal interface system](apps/docs/src/assets/chrome-landing-desktop-source.png)

Chrome UI is an open-source React component library built around **Reactive Chrome**: an opaque metal interface language shaped by polished silver, deep ink, cobalt focus, enamel-red state, hard seams, and responsive light.

It is fully original and does not use Shadcn, Tailwind, glass blur, or translucent card styling. Radix primitives provide accessible behavior for complex controls while every visual layer and component anatomy is custom.

## What is included

- `@loreanai/chrome-ui`, an ESM React and TypeScript package with generated declarations
- Ink and arctic themes with system, full, and reduced motion modes
- ChromeProvider and `useChrome()` theme APIs
- 37 documented UI components plus `ChromeProvider`, spanning controls, navigation, feedback, data display, overlays, and surfaces
- A responsive Vite documentation app with foundations, component explorer, playground, and Control Room pattern
- Self-hosted Space Grotesk, JetBrains Mono, and Oxanium typography
- Unit, accessibility, package-consumer, and browser test coverage

## Quick start

Install the public package from npm:

```sh
npm install @loreanai/chrome-ui
```

To run the documentation and package workspace locally:

```sh
corepack enable
pnpm install
pnpm dev
```

Then open the local URL shown by Vite.

Import the library stylesheet once and wrap your application with `ChromeProvider`:

```tsx
import { Button, ChromeProvider } from "@loreanai/chrome-ui";
import "@loreanai/chrome-ui/styles.css";

export function App() {
  return (
    <ChromeProvider defaultTheme="ink" motion="system">
      <Button variant="primary">Create project</Button>
    </ChromeProvider>
  );
}
```

## Component catalog

Core controls include `Surface`, `Button`, `IconButton`, `TextField`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Tabs`, `Badge`, `Tooltip`, `DropdownMenu`, `Dialog`, `Toast`, `Progress`, and `Avatar`.

The extended set adds `Alert`, `Breadcrumb`, `CodeBlock`, `Divider`, `EmptyState`, `FileDropzone`, `KeyHint`, `Meter`, `Pagination`, `SearchField`, `SegmentedControl`, `Skeleton`, `Spinner`, `Stat`, `StatusIndicator`, `Stepper`, `Table`, `Timeline`, `ToggleButton`, and `Toolbar`.

## Workspace

```text
apps/docs              Documentation and interactive examples
packages/chrome-ui     Installable @loreanai/chrome-ui package
scripts                Package-consumer smoke validation
```

## Development

```sh
pnpm dev          # build the package and start the docs app
pnpm build        # build package and documentation
pnpm typecheck    # typecheck every workspace package
pnpm lint         # lint the workspace
pnpm test         # unit and accessibility tests
pnpm test:package # pack and test an isolated package consumer
pnpm test:e2e     # browser interaction tests
pnpm validate     # full non-browser validation suite
```

## Design principles

- Opaque surfaces only—no backdrop blur or glass transparency
- Silver for primary actions, cobalt for focus and progress, and enamel red for destructive or live state
- Hard seams, clipped corners, narrow highlights, and restrained depth
- Keyboard access, visible focus, reduced-motion support, and 44px mobile targets
- Open rails, dividers, lists, and canvases instead of generic card grids

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. For security issues, follow [SECURITY.md](SECURITY.md).

## License

Chrome UI is available under the [MIT License](LICENSE).
