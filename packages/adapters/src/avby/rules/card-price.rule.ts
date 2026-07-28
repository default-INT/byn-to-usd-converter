import { findMoneyInText } from "@byn/dom-scanner";
import { formatUsdCompact } from "../../format.js";
import type { FormatContext, PriceCandidate, PriceRule } from "../../types.js";
import { MARK_ATTR } from "../../types.js";
import {
  applyUsdWithBynLabel,
  collectElementsByClassSubstring,
} from "../shared.js";

export const AVBY_CARD_PRICE_RULE_ID = "avby-card-price";
const PRICE_CLASS_SUBSTRING = "__price-primary";

/**
 * TODO: need to investigate
 *
 * Primary card price (`*__price-primary`).
 * Keeps the «с НДС» phrase when present.
 */
export const CardPriceRule: PriceRule = {
  id: AVBY_CARD_PRICE_RULE_ID,
  pathMatch: ["*"],

  locate(root: ParentNode): PriceCandidate[] {
    const candidates: PriceCandidate[] = [];

    for (const el of collectElementsByClassSubstring(
      root,
      PRICE_CLASS_SUBSTRING,
    )) {
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
      AVBY_CARD_PRICE_RULE_ID,
      { preserveVat: true },
    );
  },
};
