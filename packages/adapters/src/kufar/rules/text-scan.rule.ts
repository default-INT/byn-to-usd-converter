import { textScanRule } from "../../common/rules/text-scan.rule.js";
import type { PriceRule } from "../../types.js";
import {
  MARK_ATTR,
  ORIGINAL_ATTR,
  RULE_ATTR,
} from "../../types.js";

export const KUFAR_RULE_ID = "kufar-text-scan";
export const TOOLTIP_ATTR = "data-byn-kufar-tooltip";
export const TOOLTIP_BOUND_ATTR = "data-byn-kufar-tooltip-bound";

/**
 * Same locate/format as Common text-scan; USD replace uses default apply.
 * Custom BYN tooltip is wired by KufarAdapter after scan.
 */
export const kufarTextScanRule: PriceRule = {
  id: KUFAR_RULE_ID,
  pathMatch: ["*"],
  locate: (root) => textScanRule.locate(root),
  format: (ctx) => textScanRule.format(ctx),
};

function ensureTooltip(): HTMLDivElement {
  let el = document.querySelector<HTMLDivElement>(`[${TOOLTIP_ATTR}]`);
  if (el) return el;

  el = document.createElement("div");
  el.setAttribute(TOOLTIP_ATTR, "true");
  el.setAttribute("role", "tooltip");
  el.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "pointer-events:none",
    "box-sizing:border-box",
    "max-width:min(280px,90vw)",
    "padding:6px 10px",
    "background:rgba(0,0,0,0.8)",
    "border-radius:8px",
    "font-size:14px",
    "line-height:1.3",
    "color:#fff",
    "white-space:nowrap",
    "opacity:0",
    "visibility:hidden",
    "transform:translate(-50%,-100%)",
    "transition:opacity 0.12s ease",
  ].join(";");
  document.documentElement.appendChild(el);
  return el;
}

function showTooltip(anchor: Element, text: string): void {
  const tip = ensureTooltip();
  tip.textContent = text;

  const rect = anchor.getBoundingClientRect();
  const top = rect.top - 8;
  const left = rect.left + rect.width / 2;

  tip.style.top = `${Math.max(8, top)}px`;
  tip.style.left = `${left}px`;
  tip.style.opacity = "1";
  tip.style.visibility = "visible";
}

function hideTooltip(): void {
  const tip = document.querySelector<HTMLDivElement>(`[${TOOLTIP_ATTR}]`);
  if (!tip) return;
  tip.style.opacity = "0";
  tip.style.visibility = "hidden";
}

export function removeKufarTooltip(): void {
  hideTooltip();
  document.querySelector(`[${TOOLTIP_ATTR}]`)?.remove();
}

/** Attach custom hover tooltip with original BYN on converted USD spans. */
export function attachKufarTooltips(root: ParentNode): void {
  const scope: ParentNode =
    root instanceof Document || root instanceof Element ? root : document;

  const usdSpans = (
    scope instanceof Document || scope instanceof Element ? scope : document
  ).querySelectorAll(`[${MARK_ATTR}][${RULE_ATTR}="${KUFAR_RULE_ID}"]`);

  usdSpans.forEach((usdEl) => {
    const original = usdEl.getAttribute(ORIGINAL_ATTR)?.trim() ?? "";
    if (!original) return;

    // Custom tooltip replaces the native title.
    usdEl.removeAttribute("title");

    if (usdEl.hasAttribute(TOOLTIP_BOUND_ATTR)) return;
    usdEl.setAttribute(TOOLTIP_BOUND_ATTR, "true");

    usdEl.addEventListener("mouseenter", () => {
      showTooltip(usdEl, original);
    });
    usdEl.addEventListener("mouseleave", () => {
      hideTooltip();
    });
  });
}
