// Pure, dependency-free check — no database — so it can be unit tested
// directly (see tests/productPricing.test.js) rather than only being
// exercised indirectly through a full stockOut() call, which needs a live
// MySQL connection.
//
// A product is only sellable if BOTH prices are genuinely positive. Zero
// (or missing/undefined) on either side means the product's pricing was
// never actually filled in — selling it would either silently record a
// meaningless profit calculation (revenue of $0) or, worse, a negative one
// (cost with no revenue at all).
export function hasValidPricing(product) {
  return Number(product.selling_price) > 0 && Number(product.purchase_price) > 0;
}
