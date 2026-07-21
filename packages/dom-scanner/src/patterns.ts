export type DetectedCurrency = "BYN" | "USD" | "EUR" | "RUB";

export interface MoneyMatch {
  raw: string;
  amount: number;
  currency: DetectedCurrency;
  index: number;
}

/** Matches forms like "100 BYN", "Br 100", "100 000 р.", "100 руб.", "$100". */
export const MONEY_PATTERNS: ReadonlyArray<{
  currency: DetectedCurrency;
  regex: RegExp;
}> = [
  {
    currency: "BYN",
    // "р." / "р" after amount (e.g. "100 000 р.") — common BYN shorthand
    regex: /(\d[\d\s.,]*)\s*(?:BYN|б\.?\s*р\.?|руб\.?|р\.?(?![а-яА-ЯёЁa-zA-Z]))/gi,
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

  for (const { currency, regex } of MONEY_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const amountRaw = m[1] ?? m[0];
      const amount = parseAmount(amountRaw);
      if (amount === null) continue;
      matches.push({
        raw: m[0],
        amount,
        currency,
        index: m.index,
      });
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}
