import rateLimit from 'express-rate-limit';

// A factory, not just a single exported instance — this is what lets tests
// spin up a fresh, isolated limiter (a clean counter, as if the app had
// just started) instead of all sharing one global counter and polluting
// each other's results. The real app below still only ever creates ONE
// instance for its whole lifetime, which is what you actually want in
// production: a single shared counter per IP, not one that resets on every
// import.
export function createLoginLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true, // sends RateLimit-* headers so well-behaved clients can back off
    legacyHeaders: false,
    message: { error: { message: 'Too many login attempts. Please try again in 15 minutes.' } },
    // Successful logins don't count against the limit — only failed attempts
    // accumulate, so a legitimate user who succeeds on their 2nd try isn't
    // penalized for the 1st.
    skipSuccessfulRequests: true,
  });
}

// Throttles login attempts per IP address. Without this, nothing stops an
// attacker (or a buggy script) from trying thousands of passwords per
// second against a known email — bcrypt.compare() is slow on purpose, but
// that only helps if attempts are also rate-limited at the network level.
//
// 5 attempts / 15 minutes is deliberately strict: a real user mistyping
// their password twice is normal; a script trying hundreds of passwords is
// not. Keyed by IP (the default), so it doesn't lock out other users
// sharing a login form — it only slows down repeated failures from the
// same source.
export const loginLimiter = createLoginLimiter();

// Separate, stricter limiter for anything that sends a real email (Sign
// Up, Resend Code, Forgot Password). Unlike login attempts, every request
// here — successful or not — costs a real email send, so there's no
// skipSuccessfulRequests here: a script hammering "send me another code"
// needs to be stopped even though each individual request "succeeds".
// 3 per 15 minutes is enough for a real person who fat-fingered their
// email or didn't get the first one, but not enough to spam someone's
// inbox or rack up mail-provider costs.
export function createOtpRequestLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests. Please wait a few minutes and try again.' } },
  });
}

export const otpRequestLimiter = createOtpRequestLimiter();

// Looser than the OTP limiter — this is an authenticated action a logged-in
// user takes on their OWN account (emailing themselves a copy of a
// report), not a public, unauthenticated endpoint someone could point at a
// stranger's inbox. Still capped, mainly to catch an accidental retry loop
// rather than to stop a determined attacker — there isn't much attack
// surface here since it can only ever send to the requesting user's own
// account email (see reportController.emailReport).
export function createEmailReportLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many report emails sent. Please wait a few minutes and try again.' } },
  });
}

export const emailReportLimiter = createEmailReportLimiter();
