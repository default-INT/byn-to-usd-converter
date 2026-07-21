import { createSiteAdapter } from "../create-site-adapter.js";
import type { RateResult } from "@byn/core";
import type { SiteAdapter } from "../types.js";
import {
  insertRealtBynMirrors,
  realtTextScanRule,
} from "./rules/text-scan.rule.js";

const base = createSiteAdapter({
  id: "realt",
  hostPattern: /(^|\.)realt\.by$/i,
  rules: [realtTextScanRule],
});

/**
 * Realt.by: replace BYN with USD like CommonAdapter, then insert
 * `<span class="text-basic">… р.</span>` with the original BYN next to the parent.
 */
export const RealtAdapter: SiteAdapter = {
  ...base,
  scan(root: ParentNode, rate: RateResult) {
    base.scan(root, rate);
    insertRealtBynMirrors(root);
  },
};
