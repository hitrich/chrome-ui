import { Button, Select, Slider, Surface, Switch, TextField, useChrome, type ButtonSize, type ButtonVariant } from "@chrome-ui/react";
import { useState } from "react";
import { Header } from "../components/Header";
import { UiIcon } from "../components/UiIcon";

export function Playground() {
  const { theme } = useChrome();
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [size, setSize] = useState<ButtonSize>("lg");
  const [reflection, setReflection] = useState([72]);
  const [icon, setIcon] = useState(true);
  const [label, setLabel] = useState("Create project");

  return (
    <div className="docs-page playground-page">
      <Header showThemeToggle />
      <main>
        <header className="playground-heading"><h1>Playground</h1><p>Adjust the material without losing its hierarchy.</p></header>
        <div className="playground-grid">
          <aside className="playground-controls">
            <label><span>Variant</span><Select.Root value={variant} onValueChange={(value) => setVariant(value as ButtonVariant)}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["primary", "secondary", "quiet", "danger"].map((value) => <Select.Item key={value} value={value}>{value}</Select.Item>)}</Select.Content></Select.Root></label>
            <label><span>Size</span><Select.Root value={size} onValueChange={(value) => setSize(value as ButtonSize)}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["sm", "md", "lg"].map((value) => <Select.Item key={value} value={value}>{value}</Select.Item>)}</Select.Content></Select.Root></label>
            <label><span>Reflection · {reflection[0]}%</span><Slider value={reflection} onValueChange={setReflection} aria-label="Reflection intensity" /></label>
            <label className="labeled-control"><span>Directional icon</span><Switch checked={icon} onCheckedChange={setIcon} aria-label="Directional icon" /></label>
            <TextField label="Label" value={label} onChange={(event) => setLabel(event.currentTarget.value)} />
          </aside>
          <Surface finish="edge" className="playground-stage" style={{ "--playground-reflection": reflection[0] } as React.CSSProperties}>
            <span>{theme} / live preview</span>
            <Button variant={variant} size={size}>{label || "Untitled action"} {icon ? <UiIcon name="arrow-right" /> : null}</Button>
            <code>{`<Button variant="${variant}" size="${size}">${label || "Untitled action"}</Button>`}</code>
          </Surface>
        </div>
      </main>
    </div>
  );
}
