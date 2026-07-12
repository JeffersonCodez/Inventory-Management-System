import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination, buildPaginationMeta } from '../src/utils/pagination.js';

test('parsePagination: applies defaults when query is empty', () => {
  const { page, limit, offset } = parsePagination({});
  assert.equal(page, 1);
  assert.equal(limit, 20);
  assert.equal(offset, 0);
});

test('parsePagination: computes offset from page and limit', () => {
  const { page, limit, offset } = parsePagination({ page: '3', limit: '10' });
  assert.equal(page, 3);
  assert.equal(limit, 10);
  assert.equal(offset, 20);
});

test('parsePagination: clamps below 1 and above maxLimit', () => {
  assert.equal(parsePagination({ page: '-5' }).page, 1);
  assert.equal(parsePagination({ limit: '9999' }, { maxLimit: 100 }).limit, 100);
  assert.equal(parsePagination({ limit: '0' }).limit, 1);
});

test('parsePagination: ignores garbage input rather than producing NaN', () => {
  const { page, limit } = parsePagination({ page: 'abc', limit: 'xyz' });
  assert.equal(Number.isNaN(page), false);
  assert.equal(Number.isNaN(limit), false);
});

test('buildPaginationMeta: computes totalPages correctly, including exact divisions', () => {
  assert.equal(buildPaginationMeta(45, 1, 20).totalPages, 3);
  assert.equal(buildPaginationMeta(40, 1, 20).totalPages, 2);
  assert.equal(buildPaginationMeta(0, 1, 20).totalPages, 1); // never zero pages
});
