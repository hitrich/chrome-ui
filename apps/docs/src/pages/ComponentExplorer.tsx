import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ChromeProvider,
  Dialog,
  DropdownMenu,
  IconButton,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Surface,
  Switch,
  Tabs,
  TextField,
  Toast,
  Tooltip
} from "@loreanai/chrome-ui";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DocsRail } from "../components/DocsRail";
import { Header } from "../components/Header";
import { UiIcon } from "../components/UiIcon";
import { componentDocs } from "../data";

function ComponentPreview({ slug }: { slug: string }) {
  const [buttonState, setButtonState] = useState("Focus");
  const [switchOn, setSwitchOn] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);

  if (slug === "avatar") return <div className="inline-demo"><Avatar name="Arin Reyes" size="lg" /><Avatar name="Chrome Library" /><Avatar name="Violet Transmission" size="sm" /></div>;
  if (slug === "chrome-provider") return <div className="provider-demo"><ChromeProvider theme="ink" motion="reduced"><Surface finish="edge"><strong>Ink scope</strong><span>Reduced motion</span></Surface></ChromeProvider></div>;
  if (slug === "button") {
    const previewClass = buttonState === "Default" ? undefined : `preview-button--${buttonState.toLowerCase()}`;
    return (
      <>
        <Button size="lg" className={previewClass} disabled={buttonState === "Disabled"}>
          Create project <UiIcon name="arrow-right" />
        </Button>
        <div className="state-selector" aria-label="Button preview state">
          {["Default", "Hover", "Focus", "Pressed", "Disabled"].map((state) => (
            <button key={state} aria-pressed={buttonState === state} onClick={() => setButtonState(state)}>{state}</button>
          ))}
        </div>
      </>
    );
  }
  if (slug === "icon-button") return <IconButton size="lg" aria-label="Favorite component"><UiIcon name="star" /></IconButton>;
  if (slug === "text-field") return <TextField label="Project name" placeholder="Violet Transmission" hint="Names can be changed later." trailing={<UiIcon name="sliders" />} />;
  if (slug === "select") return <Select.Root defaultValue="analog"><Select.Trigger aria-label="Input source"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item><Select.Item value="usb">USB interface</Select.Item><Select.Item value="loop">Loopback</Select.Item><Select.Item value="line" disabled>Line input unavailable</Select.Item></Select.Content></Select.Root>;
  if (slug === "checkbox") return <Checkbox defaultChecked>Include component styles</Checkbox>;
  if (slug === "radio-group") return <RadioGroup.Root defaultValue="ink"><RadioGroup.Item value="ink">Ink</RadioGroup.Item><RadioGroup.Item value="arctic">Arctic</RadioGroup.Item></RadioGroup.Root>;
  if (slug === "switch") return <label className="labeled-control"><span>Responsive light</span><Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="Responsive light" /></label>;
  if (slug === "slider") return <div className="wide-demo"><span>Reflection intensity</span><Slider defaultValue={[64]} aria-label="Reflection intensity" /></div>;
  if (slug === "tabs") return <Tabs.Root defaultValue="preview"><Tabs.List><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code">Code</Tabs.Trigger><Tabs.Trigger value="anatomy">Anatomy</Tabs.Trigger></Tabs.List><Tabs.Content value="preview"><p>The active plane stays clear and connected.</p></Tabs.Content><Tabs.Content value="code"><p>Compound parts preserve accessible structure.</p></Tabs.Content><Tabs.Content value="anatomy"><p>List, trigger, and content form one relationship.</p></Tabs.Content></Tabs.Root>;
  if (slug === "badge") return <div className="inline-demo"><Badge>Neutral</Badge><Badge tone="accent">Focused</Badge><Badge tone="danger">Live</Badge><Badge tone="success">Ready</Badge></div>;
  if (slug === "tooltip") return <Tooltip.Root defaultOpen><Tooltip.Trigger asChild><IconButton aria-label="Material information"><UiIcon name="sparkle" /></IconButton></Tooltip.Trigger><Tooltip.Content>Reactive chrome finish</Tooltip.Content></Tooltip.Root>;
  if (slug === "dropdown") return <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button>Project actions <UiIcon name="sliders" /></Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>Duplicate project</DropdownMenu.Item><DropdownMenu.Item>Save snapshot</DropdownMenu.Item><DropdownMenu.Item>Export package</DropdownMenu.Item><DropdownMenu.Separator /><DropdownMenu.Item disabled>Delete unavailable</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>;
  if (slug === "dialog") return <Dialog.Root><Dialog.Trigger asChild><Button>Open dialog <UiIcon name="external" /></Button></Dialog.Trigger><Dialog.Content><Dialog.Title>Export package</Dialog.Title><Dialog.Description>Components, tokens, and CSS will be prepared for download.</Dialog.Description><div className="dialog-actions"><Dialog.Close asChild><Button variant="quiet">Cancel</Button></Dialog.Close><Dialog.Close asChild><Button>Export</Button></Dialog.Close></div></Dialog.Content></Dialog.Root>;
  if (slug === "toast") return <Toast.Provider><Button onClick={() => setToastOpen(true)}>Save snapshot</Button><Toast.Root open={toastOpen} onOpenChange={setToastOpen}><Toast.Title>Snapshot saved</Toast.Title><Toast.Description>Just now</Toast.Description><Toast.Close aria-label="Dismiss"><UiIcon name="close" /></Toast.Close></Toast.Root><Toast.Viewport /></Toast.Provider>;
  if (slug === "progress") return <div className="wide-demo"><span>Package build · 68%</span><Progress value={68} aria-label="Package build" /></div>;
  if (slug === "surface") return <div className="surface-demo"><Surface finish="ink">Ink</Surface><Surface finish="edge">Edge</Surface><Surface finish="chrome">Chrome</Surface></div>;
  return null;
}

const disabledVariantSlugs = new Set(["icon-button", "text-field", "select", "checkbox", "radio-group", "switch", "slider", "tabs", "dropdown"]);

function DisabledVariant({ slug }: { slug: string }) {
  if (slug === "icon-button") return <IconButton disabled aria-label="Unavailable action"><UiIcon name="star" /></IconButton>;
  if (slug === "text-field") return <TextField disabled aria-label="Unavailable field" placeholder="Unavailable" />;
  if (slug === "select") return <Select.Root disabled defaultValue="analog"><Select.Trigger aria-label="Unavailable input"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item></Select.Content></Select.Root>;
  if (slug === "checkbox") return <Checkbox disabled defaultChecked>Unavailable</Checkbox>;
  if (slug === "radio-group") return <RadioGroup.Root defaultValue="ink" aria-label="Unavailable theme"><RadioGroup.Item value="ink" disabled>Ink</RadioGroup.Item></RadioGroup.Root>;
  if (slug === "switch") return <Switch disabled defaultChecked aria-label="Unavailable setting" />;
  if (slug === "slider") return <Slider disabled defaultValue={[64]} aria-label="Unavailable intensity" />;
  if (slug === "tabs") return <Tabs.Root defaultValue="preview"><Tabs.List><Tabs.Trigger value="preview" disabled>Preview</Tabs.Trigger></Tabs.List><Tabs.Content value="preview" className="sr-only">Unavailable view</Tabs.Content></Tabs.Root>;
  if (slug === "dropdown") return <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button disabled>Unavailable menu</Button></DropdownMenu.Trigger></DropdownMenu.Root>;
  return null;
}

function usageFor(title: string, slug: string) {
  const snippets: Record<string, string> = {
    avatar: `import { Avatar } from "@loreanai/chrome-ui"\n\n<Avatar name="Arin Reyes" />`,
    "chrome-provider": `import { ChromeProvider } from "@loreanai/chrome-ui"\n\n<ChromeProvider defaultTheme="ink" motion="system">\n  <App />\n</ChromeProvider>`,
    button: `import { Button } from "@loreanai/chrome-ui"\n\n<Button variant="primary">Create project</Button>`,
    "icon-button": `import { IconButton } from "@loreanai/chrome-ui"\n\n<IconButton aria-label="More actions">···</IconButton>`,
    "text-field": `import { TextField } from "@loreanai/chrome-ui"\n\n<TextField label="Project name" />`,
    select: `import { Select } from "@loreanai/chrome-ui"\n\n<Select.Root defaultValue="analog">\n  <Select.Trigger aria-label="Input source"><Select.Value /></Select.Trigger>\n  <Select.Content><Select.Item value="analog">Analog 4</Select.Item></Select.Content>\n</Select.Root>`,
    checkbox: `import { Checkbox } from "@loreanai/chrome-ui"\n\n<Checkbox defaultChecked>Include styles</Checkbox>`,
    "radio-group": `import { RadioGroup } from "@loreanai/chrome-ui"\n\n<RadioGroup.Root defaultValue="ink" aria-label="Theme">\n  <RadioGroup.Item value="ink">Ink</RadioGroup.Item>\n  <RadioGroup.Item value="arctic">Arctic</RadioGroup.Item>\n</RadioGroup.Root>`,
    switch: `import { Switch } from "@loreanai/chrome-ui"\n\n<Switch aria-label="Responsive light" defaultChecked />`,
    slider: `import { Slider } from "@loreanai/chrome-ui"\n\n<Slider aria-label="Reflection intensity" defaultValue={[64]} />`,
    tabs: `import { Tabs } from "@loreanai/chrome-ui"\n\n<Tabs.Root defaultValue="preview">\n  <Tabs.List aria-label="Component view"><Tabs.Trigger value="preview">Preview</Tabs.Trigger></Tabs.List>\n  <Tabs.Content value="preview">Live component</Tabs.Content>\n</Tabs.Root>`,
    badge: `import { Badge } from "@loreanai/chrome-ui"\n\n<Badge tone="accent">Focused</Badge>`,
    tooltip: `import { Tooltip } from "@loreanai/chrome-ui"\n\n<Tooltip.Provider><Tooltip.Root><Tooltip.Trigger>Material</Tooltip.Trigger><Tooltip.Content>Reactive chrome</Tooltip.Content></Tooltip.Root></Tooltip.Provider>`,
    dropdown: `import { Button, DropdownMenu } from "@loreanai/chrome-ui"\n\n<DropdownMenu.Root><DropdownMenu.Trigger asChild><Button>Actions</Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>Duplicate</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>`,
    dialog: `import { Button, Dialog } from "@loreanai/chrome-ui"\n\n<Dialog.Root><Dialog.Trigger asChild><Button>Export</Button></Dialog.Trigger><Dialog.Content><Dialog.Title>Export package</Dialog.Title><Dialog.Description>Prepare files.</Dialog.Description></Dialog.Content></Dialog.Root>`,
    toast: `import { Toast } from "@loreanai/chrome-ui"\n\n<Toast.Provider><Toast.Root><Toast.Title>Snapshot saved</Toast.Title></Toast.Root><Toast.Viewport /></Toast.Provider>`,
    progress: `import { Progress } from "@loreanai/chrome-ui"\n\n<Progress value={68} aria-label="Package build" />`,
    surface: `import { Surface } from "@loreanai/chrome-ui"\n\n<Surface finish="chrome">Primary action</Surface>`
  };
  const componentImport = snippets[slug] ?? `import { ${title.replace(/\s/g, "")} } from "@loreanai/chrome-ui"`;
  return componentImport;
}

function ButtonUsageCode() {
  return (
    <code className="syntax-code">
      <span><b>import</b>{" { Button } "}<b>from</b>{" "}<i>"@loreanai/chrome-ui"</i></span>
      <span aria-hidden="true">&nbsp;</span>
      <span>{"<Button "}<em>variant</em>{"="}<i>"primary"</i>{">Create project</Button>"}</span>
    </code>
  );
}

function propType(prop: string, slug: string) {
  if (prop === "theme" || prop === "defaultTheme") return "'ink' | 'arctic'";
  if (prop === "motion") return "'system' | 'full' | 'reduced'";
  if (prop === "variant") return "'primary'";
  if (prop === "size") return "'md'";
  if (["disabled", "asChild", "modal", "open", "checked", "defaultChecked", "showClose"].includes(prop)) return "boolean";
  if (["min", "max", "duration", "delayDuration", "sideOffset"].includes(prop)) return "number";
  if (["value", "defaultValue"].includes(prop)) return slug === "slider" ? "number[]" : slug === "progress" ? "number" : "string";
  if (prop.startsWith("on")) return "function";
  return "string";
}

export function ComponentExplorer() {
  const { slug = "button" } = useParams();
  const [copied, setCopied] = useState(false);
  const item = componentDocs.find((component) => component.slug === slug) ?? componentDocs[0];
  const isButton = item.slug === "button";
  const usage = usageFor(item.title, item.slug);
  const copyUsage = () => {
    void navigator.clipboard?.writeText(usage).catch(() => undefined);
    setCopied(true);
  };

  return (
    <div className="docs-page">
      <Header showThemeToggle />
      <div className="docs-layout">
        <DocsRail />
        <main className="component-doc" id="main-content">
          <header className="component-doc__header">
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </header>

          <section aria-labelledby="preview-title">
            <h2 id="preview-title">Preview</h2>
            <div className={`component-preview${isButton ? " component-preview--button" : ""}`}><ComponentPreview slug={item.slug} /></div>
          </section>

          <section aria-labelledby="variants-title">
            <h2 id="variants-title">Variants</h2>
            {isButton ? (
              <div className="variant-rail">
                <div><Button>Create project <UiIcon name="arrow-right" /></Button><span>Primary</span></div>
                <div><Button variant="secondary">Create project <UiIcon name="arrow-right" /></Button><span>Secondary</span></div>
                <div><Button variant="quiet">Create project <UiIcon name="arrow-right" /></Button><span>Quiet</span></div>
                <div><Button variant="danger">Delete project <UiIcon name="arrow-right" /></Button><span>Danger</span></div>
              </div>
            ) : (
              <div className="variant-summary">
                <span>Ink</span><span>Arctic</span><span>Focused</span>
                {disabledVariantSlugs.has(item.slug) ? <div className="disabled-variant"><DisabledVariant slug={item.slug} /><span>Disabled</span></div> : <span>Disabled</span>}
              </div>
            )}
          </section>

          <section className="documentation-split">
            <div>
              <h2>Usage</h2>
              <pre>{isButton ? <ButtonUsageCode /> : <code>{usage}</code>}<button aria-label={copied ? "Usage copied" : "Copy usage"} onClick={copyUsage}><UiIcon name={copied ? "check" : "copy"} /></button></pre>
            </div>
            <div>
              <h2>Anatomy</h2>
              <dl>{item.anatomy.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
            </div>
          </section>
        </main>
        <aside className="props-panel">
          <h2>Props</h2>
          <dl>{item.props.map((prop) => <div key={prop}><dt>{prop}</dt><dd>{propType(prop, item.slug)}</dd></div>)}</dl>
        </aside>
      </div>
    </div>
  );
}
