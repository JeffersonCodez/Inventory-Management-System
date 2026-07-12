import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { validate } from '../src/middleware/validate.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { productCreateValidation, productUpdateValidation } from '../src/routes/productRoutes.js';
import { categoryValidation } from '../src/routes/categoryRoutes.js';
import { supplierValidation } from '../src/routes/supplierRoutes.js';

// Wraps a set of validators in a real (but throwaway) Express server, so
// these tests exercise the exact same middleware chain the real routes
// use — not a re-implementation of it — without needing a live MySQL
// connection. The dummy handler only runs if validation passed, so a 200
// response means "this input was accepted" and a 400 means "rejected".
// errorHandler is the SAME error middleware the real app uses — without
// it, a thrown ApiError falls through to Express's default HTML error
// page instead of the app's normal { error: { message } } JSON shape.
async function startTestServer(validators) {
  const app = express();
  app.use(express.json());
  app.post('/test', validators, validate, (req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;

  return {
    post: (body) =>
      fetch(`http://localhost:${port}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('product UPDATE validation: a full valid payload is accepted', async () => {
  const server = await startTestServer(productUpdateValidation);
  try {
    const res = await server.post({ name: 'Bond Paper', sku: 'BP-01', categoryId: 1, supplierId: 1, unit: 'ream', quantity: 10, minimumStock: 2, purchasePrice: 50, sellingPrice: 80 });
    assert.equal(res.status, 200);
  } finally {
    await server.close();
  }
});

test('product UPDATE validation: a partial payload (just quantity) is accepted', async () => {
  // This is the whole point of using .optional() on the update rules — the
  // controller merges partial updates with the existing row, so a request
  // that only changes quantity must NOT be rejected for "missing" name/sku/etc.
  const server = await startTestServer(productUpdateValidation);
  try {
    const res = await server.post({ quantity: 25 });
    assert.equal(res.status, 200);
  } finally {
    await server.close();
  }
});

test('product UPDATE validation: rejects a negative quantity even on a partial payload', async () => {
  const server = await startTestServer(productUpdateValidation);
  try {
    const res = await server.post({ quantity: -5 });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.error.message, /zero or more/);
  } finally {
    await server.close();
  }
});

test('product UPDATE validation: rejects a $0 selling price (regression test for the "Dior Bag" bug)', async () => {
  // A product with a purchase price but no selling price at all used to
  // slip through here (isFloat({ min: 0 }) accepts 0), then produced a
  // nonsensical negative profit the moment it was sold.
  const server = await startTestServer(productUpdateValidation);
  try {
    const res = await server.post({ sellingPrice: 0 });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.error.message, /greater than zero/);
  } finally {
    await server.close();
  }
});

test('product CREATE validation: rejects a $0 purchase price or selling price', async () => {
  const server = await startTestServer(productCreateValidation);
  try {
    const zeroSelling = await server.post({
      name: 'Dior Bag', sku: 'ABD-1233', categoryId: 1, supplierId: 1, unit: 'bag',
      quantity: 1, minimumStock: 5, purchasePrice: 10, sellingPrice: 0,
    });
    assert.equal(zeroSelling.status, 400);

    const zeroPurchase = await server.post({
      name: 'Dior Bag', sku: 'ABD-1233', categoryId: 1, supplierId: 1, unit: 'bag',
      quantity: 1, minimumStock: 5, purchasePrice: 0, sellingPrice: 20,
    });
    assert.equal(zeroPurchase.status, 400);
  } finally {
    await server.close();
  }
});

test('product CREATE validation: rejects a payload missing required fields (unlike update)', async () => {
  // Same "quantity: 25 only" payload that passed on UPDATE must FAIL on
  // CREATE, since there's no existing row to fall back to for name/sku/etc.
  const server = await startTestServer(productCreateValidation);
  try {
    const res = await server.post({ quantity: 25 });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('category validation: rejects a request with no name (would otherwise NULL out the name column)', async () => {
  const server = await startTestServer(categoryValidation);
  try {
    const res = await server.post({ description: 'Only a description, no name' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('category validation: accepts a name with no description', async () => {
  const server = await startTestServer(categoryValidation);
  try {
    const res = await server.post({ name: 'Office Supplies' });
    assert.equal(res.status, 200);
  } finally {
    await server.close();
  }
});

test('supplier validation: rejects a malformed email', async () => {
  const server = await startTestServer(supplierValidation);
  try {
    const res = await server.post({ name: 'Acme Corp', email: 'not-an-email' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('supplier validation: accepts a valid email, and no email at all', async () => {
  const server = await startTestServer(supplierValidation);
  try {
    const withEmail = await server.post({ name: 'Acme Corp', email: 'orders@acme.com' });
    assert.equal(withEmail.status, 200);
    const withoutEmail = await server.post({ name: 'Acme Corp' });
    assert.equal(withoutEmail.status, 200);
  } finally {
    await server.close();
  }
});
