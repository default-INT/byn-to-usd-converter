import type { CurrencyCode, RateResult } from "../currency/types.js";
import type { RateProvider } from "./provider.interface.js";

/**
 * Fallback provider via exchangerate.host (stub).
 * Wire up when NBRB is unavailable.
 */
const API_BASE = "https://api.exchangerate.host";

export class ExchangeRateHostProvider implements RateProvider {
  readonly id = "exchangerate-host";

  async fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<RateResult> {
    if (base === quote) {
      return {
        base,
        quote,
        rate: 1,
        asOf: new Date().toISOString(),
        provider: this.id,
      };
    }

    const url = `${API_BASE}/latest?base=${base}&symbols=${quote}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ExchangeRateHostProvider: HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      success?: boolean;
      date?: string;
      rates?: Record<string, number>;
    };

    const rate = data.rates?.[quote];
    if (typeof rate !== "number") {
      throw new Error(
        `ExchangeRateHostProvider: missing rate for ${base}/${quote}`,
      );
    }

    return {
      base,
      quote,
      rate,
      asOf: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      provider: this.id,
    };
  }
}
