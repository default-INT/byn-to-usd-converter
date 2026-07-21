import type { FormatContext, PriceCandidate, PriceRule } from "./types.js";
import { MARK_ATTR, MIRROR_ATTR, ORIGINAL_ATTR, RULE_ATTR } from "./types.js";

export function createUsdSpan(
  original: string,
  formatted: string,
  ruleId: string,
): HTMLSpanElement {
  const el = document.createElement("span");
  el.setAttribute(MARK_ATTR, "true");
  el.setAttribute(ORIGINAL_ATTR, original);
  el.setAttribute(RULE_ATTR, ruleId);
  el.title = original;
  el.textContent = formatted;
  el.style.cssText =
    "all:unset;display:inline;cursor:inherit;font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;vertical-align:baseline;";
  return el;
}

export function isInsideConverted(node: Node): boolean {
  const el = node instanceof Element ? node : node.parentElement;
  return Boolean(
    el?.closest(`[${MARK_ATTR}]`) || el?.closest(`[${MIRROR_ATTR}]`),
  );
}

/** Default apply for a single Element candidate. */
export function defaultApplyElement(
  candidate: PriceCandidate,
  formatted: string,
  _ctx: FormatContext,
  ruleId: string,
): void {
  if (!(candidate.target instanceof Element)) return;
  if (candidate.target.closest(`[${MARK_ATTR}]`)) return;

  const span = createUsdSpan(candidate.originalText, formatted, ruleId);
  candidate.target.textContent = "";
  candidate.target.appendChild(span);
}

/**
 * Rebuild a text node once for all BYN matches (stable indices).
 * Uses `rule.format` / optional per-candidate `rule.apply`.
 */
export function applyTextNodeGroup(
  node: Text,
  candidates: PriceCandidate[],
  rule: PriceRule,
  buildCtx: (c: PriceCandidate) => FormatContext,
): void {
  if (isInsideConverted(node)) return;
  if (candidates.length === 0) return;

  const withCustomApply = Boolean(rule.apply);
  if (withCustomApply && rule.apply) {
    const ordered = [...candidates].sort(
      (a, b) => (b.index ?? 0) - (a.index ?? 0),
    );
    for (const candidate of ordered) {
      const ctx = buildCtx(candidate);
      rule.apply(candidate, rule.format(ctx), ctx);
    }
    return;
  }

  const text = node.textContent ?? "";
  const sorted = [...candidates]
    .filter((c) => typeof c.index === "number")
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const candidate of sorted) {
    const start = candidate.index ?? 0;
    if (start < cursor) continue;

    if (start > cursor) {
      fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
    }

    const ctx = buildCtx(candidate);
    const formatted = rule.format(ctx);
    fragment.appendChild(
      createUsdSpan(candidate.originalText, formatted, rule.id),
    );
    cursor = start + candidate.originalText.length;
  }

  if (cursor < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(cursor)));
  }

  node.parentNode?.replaceChild(fragment, node);
}

function queryMarked(
  root: ParentNode,
  selector: string,
): NodeListOf<Element> {
  if (root instanceof Document) {
    return root.querySelectorAll(selector);
  }
  if (root instanceof Element) {
    return root.querySelectorAll(selector);
  }
  return document.querySelectorAll(selector);
}

export function removeBynMirrors(root: ParentNode = document): void {
  queryMarked(root, `[${MIRROR_ATTR}]`).forEach((el) => el.remove());
}

export function restoreConverted(root: ParentNode = document): void {
  removeBynMirrors(root);

  queryMarked(root, `[${MARK_ATTR}]`).forEach((el) => {
    const original = el.getAttribute(ORIGINAL_ATTR);
    el.replaceWith(document.createTextNode(original ?? ""));
  });
}
