import type { RateResult } from "@byn/core";
import { restoreConverted } from "./apply.js";
import { runRules } from "./run-rules.js";
import type { PriceRule, SiteAdapter } from "./types.js";

export function createSiteAdapter(options: {
  id: string;
  hostPattern: RegExp | null;
  rules: readonly PriceRule[];
}): SiteAdapter {
  const { id, hostPattern, rules } = options;

  return {
    id,
    hostPattern,
    rules,
    scan(root: ParentNode, rate: RateResult) {
      runRules(rules, root, rate);
    },
    restore(root?: ParentNode) {
      restoreConverted(root ?? document);
    },
  };
}
