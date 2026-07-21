import { createSiteAdapter } from "../create-site-adapter.js";
import { textScanRule } from "./rules/text-scan.rule.js";

/** Fallback adapter for any host: generic text scan. */
export const CommonAdapter = createSiteAdapter({
  id: "common",
  hostPattern: null,
  rules: [textScanRule],
});
