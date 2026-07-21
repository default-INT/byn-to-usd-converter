import type { CurrencyCode, RateResult } from "../currency/types.js";

export interface RateProvider {
  readonly id: string;
  fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<RateResult>;
}
