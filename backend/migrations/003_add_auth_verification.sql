-- Adds Sign Up (with email verification) and Forgot Password support.
--
-- Design decisions worth knowing:
--
-- 1. `email_verified` defaults to 1 (true). This matters because it's an
--    ALTER on a table that may already have real rows in it — your seeded
--    admin/staff accounts, and any users an admin has created through the
--    Users page. Defaulting to 1 means every EXISTING account keeps
--    working exactly as before; only brand-new accounts created through
--    the new public Sign Up form start out at 0 (unverified) and get
--    flipped to 1 once they enter the correct OTP.
--
-- 2. `otp_codes` is keyed by `email`, not `user_id`. A signup OTP is
--    requested for an email that (in this design) already has a row in
--    `users` — just an unverified one — so `user_id` would technically
--    work for both signup and password-reset codes. Keying by email
--    instead keeps the table's meaning simple either way: "this email
--    proved it can receive mail for this purpose," independent of exactly
--    when the user row was created.
--
-- 3. Only the CODE is stored, never in plain text — `code_hash` is a
--    SHA-256 hash of the 6-digit code. A short numeric code is inherently
--    guessable (only 1,000,000 possibilities), which is exactly why
--    `attempts` and `expires_at` exist: the code is only ever useful
--    within a short window, from a single IP under rate limiting (see
--    middleware/rateLimiter.js), with a hard cap on wrong guesses.

USE ledger_inventory;

ALTER TABLE users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1 AFTER role;

CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  purpose ENUM('signup', 'password_reset') NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_purpose (email, purpose)
);
