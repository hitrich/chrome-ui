# Chrome UI — design QA

The site and package were built from the satin chrome design (14 artboards: landing, foundations, chrome buttons, components overview, 54 base components, 12 blocks, 12 charts, the Button component page and 6 templates). Each page was compared with its artboard at 1440 px, 2× device scale, by cropping matching regions side by side at 100% over at least three rounds, then checked at 1024, 768 and 390 px.

## Page heights at 1440 px

| Page | Route | Design | Built | Note |
|---|---|---|---|---|
| Landing | `/` | 6317 | 6317 | |
| Foundations | `/foundations` | 3410 | 3486 | the artboard's fixed height cut off its own 80 px bottom padding |
| Chrome buttons | `/foundations/buttons` | 2590 | 2581 | |
| Components | `/components` | 2711 | 2713 | |
| Base components | `/components/base` | 5396 | 5398 | |
| Blocks | `/components/blocks` | 2896 | 2896 | |
| Charts | `/components/charts` | 1793 | 1793 | |
| Button (Ink) | `/components/button` | 3468 | 3468 | |
| Dashboard | `/templates/dashboard` | 1611 | 1611 | |
| Control room | `/templates/control-room` | 1285 | 1285 | |
| Finance desk | `/templates/finance-desk` | 1559 | 1559 | |
| Agent console | `/templates/agent-console` | 1569 | 1597 | Approve / Reject added under the approval step |
| Analytics | `/templates/analytics` | 1688 | 1687 | |
| Settings | `/templates/settings` | 3073 | 3071 | |

## Checks

- No console or page errors, exactly one `h1`, and no horizontal page scroll on every route (13 pages and 54 component pages) at 1440, 1024 and 390 px; wide tables, code and diff blocks scroll inside their own region.
- Both themes on the docs pages; Ink islands nest inside Satin pages through tokens only.
- Unit and axe tests for every package component and chart; browser tests for routing, theme persistence, copy feedback, catalog filtering, block preview themes, template forms and drawers, and the phone navigation drawer.

## Deliberate differences from the artboards

- Sidebars in the docs and template shells are sticky, so a template's status card stays at the bottom of the window instead of the bottom of the page.
- Foundations lists the package's real public token names (`--chrome-cobalt`, `--chrome-rim`, …) instead of the design's internal short names.
- Foundations and Chrome buttons gained a slim header so they are not dead ends; the landing banner and changelog link to GitHub releases.
- Interactions the static design could only imply are real: Approve / Reject in the agent run, Save / Discard enabled only after an edit, drawers and dialogs behind incident, payment and key actions. Small amounts of supporting copy exist only inside those opened layers.
- Today's date marker is hidden on calendars that show the fictional November 2026 data.
