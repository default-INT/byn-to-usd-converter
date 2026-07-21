import { findMoneyInText, createDomObserver } from "@byn/dom-scanner";
import type { RateResult } from "@byn/core";
import { SUPPORTED_SITE_MATCHES } from "../utils/supported-sites";

const MARK_ATTR = "data-byn-converted";
const ORIGINAL_ATTR = "data-byn-original";

interface RateResponse {
  ok: boolean;
  rate?: RateResult;
  error?: string;
}

interface RateUpdatedMessage {
  type: "RATE_UPDATED";
  payload: RateResult;
}

/** e.g. 100000 → "$100 000" */
function formatUsd(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${rounded < 0 ? "-" : ""}$${grouped}`;
}

function convertBynToUsd(amount: number, rate: RateResult): number {
  return amount * rate.rate;
}

function createUsdReplacement(original: string, usdAmount: number): HTMLSpanElement {
  const el = document.createElement("span");
  el.setAttribute(MARK_ATTR, "true");
  el.setAttribute(ORIGINAL_ATTR, original);
  el.title = original;
  el.textContent = formatUsd(usdAmount);
  // Keep surrounding site typography/color; only enable native tooltip.
  el.style.cssText =
    "all:unset;display:inline;cursor:inherit;font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;vertical-align:baseline;";
  return el;
}

function annotateTextNode(node: Text, rate: RateResult): void {
  const parent = node.parentElement;
  if (!parent || parent.closest(`[${MARK_ATTR}]`)) return;
  if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) return;

  const text = node.textContent ?? "";
  const matches = findMoneyInText(text).filter((m) => m.currency === "BYN");
  if (matches.length === 0) return;

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of matches) {
    if (match.index < cursor) continue;

    if (match.index > cursor) {
      fragment.appendChild(
        document.createTextNode(text.slice(cursor, match.index)),
      );
    }

    fragment.appendChild(
      createUsdReplacement(match.raw, convertBynToUsd(match.amount, rate)),
    );

    cursor = match.index + match.raw.length;
  }

  if (cursor < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(cursor)));
  }

  node.parentNode?.replaceChild(fragment, node);
}

function restoreConvertedAmounts(): void {
  document.querySelectorAll(`[${MARK_ATTR}]`).forEach((el) => {
    const original = el.getAttribute(ORIGINAL_ATTR);
    el.replaceWith(document.createTextNode(original ?? ""));
  });
}

function scanRoot(root: Node, rate: RateResult): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  for (const node of nodes) annotateTextNode(node, rate);
}

async function fetchRate(): Promise<RateResult | null> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: "GET_RATE",
    })) as RateResponse;
    if (response?.ok && response.rate) return response.rate;
  } catch (err) {
    console.error("Failed to get rate from background", err);
  }
  return null;
}

export default defineContentScript({
  matches: [...SUPPORTED_SITE_MATCHES],
  runAt: "document_idle",
  async main() {
    let rate = await fetchRate();
    if (!rate) return;

    scanRoot(document.body, rate);

    createDomObserver(document.body, (roots) => {
      if (!rate) return;
      for (const root of roots) scanRoot(root, rate);
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as RateUpdatedMessage;
      if (msg?.type === "RATE_UPDATED" && msg.payload) {
        rate = msg.payload;
        restoreConvertedAmounts();
        scanRoot(document.body, rate);
      }
    });
  },
});
