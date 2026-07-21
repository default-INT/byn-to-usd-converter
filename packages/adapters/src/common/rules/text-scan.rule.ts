import { findMoneyInText } from "@byn/dom-scanner";
import { isInsideConverted } from "../../apply.js";
import { formatUsdCompact } from "../../format.js";
import { MARK_ATTR, type PriceCandidate, type PriceRule } from "../../types.js";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT"]);

/**
 * Default rule: walk text nodes and replace BYN amounts via shared patterns.
 * `pathMatch: ["*"]` — all pages.
 */
export const textScanRule: PriceRule = {
  id: "text-scan",
  pathMatch: ["*"],

  locate(root: ParentNode): PriceCandidate[] {
    const candidates: PriceCandidate[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();

    while (current) {
      const node = current as Text;
      const parent = node.parentElement;

      if (
        !parent ||
        isInsideConverted(node) ||
        parent.closest(`[${MARK_ATTR}]`) ||
        SKIP_TAGS.has(parent.tagName)
      ) {
        current = walker.nextNode();
        continue;
      }

      const text = node.textContent ?? "";
      for (const match of findMoneyInText(text)) {
        if (match.currency !== "BYN") continue;
        candidates.push({
          amountByn: match.amount,
          originalText: match.raw,
          target: node,
          index: match.index,
        });
      }

      current = walker.nextNode();
    }

    return candidates;
  },

  format(ctx) {
    return formatUsdCompact(ctx.amountUsd);
  },
};
