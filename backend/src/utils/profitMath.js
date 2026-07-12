// Pure profit-calculation logic, deliberately kept free of any database
// dependency (no `pool`, no imports from models/) — same pattern as
// utils/stockStatus.js. Because it's just plain math in, plain numbers out,
// it can be unit tested directly (see tests/profitMath.test.js) without
// spinning up MySQL, and it can be reused anywhere profit needs computing
// (right now that's just stockService.js, but a future "edit a past sale"
// feature would reuse this exact function too).

// Rounds to 2 decimal places using integer math to avoid classic floating
// point artifacts (e.g. 0.1 + 0.2 !== 0.3) creeping into money values.
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Profit = (Selling Price - Purchase Price) x Quantity Sold
 *
 * Returns all three figures a sale needs to record, not just profit,
 * because the sales table stores total_cost and total_revenue too
 * (they're what the Reports page sums for "Total Revenue" / "Total Cost").
 */
export function calculateProfit({ purchasePrice, sellingPrice, quantity }) {
  const totalCost = round2(purchasePrice * quantity);
  const totalRevenue = round2(sellingPrice * quantity);
  const totalProfit = round2(totalRevenue - totalCost);
  return { totalCost, totalRevenue, totalProfit };
}
