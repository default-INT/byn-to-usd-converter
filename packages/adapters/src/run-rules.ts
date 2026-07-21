import type { RateResult } from "@byn/core";
import {
  applyTextNodeGroup,
  defaultApplyElement,
  isInsideConverted,
} from "./apply.js";
import { getPathname, matchesPath } from "./path-match.js";
import type { FormatContext, PriceCandidate, PriceRule } from "./types.js";

function buildCtx(candidate: PriceCandidate, rate: RateResult): FormatContext {
  const amountUsd = candidate.amountByn * rate.rate;
  return {
    rate,
    originalText: candidate.originalText,
    amountByn: candidate.amountByn,
    amountUsd,
  };
}

/** Run all matching rules for a site adapter. */
export function runRules(
  rules: readonly PriceRule[],
  root: ParentNode,
  rate: RateResult,
): void {
  const pathname = getPathname();

  for (const rule of rules) {
    if (!matchesPath(pathname, rule.pathMatch)) continue;
    if (rule.match && !rule.match(root)) continue;

    const candidates = rule.locate(root).filter((c) => !isInsideConverted(c.target));
    if (candidates.length === 0) continue;

    const byText = new Map<Text, PriceCandidate[]>();
    const elements: PriceCandidate[] = [];

    for (const candidate of candidates) {
      if (candidate.target instanceof Text) {
        const list = byText.get(candidate.target) ?? [];
        list.push(candidate);
        byText.set(candidate.target, list);
      } else if (candidate.target instanceof Element) {
        elements.push(candidate);
      }
    }

    for (const [node, group] of byText) {
      applyTextNodeGroup(node, group, rule, (c) => buildCtx(c, rate));
    }

    for (const candidate of elements) {
      const ctx = buildCtx(candidate, rate);
      const formatted = rule.format(ctx);
      if (rule.apply) {
        rule.apply(candidate, formatted, ctx);
      } else {
        defaultApplyElement(candidate, formatted, ctx, rule.id);
      }
    }
  }
}
