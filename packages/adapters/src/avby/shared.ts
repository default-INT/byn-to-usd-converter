import { formatBynCompact } from "../format.js";
import type { FormatContext, PriceCandidate } from "../types.js";
import {
  MARK_ATTR,
  MIRROR_ATTR,
  ORIGINAL_ATTR,
  ORIGINAL_HTML_ATTR,
  RULE_ATTR,
} from "../types.js";

const VAT_RE = /[сc]\s*НДС/i;

export function collectElementsByClass(
  root: ParentNode,
  className: string,
): Element[] {
  const found: Element[] = [];

  if (root instanceof Element && root.classList.contains(className)) {
    found.push(root);
  }

  if ("querySelectorAll" in root) {
    root.querySelectorAll(`.${className}`).forEach((el) => {
      if (!found.includes(el)) found.push(el);
    });
  }

  return found;
}

/** Match BEM-like `*__price-primary` class names. */
export function collectElementsByClassSubstring(
  root: ParentNode,
  substring: string,
): Element[] {
  const selector = `[class*="${substring}"]`;
  const found: Element[] = [];

  if (
    root instanceof Element &&
    typeof root.className === "string" &&
    root.className.includes(substring)
  ) {
    found.push(root);
  }

  if ("querySelectorAll" in root) {
    root.querySelectorAll(selector).forEach((el) => {
      if (!found.includes(el)) found.push(el);
    });
  }

  return found;
}

export function hasVatPhrase(text: string): boolean {
  return VAT_RE.test(text);
}

/**
 * Clear price container and insert USD + `= XXX XXX р.` (+ optional «с НДС»).
 */
export function applyUsdWithBynLabel(
  candidate: PriceCandidate,
  formattedUsd: string,
  ctx: FormatContext,
  ruleId: string,
  options?: { preserveVat?: boolean },
): void {
  if (!(candidate.target instanceof HTMLElement)) return;
  const el = candidate.target;
  if (el.hasAttribute(MARK_ATTR)) return;

  const preserveVat = options?.preserveVat ?? false;
  const originalText = el.textContent ?? "";
  const keepVat = preserveVat && hasVatPhrase(originalText);

  const vatNode = keepVat
    ? [...el.querySelectorAll("*")].find((node) =>
        VAT_RE.test(node.textContent ?? ""),
      )
    : undefined;
  const vatClone = vatNode?.cloneNode(true) ?? null;

  el.setAttribute(MARK_ATTR, "true");
  el.setAttribute(ORIGINAL_ATTR, candidate.originalText);
  el.setAttribute(ORIGINAL_HTML_ATTR, el.innerHTML);
  el.setAttribute(RULE_ATTR, ruleId);

  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }

  const usdSpan = document.createElement("span");
  usdSpan.style.cssText =
    "all:unset;display:inline;font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;vertical-align:baseline;";
  usdSpan.textContent = formattedUsd;

  const bynSpan = document.createElement("span");
  bynSpan.setAttribute(MIRROR_ATTR, "true");
  bynSpan.textContent = `= ${formatBynCompact(ctx.amountByn)}`;
  bynSpan.style.cssText =
    "font-size:14px;color:var(--color-gray-400-dark);font-weight:500;";

  el.append(usdSpan, document.createTextNode(" "), bynSpan);

  if (keepVat) {
    el.append(document.createTextNode(" "));
    if (vatClone) {
      el.append(vatClone);
    } else {
      el.append(document.createTextNode("с НДС"));
    }
  }
}
