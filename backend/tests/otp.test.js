import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateOtp, hashOtp, otpMatches, otpExpiryDate } from '../src/utils/otp.js';

test('generateOtp: always produces a 6-digit numeric string, including with leading zeros', () => {
  // Run many times — crypto.randomInt(0, 1_000_000) can legitimately
  // return small numbers like 42, which must still come out as "000042",
  // not "42". A single run could get lucky and miss that case entirely.
  for (let i = 0; i < 500; i++) {
    const code = generateOtp();
    assert.equal(code.length, 6, `expected 6 chars, got "${code}"`);
    assert.match(code, /^\d{6}$/, `expected only digits, got "${code}"`);
  }
});

test('hashOtp: is deterministic — the same code always hashes the same way', () => {
  assert.equal(hashOtp('123456'), hashOtp('123456'));
});

test('hashOtp: different codes hash differently', () => {
  assert.notEqual(hashOtp('123456'), hashOtp('654321'));
});

test('otpMatches: true for the correct code, false for anything else', () => {
  const hash = hashOtp('482913');
  assert.equal(otpMatches('482913', hash), true);
  assert.equal(otpMatches('482914', hash), false);
  assert.equal(otpMatches('', hash), false);
});

test('otpExpiryDate: is roughly 10 minutes in the future', () => {
  const expiry = otpExpiryDate();
  const diffMinutes = (expiry.getTime() - Date.now()) / 60000;
  assert.ok(diffMinutes > 9.9 && diffMinutes <= 10, `expected ~10 minutes, got ${diffMinutes}`);
});
