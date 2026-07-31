import { useParams } from "react-router-dom";
import { DocsRail } from "../components/DocsRail";
import { Header } from "../components/Header";
import { foundationDocs } from "../data";

function FoundationContent({ slug }: { slug: string }) {
  if (slug === "color") {
    return (
      <>
        <div className="token-band color-band">
          <div data-color="silver"><span>Silver</span><code>#D9DDE4</code></div>
          <div data-color="ink"><span>Ink</span><code>#050608</code></div>
          <div data-color="cobalt"><span>Cobalt</span><code>#1258FF</code></div>
          <div data-color="enamel"><span>Enamel</span><code>#F04438</code></div>
          <div data-color="ivory"><span>Ivory</span><code>#FFF5E6</code></div>
        </div>
        <div className="foundation-rules">
          <article><span>Focus + progress</span><h2>Cobalt moves forward.</h2><p>Use cobalt for keyboard focus, selection, active tabs, and progress—not atmosphere.</p></article>
          <article><span>Live + destructive</span><h2>Enamel signals consequence.</h2><p>Reserve red reflections for record, live state, removal, and destructive confirmation.</p></article>
        </div>
      </>
    );
  }
  if (slug === "typography") {
    return (
      <div className="type-specimen">
        <section><span>Display / Space Grotesk</span><p>Reflected<br />Color</p><code>72 / 0.94 / −0.045em</code></section>
        <section><span>Interface / Space Grotesk</span><h2>Violet Transmission</h2><p>Dense controls stay readable because every label has an explicit size and rhythm.</p></section>
        <section><span>Technical / JetBrains Mono</span><code>02:14.08 — CHANNEL 03 — +2.4 dB</code></section>
      </div>
    );
  }
  if (slug === "motion") {
    return (
      <div className="motion-specimen">
        <div className="motion-rail" /><div><span>90ms press · 240ms settle</span><h2>Response is instant. Release is calm.</h2><p>Pointer-tracked light follows intent, controls compress on contact, and overlays arrive from their spatial source.</p></div>
      </div>
    );
  }
  if (slug === "accessibility") {
    return (
      <div className="foundation-checklist">
        {[
          ["Keyboard", "Every control exposes visible cobalt focus and predictable order."],
          ["Screen readers", "Compound controls retain native names, roles, state, and relationships."],
          ["Motion", "System preference or provider state removes spatial transitions."],
          ["Forced colors", "Metal falls back to platform colors without hiding control boundaries."],
          ["Touch", "Mobile actions preserve a minimum 44px target."]
        ].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}
      </div>
    );
  }
  return (
    <div className="boundary-diagram">
      <div><span>Graphite</span><strong>Workload</strong><p>Navigation, tables, canvases, fields, and passive regions.</p></div>
      <div><span>Chrome edge</span><strong>Selection</strong><p>Focus, active rows, fader handles, and important boundaries.</p></div>
      <div><span>Full chrome</span><strong>Decision</strong><p>Primary actions and singular physical controls only.</p></div>
    </div>
  );
}

export function Foundations() {
  const { slug = "color" } = useParams();
  const item = foundationDocs.find((foundation) => foundation.slug === slug) ?? foundationDocs[0];
  return (
    <div className="docs-page">
      <Header showThemeToggle />
      <div className="docs-layout docs-layout--foundation">
        <DocsRail />
        <main className="foundation-page">
          <header><h1>{item.title}</h1><p>{item.description}</p></header>
          <FoundationContent slug={item.slug} />
        </main>
      </div>
    </div>
  );
}
