import { createDomObserver } from "@byn/dom-scanner";
import { resolveAdapter } from "@byn/adapters";
import type { RateResult } from "@byn/core";
import { SUPPORTED_SITE_MATCHES } from "../utils/supported-sites";

interface RateResponse {
  ok: boolean;
  rate?: RateResult;
  error?: string;
}

interface RateUpdatedMessage {
  type: "RATE_UPDATED";
  payload: RateResult;
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
    const adapter = resolveAdapter(location.hostname);
    let rate = await fetchRate();
    if (!rate) return;

    adapter.scan(document.body, rate);

    createDomObserver(document.body, (roots) => {
      if (!rate) return;
      for (const root of roots) {
        const scope =
          root instanceof Element || root instanceof Document
            ? root
            : root.parentElement;
        if (scope) adapter.scan(scope, rate);
      }
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as RateUpdatedMessage;
      if (msg?.type === "RATE_UPDATED" && msg.payload) {
        rate = msg.payload;
        adapter.restore();
        adapter.scan(document.body, rate);
      }
    });
  },
});
