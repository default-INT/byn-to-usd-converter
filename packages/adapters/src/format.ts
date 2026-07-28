/** e.g. 100000 → "$100 000" */
export function formatUsdCompact(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${rounded < 0 ? "-" : ""}$${grouped}`;
}

/** e.g. 179062 → "$179 k" (thousands of USD, for map markers). */
export function formatUsdK(amount: number): string {
  const k = Math.round(amount / 1000);
  return `${k < 0 ? "-" : ""}$${Math.abs(k)} k`;
}

/** e.g. 440244 → "440 244 р." */
export function formatBynCompact(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${rounded < 0 ? "-" : ""}${grouped} р.`;
}
