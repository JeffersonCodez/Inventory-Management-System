// Pure aggregation logic for the dashboard's Monthly Inventory Movement
// chart, deliberately kept free of any database dependency — same reason
// as utils/profitMath.js: plain data in, plain data out, so it can be unit
// tested directly (see tests/monthlyMovement.test.js) without a live MySQL
// connection, and so the previous bug (grouping by a garbled key because
// String(dateObject) isn't what it looks like) can never silently reappear
// unnoticed.
export function buildMonthlyMovement(rows, months = 6) {
  const byMonth = {};
  for (const row of rows) {
    // `row.created_at` may be a live JS Date object (what mysql2 returns
    // for a TIMESTAMP column) or, in theory, a string — `new Date(...)`
    // normalizes either into a real Date before we ask it for an ISO
    // string, rather than assuming which shape we already have.
    const key = new Date(row.created_at).toISOString().slice(0, 7); // 'YYYY-MM'
    if (!byMonth[key]) byMonth[key] = { in: 0, out: 0 };
    byMonth[key][row.transaction_type] += row.quantity;
  }

  const sortedKeys = Object.keys(byMonth).sort().slice(-months);
  return sortedKeys.map((key) => {
    const [y, m] = key.split('-');
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
    return { key, label, in: byMonth[key].in, out: byMonth[key].out };
  });
}
