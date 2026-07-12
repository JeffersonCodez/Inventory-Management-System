import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveStatus } from '../src/utils/stockStatus.js';

test('deriveStatus: zero quantity is always "out"', () => {
  assert.equal(deriveStatus(0, 10), 'out');
  assert.equal(deriveStatus(0, 0), 'out');
});

test('deriveStatus: at or below minimum (but not zero) is "low"', () => {
  assert.equal(deriveStatus(5, 10), 'low');
  assert.equal(deriveStatus(10, 10), 'low'); // exactly at threshold counts as low
});

test('deriveStatus: above minimum is "ok"', () => {
  assert.equal(deriveStatus(11, 10), 'ok');
  assert.equal(deriveStatus(100, 0), 'ok');
});
