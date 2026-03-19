/** Format price with currency symbol */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/** Calculate total with tax */
export function calculateTotalWithTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}

/** Calculate discount */
export function applyDiscount(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}
