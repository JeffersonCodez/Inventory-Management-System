// Status is always derived, never stored — this is the single source of
// truth so it can never drift out of sync with quantity / minimum_stock.
export function deriveStatus(quantity, minimumStock) {
  if (quantity === 0) return 'out';
  if (quantity <= minimumStock) return 'low';
  return 'ok';
}
