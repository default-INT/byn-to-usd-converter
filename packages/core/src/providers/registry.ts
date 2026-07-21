import type { CurrencyCode, RateResult } from "../currency/types.js";
import type { RateProvider } from "./provider.interface.js";

/**
 * Tries providers in priority order until one succeeds.
 */
export class ProviderRegistry {
  constructor(private readonly providers: readonly RateProvider[]) {
    if (providers.length === 0) {
      throw new Error("ProviderRegistry requires at least one provider");
    }
  }

  async fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<RateResult> {
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        return await provider.fetchRate(base, quote);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.id}: ${message}`);
      }
    }

    throw new Error(
      `All rate providers failed for ${base}/${quote}: ${errors.join("; ")}`,
    );
  }
}
