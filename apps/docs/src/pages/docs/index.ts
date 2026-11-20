import { dataDocs } from "./data";
import { feedbackDocs } from "./feedback";
import { inputDocs } from "./inputs";
import { navigationDocs } from "./navigation";
import { overlayDocs } from "./overlays";
import type { ComponentDoc } from "./types";

/** Page content for every base component, keyed by its data.ts slug. */
export const componentDocs: Record<string, ComponentDoc> = {
  ...inputDocs,
  ...navigationDocs,
  ...feedbackDocs,
  ...overlayDocs,
  ...dataDocs
};
