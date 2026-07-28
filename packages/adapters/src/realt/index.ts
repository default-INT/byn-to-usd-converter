import { createSiteAdapter } from "../create-site-adapter.js";
import type { RateResult } from "@byn/core";
import type { SiteAdapter } from "../types.js";
import {
  realtMapPointsRule,
  finishRealtMapPoints,
} from "./rules/map-points.rule.js";
import {
  insertRealtBynMirrors,
  realtTextScanRule,
} from "./rules/text-scan.rule.js";

const base = createSiteAdapter({
  id: "realt",
  hostPattern: /(^|\.)realt\.by$/i,
  // Map markers first so ymaps prices get "$N k" before generic text-scan.
  rules: [realtMapPointsRule, realtTextScanRule],
});

/**
 * Realt.by: replace BYN with USD like CommonAdapter, then insert
 * `<span class="text-basic">… р.</span>` with the original BYN next to the parent.
 * Map placemarks use compact "$N k" + BYN mirror (no text-basic) and parent width.
 */
export const RealtAdapter: SiteAdapter = {
  ...base,
  scan(root: ParentNode, rate: RateResult) {
    base.scan(root, rate);
    finishRealtMapPoints(root);
    insertRealtBynMirrors(root);
  },
};
