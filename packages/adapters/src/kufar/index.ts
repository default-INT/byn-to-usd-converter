import type { RateResult } from "@byn/core";
import { createSiteAdapter } from "../create-site-adapter.js";
import type { SiteAdapter } from "../types.js";
import {
  attachKufarTooltips,
  kufarTextScanRule,
  removeKufarTooltip,
} from "./rules/text-scan.rule.js";

const base = createSiteAdapter({
  id: "kufar",
  hostPattern: /(^|\.)re\.kufar\.by$/i,
  rules: [kufarTextScanRule],
});

/**
 * re.kufar.by: replace BYN with USD like CommonAdapter, show original BYN
 * in a custom hover tooltip (dark translucent pill).
 */
export const KufarAdapter: SiteAdapter = {
  ...base,
  scan(root: ParentNode, rate: RateResult) {
    base.scan(root, rate);
    attachKufarTooltips(root);
  },
  restore(root?: ParentNode) {
    removeKufarTooltip();
    base.restore(root);
  },
};
