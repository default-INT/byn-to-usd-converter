# BYN → USD Converter

Browser extension that finds Belarusian ruble (BYN) amounts on web pages and shows approximate USD equivalents using official exchange rates.

## Decisions

| Topic | Choice |
| --- | --- |
| Extension tooling | **WXT** (Vite-based, multi-browser ready) |
| Primary rate provider | **National Bank of Belarus (НБ РБ)** — official, free |
| Fallback provider | exchangerate.host (planned) |
| Package manager / monorepo | **pnpm** + **Turborepo** |
| UI | React (popup + options) |

## Current scope

Chrome extension only. Firefox, Safari (macOS), and iOS Safari wrapper are documented in the target layout below and will be added later.

## Monorepo layout

```
byn-to-usd-converter/
├── apps/
│   ├── extension/                     # WXT: Chrome (Firefox / Safari later)
│   │   ├── entrypoints/
│   │   │   ├── background.ts          # service worker: poll rates, cache, broadcast
│   │   │   ├── content.ts             # DOM scan, insert converted amounts
│   │   │   ├── popup/                 # React popup
│   │   │   └── options/               # React options page
│   │   ├── wxt.config.ts
│   │   └── package.json
│   └── safari-wrapper/                # (planned) Xcode project: macOS + iOS targets
│       ├── BYNConverter.xcodeproj
│       ├── Shared (App)/
│       ├── macOS (Extension)/
│       └── iOS (Extension)/
├── packages/
│   ├── core/                          # pure TypeScript, no browser APIs
│   │   └── src/
│   │       ├── currency/types.ts      # CurrencyCode, Money, RateResult
│   │       ├── providers/
│   │       │   ├── provider.interface.ts
│   │       │   ├── nbrb.provider.ts   # primary
│   │       │   ├── exchangerate-host.provider.ts
│   │       │   └── registry.ts        # priority + fallback chain
│   │       ├── conversion/
│   │       │   ├── conversion-engine.ts
│   │       │   └── cache.ts           # TTL rate cache
│   │       └── storage/storage.interface.ts  # abstraction over chrome.storage
│   ├── dom-scanner/                   # find prices in page text
│   │   └── src/
│   │       ├── patterns.ts            # regex for "100 BYN", "Br 100", "$100"
│   │       └── observer.ts            # MutationObserver for SPAs
│   ├── adapters/                      # site adapters (extension + future Safari)
│   │   └── src/
│   │       ├── types.ts               # PriceRule, SiteAdapter, pathMatch
│   │       ├── resolve.ts             # hostname → adapter (Common fallback)
│   │       └── common/                # default text-scan rule
│   └── ui-kit/                        # shared React components (popup / options)
├── eslint.config.js                   # flat ESLint sketch (TS + React)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### Package responsibilities

- **`@byn/core`** — currency types, rate providers, conversion engine, in-memory TTL cache, storage interface. Must remain browser-API free so it stays testable in Node.
- **`@byn/dom-scanner`** — text patterns and DOM observation (no site-specific UI).
- **`@byn/adapters`** — site adapters with `PriceRule`s (`pathMatch`, locate, format, apply). Shared by the Chrome extension and future Safari / iOS clients. `CommonAdapter` is the default.
- **`@byn/ui-kit`** — small shared React building blocks for popup and options.
- **`@byn/extension`** — WXT app that wires everything with Chrome APIs (`chrome.storage`, alarms, messaging).

## Getting started

```bash
pnpm install
pnpm dev          # WXT Chrome extension in watch mode
pnpm build        # build all packages + extension
pnpm lint
pnpm typecheck
```

Load the unpacked build from `apps/extension/.output/chrome-mv3` (path may vary slightly by WXT version) in `chrome://extensions`.

## Rate providers

1. **НБ РБ (`NbrbProvider`)** — `https://api.nbrb.by/exrates/rates` (first in the fallback chain).
2. **exchangerate.host** — secondary; used when NBRB fails.

Polling interval defaults to 60 minutes via `chrome.alarms` in the background service worker.

## Lint

Root flat config: [`eslint.config.js`](./eslint.config.js). It covers TypeScript + React Hooks and restricts browser globals inside `packages/core`.

## License

MIT — see [LICENSE](./LICENSE).
