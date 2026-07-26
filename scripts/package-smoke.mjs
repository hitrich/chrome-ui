import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePackageRoot = join(workspaceRoot, "packages", "chrome-ui");
const temporaryRoot = mkdtempSync(join(tmpdir(), "chrome-ui-package-smoke-"));
const cleanWorkspaceRoot = join(temporaryRoot, "clean-workspace");
const cleanPackageRoot = join(cleanWorkspaceRoot, "packages", "chrome-ui");
const artifactRoot = join(temporaryRoot, "artifacts");
const consumerRoot = join(temporaryRoot, "consumer");
const sharedStore = join(workspaceRoot, ".pnpm-store", "v10");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

try {
  mkdirSync(cleanPackageRoot, { recursive: true });
  for (const file of ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.base.json"]) {
    copyFileSync(join(workspaceRoot, file), join(cleanWorkspaceRoot, file));
  }
  cpSync(sourcePackageRoot, cleanPackageRoot, {
    recursive: true,
    filter: (source) => {
      const pathFromPackage = relative(sourcePackageRoot, source);
      return !pathFromPackage.split("/").some((segment) => segment === "dist" || segment === "node_modules");
    }
  });

  if (existsSync(join(cleanPackageRoot, "dist"))) {
    throw new Error("The clean package fixture unexpectedly contains dist before prepack.");
  }

  run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts", "--prefer-offline", "--filter", "@loreanai/chrome-ui...", "--store-dir", sharedStore], cleanWorkspaceRoot);

  if (existsSync(join(cleanPackageRoot, "dist"))) {
    throw new Error("Dependency installation built dist before the prepack lifecycle.");
  }

  mkdirSync(artifactRoot, { recursive: true });
  run("pnpm", ["--filter", "@loreanai/chrome-ui", "pack", "--pack-destination", artifactRoot], cleanWorkspaceRoot);

  const tarballName = readdirSync(artifactRoot).find((name) => name.endsWith(".tgz"));
  if (!tarballName || !existsSync(join(cleanPackageRoot, "dist", "index.d.ts"))) {
    throw new Error("Clean prepack did not produce both a tarball and declarations.");
  }

  mkdirSync(consumerRoot, { recursive: true });
  writeFileSync(join(consumerRoot, "package.json"), JSON.stringify({
    name: "chrome-ui-package-consumer",
    private: true,
    type: "module",
    dependencies: {
      "@loreanai/chrome-ui": `file:${join(artifactRoot, tarballName)}`,
      react: "19.2.7",
      "react-dom": "19.2.7"
    },
    devDependencies: {
      "@types/react": "19.2.17",
      "@types/react-dom": "19.2.3",
      typescript: "5.9.3"
    }
  }, null, 2));

  run("pnpm", ["install", "--ignore-scripts", "--prefer-offline", "--store-dir", sharedStore], consumerRoot);

  writeFileSync(join(consumerRoot, "verify.mjs"), `
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as Chrome from "@loreanai/chrome-ui";

const expected = [
  "Alert", "Avatar", "Badge", "Breadcrumb", "Button", "Checkbox", "ChromePortalLayer",
  "ChromeProvider", "CodeBlock", "Dialog", "Divider", "DropdownMenu", "EmptyState",
  "FileDropzone", "IconButton", "KeyHint", "Meter", "Pagination", "Progress", "RadioGroup",
  "SearchField", "SegmentedControl", "Select", "Skeleton", "Slider", "Spinner", "Stat",
  "StatusIndicator", "Stepper", "Surface", "Switch", "Table", "Tabs", "TextField",
  "Timeline", "Toast", "ToggleButton", "Toolbar", "Tooltip", "useChrome"
];
const missing = expected.filter((name) => !Chrome[name]);
if (missing.length) throw new Error(\`Missing runtime exports: \${missing.join(", ")}\`);

const stylesheetPath = fileURLToPath(import.meta.resolve("@loreanai/chrome-ui/styles.css"));
if (statSync(stylesheetPath).size === 0 || !readFileSync(stylesheetPath, "utf8").includes("@layer chrome")) {
  throw new Error("The exported stylesheet is empty or missing Chrome layers.");
}
`);

  writeFileSync(join(consumerRoot, "consumer.tsx"), `
import * as React from "react";
import {
  Alert, Avatar, Badge, Button, Checkbox, ChromeProvider, Dialog, DropdownMenu,
  IconButton, Progress, RadioGroup, SearchField, Select, Slider, Surface, Switch,
  Table, Tabs, TextField, Toast, Toolbar, Tooltip, useChrome,
  type AlertProps, type AvatarProps, type BadgeProps, type ButtonElement, type ButtonProps,
  type ButtonSize, type ButtonVariant, type ChromeMotion, type ChromeProviderProps,
  type ChromeTheme, type IconButtonProps, type ProgressProps, type SearchFieldProps,
  type SliderProps, type SurfaceProps, type TableProps, type TextFieldProps, type ToolbarProps
} from "@loreanai/chrome-ui";

const anchorRef = React.createRef<HTMLAnchorElement>();
const iconAnchorRef = React.createRef<HTMLAnchorElement>();
const theme: ChromeTheme = "ink";
const motion: ChromeMotion = "system";
const props: ButtonProps = { variant: "primary", size: "md" };
const element: ButtonElement | null = anchorRef.current;
type PublicContracts = [AlertProps, AvatarProps, BadgeProps, ButtonProps, ButtonSize, ButtonVariant,
  ChromeMotion, ChromeProviderProps, ChromeTheme, IconButtonProps, ProgressProps,
  SearchFieldProps, SliderProps, SurfaceProps, TableProps, TextFieldProps, ToolbarProps];
const contracts: PublicContracts | undefined = undefined;
const exportsToCheck = [Alert, Avatar, Badge, Checkbox, Dialog, DropdownMenu,
  IconButton, Progress, RadioGroup, SearchField, Select, Slider, Surface, Switch,
  Table, Tabs, TextField, Toast, Toolbar, Tooltip, useChrome];

export const fixture = (
  <ChromeProvider theme={theme} motion={motion}>
    <Button {...props} asChild ref={anchorRef}>
      <a href="/components">Open components</a>
    </Button>
    <IconButton asChild ref={iconAnchorRef} aria-label="Open foundations">
      <a href="/foundations">i</a>
    </IconButton>
    <Alert title="Ready">Package verified.</Alert>
  </ChromeProvider>
);
void element;
void contracts;
void exportsToCheck;
`);

  writeFileSync(join(consumerRoot, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: false,
      noEmit: true
    },
    include: ["consumer.tsx"]
  }, null, 2));

  run(process.execPath, ["verify.mjs"], consumerRoot);
  run("pnpm", ["exec", "tsc", "--project", "tsconfig.json"], consumerRoot);

  const packedStyles = join(consumerRoot, "node_modules", "@loreanai", "chrome-ui", "dist", "index.css");
  if (!existsSync(packedStyles) || statSync(packedStyles).size === 0) {
    throw new Error("The installed tarball is missing its stylesheet payload.");
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
