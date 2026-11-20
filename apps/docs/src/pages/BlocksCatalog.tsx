import { ChromeProvider, SegmentedControl, useChrome } from "@loreanai/chrome-ui";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DocsShell } from "../components/DocsShell";
import { blocks } from "../data";
import { blockPreviews } from "./blocks/Blocks";
import "./BlocksCatalog.css";

const filters = ["All", "App shell", "Data", "Forms", "Agents"].map((value) => ({ value, label: value }));
const themes = [{ value: "satin", label: "Satin" }, { value: "ink", label: "Ink" }];

/** /components/blocks — the twelve blocks as live compositions, filterable, with the preview stages on their own theme. */
export default function BlocksCatalog() {
  const { theme } = useChrome();
  const { hash } = useLocation();
  const [filter, setFilter] = useState("All");
  const [preview, setPreview] = useState<string>();
  const stageTheme = preview === "ink" || (!preview && theme === "ink") ? "ink" : "satin";

  // a sidebar link to a block the current filter hides shows them all again
  const [seenHash, setSeenHash] = useState(hash);
  if (hash !== seenHash) {
    setSeenHash(hash);
    const target = blocks.find((entry) => `#${entry.slug}` === hash);
    if (target && filter !== "All" && filter !== target.category) setFilter("All");
  }

  return (
    <DocsShell className="pg-blocks">
      <header className="pg-blocks__hd">
        <h1 className="h1">Blocks</h1>
        <p className="lead">Twelve ready-made sections assembled from base components, shown with live Orbital Ops data.</p>
      </header>

      <div className="pg-blocks__bar">
        <div className="pg-blocks__scroll">
          <SegmentedControl aria-label="Show category" items={filters} value={filter} onValueChange={setFilter} />
        </div>
        <div className="pg-blocks__theme">
          <span className="small t3" aria-hidden="true">Preview</span>
          <SegmentedControl aria-label="Preview theme" items={themes} value={stageTheme} onValueChange={setPreview} />
        </div>
      </div>

      <div className="pg-blocks__grid">
        {blocks
          .filter((entry) => filter === "All" || entry.category === filter)
          .map((entry) => {
            const Preview = blockPreviews[entry.slug]!;
            return (
              <article key={entry.slug} id={entry.slug} className="card pg-blocks__tile" aria-labelledby={`${entry.slug}-title`}>
                <ChromeProvider theme={stageTheme} className="pg-blocks__pv" data-block={entry.slug}>
                  <Preview />
                </ChromeProvider>
                <div className="pg-blocks__meta">
                  <h2 className="h3" id={`${entry.slug}-title`}>
                    <Link to={`#${entry.slug}`}>{entry.name}</Link>
                    <span className="pg-blocks__cat">{entry.category}</span>
                  </h2>
                  <p>{entry.blurb}</p>
                </div>
              </article>
            );
          })}
      </div>
    </DocsShell>
  );
}
