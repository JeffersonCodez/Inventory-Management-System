import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasValidPricing } from '../src/utils/productPricing.js';

test('hasValidPricing: true when both prices are genuinely positive', () => {
  assert.equal(hasValidPricing({ purchase_price: 10, selling_price: 15 }), true);
});

test('hasValidPricing: false when selling price is exactly zero (the reported bug)', () => {
  // This is the exact "Dior Bag" scenario — purchase price filled in,
  // selling price left at its old default of 0.
  assert.equal(hasValidPricing({ purchase_price: 10, selling_price: 0 }), false);
});

test('hasValidPricing: false when purchase price is exactly zero', () => {
  assert.equal(hasValidPricing({ purchase_price: 0, selling_price: 15 }), false);
});

test('hasValidPricing: false when a price is negative', () => {
  assert.equal(hasValidPricing({ purchase_price: -5, selling_price: 15 }), false);
});

test('hasValidPricing: false when a price is missing entirely', () => {
  assert.equal(hasValidPricing({ purchase_price: 10 }), false);
});

test('hasValidPricing: handles string values from the database the same as numbers', () => {
  // MySQL's DECIMAL columns come back through mysql2 as strings, not
  // numbers — this must not be mistaken for "any string is truthy, so
  // it's fine".
  assert.equal(hasValidPricing({ purchase_price: '10.00', selling_price: '0.00' }), false);
  assert.equal(hasValidPricing({ purchase_price: '10.00', selling_price: '15.00' }), true);
});
