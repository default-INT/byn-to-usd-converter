import type { CurrencyCode, RateResult } from "../currency/types.js";
import type { RateProvider } from "./provider.interface.js";

/**
 * National Bank of the Republic of Belarus (НБ РБ).
 * Official, free API: https://www.nbrb.by/apihelp/exrates
 */
const NBRB_BASE = "https://api.nbrb.by/exrates/rates";

/** NBRB Cur_ID for currencies quoted against BYN. */
const CUR_ID: Partial<Record<CurrencyCode, number>> = {
  USD: 431,
  EUR: 451,
  RUB: 456,
};

interface NbrbRateResponse {
  Cur_ID: number;
  Date: string;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_OfficialRate: number;
}

export class NbrbProvider implements RateProvider {
  readonly id = "nbrb";

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

    // NBRB quotes foreign currencies in BYN (how many BYN for Cur_Scale units).
    if (base === "BYN") {
      const foreign = quote;
      const curId = CUR_ID[foreign];
      if (!curId) {
        throw new Error(`NbrbProvider: unsupported quote currency ${foreign}`);
      }
      const data = await this.fetchById(curId);
      const bynPerUnit = data.Cur_OfficialRate / data.Cur_Scale;
      return {
        base,
        quote,
        rate: 1 / bynPerUnit,
        asOf: new Date(data.Date).toISOString(),
        provider: this.id,
      };
    }

    if (quote === "BYN") {
      const foreign = base;
      const curId = CUR_ID[foreign];
      if (!curId) {
        throw new Error(`NbrbProvider: unsupported base currency ${foreign}`);
      }
      const data = await this.fetchById(curId);
      const bynPerUnit = data.Cur_OfficialRate / data.Cur_Scale;
      return {
        base,
        quote,
        rate: bynPerUnit,
        asOf: new Date(data.Date).toISOString(),
        provider: this.id,
      };
    }

    throw new Error(
      `NbrbProvider: only BYN pairs are supported (got ${base}/${quote})`,
    );
  }

  private async fetchById(curId: number): Promise<NbrbRateResponse> {
    const res = await fetch(`${NBRB_BASE}/${curId}`);
    if (!res.ok) {
      throw new Error(`NbrbProvider: HTTP ${res.status}`);
    }
    return (await res.json()) as NbrbRateResponse;
  }
}
