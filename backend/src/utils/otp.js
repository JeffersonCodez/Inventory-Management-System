import crypto from 'node:crypto';

// Pure, dependency-free OTP helpers — no database, no email sending — same
// reasoning as utils/profitMath.js: plain data in, plain data out, so the
// actual code-generation and matching logic can be unit tested directly
// (see tests/otp.test.js).

// crypto.randomInt is cryptographically secure (unlike Math.random),
// which matters here — a guessable OTP generator would defeat the whole
// point of the code, no matter how well the rest of the flow is built.
export function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// The raw 6-digit code is never stored — only this hash is. SHA-256 (not
// bcrypt) is deliberate here: bcrypt's slowness defends against offline
// brute-forcing of a LEAKED hash, which matters for passwords that live
// forever. An OTP is different — it's already short-lived (expiresAt),
// single-use, and rate-limited both per-code (see attempts in OtpCode.js)
// and per-IP (see middleware/rateLimiter.js), so a fast hash is fine and
// keeps verification snappy.
export function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function otpMatches(code, hash) {
  return hashOtp(code) === hash;
}

// 10 minutes — long enough for someone to switch to their email app and
// back, short enough that a leaked/guessed code stops being useful fast.
export function otpExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}
