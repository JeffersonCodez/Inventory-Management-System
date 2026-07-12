export { resolveRange } from '../utils/dateRange.js';

// Groups raw sale rows into { key, label, profit, revenue, cost } buckets
// for the trend chart. Bucketing happens here in JavaScript rather than
// with a MySQL-specific DATE_FORMAT()/WEEK() function — the exact same
// portability tradeoff transactionController.js already makes for the
// Monthly Inventory Movement chart, documented there too.
export function buildTrend(rows, granularity = 'daily') {
  const keyFor = (soldAt) => {
    const d = new Date(soldAt);
    if (granularity === 'monthly') return d.toISOString().slice(0, 7); // '2026-07'
    if (granularity === 'weekly') return isoWeekKey(d); // '2026-W27'
    return d.toISOString().slice(0, 10); // '2026-07-06'
  };

  const buckets = {};
  for (const row of rows) {
    const key = keyFor(row.sold_at);
    if (!buckets[key]) buckets[key] = { profit: 0, revenue: 0, cost: 0 };
    buckets[key].profit += Number(row.total_profit);
    buckets[key].revenue += Number(row.total_revenue);
    buckets[key].cost += Number(row.total_cost);
  }

  return Object.keys(buckets)
    .sort()
    .map((key) => ({
      key,
      label: labelFor(key, granularity),
      profit: round2(buckets[key].profit),
      revenue: round2(buckets[key].revenue),
      cost: round2(buckets[key].cost),
    }));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ISO-8601 week number, e.g. 2026-07-06 -> '2026-W27'.
function isoWeekKey(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Turns a bucket key into a short axis label for the chart, e.g.
// '2026-07-06' -> 'Jul 6', '2026-07' -> 'Jul 2026', '2026-W27' -> 'W27'.
function labelFor(key, granularity) {
  if (granularity === 'monthly') {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  if (granularity === 'weekly') return key.split('-')[1];
  return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
