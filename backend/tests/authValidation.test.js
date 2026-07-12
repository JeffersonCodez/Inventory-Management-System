import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { validate } from '../src/middleware/validate.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import {
  registerValidation,
  verifySignupValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  resendOtpValidation,
} from '../src/routes/authRoutes.js';

// Same throwaway-server approach as tests/validation.test.js — real
// middleware, real HTTP requests, no live database needed since a 400
// from `validate` never reaches a controller.
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

test('registerValidation: rejects a short password', async () => {
  const server = await startTestServer(registerValidation);
  try {
    const res = await server.post({ name: 'Juan', email: 'juan@test.com', password: '1234567' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('registerValidation: accepts a valid signup payload', async () => {
  const server = await startTestServer(registerValidation);
  try {
    const res = await server.post({ name: 'Juan', email: 'juan@test.com', password: 'correcthorse' });
    assert.equal(res.status, 200);
  } finally {
    await server.close();
  }
});

test('verifySignupValidation: rejects a code that is not exactly 6 digits', async () => {
  const server = await startTestServer(verifySignupValidation);
  try {
    const tooShort = await server.post({ email: 'juan@test.com', code: '123' });
    assert.equal(tooShort.status, 400);
    const notNumeric = await server.post({ email: 'juan@test.com', code: 'abcdef' });
    assert.equal(notNumeric.status, 400);
  } finally {
    await server.close();
  }
});

test('verifySignupValidation: accepts a proper 6-digit code', async () => {
  const server = await startTestServer(verifySignupValidation);
  try {
    const res = await server.post({ email: 'juan@test.com', code: '048213' });
    assert.equal(res.status, 200);
  } finally {
    await server.close();
  }
});

test('forgotPasswordValidation: rejects a malformed email', async () => {
  const server = await startTestServer(forgotPasswordValidation);
  try {
    const res = await server.post({ email: 'not-an-email' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('resetPasswordValidation: rejects a new password under 8 characters', async () => {
  const server = await startTestServer(resetPasswordValidation);
  try {
    const res = await server.post({ email: 'juan@test.com', code: '048213', newPassword: 'short' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('resendOtpValidation: rejects a purpose that is not signup or password_reset', async () => {
  const server = await startTestServer(resendOtpValidation);
  try {
    const res = await server.post({ email: 'juan@test.com', purpose: 'anything-else' });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

test('resendOtpValidation: accepts both valid purposes', async () => {
  const server = await startTestServer(resendOtpValidation);
  try {
    const signup = await server.post({ email: 'juan@test.com', purpose: 'signup' });
    assert.equal(signup.status, 200);
    const reset = await server.post({ email: 'juan@test.com', purpose: 'password_reset' });
    assert.equal(reset.status, 200);
  } finally {
    await server.close();
  }
});
