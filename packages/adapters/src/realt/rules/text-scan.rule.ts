import { textScanRule } from "../../common/rules/text-scan.rule.js";
import type { PriceRule } from "../../types.js";
import {
  MARK_ATTR,
  MIRROR_ATTR,
  ORIGINAL_ATTR,
  RULE_ATTR,
} from "../../types.js";

export const REALT_RULE_ID = "realt-text-scan";

/**
 * Same locate/format as Common text-scan; USD replace uses default apply.
 * BYN mirror spans are inserted by RealtAdapter after scan.
 */
export const realtTextScanRule: PriceRule = {
  id: REALT_RULE_ID,
  pathMatch: ["*"],
  locate: (root) => textScanRule.locate(root),
  format: (ctx) => textScanRule.format(ctx),
};

/** Insert `<span class="text-basic">440 244 р.</span>` next to each USD span's parent. */
export function insertRealtBynMirrors(root: ParentNode): void {
  const scope: ParentNode =
    root instanceof Document || root instanceof Element ? root : document;

  const usdSpans = (
    scope instanceof Document || scope instanceof Element
      ? scope
      : document
  ).querySelectorAll(`[${MARK_ATTR}][${RULE_ATTR}="${REALT_RULE_ID}"]`);

  usdSpans.forEach((usdEl) => {
    const parent = usdEl.parentElement;
    if (!parent) return;

    if (parent.nextElementSibling?.hasAttribute(MIRROR_ATTR)) return;

    const original = usdEl.getAttribute(ORIGINAL_ATTR)?.trim() ?? "";
    if (!original) return;

    // BYN is shown in the mirror; drop native tooltip.
    usdEl.removeAttribute("title");

    const bynSpan = document.createElement("span");
    bynSpan.className = "text-basic pl-0.5 text-subhead";
    bynSpan.setAttribute(MIRROR_ATTR, "true");
    bynSpan.textContent = ` = ${original}`;
    parent.insertAdjacentElement("afterend", bynSpan);
  });
}
