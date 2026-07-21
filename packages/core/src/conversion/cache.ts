import type { RateResult } from "../currency/types.js";

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class RateCache {
  private readonly store = new Map<string, CacheEntry<RateResult>>();

  constructor(private readonly ttlMs: number) {}

  static key(base: string, quote: string): string {
    return `${base}:${quote}`;
  }

  get(base: string, quote: string): RateResult | undefined {
    const entry = this.store.get(RateCache.key(base, quote));
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(RateCache.key(base, quote));
      return undefined;
    }
    return entry.value;
  }

  set(result: RateResult): void {
    this.store.set(RateCache.key(result.base, result.quote), {
      value: result,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.store.clear();
  }
}
