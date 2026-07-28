import { findMoneyInText } from "@byn/dom-scanner";
import { isInsideConverted } from "../../apply.js";
import { formatUsdK } from "../../format.js";
import {
  MARK_ATTR,
  MIRROR_ATTR,
  ORIGINAL_ATTR,
  RULE_ATTR,
  type PriceCandidate,
  type PriceRule,
} from "../../types.js";

export const REALT_MAP_POINTS_RULE_ID = "realt-map-points";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT"]);

function scopeRoot(root: ParentNode): ParentNode {
  return root instanceof Document || root instanceof Element ? root : document;
}

function hasYmaps(root: ParentNode): boolean {
  const scope = scopeRoot(root);
  if (scope instanceof Document || scope instanceof Element) {
    return scope.querySelector("ymaps") !== null;
  }
  return document.querySelector("ymaps") !== null;
}

function queryMapUsdSpans(root: ParentNode): NodeListOf<Element> {
  const scope = scopeRoot(root);
  const selector = `[${MARK_ATTR}][${RULE_ATTR}="${REALT_MAP_POINTS_RULE_ID}"]`;
  if (scope instanceof Document || scope instanceof Element) {
    return scope.querySelectorAll(selector);
  }
  return document.querySelectorAll(selector);
}

/**
 * Map placemarks: parent box → `width: max-content`;
 * BYN mirror without `text-basic` (unlike listing mirrors).
 */
export function finishRealtMapPoints(root: ParentNode): void {
  queryMapUsdSpans(root).forEach((usdEl) => {
    const parent = usdEl.parentElement;
    if (!parent) return;

    parent.style.setProperty("width", "max-content");
    parent.classList.remove("text-basic");

    if (
      parent.querySelector(`[${MIRROR_ATTR}]`) ||
      parent.nextElementSibling?.hasAttribute(MIRROR_ATTR)
    ) {
      return;
    }

    const original = usdEl.getAttribute(ORIGINAL_ATTR)?.trim() ?? "";
    if (!original) return;

    usdEl.removeAttribute("title");

    const bynSpan = document.createElement("span");
    bynSpan.className = "pl-0.5 text-subhead";
    bynSpan.setAttribute(MIRROR_ATTR, "true");
    bynSpan.textContent = ` = ${original}`;
    // Keep BYN inside the sized box so max-content covers the full label.
    parent.appendChild(bynSpan);
  });
}

/**
 * Map placemark prices on realt.by, e.g. inside:
 * `<ymaps><span>573 т.р.</span></ymaps>` → `$179 k` + mirror ` = 573 т.р.`
 * Also "1,3 млн р." / "от 1,3 млн р.".
 */
export const realtMapPointsRule: PriceRule = {
  id: REALT_MAP_POINTS_RULE_ID,
  pathMatch: ["*"],

  match(root) {
    return hasYmaps(root);
  },

  locate(root: ParentNode): PriceCandidate[] {
    const candidates: PriceCandidate[] = [];
    const walker = document.createTreeWalker(
      scopeRoot(root),
      NodeFilter.SHOW_TEXT,
    );
    let current = walker.nextNode();

    while (current) {
      const node = current as Text;
      const parent = node.parentElement;

      if (
        !parent ||
        !parent.closest("ymaps") ||
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
    return formatUsdK(ctx.amountUsd);
  },
};
