import type { CSSProperties, ReactNode } from "react";

// One component page's content. Every prop name, type and default is read from the package source.
// In `description`, `text` and `extends` strings, `backticks` render in the mono face.

export interface PropRow {
  name: string;
  /** TypeScript type as written in the source; unions wrap after each " | ". */
  type: string;
  /** Literal default; omitted renders "—". */
  default?: string;
  description: string;
}

export interface PropGroup {
  /** Compound part, such as "Dialog.Content". Omitted for a single component. */
  part?: string;
  /** What else the part passes through, such as the Radix primitive it extends. */
  extends?: string;
  rows: readonly PropRow[];
}

export interface Sample {
  /** Mono caption under the sample. */
  label: string;
  node: ReactNode;
}

/** A dotted stage of captioned samples (Finishes, Sizes, Tones …). */
export interface StageSection {
  kind?: "stage";
  id: string;
  title: string;
  text?: string;
  samples: readonly Sample[];
  /** Stage overrides, such as `alignItems: "flex-end"` for sizes. */
  style?: CSSProperties;
}

/** Do and don't, side by side. */
export interface UsageSection {
  kind: "usage";
  id: string;
  title: string;
  do: { node: ReactNode; text: string };
  dont: { node: ReactNode; text: string };
}

export type DocSection = StageSection | UsageSection;

export interface A11yNote {
  /** Keycaps drawn with KeyHint; an array is one chord, such as ["⇧", "Tab"]. */
  keys?: readonly (string | readonly string[])[];
  /** A short Badge instead of keys, such as "4.5:1" or "aria-live". */
  badge?: string;
  text: string;
}

export interface ComponentDoc {
  /** Header tags: the Radix primitive it uses, "WCAG 2.2 AA", "New" … */
  tags: readonly string[];
  /** Replaces the catalog blurb as the lead. */
  lead?: string;
  /** Names in the install line's import. */
  imports: readonly string[];
  /** Realistic usage for the Preview's Code view. Compiles against the package API. */
  code: string;
  /** A full file under the install line instead of the bare import line (Button). */
  installFile?: { filename: string; code: string };
  /** Preview stage overrides. */
  stage?: CSSProperties;
  sections?: readonly DocSection[];
  props: readonly PropGroup[];
  a11y: readonly A11yNote[];
}
