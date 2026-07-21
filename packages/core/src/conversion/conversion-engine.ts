import type { CurrencyCode, Money, RateResult } from "../currency/types.js";
import { RateCache } from "./cache.js";
import type { ProviderRegistry } from "../providers/registry.js";

export interface ConversionResult {
  from: Money;
  to: Money;
  rate: RateResult;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

export class ConversionEngine {
  private readonly cache: RateCache;

  constructor(
    private readonly registry: ProviderRegistry,
    ttlMs: number = DEFAULT_TTL_MS,
  ) {
    this.cache = new RateCache(ttlMs);
  }

  async convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
  ): Promise<ConversionResult> {
    const rate = await this.getRate(from, to);
    return {
      from: { amount, currency: from },
      to: { amount: amount * rate.rate, currency: to },
      rate,
    };
  }

  async getRate(base: CurrencyCode, quote: CurrencyCode): Promise<RateResult> {
    const cached = this.cache.get(base, quote);
    if (cached) return cached;

    const result = await this.registry.fetchRate(base, quote);
    this.cache.set(result);
    return result;
  }
}
