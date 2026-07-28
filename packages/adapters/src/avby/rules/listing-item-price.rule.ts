import { findMoneyInText } from "@byn/dom-scanner";
import { formatUsdCompact } from "../../format.js";
import type { FormatContext, PriceCandidate, PriceRule } from "../../types.js";
import { MARK_ATTR } from "../../types.js";
import { applyUsdWithBynLabel, collectElementsByClass } from "../shared.js";

export const AVBY_LISTING_ITEM_PRICE_RULE_ID = "avby-listing-item-price";
const PRICE_CLASS = "listing-item__price-primary";

/**
 * Listing item primary price (`listing-item__price-primary`).
 * Keeps the «с НДС» phrase when present.
 */
export const ListingItemPriceRule: PriceRule = {
  id: AVBY_LISTING_ITEM_PRICE_RULE_ID,
  pathMatch: ["*"],

  locate(root: ParentNode): PriceCandidate[] {
    const candidates: PriceCandidate[] = [];

    for (const el of collectElementsByClass(root, PRICE_CLASS)) {
      if (el.hasAttribute(MARK_ATTR)) continue;

      const text = el.textContent ?? "";
      const match = findMoneyInText(text).find((m) => m.currency === "BYN");
      if (!match) continue;

      candidates.push({
        amountByn: match.amount,
        originalText: match.raw,
        target: el,
      });
    }

    return candidates;
  },

  format(ctx: FormatContext) {
    return formatUsdCompact(ctx.amountUsd);
  },

  apply(candidate, formatted, ctx) {
    applyUsdWithBynLabel(
      candidate,
      formatted,
      ctx,
      AVBY_LISTING_ITEM_PRICE_RULE_ID,
      { preserveVat: true },
    );
  },
};
