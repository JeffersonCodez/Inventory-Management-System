import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlyMovement } from '../src/utils/monthlyMovement.js';

test('buildMonthlyMovement: groups real Date objects correctly (regression test for the "Invalid Date" bug)', () => {
  // These are real JS Date objects, exactly what mysql2 hands back for a
  // TIMESTAMP column — not strings. This is the exact shape that broke the
  // old String(t.created_at).slice(0, 7) logic.
  const rows = [
    { created_at: new Date('2026-06-10T00:00:00'), transaction_type: 'in', quantity: 10 },
    { created_at: new Date('2026-06-15T00:00:00'), transaction_type: 'out', quantity: 3 },
    { created_at: new Date('2026-07-01T00:00:00'), transaction_type: 'in', quantity: 7 },
  ];

  const result = buildMonthlyMovement(rows, 6);

  // Two distinct months, correctly separated — the bug would have merged
  // everything into one garbled, non-date key instead.
  assert.equal(result.length, 2);
  assert.equal(result[0].key, '2026-06');
  assert.equal(result[0].in, 10);
  assert.equal(result[0].out, 3);
  assert.equal(result[1].key, '2026-07');
  assert.equal(result[1].in, 7);
  assert.equal(result[1].out, 0);

  // The bug's visible symptom: no label should ever be the literal string
  // "Invalid Date".
  for (const month of result) {
    assert.notEqual(month.label, 'Invalid Date');
  }
  assert.equal(result[0].label, 'Jun');
  assert.equal(result[1].label, 'Jul');
});

test('buildMonthlyMovement: respects the `months` limit by keeping only the most recent buckets', () => {
  const rows = ['2026-01', '2026-02', '2026-03', '2026-04'].map((ym) => ({
    created_at: new Date(`${ym}-01T00:00:00`),
    transaction_type: 'in',
    quantity: 1,
  }));

  const result = buildMonthlyMovement(rows, 2);
  assert.deepEqual(result.map((r) => r.key), ['2026-03', '2026-04']);
});

test('buildMonthlyMovement: an empty transaction list returns an empty chart, not an error', () => {
  assert.deepEqual(buildMonthlyMovement([], 6), []);
});
