import { Badge, Button, IconButton, SegmentedControl, Slider, Switch, type ButtonFinish, type ButtonSize } from "@loreanai/chrome-ui";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import "./ChromeButtons.css";

/* Chrome buttons (Satin): the seven-layer build as an explainer, the range of finishes, sizes and shapes, and parts in use. */

const glyph = (d: string, size: number, strokeWidth = 2) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: size, height: size, strokeWidth }}>
    <path d={d} />
  </svg>
);
const fill = (d: string, size: number, color: string) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={d} fill={color} /></svg>
);
const PLAY = "M7 4.5v15l12-7.5z";
const PAUSE = "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z";
const ARROW = "M7 17 17 7M9 7h8v8";

/** 64 polished spokes around the pivot, longer on three lobes. */
const spokes: CSSProperties[] = Array.from({ length: 64 }, (_, k) => {
  const a = (k / 64) * 360;
  const t = (a * Math.PI) / 180;
  const len = Math.round(68 + 30 * (0.5 + 0.5 * Math.cos(3 * t + 0.5)) + 6 * Math.sin(5 * t));
  const reach = 58 + len;
  return { height: len, marginTop: -reach, transformOrigin: `50% ${reach}px`, transform: `rotate(${a.toFixed(2)}deg)` };
});

/* ---------------------------------------------------------------- the build: layers 1–6 are drawn statically */

const STROKE = "linear-gradient(180deg, #C9C9C9, #686A69 50%, #ABC9C4)";
const RING = "linear-gradient(180deg, #F4F4F4, #565656 50%, #93B3AE)";
const label = (style?: CSSProperties) => <span className="cb-demo__label" style={style}>Generate</span>;
const steps: { caption: ReactNode; stops?: string[]; demo: ReactNode }[] = [
  { caption: "A fully rounded pill frame with a 1 px stroke.", demo: <div className="cb-demo" style={{ border: "1px solid #8a8c8c" }} /> },
  {
    caption: "An inner pill inset 3–4 px. Label centred in Plus Jakarta Sans Bold.",
    demo: <div className="cb-demo" style={{ border: "1px solid #8a8c8c", color: "#8a8c8c" }}><span className="cb-demo__inner" style={{ border: "1px solid #8a8c8c" }} />{label()}</div>
  },
  {
    caption: "A vertical gradient on the stroke.",
    stops: ["C9C9C9", "686A69", "ABC9C4"],
    demo: (
      <div className="cb-demo" style={{ border: "1px solid transparent", background: `linear-gradient(#e6e7e7, #e6e7e7) padding-box, ${STROKE} border-box`, color: "#8a8c8c" }}>
        <span className="cb-demo__inner" style={{ border: "1px solid #b4b6b6" }} />{label()}
      </div>
    )
  },
  {
    caption: "A vertical gradient on the frame fill. It reads as the bezel ring.",
    stops: ["F4F4F4", "565656", "93B3AE"],
    demo: (
      <div className="cb-demo" style={{ border: "1px solid transparent", background: `${RING} padding-box, ${STROKE} border-box`, color: "#8a8c8c" }}>
        <span className="cb-demo__inner" style={{ background: "#e6e7e7" }} />{label()}
      </div>
    )
  },
  {
    caption: "A vertical gradient on the inner pill.",
    stops: ["D5D8D8", "818C8A"],
    demo: (
      <div className="cb-demo" style={{ border: "1px solid transparent", background: `${RING} padding-box, ${STROKE} border-box`, color: "#8a8c8c" }}>
        <span className="cb-demo__inner" style={{ background: "linear-gradient(180deg, #D5D8D8, #818C8A)" }} />{label()}
      </div>
    )
  },
  {
    caption: "A vertical gradient on the label, for contrast.",
    stops: ["252424", "3C3C3C"],
    demo: (
      <div className="cb-demo" style={{ border: "1px solid transparent", background: `${RING} padding-box, ${STROKE} border-box` }}>
        <span className="cb-demo__inner" style={{ background: "linear-gradient(180deg, #D5D8D8, #818C8A)" }} />
        {label({ background: "linear-gradient(180deg, #252424, #3C3C3C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" })}
      </div>
    )
  }
];

function Stops({ stops }: { stops: string[] }) {
  return (
    <div className="hex">
      {stops.map((hex) => <span key={hex}><i style={{ background: `#${hex}` }} />{hex}</span>)}
    </div>
  );
}

const range: { finish: ButtonFinish; label: string }[] = [
  { finish: "polished", label: "Deploy" },
  { finish: "smoked", label: "Open console" },
  { finish: "cobalt", label: "Approve" },
  { finish: "enamel", label: "Roll back" },
  { finish: "graphite", label: "Preview" },
  { finish: "ghost", label: "Cancel" }
];
const sizes: { size: ButtonSize; note: string }[] = [
  { size: "sm", note: "sm · 30" },
  { size: "md", note: "md · 36" },
  { size: "lg", note: "lg · 44" },
  { size: "xl", note: "xl · 52" }
];

/* ---------------------------------------------------------------- parts in use */

/** Regions done → share of traffic shifted. */
const rollout = [0, 14, 38, 62, 81, 100];

function ReleasePlayer() {
  const [done, setDone] = useState(3);
  const [paused, setPaused] = useState(false);
  const pct = rollout[done] ?? 0;
  return (
    <div className="cb-player">
      <div className="cb-player__disc" aria-hidden="true" />
      <div className="cb-player__title">
        <span>Release</span>
        <h3>v4.18.0 · {done === 5 ? "rolled out" : paused ? "paused" : "rolling out"}</h3>
      </div>
      <div className="cb-player__progress">
        <div className="cb-player__track" role="progressbar" aria-label="Rollout" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <div className="cb-player__meta"><span>{done} of 5 regions</span><span>{pct}%</span></div>
      </div>
      <div className="cb-player__transport">
        <IconButton finish="smoked" size="lg" aria-label="Previous step" disabled={done === 0} onClick={() => setDone((d) => d - 1)}>{fill("M17 5v14L7 12z M5 5h2v14H5z", 16, "#f4f4f5")}</IconButton>
        <IconButton finish="polished" className="cb-player__play" aria-label={paused ? "Resume rollout" : "Pause rollout"} onClick={() => setPaused((p) => !p)}>
          {fill(paused ? PLAY : PAUSE, 18, "#2b2a2a")}
        </IconButton>
        <IconButton finish="smoked" size="lg" aria-label="Next step" disabled={done === 5} onClick={() => setDone((d) => d + 1)}>{fill("M7 5v14l10-7z M17 5h2v14h-2z", 16, "#f4f4f5")}</IconButton>
      </div>
    </div>
  );
}

function DeploySettings() {
  const [shift, setShift] = useState(64);
  const [deploying, setDeploying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const deploy = () => {
    setDeploying(true);
    timer.current = setTimeout(() => setDeploying(false), 1600);
  };
  return (
    <div className="tile cb-settings">
      <div className="cb-settings__head"><h3>Deploy settings</h3><span className="kc cb-settings__kc" aria-hidden="true">⌘</span></div>
      <div className="cb-settings__rows">
        {[
          { label: "Auto-rollback", on: true },
          { label: "Page on-call", on: true },
          { label: "Quiet hours", on: false }
        ].map((row) => (
          <div className="cb-settings__row" key={row.label}><span>{row.label}</span><Switch aria-label={row.label} defaultChecked={row.on} /></div>
        ))}
      </div>
      <div className="cb-settings__shift">
        <span className="cb-settings__label"><span id="cb-shift">Traffic shift</span><span className="cb-settings__value">{shift}%</span></span>
        <Slider aria-labelledby="cb-shift" value={[shift]} max={100} step={1} onValueChange={(v) => setShift(v[0] ?? 0)} />
      </div>
      <div className="cb-settings__strategy">
        <span id="cb-strategy">Strategy</span>
        <SegmentedControl
          aria-labelledby="cb-strategy"
          defaultValue="rolling"
          items={[{ value: "canary", label: "Canary" }, { value: "rolling", label: "Rolling" }, { value: "blue-green", label: "Blue-green" }]}
        />
      </div>
      <Button finish="polished" size="xl" className="cb-settings__deploy" loading={deploying} onClick={deploy}>Deploy</Button>
      <span className="cb-sr" role="status">{deploying ? "Deploying" : ""}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function ChromeButtons() {
  const [previewing, setPreviewing] = useState(false);
  const [running, setRunning] = useState(false);
  return (
    <div className="pg-buttons">
      <nav className="cb-top" aria-label="Site">
        <Link to="/" className="cb-top__brand" aria-label="Chrome UI home">
          <Logo />
          <span className="disp">CHROME</span>
        </Link>
        <div className="cb-top__links">
          <Button asChild finish="ghost" size="sm"><Link to="/foundations">Foundations</Link></Button>
          <Button asChild finish="ghost" size="sm" trailingIcon={<Icon name="arrow-right" size={14} />}><Link to="/components/button">Button docs</Link></Button>
        </div>
      </nav>

      <main id="main" className="cb-page">
        <section className="cb-hero" aria-labelledby="cb-title">
          <div className="cb-hero__copy">
            <span className="eyebrow">Finishes · Chrome</span>
            <h1 id="cb-title">Chrome buttons, built like the real thing.</h1>
            <p>Seven layers, one build. A pill frame with a gradient stroke, a bezel ring, a satin inner pill and a tinted glow underneath. Every chrome finish in Chrome UI is made this way.</p>
            <div className="cb-hero__install"><Badge>v1.0</Badge><span className="mono">npm i @loreanai/chrome-ui</span></div>
          </div>
          <div className="cb-hero__parts">
            <div className="tray">
              <Button asChild finish="smoked" className="chrome-icon-button cb-58"><Link to="/" aria-label="Chrome UI home"><span className="disp cb-hero__c">C</span></Link></Button>
              <span className="datechip">Tue<br />10</span>
              <Button asChild finish="polished" className="chrome-icon-button cb-58"><Link to="/components/button" aria-label="Open the Button docs">{glyph(ARROW, 22)}</Link></Button>
            </div>
            <div className="cb-hero__row">
              <div className="tray cb-hero__player">
                <span className="cb-hero__dot" aria-hidden="true" />
                <Button finish="polished" size="lg" className="cb-hero__preview" aria-pressed={previewing} onClick={() => setPreviewing((on) => !on)}>
                  <span className="cb-hero__play" aria-hidden="true">{fill(previewing ? PAUSE : PLAY, 12, "#e8e9e9")}</span>Preview
                </Button>
              </div>
              <IconButton finish="polished" className="cb-64" aria-label="Comment">
                {glyph("M12 3.5c4.7 0 8.5 3.4 8.5 7.6S16.7 18.7 12 18.7c-1 0-2-.1-2.9-.4L4 20.5l1.4-4.1A7.2 7.2 0 0 1 3.5 11.1C3.5 6.9 7.3 3.5 12 3.5Z", 24)}
              </IconButton>
            </div>
            <Button asChild finish="polished" size="xl" className="cb-hero__design"><Link to="/foundations">Design</Link></Button>
          </div>
        </section>

        <section className="cb-section" aria-labelledby="cb-build">
          <div className="cb-head"><h2 id="cb-build">The build</h2><span className="eyebrow">Seven layers · front to back</span></div>
          <div className="cb-build">
            {steps.map((step, i) => (
              <div className="tile" key={i}>
                <span className="stepn">{i + 1}</span>
                <div className="stage" aria-hidden="true">{step.demo}</div>
                <p className="cap">{step.caption}</p>
                {step.stops ? <Stops stops={step.stops} /> : null}
              </div>
            ))}
            <div className="tile">
              <span className="stepn">7</span>
              <div className="stage"><Button finish="polished" size="xl" className="cb-generate">Generate</Button></div>
              <p className="cap">A tinted copy of the part, offset below at 50% and blurred into the glow.</p>
              <Stops stops={["5F837D", "ABC9C4"]} />
            </div>
            <div className="tile cb-tint">
              <span className="stepn" aria-hidden="true">{glyph("m5 12 5 5 9-10", 16)}</span>
              <div className="stage cb-tint__stage">
                <Button finish="polished" size="lg" className="tint-rose">Generate</Button>
                <Button finish="polished" size="lg" className="tint-cobalt">Generate</Button>
              </div>
              <p className="cap">Swap the tinted stops for new palettes. The rules stay the same.</p>
            </div>
          </div>
        </section>

        <section className="cb-section" aria-labelledby="cb-range">
          <div className="cb-head"><h2 id="cb-range">The range</h2><span className="eyebrow">Six finishes · four sizes</span></div>
          <div className="cb-range">
            <div className="tile cb-range__finishes">
              <div className="cb-range__intro">
                <span className="eyebrow">Finishes</span>
                <span>Polished, smoked, cobalt and enamel share the build. Graphite and ghost stay flat for everyday actions.</span>
              </div>
              <div className="cb-range__grid">
                {range.map((item) => (
                  <div className="fin" key={item.finish}><Button finish={item.finish} size="lg">{item.label}</Button><span className="mono">{item.finish}</span></div>
                ))}
              </div>
            </div>
            <div className="tile cb-range__tile">
              <span className="eyebrow">Sizes</span>
              <div className="cb-range__row">
                {sizes.map((item) => (
                  <div className="fin" key={item.size}><Button finish="polished" size={item.size}>Deploy</Button><span className="mono">{item.note}</span></div>
                ))}
              </div>
              <p className="cap cb-left">The inner pill sits 3 px in, and 4 px in from xl up.</p>
            </div>
            <div className="tile cb-range__tile">
              <span className="eyebrow">Shapes</span>
              <div className="cb-range__row">
                <div className="fin"><IconButton finish="polished" className="cb-64" aria-label="Add">{glyph("M12 5v14M5 12h14", 22)}</IconButton><span className="mono">polished · 64</span></div>
                <div className="fin"><IconButton finish="smoked" className="cb-64" aria-label="Play">{fill(PLAY, 18, "#f4f4f5")}</IconButton><span className="mono">smoked · 64</span></div>
                <div className="fin"><IconButton finish="polished" size="lg" aria-label="Open">{glyph(ARROW, 16)}</IconButton><span className="mono">polished · 44</span></div>
                <div className="fin">
                  <IconButton finish="polished" size="sm" className="tint-cobalt" aria-label="Center view">
                    <svg className="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: 14, height: 14, strokeWidth: 2 }}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>
                  </IconButton>
                  <span className="mono">cobalt tint · 30</span>
                </div>
              </div>
              <p className="cap cb-left">Round parts use the same build at any diameter.</p>
            </div>
          </div>
        </section>

        <section className="cb-section" aria-labelledby="cb-use">
          <div className="cb-head"><h2 id="cb-use">In use</h2><span className="eyebrow">Graphic parts</span></div>
          <div className="cb-use">
            <div className="cb-spokes">
              <span className="kc" aria-hidden="true">⌘</span>
              <div className="cb-spokes__pivot" aria-hidden="true">
                {spokes.map((style, i) => <span key={i} className="spoke" style={style} />)}
              </div>
              <div className="cb-spokes__start">
                <Button finish="polished" size="xl" aria-pressed={running} onClick={() => setRunning((on) => !on)}>{running ? "Stop" : "Start"}</Button>
              </div>
            </div>
            <ReleasePlayer />
            <DeploySettings />
          </div>
        </section>
      </main>
    </div>
  );
}
