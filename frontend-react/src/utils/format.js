export function fmtMoney(n) {
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  if (!d) return '—';
  // `d` arrives in two different shapes depending on where it came from:
  //   - a plain 'YYYY-MM-DD' date-only string, e.g. from <input type="date">
  //   - a full ISO timestamp string like '2026-07-06T00:00:00.000Z' — what a
  //     MySQL TIMESTAMP/DATETIME column becomes once it round-trips through
  //     mysql2 (returned as a JS Date) and then JSON.stringify (which calls
  //     .toISOString() on Date objects).
  // Blindly appending 'T00:00:00' (the old behavior) only worked for the
  // first shape. For the second, it produced a malformed string with two
  // 'T's — unparsable, silently rendered as "Invalid Date". Detecting which
  // shape we actually got fixes both, in the one place every page reads
  // dates from.
  const hasTime = d.includes('T') || d.includes(' ');
  const date = hasTime ? new Date(d) : new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
