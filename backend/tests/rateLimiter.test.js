import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createLoginLimiter } from '../src/middleware/rateLimiter.js';

// `respondWith` lets each test decide whether the dummy login handler
// "succeeds" (2xx) or "fails" (401) on every request, which is exactly the
// distinction skipSuccessfulRequests cares about — express-rate-limit only
// counts a request against the limit if the response status is >= 400.
//
// Each call gets its OWN limiter instance via createLoginLimiter() — using
// the shared `loginLimiter` singleton here would let one test's requests
// count toward the next test's limit (they'd all be seen as the same IP:
// localhost), since a module-level singleton keeps one counter for the
// life of the process, tests included.
async function startServer(respondWith) {
  const app = express();
  app.post('/login', createLoginLimiter(), (req, res) => res.status(respondWith).json({}));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  return {
    attempt: () => fetch(`http://localhost:${port}/login`, { method: 'POST' }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('loginLimiter: allows 5 failed attempts, blocks the 6th', async () => {
  const server = await startServer(401); // every attempt "fails", like a wrong password
  try {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await server.attempt()).status);
    }
    assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429]);
  } finally {
    await server.close();
  }
});

test('loginLimiter: successful logins are never counted against the limit', async () => {
  const server = await startServer(200); // every attempt "succeeds"
  try {
    const statuses = [];
    for (let i = 0; i < 10; i++) {
      statuses.push((await server.attempt()).status);
    }
    // 10 is well past the limit of 5 — if successes counted, this would
    // start returning 429 partway through. None should, since
    // skipSuccessfulRequests only counts responses >= 400.
    assert.ok(statuses.every((s) => s === 200), `expected all 200s, got ${statuses}`);
  } finally {
    await server.close();
  }
});
