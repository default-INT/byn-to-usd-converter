export type DetectedCurrency = "BYN" | "USD" | "EUR" | "RUB";

export interface MoneyMatch {
  raw: string;
  amount: number;
  currency: DetectedCurrency;
  index: number;
}

/** Matches forms like "100 BYN", "Br 100", "100 000 р.", "262 000 ƃ", "573 т.р.", "203 т. ƃ", "1,3 млн р.", "$100". */
export const MONEY_PATTERNS: ReadonlyArray<{
  currency: DetectedCurrency;
  regex: RegExp;
  /** Multiply parsed number (e.g. 1000 for "т.р.", 1e6 for "млн"). */
  multiplier?: number;
}> = [
  {
    currency: "BYN",
    // "573 т.р.", "203 т. ƃ", "от 573 т.р." — thousands (р. / ƃ on realt.by)
    regex: /(?:от\s+)?(\d[\d\s.,]*)\s*т\.?\s*(?:р\.?|ƃ)/gi,
    multiplier: 1_000,
  },
  {
    currency: "BYN",
    // "1,3 млн р.", "от 1,3 млн р.", "2 млн руб."
    regex: /(?:от\s+)?(\d[\d\s.,]*)\s*млн\.?\s*(?:р\.?|руб\.?|ƃ)/gi,
    multiplier: 1_000_000,
  },
  {
    currency: "BYN",
    // "р." / "р" / "ƃ" after amount (e.g. "100 000 р.", "262 000 ƃ" on realt.by)
    regex:
      /(\d[\d\s.,]*)\s*(?:BYN|б\.?\s*р\.?|руб\.?|ƃ|р\.?(?![а-яА-ЯёЁa-zA-Z]))/gi,
  },
  {
    currency: "BYN",
    regex: /(?:Br|BR)\s*(\d[\d\s.,]*)/gi,
  },
  {
    currency: "USD",
    regex: /\$\s*(\d[\d\s.,]*)/g,
  },
  {
    currency: "USD",
    regex: /(\d[\d\s.,]*)\s*(?:USD|US\$)/gi,
  },
];

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

export function findMoneyInText(text: string): MoneyMatch[] {
  const matches: MoneyMatch[] = [];

  for (const { currency, regex, multiplier = 1 } of MONEY_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const amountRaw = m[1] ?? m[0];
      const amount = parseAmount(amountRaw);
      if (amount === null) continue;
      matches.push({
        raw: m[0],
        amount: amount * multiplier,
        currency,
        index: m.index,
      });
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}
