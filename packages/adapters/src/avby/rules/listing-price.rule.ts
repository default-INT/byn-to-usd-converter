import { findMoneyInText } from "@byn/dom-scanner";
import { formatUsdCompact } from "../../format.js";
import type { FormatContext, PriceCandidate, PriceRule } from "../../types.js";
import { MARK_ATTR } from "../../types.js";
import {
  applyUsdWithBynLabel,
  collectElementsByClass,
} from "../shared.js";

export const AVBY_LISTING_PRICE_RULE_ID = "avby-listing-price";
const PRICE_CLASS = "listing-index__price";

/** Listing card/index price block on av.by. */
export const ListingPriceRule: PriceRule = {
  id: AVBY_LISTING_PRICE_RULE_ID,
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
      AVBY_LISTING_PRICE_RULE_ID,
    );
  },
};

/** @deprecated Use ListingPriceRule */
export const avbyListingPriceRule = ListingPriceRule;
export const AVBY_RULE_ID = AVBY_LISTING_PRICE_RULE_ID;
