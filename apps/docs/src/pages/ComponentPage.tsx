import {
  Badge,
  Button,
  KeyHint,
  SegmentedControl,
  Switch,
  Table,
  type ButtonFinish,
  type ButtonSize
} from "@loreanai/chrome-ui";
import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { DocsShell, type TocItem } from "../components/DocsShell";
import { Icon } from "../components/Icon";
import { findBaseComponent, type BaseComponentEntry } from "../data";
import { baseDemos } from "./base/demos";
import { componentDocs } from "./docs";
import type { A11yNote, ComponentDoc, DocSection, PropGroup } from "./docs/types";
import "./ComponentPage.css";

const INSTALL = "npm i @loreanai/chrome-ui";

/* ---------- text helpers ---------- */

/** `backticks` in doc strings render in the mono face; short tokens never break at their hyphens. */
function mono(text: string): ReactNode {
  return text.split("`").map((part, index) =>
    index % 2 ? <span key={index} className={part.length > 28 ? "mono" : "mono doc-nw"}>{part}</span> : part
  );
}

// comments · strings · JSX tag opens/closes · keywords · JSX attribute names
const TOKENS =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|((?<![\w$])<\/?[A-Za-z][\w.]*|(?<!=)\/?>)|\b(import|from|export|function|return|const|let|type|default|true|false|null)\b|([A-Za-z_][\w-]*)(?==["{])/g;

/** Splits a TSX snippet into the `.code` token spans (lossless: every character is kept). */
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKENS)) {
    if (match.index > last) out.push(code.slice(last, match.index));
    const kind = match[1] ? "c" : match[2] ? "s" : match[3] ? "t" : match[4] ? "k" : "a";
    out.push(<span key={match.index} className={kind}>{match[0]}</span>);
    last = match.index + match[0].length;
  }
  out.push(code.slice(last));
  return out;
}

/* ---------- copy ---------- */

type CopyState = "idle" | "copied" | "failed";

/** Clipboard API first; a hidden textarea for insecure contexts (the docs also run on a LAN address). */
function useCopy() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (text: string) => {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.append(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };
  return [state, copy] as const;
}

function CopyButton({ text, what }: { text: string; what: string }) {
  const [state, copy] = useCopy();
  return (
    <>
      <Button finish="ghost" size="sm" data-copy={state} onClick={() => copy(text)}>
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
        <span className="chrome-visually-hidden"> {what}</span>
      </Button>
      <span className="chrome-visually-hidden" role="status">
        {state === "copied" ? `${what} copied to the clipboard` : ""}
      </span>
    </>
  );
}

/** Code always sits on a dark panel, so on Satin it is an Ink island. */
function Ink({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`chrome-root ${className}`} data-chrome-theme="ink">
      {children}
    </div>
  );
}

/* ---------- preview ---------- */

const views = [
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" }
];

function PreviewCard({ code, stage, controls, children }: { code: string; stage?: CSSProperties; controls?: ReactNode; children: ReactNode }) {
  const [view, setView] = useState("preview");
  return (
    <section id="preview" className="card doc-preview" aria-label="Preview">
      <div className="doc-preview__bar">
        <SegmentedControl aria-label="Show preview or code" items={views} value={view} onValueChange={setView} />
        {view === "code" ? <CopyButton text={code} what="code" /> : null}
      </div>
      {/* the preview stays mounted while the code shows, so a demo keeps its state */}
      <div className="doc-stage dots doc-stage--preview" style={stage} hidden={view !== "preview"}>
        {children}
      </div>
      {view === "code" ? (
        <Ink className="doc-codeview">
          <pre className="code" tabIndex={0} aria-label="Example code">
            {highlight(code)}
          </pre>
        </Ink>
      ) : null}
      {controls}
    </section>
  );
}

const finishes: readonly ButtonFinish[] = ["polished", "smoked", "cobalt", "enamel", "graphite", "ghost"];
const sizes: readonly ButtonSize[] = ["sm", "md", "lg", "xl"];
const capitalize = (word: string) => word[0]!.toUpperCase() + word.slice(1);

function buttonCode(finish: ButtonFinish, size: ButtonSize, loading: boolean, disabled: boolean) {
  const flags = `${loading ? " loading" : ""}${disabled ? " disabled" : ""}`;
  return `import { Button } from "@loreanai/chrome-ui";
import { ArrowRight } from "./icons";

<Button finish="${finish}" size="${size}"${flags} trailingIcon={<ArrowRight />}>
  Deploy to production
</Button>`;
}

function LabelledSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  const id = useId();
  return (
    <span className="doc-control doc-control--switch t2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

/** Button's preview: finish, size, loading and disabled drive the live part and its code. */
function ButtonPreview() {
  const [finish, setFinish] = useState<ButtonFinish>("polished");
  const [size, setSize] = useState<ButtonSize>("xl");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const controls = (
    <div className="doc-preview__controls small">
      <span className="doc-control">
        <span className="t3" aria-hidden="true">Finish</span>
        <SegmentedControl
          aria-label="Finish"
          items={finishes.map((value) => ({ value, label: capitalize(value) }))}
          value={finish}
          onValueChange={(value) => setFinish(value as ButtonFinish)}
        />
      </span>
      <span className="doc-control">
        <span className="t3" aria-hidden="true">Size</span>
        <SegmentedControl
          aria-label="Size"
          items={sizes.map((value) => ({ value, label: value }))}
          value={size}
          onValueChange={(value) => setSize(value as ButtonSize)}
        />
      </span>
      <LabelledSwitch label="Loading" checked={loading} onChange={setLoading} />
      <LabelledSwitch label="Disabled" checked={disabled} onChange={setDisabled} />
    </div>
  );
  return (
    <PreviewCard code={buttonCode(finish, size, loading, disabled)} controls={controls}>
      <Button finish={finish} size={size} loading={loading} disabled={disabled} trailingIcon={<Icon name="arrow-right" />}>
        Deploy to production
      </Button>
    </PreviewCard>
  );
}

/* ---------- sections ---------- */

function Installation({ entry, doc }: { entry: BaseComponentEntry; doc: ComponentDoc }) {
  const importLine = `import { ${doc.imports.join(", ")} } from "@loreanai/chrome-ui";`;
  return (
    <section id="installation" className="doc-sec">
      <h2>Installation</h2>
      <Ink className="card doc-line">
        <span className="code">
          <span className="t3">$</span> {INSTALL}
        </span>
        <CopyButton text={INSTALL} what="install command" />
      </Ink>
      {doc.installFile ? (
        <Ink className="card doc-file">
          <div className="doc-file__head">
            <span className="mono t3">{doc.installFile.filename}</span>
            <CopyButton text={doc.installFile.code} what={doc.installFile.filename} />
          </div>
          <pre className="code" tabIndex={0} aria-label={doc.installFile.filename}>
            {highlight(doc.installFile.code)}
          </pre>
        </Ink>
      ) : (
        <Ink className="card doc-line">
          <span className="code doc-line__code">{highlight(importLine)}</span>
          <CopyButton text={importLine} what={`${entry.name} import`} />
        </Ink>
      )}
    </section>
  );
}

const CHECK = "m5 12 5 5 9-10";
const CROSS = "M6 6l12 12M18 6 6 18";

function Verdict({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="doc-verdict">
      <svg className={ok ? "i doc-verdict__do" : "i doc-verdict__dont"} viewBox="0 0 24 24" aria-hidden="true">
        <path d={ok ? CHECK : CROSS} />
      </svg>
      <span className="small">
        <strong>{ok ? "Do" : "Don’t"}</strong> <span className="t2">{mono(text)}</span>
      </span>
    </div>
  );
}

function Section({ section }: { section: DocSection }) {
  if (section.kind === "usage") {
    return (
      <section id={section.id} className="doc-sec">
        <h2>{section.title}</h2>
        <div className="doc-usage">
          {[section.do, section.dont].map((side, index) => (
            <div className="card doc-usage__card" key={index}>
              <div className="doc-stage doc-usage__stage">{side.node}</div>
              <Verdict ok={index === 0} text={side.text} />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section id={section.id} className="doc-sec">
      <h2>{section.title}</h2>
      {section.text ? <p className="t2">{mono(section.text)}</p> : null}
      <div className="doc-stage dots" style={section.style}>
        {section.samples.map((sample) => (
          <div className="doc-cap" key={sample.label}>
            {sample.node}
            <span className="mono">{sample.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Types break only after " |", after a comma or before "=>", so union members and parameters stay whole. */
function TypeCell({ type }: { type: string }) {
  return (
    <td className="mono doc-props__type">
      {type.split(/(?<=\|) |(?<=,) | (?==>)/).map((part, index) => (
        <Fragment key={index}>
          {index ? " " : null}
          <span>{part}</span>
        </Fragment>
      ))}
    </td>
  );
}

function PropsTables({ name, groups }: { name: string; groups: readonly PropGroup[] }) {
  return (
    <section id="props" className="doc-sec">
      <h2>Props</h2>
      {groups.map((group) => (
        <div className="doc-props" key={group.part ?? name}>
          {group.part || group.extends ? (
            <p className="doc-props__head">
              {group.part ? <span className="mono doc-props__part">{group.part}</span> : null}
              {group.extends ? <span className="t2 small">{mono(group.extends)}</span> : null}
            </p>
          ) : null}
          {group.rows.length ? (
            <div className="card doc-props__card">
              <Table className="doc-props__table" aria-label={`${group.part ?? name} props`}>
                <colgroup>
                  <col style={{ width: 128 }} />
                  <col />
                  <col style={{ width: 112 }} />
                  <col style={{ width: 300 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Prop</th>
                    <th scope="col">Type</th>
                    <th scope="col">Default</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.name}>
                      <td className="mono">{row.name}</td>
                      <TypeCell type={row.type} />
                      <td className={row.default && row.default.length > 14 ? "mono t3 doc-props__default" : "mono t3"}>{row.default ?? "—"}</td>
                      <td className="t2 doc-props__desc">{mono(row.description)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}

function Accessibility({ notes }: { notes: readonly A11yNote[] }) {
  return (
    <section id="accessibility" className="doc-sec">
      <h2>Accessibility</h2>
      <div className="doc-a11y">
        {notes.map((note, index) => (
          <div className="card doc-a11y__card" key={index}>
            <span className="doc-a11y__keys">
              {note.keys?.map((key) => (typeof key === "string" ? <KeyHint key={key}>{key}</KeyHint> : <KeyHint key={key.join("+")} keys={key} />))}
              {note.badge ? <Badge>{note.badge}</Badge> : null}
            </span>
            <p className="small t2">{mono(note.text)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- page ---------- */

function DocPage({ entry, doc }: { entry: BaseComponentEntry; doc: ComponentDoc }) {
  const sections = doc.sections ?? [];
  const toc: TocItem[] = [
    { id: "preview", label: "Preview" },
    { id: "installation", label: "Installation" },
    ...sections.map((section) => ({ id: section.id, label: section.title })),
    { id: "props", label: "Props" },
    { id: "accessibility", label: "Accessibility" }
  ];
  const Demo = baseDemos[entry.slug];
  return (
    <DocsShell className="pg-doc" toc={toc}>
      <div className="doc">
        <header className="doc-hd">
          <span className="eyebrow">Base component</span>
          <h1 className="h1 chrome-text doc-title">{entry.name}</h1>
          <p className="lead doc-lead">{doc.lead ?? entry.blurb}</p>
          <div className="doc-tags">
            {doc.tags.map((tag) => (
              <Badge key={tag} tone={tag === "New" ? "new" : "neutral"}>
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        {entry.slug === "button" ? (
          <ButtonPreview />
        ) : (
          <PreviewCard code={doc.code} stage={doc.stage}>
            <div className="base-demo doc-demo">{Demo ? <Demo /> : null}</div>
          </PreviewCard>
        )}
        <Installation entry={entry} doc={doc} />
        {sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
        <PropsTables name={entry.name} groups={doc.props} />
        <Accessibility notes={doc.a11y} />
      </div>
    </DocsShell>
  );
}

export default function Page() {
  const { slug } = useParams();
  const entry = findBaseComponent(slug);
  const doc = entry ? componentDocs[entry.slug] : undefined;
  if (!entry || !doc) return <Navigate replace to="/components/base" />;
  // keyed, so preview and copy state start fresh on every component
  return <DocPage key={entry.slug} entry={entry} doc={doc} />;
}
