import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCSV, toXLSX, toPDF } from '../src/services/reportService.js';

const HEADERS = ['Date', 'Product', 'Quantity'];
const ROWS = [
  ['2026-07-06', 'Wooting keyboard', 1],
  ['2026-07-06', 'Cordless Drill', 5],
];

test('toCSV: quotes and escapes values, one row per line', () => {
  const csv = toCSV(HEADERS, [['2026-07-06', 'Product, with a comma', 1]]);
  const lines = csv.split('\n');
  assert.equal(lines[0], '"Date","Product","Quantity"');
  assert.equal(lines[1], '"2026-07-06","Product, with a comma","1"');
});

test('toCSV: embedded quotes are escaped by doubling them', () => {
  const csv = toCSV(HEADERS, [['2026-07-06', 'The "Best" Product', 1]]);
  assert.match(csv, /"The ""Best"" Product"/);
});

test('toXLSX: produces a real, valid .xlsx file (starts with the ZIP magic bytes)', async () => {
  const buffer = await toXLSX({ title: 'Stock Out Report', headers: HEADERS, rows: ROWS });
  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 2).toString(), 'PK'); // .xlsx is a ZIP archive
});

test('toXLSX: handles zero rows without throwing', async () => {
  const buffer = await toXLSX({ title: 'Stock Out Report', headers: HEADERS, rows: [] });
  assert.ok(buffer.length > 0);
});

test('toXLSX: a title longer than Excel\'s 31-character sheet name limit does not crash', async () => {
  const longTitle = 'A'.repeat(50);
  const buffer = await toXLSX({ title: longTitle, headers: HEADERS, rows: ROWS });
  assert.ok(buffer.length > 0);
});

test('toPDF: produces a real, valid .pdf file (starts with the PDF magic bytes)', async () => {
  const buffer = await toPDF({ title: 'Stock Out Report', subtitle: 'Jun 9 – Jul 9, 2026', headers: HEADERS, rows: ROWS });
  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
});

test('toPDF: handles zero rows without throwing', async () => {
  const buffer = await toPDF({ title: 'Stock Out Report', subtitle: 'No data', headers: HEADERS, rows: [] });
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
});

test('toPDF: a very long cell value does not crash the layout', async () => {
  const buffer = await toPDF({
    title: 'Stock Out Report',
    headers: HEADERS,
    rows: [['2026-07-06', 'X'.repeat(300), 1]],
  });
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
});

test('toPDF: enough rows to overflow one page produces a real multi-page PDF', async () => {
  const manyRows = Array.from({ length: 60 }, (_, i) => ['2026-07-06', `Product ${i}`, i + 1]);
  const buffer = await toPDF({ title: 'Stock Out Report', headers: HEADERS, rows: manyRows });
  // Every page object in a PDF is registered as '/Type /Page' — counting
  // these occurrences in the raw bytes is a simple, dependency-free way
  // to confirm more than one page was actually produced, not just that
  // the buffer is non-empty.
  const pageCount = (buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  assert.ok(pageCount >= 2, `expected at least 2 pages, found ${pageCount}`);
});
