import {
  Button,
  Dialog,
  IconButton,
  Slider,
  Switch,
  Tabs,
  TextField,
  useChrome
} from "@loreanai/chrome-ui";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChromeRibbon } from "../components/ChromeRibbon";
import { Header } from "../components/Header";
import { UiIcon, UiIconSwap } from "../components/UiIcon";

const installCommand = "pnpm add @loreanai/chrome-ui";

type CopyStatus = "idle" | "copied" | "error";

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the selection-based path when permission is denied.
    }
  }

  const fallback = document.createElement("textarea");
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.setAttribute("aria-hidden", "true");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  try {
    fallback.select();
    const copied = document.execCommand("copy");
    if (!copied) throw new Error("Clipboard is unavailable");
  } finally {
    fallback.remove();
    if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
  }
}

export function Home() {
  const { motion, setMotion } = useChrome();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (copyStatus === "idle") return undefined;
    const timer = window.setTimeout(() => setCopyStatus("idle"), copyStatus === "copied" ? 1400 : 2600);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const copyInstall = async () => {
    try {
      await writeToClipboard(installCommand);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="home-page">
      <Header />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <h1 id="hero-title"><span>Interfaces</span><span>forged from</span><span>reflected color.</span></h1>
            <p>
              <span className="hero-description--desktop">A React component system built from opaque metal, deep ink, and responsive light.</span>
              <span className="hero-description--mobile"><span>A React component system built from</span><span>opaque metal, deep ink, and</span><span>responsive light.</span></span>
            </p>
            <Button asChild size="lg" className="hero__cta">
              <Link to="/components/button">Explore components <UiIcon name="arrow-right" /></Link>
            </Button>
            <button
              className="install-command"
              data-status={copyStatus}
              onClick={copyInstall}
              aria-label={copyStatus === "error" ? "Copy unavailable. Select the install command manually." : "Copy install command"}
            >
              <span aria-hidden="true">›_</span>
              <code>{installCommand}</code>
              <UiIconSwap icons={["copy", "check", "close"]} name={copyStatus === "copied" ? "check" : copyStatus === "error" ? "close" : "copy"} />
            </button>
            <span className="sr-only" aria-live="polite">
              {copyStatus === "copied" ? "Install command copied" : copyStatus === "error" ? "Copy unavailable. Select the install command manually." : ""}
            </span>
          </div>
          <ChromeRibbon />
        </section>

        <section className="core-controls" aria-labelledby="core-controls-title">
          <div className="section-heading-row">
            <h2 id="core-controls-title">Core controls</h2>
            <Link to="/components/button">View all components <UiIcon name="arrow-right" /></Link>
          </div>
          <div className="control-rail">
            <div className="control-sample control-sample--button">
              <span className="desktop-label">Button</span>
              <span className="mobile-label">Primary button</span>
              <Button>Primary button <UiIcon name="arrow-right" /></Button>
            </div>
            <div className="control-sample control-sample--icon">
              <span>Icon button</span>
              <IconButton aria-label="Favorite component"><UiIcon name="star" /></IconButton>
            </div>
            <div className="control-sample control-sample--field">
              <span className="desktop-label">Text field</span>
              <span className="mobile-label">Email</span>
              <TextField className="desktop-field" aria-label="Text field" placeholder="Type something…" trailing={<UiIcon name="sliders" />} />
              <TextField className="mobile-field" aria-label="Email" placeholder="Email" trailing={<UiIcon name="sliders" />} />
            </div>
            <div className="control-sample control-sample--switch">
              <span className="desktop-label">Switch</span>
              <span className="mobile-label">Motion</span>
              <Switch checked={motion !== "reduced"} onCheckedChange={(checked) => setMotion(checked ? "system" : "reduced")} aria-label="Motion" />
            </div>
            <div className="control-sample control-sample--tabs">
              <span className="desktop-label">Tabs</span>
              <Tabs.Root defaultValue="preview">
                <Tabs.List aria-label="Component view">
                  <Tabs.Trigger value="preview"><span className="desktop-label">Tab 1</span><span className="mobile-label">Preview</span></Tabs.Trigger>
                  <Tabs.Trigger value="code"><span className="desktop-label">Tab 2</span><span className="mobile-label">Code</span></Tabs.Trigger>
                  <Tabs.Trigger value="three" className="desktop-only">Tab 3</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content className="sr-only" value="preview">Preview component state</Tabs.Content>
                <Tabs.Content className="sr-only" value="code">Component source view</Tabs.Content>
                <Tabs.Content className="sr-only" value="three">Component anatomy view</Tabs.Content>
              </Tabs.Root>
            </div>
            <div className="control-sample control-sample--slider">
              <span>Slider</span>
              <Slider defaultValue={[54]} aria-label="Intensity" />
            </div>
            <div className="control-sample control-sample--dialog desktop-only">
              <span>Dialog</span>
              <Dialog.Root>
                <Dialog.Trigger asChild><Button size="sm">Open dialog <UiIcon name="external" /></Button></Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>Material detail</Dialog.Title>
                  <Dialog.Description>Chrome uses opaque reflected bands and hard seams. It never relies on blur.</Dialog.Description>
                  <Dialog.Close asChild><Button>Understood</Button></Dialog.Close>
                </Dialog.Content>
              </Dialog.Root>
            </div>
          </div>
        </section>

        <section className="material-intro" aria-labelledby="material-title">
          <div className="section-heading-row">
            <h2 id="material-title">The material system</h2>
            <Link to="/foundations/color" aria-label="Open material foundations">+</Link>
          </div>
          <div className="material-principles">
            <article><span>01</span><h3>Opaque by design</h3><p>Hard metal surfaces preserve hierarchy without borrowing the blur of glass.</p></article>
            <article><span>02</span><h3>Color has meaning</h3><p>Cobalt indicates focus and progress. Enamel red is reserved for live and destructive state.</p></article>
            <article><span>03</span><h3>Chrome is scarce</h3><p>Reflective intensity belongs on decisions, selection, and physical control points.</p></article>
          </div>
        </section>
      </main>
    </div>
  );
}
