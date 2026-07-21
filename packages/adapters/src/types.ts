import type { RateResult } from "@byn/core";

export interface FormatContext {
  rate: RateResult;
  originalText: string;
  amountByn: number;
  amountUsd: number;
}

export interface PriceCandidate {
  amountByn: number;
  originalText: string;
  /** Node to replace or wrap. */
  target: Text | Element;
  /** Start index within a Text node's textContent. */
  index?: number;
}

/**
 * Per-site (or per-block) rule: locate prices, format USD, optionally custom DOM apply.
 * Concrete rules implement this interface.
 */
export interface PriceRule {
  readonly id: string;
  /**
   * Restrict rule to pathname patterns, e.g. `["/post", "/list", "*"]`.
   * `*` or omitted/empty = all paths.
   */
  readonly pathMatch?: string[];
  /** Optional DOM gate (layout / container). */
  match?(root: ParentNode): boolean;
  locate(root: ParentNode): PriceCandidate[];
  format(ctx: FormatContext): string;
  /** Custom DOM write; defaults to shared apply helpers. */
  apply?(candidate: PriceCandidate, formatted: string, ctx: FormatContext): void;
}

export interface SiteAdapter {
  readonly id: string;
  /** `null` = default / fallback adapter. */
  readonly hostPattern: RegExp | null;
  readonly rules: readonly PriceRule[];
  scan(root: ParentNode, rate: RateResult): void;
  restore(root?: ParentNode): void;
}

export const MARK_ATTR = "data-byn-converted";
export const ORIGINAL_ATTR = "data-byn-original";
export const RULE_ATTR = "data-byn-rule";
/** Sibling label with original BYN (e.g. Realt `text-basic` span). */
export const MIRROR_ATTR = "data-byn-mirror";
