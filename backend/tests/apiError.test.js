import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/utils/ApiError.js';

test('ApiError factory methods set the right status codes', () => {
  assert.equal(ApiError.badRequest('x').statusCode, 400);
  assert.equal(ApiError.unauthorized().statusCode, 401);
  assert.equal(ApiError.forbidden().statusCode, 403);
  assert.equal(ApiError.notFound().statusCode, 404);
  assert.equal(ApiError.conflict('x').statusCode, 409);
});

test('ApiError carries the field name through for form-level error display', () => {
  const err = ApiError.conflict('SKU already exists', 'sku');
  assert.equal(err.field, 'sku');
  assert.equal(err.message, 'SKU already exists');
});

test('ApiError is a real Error instance (works with try/catch and instanceof)', () => {
  const err = ApiError.notFound('Product not found');
  assert.ok(err instanceof Error);
  assert.ok(err instanceof ApiError);
});
