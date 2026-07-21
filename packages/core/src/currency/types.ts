export type CurrencyCode = "BYN" | "USD" | "EUR" | "RUB";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface RateResult {
  base: CurrencyCode;
  quote: CurrencyCode;
  /** How many units of `quote` equal 1 unit of `base`. */
  rate: number;
  /** ISO-8601 timestamp when the rate was observed. */
  asOf: string;
  provider: string;
}
