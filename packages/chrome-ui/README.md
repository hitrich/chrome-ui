# @loreanai/chrome-ui

Reactive Chrome is an opaque metal component system for React. It uses graphite for routine surfaces, silver for primary actions, cobalt for focus and progress, and enamel red for live or destructive state.

## Install

```sh
npm install @loreanai/chrome-ui
```

Import the library stylesheet once at the root of your application, then wrap the interface in `ChromeProvider`.

```tsx
import { Button, ChromeProvider } from "@loreanai/chrome-ui";
import "@loreanai/chrome-ui/styles.css";

export function App() {
  return (
    <ChromeProvider defaultTheme="ink" motion="system">
      <Button>Create project</Button>
    </ChromeProvider>
  );
}
```

Themes are `ink` and `arctic`. Motion can follow the system preference, remain `full`, or be explicitly `reduced`. React and React DOM are peer dependencies.

`Button` and `IconButton` use an `HTMLElement` ref because `asChild` can slot a link or another interactive element. Without `asChild`, the rendered element is a native button and receives standard button props.
