import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateProfit } from '../src/utils/profitMath.js';

test('calculateProfit: matches the spec example exactly', () => {
  // Purchase ₱50, Sell ₱80, Qty 10 -> Profit ₱300 (the worked example from
  // the feature spec, used here as a regression check).
  const result = calculateProfit({ purchasePrice: 50, sellingPrice: 80, quantity: 10 });
  assert.equal(result.totalCost, 500);
  assert.equal(result.totalRevenue, 800);
  assert.equal(result.totalProfit, 300);
});

test('calculateProfit: a loss-making sale is not clamped to zero', () => {
  // Selling below cost (e.g. a clearance sale) is a real, legitimate
  // business event and should show up as a negative profit, not be hidden.
  const result = calculateProfit({ purchasePrice: 100, sellingPrice: 70, quantity: 2 });
  assert.equal(result.totalCost, 200);
  assert.equal(result.totalRevenue, 140);
  assert.equal(result.totalProfit, -60);
});

test('calculateProfit: avoids floating point drift on repeating decimals', () => {
  // 19.99 * 3 in naive floating point math can land on 59.97000000000001.
  const result = calculateProfit({ purchasePrice: 10, sellingPrice: 19.99, quantity: 3 });
  assert.equal(result.totalRevenue, 59.97);
});

test('calculateProfit: zero quantity means zero everything', () => {
  const result = calculateProfit({ purchasePrice: 50, sellingPrice: 80, quantity: 0 });
  assert.equal(result.totalCost, 0);
  assert.equal(result.totalRevenue, 0);
  assert.equal(result.totalProfit, 0);
});
