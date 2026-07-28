import { createSiteAdapter } from "../create-site-adapter.js";
import { CardPriceRule } from "./rules/card-price.rule.js";
import { ListingItemPriceRule } from "./rules/listing-item-price.rule.js";
import { ListingPriceRule } from "./rules/listing-price.rule.js";
import { SalonListingPriceRule } from "./rules/salon-listing-price.rule.js";

/**
 * av.by: listing/index, card primary, and salon top price blocks → USD + BYN label.
 */
export const AvByAdapter = createSiteAdapter({
  id: "avby",
  hostPattern: /(^|\.)av\.by$/i,
  rules: [
    ListingPriceRule,
    ListingItemPriceRule,
    CardPriceRule,
    SalonListingPriceRule,
  ],
});
