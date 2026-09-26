/** Rumus diskon Flash Sale. */
export function discountPercentOf(normalPrice: number, promoPrice: number): number {
  if (normalPrice <= 0) return 0;
  return Math.max(0, Math.round(((normalPrice - promoPrice) / normalPrice) * 100));
}
