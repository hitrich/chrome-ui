import { Badge, Button, EmptyState, KeyHint, SearchField, SegmentedControl } from "@loreanai/chrome-ui";
import { useEffect, useRef, useState, type JSX, type RefObject } from "react";
import { Link, useLocation } from "react-router-dom";
import { DocsShell } from "../components/DocsShell";
import { baseComponents, baseSections, type BaseComponentEntry, type BaseSectionId } from "../data";
import { baseDemos } from "./base/demos";
import "./BaseCatalog.css";

const subtitles: Record<BaseSectionId, string> = {
  inputs: "Fields, choices and actions",
  navigation: "Moving between views and levels",
  feedback: "State, progress and loading",
  overlays: "Layers drawn above the page",
  data: "Records, people and structure"
};

const groups = [
  { value: "all", label: "All" },
  { value: "inputs", label: "Inputs" },
  { value: "navigation", label: "Navigation" },
  { value: "feedback", label: "Feedback" },
  { value: "overlays", label: "Overlays" },
  { value: "data", label: "Data" }
];

/** A catalog card: recessed preview stage, then the name (a stretched link to the page) and the blurb. */
export function BaseTile({ entry, demo: Demo }: { entry: BaseComponentEntry; demo?: () => JSX.Element }) {
  return (
    <article className="card tile">
      <div className="pv">{Demo ? <Demo /> : null}</div>
      <div className="meta">
        <h3 className="h3">
          <Link to={`/components/${entry.slug}`}>{entry.name}</Link>
          {entry.isNew ? <Badge tone="new">New</Badge> : null}
        </h3>
        <Blurb text={entry.blurb} />
      </div>
    </article>
  );
}

/** A tile description; hyphenated words never break at the hyphen ("mirror-finish"). */
export function Blurb({ text }: { text: string }) {
  return <p>{text.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} className="nowrap">{part}</span> : part))}</p>;
}

/** "/" focuses the page's filter field, unless the reader is already typing somewhere. */
export function useSlashFocus(field: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      field.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [field]);
}

export default function Page() {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const { hash } = useLocation();
  useSlashFocus(field);

  // a sidebar link to #section shows every card again, so the anchor exists
  const [seenHash, setSeenHash] = useState(hash);
  if (hash !== seenHash) {
    setSeenHash(hash);
    if (hash) {
      setGroup("all");
      setQuery("");
    }
  }

  const needle = query.trim().toLowerCase();
  const visible = baseSections
    .filter((section) => group === "all" || section.id === group)
    .map((section) => ({
      section,
      cards: baseComponents.filter((entry) => entry.section === section.id && entry.name.toLowerCase().includes(needle))
    }))
    .filter((row) => row.cards.length);
  const shown = visible.reduce((sum, row) => sum + row.cards.length, 0);

  return (
    <DocsShell className="pg-base">
      <header className="pb-hd">
        <h1 className="h1">Base components</h1>
        <p className="lead">The 54 primitives every block and template is built from, each shown in a real state.</p>
      </header>

      <div className="pb-filters">
        <div className="pb-scroll">
          <SegmentedControl aria-label="Show group" items={groups} value={group} onValueChange={setGroup} />
        </div>
        <SearchField
          ref={field}
          className="pb-filter"
          aria-label="Filter components by name"
          placeholder="Filter by name"
          value={query}
          onValueChange={setQuery}
          shortcut={<KeyHint keys={["/"]} />}
        />
      </div>
      <p className="chrome-visually-hidden" aria-live="polite">{needle || group !== "all" ? `${shown} of 54 components shown` : ""}</p>

      {visible.map(({ section, cards }) => (
        <section key={section.id} id={section.id} aria-labelledby={`h-${section.id}`}>
          <div className="pb-sec">
            <h2 className="pb-sh" id={`h-${section.id}`}>
              {section.title} <span className="num t3">{cards.length}</span>
            </h2>
            <span className="small t3">{subtitles[section.id]}</span>
          </div>
          <div className="pb-grid">
            {cards.map((entry) => <BaseTile key={entry.slug} entry={entry} demo={baseDemos[entry.slug]} />)}
          </div>
        </section>
      ))}

      {shown ? null : (
        <EmptyState
          className="pb-empty"
          title="No components match"
          description={needle ? `Nothing in ${group === "all" ? "the catalog" : `${groups.find((g) => g.value === group)?.label}`} is called “${query.trim()}”.` : "This group is empty."}
          action={<Button size="sm" onClick={() => { setGroup("all"); setQuery(""); field.current?.focus(); }}>Clear filters</Button>}
        />
      )}
    </DocsShell>
  );
}
