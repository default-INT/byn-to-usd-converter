import { findMoneyInText } from "@byn/dom-scanner";
import { textScanRule } from "../../common/rules/text-scan.rule.js";
import type { PriceCandidate, PriceRule } from "../../types.js";
import {
  MARK_ATTR,
  MIRROR_ATTR,
  ORIGINAL_ATTR,
  RULE_ATTR,
} from "../../types.js";

export const REALT_RULE_ID = "realt-text-scan";

const LARGE_AMOUNT = 1_000_000;

function isInsideYmaps(candidate: PriceCandidate): boolean {
  const el =
    candidate.target instanceof Element
      ? candidate.target
      : candidate.target.parentElement;
  return Boolean(el?.closest("ymaps"));
}

function amountOf(text: string, currency: "BYN" | "USD"): number {
  return (
    findMoneyInText(text).find((m) => m.currency === currency)?.amount ?? 0
  );
}

function getSizeClass(byn: number, usd: number, parent: HTMLElement) {
  if (byn > LARGE_AMOUNT && usd > LARGE_AMOUNT) return "text-disclaimer";
  if (byn > LARGE_AMOUNT || usd > LARGE_AMOUNT || parent.children.length > 3) return "text-caption";

  return "text-subhead";
}

/**
 * Same locate/format as Common text-scan (full "$405 435"); skips ymaps
 * (handled by realtMapPointsRule). BYN mirrors via RealtAdapter after scan.
 */
export const realtTextScanRule: PriceRule = {
  id: REALT_RULE_ID,
  pathMatch: ["*"],
  locate: (root) => textScanRule.locate(root).filter((c) => !isInsideYmaps(c)),
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

    const amountByn = amountOf(original, "BYN");
    const amountUsd = amountOf(usdEl.textContent ?? "", "USD");
    
    const sizeClass = getSizeClass(amountByn, amountUsd, parent);

    const bynSpan = document.createElement("span");
    bynSpan.className = `text-basic pl-0.5 ${sizeClass}`;
    bynSpan.setAttribute(MIRROR_ATTR, "true");
    bynSpan.textContent = ` = ${original}`;
    parent.insertAdjacentElement("afterend", bynSpan);
  });
}
