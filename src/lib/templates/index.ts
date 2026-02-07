import type { ArtifactBase } from "@/types/artifact";
import { TEMPLATE_QUOTES } from "./quotes";
import { TEMPLATE_TRACKING } from "./tracking";
import { TEMPLATE_FORMS } from "./forms";

/**
 * Map of use case keys to their pre-configured template artifacts.
 * Only "tracking", "quotes", and "forms" have templates.
 * "custom" intentionally has no template (user builds from scratch).
 */
export const TEMPLATES: Record<string, ArtifactBase> = {
  quotes: TEMPLATE_QUOTES,
  tracking: TEMPLATE_TRACKING,
  forms: TEMPLATE_FORMS,
};

export { TEMPLATE_QUOTES, TEMPLATE_TRACKING, TEMPLATE_FORMS };
