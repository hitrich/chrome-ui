// Stroke glyphs for the docs samples, on the artboards' 24-unit grid (drawn by the `.i` utility).
export const paths = {
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sliders: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M13 4v4M7 10v4M15 16v4",
  rerun: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  chevron: "m6 9 6 6 6-6",
  pin: "M12 17v5M9 3h6l-1 7 4 3H6l4-3z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  wrap: "M4 6h16M4 12h13a3 3 0 0 1 0 6h-4M4 18h5M15 16l-2 2 2 2",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  filter: "M3 5h18l-7 8v6l-4 2v-8Z",
  terminal: "m4 17 6-5-6-5M12 19h8",
  copy: "M8 8h12v12H8zM16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  bold: "M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z",
  italic: "M10 5h8M6 19h8M14 5l-4 14"
} as const;

export type GlyphName = keyof typeof paths;

export function G({ name, size }: { name: GlyphName; size?: number }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={size ? { width: size, height: size } : undefined}>
      <path d={paths[name]} />
    </svg>
  );
}
