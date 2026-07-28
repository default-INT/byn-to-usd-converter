import { findMoneyInText } from "@byn/dom-scanner";
import { formatBynCompact, formatUsdCompact } from "../../format.js";
import type { FormatContext, PriceCandidate, PriceRule } from "../../types.js";
import {
  MARK_ATTR,
  MIRROR_ATTR,
  ORIGINAL_ATTR,
  ORIGINAL_HTML_ATTR,
  RULE_ATTR,
} from "../../types.js";
import { collectElementsByClass } from "../shared.js";

export const AVBY_SALON_LISTING_PRICE_RULE_ID = "avby-salon-listing-price";
const PRICES_CLASS = "salon-listing-top__prices";

function parseBareAmount(text: string): number | null {
  const normalized = text.replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Salon listing top prices: `span` («от») + `div` (amount) + `small` (currency).
 * Keeps «от», removes currency `<small>`, writes USD + BYN into the amount `div`.
 */
export const SalonListingPriceRule: PriceRule = {
  id: AVBY_SALON_LISTING_PRICE_RULE_ID,
  pathMatch: ["*"],

  locate(root: ParentNode): PriceCandidate[] {
    const candidates: PriceCandidate[] = [];

    for (const container of collectElementsByClass(root, PRICES_CLASS)) {
      if (container.hasAttribute(MARK_ATTR)) continue;

      const priceDiv = [...container.children].find(
        (el) => el.tagName === "DIV",
      );
      const currencySmall = [...container.children].find(
        (el) => el.tagName === "SMALL",
      );
      if (!priceDiv || !currencySmall) continue;

      const amountText = priceDiv.textContent?.trim() ?? "";
      const currencyText = currencySmall.textContent?.trim() ?? "";
      const combined = `${amountText} ${currencyText}`.trim();

      const match = findMoneyInText(combined).find((m) => m.currency === "BYN");
      const amountByn = match?.amount ?? parseBareAmount(amountText);
      if (amountByn === null) continue;

      candidates.push({
        amountByn,
        originalText: match?.raw ?? amountText,
        target: container,
      });
    }

    return candidates;
  },

  format(ctx: FormatContext) {
    return formatUsdCompact(ctx.amountUsd);
  },

  apply(candidate, formatted, ctx) {
    if (!(candidate.target instanceof HTMLElement)) return;
    const container = candidate.target;
    if (container.hasAttribute(MARK_ATTR)) return;

    const priceDiv = [...container.children].find(
      (el) => el.tagName === "DIV",
    );
    if (!(priceDiv instanceof HTMLElement)) return;

    container.setAttribute(MARK_ATTR, "true");
    container.setAttribute(ORIGINAL_ATTR, candidate.originalText);
    container.setAttribute(ORIGINAL_HTML_ATTR, container.innerHTML);
    container.setAttribute(RULE_ATTR, AVBY_SALON_LISTING_PRICE_RULE_ID);

    for (const child of [...container.children]) {
      if (child.tagName === "SMALL") child.remove();
    }

    while (priceDiv.firstChild) {
      priceDiv.removeChild(priceDiv.firstChild);
    }

    const usdSpan = document.createElement("span");
    usdSpan.style.cssText =
      "all:unset;display:inline;font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;vertical-align:baseline;";
    usdSpan.textContent = formatted;

    const bynSpan = document.createElement("span");
    bynSpan.setAttribute(MIRROR_ATTR, "true");
    bynSpan.textContent = `= ${formatBynCompact(ctx.amountByn)}`;
    bynSpan.style.cssText =
      "font-size:14px;color:#fff;font-weight:500;";

    priceDiv.append(usdSpan, document.createTextNode(" "), bynSpan);
  },
};
