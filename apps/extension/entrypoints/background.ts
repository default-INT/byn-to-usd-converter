import {
  ConversionEngine,
  ExchangeRateHostProvider,
  NbrbProvider,
  ProviderRegistry,
  type RateResult,
} from "@byn/core";

const POLL_ALARM = "rate-poll";
const POLL_MINUTES = 60;
const CACHE_KEY = "rate:BYN:USD";

interface GetRateMessage {
  type: "GET_RATE";
}

type IncomingMessage = GetRateMessage | { type?: string };

const registry = new ProviderRegistry([
  new NbrbProvider(),
  new ExchangeRateHostProvider(),
]);
const engine = new ConversionEngine(registry);

async function refreshRate(): Promise<RateResult> {
  const rate = await engine.getRate("BYN", "USD");
  await browser.storage.local.set({ [CACHE_KEY]: rate });
  return rate;
}

async function broadcastRate(rate: RateResult): Promise<void> {
  const tabs = await browser.tabs.query({});
  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id == null) return;
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: "RATE_UPDATED",
          payload: rate,
        });
      } catch {
        // Tab may not have a content script.
      }
    }),
  );
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void refreshRate()
      .then(broadcastRate)
      .catch((err: unknown) => console.error("Initial rate fetch failed", err));

    void browser.alarms.create(POLL_ALARM, { periodInMinutes: POLL_MINUTES });
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== POLL_ALARM) return;
    void refreshRate()
      .then(broadcastRate)
      .catch((err: unknown) => console.error("Scheduled rate fetch failed", err));
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const msg = message as IncomingMessage;
    if (msg?.type === "GET_RATE") {
      void (async () => {
        const stored = await browser.storage.local.get(CACHE_KEY);
        const cached = stored[CACHE_KEY] as RateResult | undefined;
        if (cached) {
          sendResponse({ ok: true, rate: cached });
          return;
        }
        try {
          const rate = await refreshRate();
          sendResponse({ ok: true, rate });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    }

    return true;
  });
});
