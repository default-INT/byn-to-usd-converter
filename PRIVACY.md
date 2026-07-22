# Privacy Policy — BYN → USD Converter

**Last updated:** July 22, 2026

This privacy policy describes how the **BYN → USD Converter** browser extension (“Extension”, “we”, “us”) handles information when you use it.

The Extension is developed by Yauheni Trafimau. We do not operate a backend service and do not build user profiles.

---

## Summary

- We **do not collect**, store on our servers, or sell **personally identifiable information**.
- All conversion work happens **locally in your browser**.
- The Extension stores a small amount of data **only on your device** (exchange rate cache and on/off setting).
- Network requests are limited to **public exchange-rate APIs**.

---

## What the Extension does on web pages

On supported websites (currently `re.kufar.by`, `realt.by`, `av.by`, and their `www` variants), a content script:

1. Reads page text and DOM elements to find Belarusian ruble (BYN) amounts.
2. Replaces or annotates those amounts with approximate USD equivalents using a cached exchange rate.

This processing happens **entirely on your device**. Page content, prices, URLs, and browsing history are **not transmitted to us** or to any server we control.

---

## Data stored locally on your device

The Extension uses Chrome’s `storage` API (`chrome.storage.local`) to keep:

| Key | Purpose | Contents |
| --- | --- | --- |
| `rate:BYN:USD` | Cache the latest exchange rate | Public rate data: base/quote currencies, numeric rate, timestamp, provider name |
| `settings:enabled` | Remember whether conversion is turned on | `true` or `false` |

This data stays on your computer. Uninstalling the Extension or clearing extension storage removes it.

We do **not** sync this data across devices unless you use a browser profile sync feature provided by your browser vendor (outside our control).

---

## Network requests (third-party services)

The Extension’s background service worker periodically fetches exchange rates from:

1. **National Bank of the Republic of Belarus (НБ РБ)** — `https://api.nbrb.by/` (primary)
2. **exchangerate.host** — `https://api.exchangerate.host/` (fallback)

These requests retrieve **public JSON rate data only**. We do not send your name, email, account credentials, page content, or browsing history to these APIs.

Those providers may receive standard technical information (such as IP address and browser user agent) as part of normal HTTPS traffic. Their handling of that data is governed by their own policies:

- [NBRB API documentation](https://www.nbrb.by/apihelp/exrates)
- [exchangerate.host](https://exchangerate.host/)

---

## What we do not collect

We do **not** collect, store, or transmit:

- Names, emails, phone numbers, or other contact details
- Authentication or payment information
- Full page content or listings you view
- Browsing history or search queries
- Precise location
- Analytics or advertising identifiers

There is no account registration, no telemetry SDK, and no developer-controlled server in this project.

---

## Permissions

| Permission | Why it is used |
| --- | --- |
| `storage` | Save cached exchange rate and enabled/disabled setting locally |
| `alarms` | Refresh the exchange rate on a schedule while the browser is running |
| Host access to supported sites | Run the content script that finds and converts BYN amounts |
| Host access to rate APIs | Fetch official / fallback exchange rates |

---

## Children’s privacy

The Extension is a general-purpose currency display tool and is not directed at children under 13. We do not knowingly collect personal information from anyone.

---

## Changes to this policy

We may update this policy when the Extension changes (for example, new supported sites or data practices). The “Last updated” date at the top will be revised accordingly. Continued use after changes means you accept the updated policy.

---

## Contact

Questions or privacy requests:

- GitHub Issues: [github.com/default-INT/byn-to-usd-converter/issues](https://github.com/default-INT/byn-to-usd-converter/issues)

---

## Chrome Web Store disclosure

For the Chrome Web Store **Privacy practices** form, this Extension:

- Does **not** collect personally identifiable information for transmission to the developer.
- Processes page content **locally** only to display currency conversions.
- Uses third-party APIs solely to obtain public exchange rates.

If you publish the Extension, use the public URL of this file (for example, on GitHub) as the **Privacy policy** link in the developer dashboard.
