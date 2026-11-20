import { Button, Checkbox, RadioGroup, SegmentedControl, Slider, Switch, TextField, type ButtonFinish } from "@loreanai/chrome-ui";
import { Fragment, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import "./Foundations.css";

/* Foundations (Ink): rules, color, semantic and chrome tokens with live controls, typography, finishes, shape, depth, motion. */

const rules = [
  { n: "1", tone: undefined, text: "Polished part per panel. Everyday actions are graphite or ghost." },
  { n: "1", tone: "cobalt", text: "Cobalt confirm per view. Beyond it: focus, selection, progress." },
  { n: "0", tone: "enamel", text: "Enamel without a reason. Only destructive, live or failing states." },
  { n: "2", tone: undefined, text: "Themes, one build. Ink and Satin swap the neutrals; the chrome stops stay put." }
];

const build = [
  ["stroke", "C9C9C9 · 686A69 · ABC9C4"],
  ["ring", "F4F4F4 · 565656 · 93B3AE"],
  ["inner", "D5D8D8 · 818C8A"],
  ["label", "2B2A2A"],
  ["glow", "5F837D · ABC9C4"]
];

const palettes: { label: string; swatches: [string, string][] }[] = [
  { label: "Ink neutrals", swatches: [["Page", "#050506"], ["Surface", "#0C0C0E"], ["Raised", "#161618"], ["Text 3", "#8A8A94"], ["Text 2", "#A1A1AA"], ["Text", "#F4F4F5"]] },
  { label: "Satin neutrals", swatches: [["Page", "#E8E9E9"], ["Tile", "#E1E2E2"], ["Raised", "#F2F3F3"], ["Text 3", "#5F6363"], ["Text 2", "#4A4D4D"], ["Text", "#202222"]] },
  { label: "Signal · Ink", swatches: [["Cobalt", "#1F55FF"], ["Cobalt text", "#7B9DFF"], ["Enamel", "#E5372A"], ["Enamel text", "#FF6B5E"], ["Mint · data", "#3FBF8F"], ["Amber · data", "#E8A33A"]] }
];

// The package's public names (the design files use the short forms in the note below).
const tokens: [name: string, ink: string, satin: string][] = [
  ["--chrome-bg", "#050506", "#E8E9E9"],
  ["--chrome-surface", "#0C0C0E", "#E1E2E2"],
  ["--chrome-surface-2", "#111113", "#DCDDDD"],
  ["--chrome-raised", "#161618", "#F2F3F3"],
  ["--chrome-well-fill", "#09090B", "#F4F5F5"],
  ["--chrome-line", "#FFFFFF12", "#00000014"],
  ["--chrome-line-2", "#FFFFFF1F", "#00000024"],
  ["--chrome-text", "#F4F4F5", "#202222"],
  ["--chrome-text-2", "#A1A1AA", "#4A4D4D"],
  ["--chrome-text-3", "#8A8A94", "#5F6363"],
  ["--chrome-cobalt", "#1F55FF", "#1447E6"],
  ["--chrome-cobalt-text", "#7B9DFF", "#1240D0"],
  ["--chrome-enamel", "#E5372A", "#D42E1F"],
  ["--chrome-enamel-text", "#FF6B5E", "#B8261A"],
  ["--chrome-mint", "#3FBF8F", "#0A6A48"],
  ["--chrome-amber", "#E8A33A", "#8A5600"],
  ["--chrome-focus", "#4B78FF", "#1F4FE0"]
];
const shortNames = ["--bg", "--surface", "--line", "--text-2", "--cobalt", "--enamel", "--mint", "--amber", "--focus"];

const swatch = (background: string): CSSProperties => ({ width: 56, height: 20, borderRadius: 6, background, boxShadow: "inset 0 0 0 1px var(--chrome-line-2)" });
const well = (rim: string, extra?: string): CSSProperties => ({
  width: 56,
  height: 22,
  borderRadius: 8,
  border: "1px solid transparent",
  background: `var(--chrome-well) padding-box, var(${rim}) border-box`,
  boxShadow: extra ? `var(--chrome-well-shadow), ${extra}` : "var(--chrome-well-shadow)"
});
const pill = (shadow: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 56,
  height: 24,
  padding: 2,
  borderRadius: 999,
  border: "1px solid transparent",
  background: "var(--chrome-pill-inner) content-box, var(--chrome-pill-ring) padding-box, var(--chrome-pill-stroke) border-box",
  boxShadow: shadow,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  color: "var(--chrome-pill-text)"
});

const chromeTokens: { name: string; role: string; sample: CSSProperties; text?: string }[] = [
  { name: "--chrome-rim", role: "Chrome rim · inputs, wells, toggles", sample: swatch("var(--chrome-rim)") },
  { name: "--chrome-rim-hover", role: "Rim on hover", sample: swatch("var(--chrome-rim-hover)") },
  { name: "--chrome-rim-sm", role: "Small rim · checkbox, radio, 3:1", sample: swatch("var(--chrome-rim-sm)") },
  { name: "--chrome-rim-cobalt", role: "Cobalt rim · focus, checked, on", sample: swatch("var(--chrome-rim-cobalt)") },
  { name: "--chrome-well", role: "Recessed well fill", sample: swatch("var(--chrome-well)") },
  { name: "--chrome-well-shadow", role: "Well shadow · 20 px and up", sample: well("--chrome-rim") },
  {
    name: "--chrome-well-shadow-sm",
    role: "Well shadow · under 20 px",
    sample: { width: 16, height: 16, borderRadius: 5, border: "1px solid transparent", background: "var(--chrome-well) padding-box, var(--chrome-rim-sm) border-box", boxShadow: "var(--chrome-well-shadow-sm)" }
  },
  { name: "--chrome-halo", role: "Focus halo · 3 px", sample: well("--chrome-rim-cobalt", "var(--chrome-halo)") },
  { name: "--chrome-pill-stroke", role: "Small pill · stroke", sample: swatch("var(--chrome-pill-stroke)") },
  { name: "--chrome-pill-ring", role: "Small pill · ring", sample: swatch("var(--chrome-pill-ring)") },
  { name: "--chrome-pill-inner", role: "Small pill · core", sample: swatch("var(--chrome-pill-inner)") },
  { name: "--chrome-pill-text", role: "Small pill · label", sample: pill("none"), text: "Day" },
  { name: "--chrome-pill-shadow", role: "Small pill · shadow", sample: pill("var(--chrome-pill-shadow)") },
  {
    name: "--chrome-knob-shadow",
    role: "Bead shadow · switch knob",
    sample: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      border: "2px solid transparent",
      background: "radial-gradient(70% 60% at 36% 24%, rgba(255,255,255,.6), rgba(255,255,255,0) 70%) padding-box, linear-gradient(180deg, #D5D8D8, #818C8A) padding-box, linear-gradient(180deg, #F4F4F4, #565656 50%, #93B3AE) border-box",
      boxShadow: "var(--chrome-knob-shadow)"
    }
  }
];

const scale = [["eyebrow", "11"], ["hint", "12.5"], ["small", "13"], ["control", "13.5"], ["body", "14"], ["h3", "15"], ["lead", "18"], ["readout", "28–34"], ["h2", "36–56"], ["h1", "52–96"]];

const finishes: { finish: ButtonFinish | null; label: string; name: string; notes: string[] }[] = [
  { finish: "polished", label: "Deploy", name: "Polished", notes: ["seven-layer chrome build", "mint-tinted ring and glow", "one per panel"] },
  { finish: "smoked", label: "Open console", name: "Smoked", notes: ["same build in black chrome", "specular top-left", "hero action on Satin"] },
  { finish: "graphite", label: "Preview", name: "Graphite", notes: ["Ink #1C1C1F → #161618", "Satin #FBFBFB → #ECECEC", "everyday default"] },
  { finish: "cobalt", label: "Approve", name: "Cobalt", notes: ["same build, cobalt stops", "inner #4F7BFF → #1C44D6", "confirm only"] },
  { finish: "enamel", label: "Roll back", name: "Enamel", notes: ["same build, enamel stops", "inner #EC5548 → #B8241B", "destructive only"] },
  { finish: null, label: "Dismiss", name: "Ghost", notes: ["label only, no material", "5% tint on hover", "cancel, dismiss, toolbars"] }
];

const radii = [["5", "checkbox, kbd"], ["6", "tag"], ["8", "input"], ["12", "float"], ["14", "Ink card"], ["24", "Satin card"]];

const depth = [
  { name: "Well", note: "Recessed · inputs, toggles, trays", className: "fd-well" },
  { name: "Card", note: "7% hairline · 3.5% top light", className: "card" },
  { name: "Lit card", note: "Top-lit edge · once per screen", className: "card card-lit" },
  { name: "Floating", note: "Smoked stroke · menus, dialogs", className: "float" }
];

const motion = [
  ["Press", "100 ms · translateY(1px)"],
  ["Hover", "180 ms · inner pill +7%"],
  ["Rim and color", "150 ms · inputs, seg, nav"],
  ["Switch thumb", "250 ms · ease-out"],
  ["Overlay in", "240 ms · ease-out"],
  ["Reduced motion", "transitions off"]
];

/** The controls that read only the chrome tokens, live, in one theme. */
function LiveControls({ theme }: { theme: "ink" | "satin" }) {
  const name = theme === "ink" ? "Ink" : "Satin";
  return (
    <div className="chrome-root fd-live" data-chrome-theme={theme} role="group" aria-label={`${name} controls`}>
      <span className="eyebrow">{name}</span>
      <div className="fd-live__row">
        <RadioGroup.Root defaultValue="canary" aria-label={`Strategy (${name})`} className="fd-live__radios">
          <RadioGroup.Item value="canary">Canary</RadioGroup.Item>
          <RadioGroup.Item value="rolling">Rolling</RadioGroup.Item>
        </RadioGroup.Root>
        <Checkbox defaultChecked>Notify</Checkbox>
        <Checkbox>Pause</Checkbox>
        <Switch defaultChecked aria-label={`Auto-promote (${name})`} className="fd-live__switch" />
      </div>
      <div className="fd-live__row">
        <SegmentedControl
          aria-label={`Window (${name})`}
          defaultValue="day"
          items={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]}
        />
        <Slider defaultValue={[62]} max={100} aria-label={`Traffic share (${name})`} className="fd-live__slider" />
      </div>
      <div className="fd-live__fields">
        <TextField defaultValue="eu-west-1" aria-label={`Region (${name})`} />
        <TextField defaultValue="api-gateway" aria-label={`Service (${name})`} data-focus-visible="" />
      </div>
    </div>
  );
}

function ChromeSamples({ theme }: { theme: "ink" | "satin" }) {
  return (
    <div className={`chrome-root fd-samples fd-samples--${theme}`} data-chrome-theme={theme} aria-hidden="true">
      {chromeTokens.map((token) => (
        <div key={token.name} className="fd-samples__cell"><span style={token.sample}>{token.text}</span></div>
      ))}
    </div>
  );
}

export default function Foundations() {
  return (
    <div className="pg-foundations">
      <nav className="fd-top" aria-label="Site">
        <Link to="/" className="fd-top__brand" aria-label="Chrome UI home">
          <Logo />
          <span className="disp">CHROME</span>
        </Link>
        <div className="fd-top__links">
          <Button asChild finish="ghost" size="sm"><Link to="/foundations/buttons">Chrome buttons</Link></Button>
          <Button asChild finish="ghost" size="sm" trailingIcon={<Icon name="arrow-right" size={14} />}><Link to="/components">Docs</Link></Button>
        </div>
      </nav>

      <main id="main" className="fd-page">
        <header className="fd-head">
          <div className="fd-head__title">
            <span className="eyebrow">Foundations · Satin chrome</span>
            <h1 className="h1 chrome-text">Soft metal, hard rules.</h1>
          </div>
          <p className="lead">The metal is satin: a gradient-stroked frame, a bezel ring and a soft inner pill over a tinted glow. It ships in two themes, Ink and Satin, cut from the same stops. Graphite carries the interface; chrome marks the one action that matters.</p>
        </header>

        <section className="card fd-rules" aria-label="Rules">
          {rules.map((rule, i) => (
            <div className="fd-rule" key={i}>
              <span className="eyebrow">Rule {String(i + 1).padStart(2, "0")}</span>
              <span className="fd-rule__n" data-tone={rule.tone}>{rule.n}</span>
              <span className="t2 small">{rule.text}</span>
            </div>
          ))}
        </section>

        <div className="fd-two">
          <section className="card panel" id="color" aria-labelledby="fd-color">
            <div className="fd-panel-head"><h2 className="h3" id="fd-color">Color</h2><span className="eyebrow">Primitive</span></div>
            <div className="fd-stack10">
              <span className="eyebrow">Chrome · the seven-layer build</span>
              <Button asChild finish="polished" className="fd-build"><span aria-hidden="true" /></Button>
              <div className="mono t3 fd-build__stops">
                {build.map(([part, stops]) => <span key={part}>{part}<br />{stops}</span>)}
              </div>
            </div>
            {palettes.map((palette) => (
              <div className="fd-stack10" key={palette.label}>
                <span className="eyebrow">{palette.label}</span>
                <div className="fd-swatches">
                  {palette.swatches.map(([label, hex]) => (
                    <div className="sw" key={label}><i style={{ background: hex }} /><b>{label}</b><span>{hex}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="card panel fd-semantic" aria-labelledby="fd-semantic">
            <div className="fd-panel-head"><h2 className="h3" id="fd-semantic">Semantic tokens</h2><span className="eyebrow">Ink / Satin</span></div>
            <div className="fd-scroll" role="region" aria-label="Semantic tokens table" tabIndex={0}>
              <table className="fd-tokens">
                <thead><tr className="eyebrow"><th scope="col">Token</th><th scope="col">Ink</th><th scope="col">Satin</th></tr></thead>
                <tbody>
                  {tokens.map(([name, ink, satin]) => (
                    <tr key={name}>
                      <th scope="row" className="mono">{name}</th>
                      <td><span className="fd-chip" style={{ background: ink }} /><span className="mono t3">{ink}</span></td>
                      <td><span className="fd-chip" style={{ background: `linear-gradient(${satin}, ${satin}), #e1e2e2` }} /><span className="mono t3">{satin}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small t3 fd-note">
              These are the public names, set on every <span className="mono">.chrome-root</span>. The design files use the short forms:{" "}
              {shortNames.map((short, i) => (
                <Fragment key={short}><span className="mono fd-nowrap">{short}</span>{i < shortNames.length - 1 ? ", " : "."}</Fragment>
              ))}
            </p>
          </section>
        </div>

        <section className="card panel" aria-labelledby="fd-chrome">
          <div className="fd-panel-head"><h2 className="h3" id="fd-chrome">Chrome tokens</h2><span className="eyebrow">Material · --chrome-*</span></div>
          <div className="fd-chrome">
            <div className="fd-scroll" role="region" aria-label="Chrome tokens table" tabIndex={0}>
              <div className="fd-chrome__grid">
                <span className="eyebrow">Token</span>
                <span className="eyebrow fd-center">Ink</span>
                <span className="eyebrow fd-center">Satin</span>
                <ul className="fd-chrome__names">
                  {chromeTokens.map((token) => (
                    <li key={token.name}><span className="mono">{token.name}</span><span className="t3">{token.role}</span></li>
                  ))}
                </ul>
                <ChromeSamples theme="ink" />
                <ChromeSamples theme="satin" />
              </div>
            </div>
            <div className="fd-chrome__live">
              <span className="eyebrow">Read by the controls · live</span>
              <LiveControls theme="ink" />
              <LiveControls theme="satin" />
              <p className="small t3 fd-note">
                Input, checkbox, radio, switch, segmented and slider read only these tokens, so any <span className="mono">chrome-root</span> re-themes them. Radio (<span className="mono">RadioGroup</span>) is new: a recessed circle that takes a cobalt bead when checked.
              </p>
            </div>
          </div>
        </section>

        <section className="card panel fd-type" id="typography" aria-labelledby="fd-typography">
          <div className="fd-type__intro">
            <h2 className="h3" id="fd-typography">Typography</h2>
            <p className="t2 small">Oxanium is the Ink display voice and the wordmark, set in satin chrome type. Satin pages set headings in Plus Jakarta Sans 500. Plus Jakarta Sans runs the interface at 13–15 px with tabular numerals; JetBrains Mono is for code, IDs and eyebrows.</p>
            <div className="fd-stack10 fd-type__scale">
              <span className="eyebrow">Scale · px</span>
              <dl className="mono fd-scale">
                {scale.map(([role, px]) => <Fragment key={role}><dt className="t3">{role}</dt><dd className="num">{px}</dd></Fragment>)}
              </dl>
            </div>
          </div>
          <div className="fd-specimens">
            <div><span className="eyebrow">H1 · Oxanium 700 · 52–96</span><span className="disp chrome-text fd-sp-h1">Forged in chrome</span></div>
            <div><span className="eyebrow">H2 · Oxanium 700 · 36–56</span><span className="disp fd-sp-h2">Ship whole surfaces</span></div>
            <div><span className="eyebrow">Satin H2 · Jakarta 500 · 36–56</span><span className="fd-sp-satin">Built like the real thing</span></div>
            <div><span className="eyebrow">Readout · Jakarta 500 · 28–34</span><span className="num fd-sp-readout">31.6k <span className="t3">req/min</span></span></div>
            <div><span className="eyebrow">H3 · Jakarta 500 · 15</span><span className="h3">Deployments across five regions</span></div>
            <div><span className="eyebrow">Body · Jakarta 400 · 14</span><span className="t2 fd-sp-body">Roll traffic gradually and watch error budgets before promoting a release to every region.</span></div>
            <div><span className="eyebrow">Code · Mono 400 · 13</span><span className="code"><span className="t">&lt;Button</span> <span className="a">finish</span>=<span className="s">"polished"</span> <span className="t">/&gt;</span></span></div>
          </div>
        </section>

        <section className="card panel" aria-labelledby="fd-finishes">
          <div className="fd-panel-head"><h2 className="h3" id="fd-finishes">Finishes</h2><span className="eyebrow">finish prop · Button, IconButton</span></div>
          <div className="fd-finishes">
            {finishes.map((item) => (
              <div className="fd-finish" key={item.name}>
                {item.finish ? (
                  <Button asChild finish={item.finish} className="fd-finish__slab"><span aria-hidden="true" /></Button>
                ) : (
                  <span className="fd-finish__slab fd-finish__ghost" aria-hidden="true" />
                )}
                <Button finish={item.finish ?? "ghost"}>{item.label}</Button>
                <span className="h3">{item.name}</span>
                <span className="mono t3 fd-finish__notes">{item.notes.map((note, i) => <Fragment key={note}>{i ? <br /> : null}{note}</Fragment>)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="fd-three">
          <section className="card panel" aria-labelledby="fd-shape">
            <h2 className="h3" id="fd-shape">Shape</h2>
            <div className="fd-radii">
              {radii.map(([r, use]) => (
                <div key={r} className="fd-stack8">
                  <div className="fd-corner" style={{ borderTopLeftRadius: Number(r) }} />
                  <span className="mono fd-caption">{r}<br /><span className="t3">{use}</span></span>
                </div>
              ))}
            </div>
            <div className="fd-stack8">
              <div className="fd-sizes">
                <Button size="sm">30</Button>
                <Button>36</Button>
                <Button size="lg">44</Button>
                <Button size="xl">52</Button>
              </div>
              <span className="mono fd-caption">pill<br /><span className="t3">buttons, seg, switch, radio</span></span>
            </div>
          </section>

          <section className="card panel" aria-labelledby="fd-depth">
            <h2 className="h3" id="fd-depth">Depth</h2>
            <div className="fd-depth">
              {depth.map((level) => (
                <div className="fd-depth__row" key={level.name}>
                  <div className={`fd-depth__sample ${level.className}`} />
                  <div className="fd-stack2"><span className="h3">{level.name}</span><span className="small t3">{level.note}</span></div>
                </div>
              ))}
            </div>
          </section>

          <section className="card panel" aria-labelledby="fd-motion">
            <h2 className="h3" id="fd-motion">Motion</h2>
            <svg viewBox="0 0 300 110" className="fd-curve" role="img" aria-label="Ease-out curve cubic-bezier 0.2, 0.8, 0.2, 1">
              <path d="M0 109.5H300M0 .5H300" stroke="rgba(255,255,255,.07)" />
              <path d="M0 110 C60 22 60 0 300 0" fill="none" stroke="var(--chrome-cobalt-text)" strokeWidth="1.5" />
              <circle cx="0" cy="110" r="3.5" fill="#f4f4f5" />
              <circle cx="300" cy="0" r="3.5" fill="#f4f4f5" />
            </svg>
            <span className="mono t3 fd-curve__caption">ease-out · cubic-bezier(.2, .8, .2, 1)</span>
            <dl className="fd-motion">
              {motion.map(([what, how]) => <div key={what}><dt className="t2">{what}</dt><dd className="mono">{how}</dd></div>)}
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}
