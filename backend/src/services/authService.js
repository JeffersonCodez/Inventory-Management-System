import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OtpCode } from '../models/OtpCode.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendMail } from '../utils/mailer.js';
import { generateOtp, hashOtp, otpMatches, otpExpiryDate } from '../utils/otp.js';

// A code is allowed to be guessed wrong this many times before it's
// invalidated outright — otherwise a script could sit there trying all
// 1,000,000 possibilities against one still-valid code.
const MAX_OTP_ATTEMPTS = 5;

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

async function issueAndSendOtp({ email, purpose, subject, bodyFor }) {
  const code = generateOtp();
  await OtpCode.create({ email, purpose, codeHash: hashOtp(code), expiresAt: otpExpiryDate() });
  await sendMail({ to: email, subject, text: bodyFor(code) });
}

// Shared by signup verification and password-reset verification — same
// checks either way: does a code exist, has it expired, has it been
// guessed wrong too many times, does it actually match. Consuming
// (deleting) the row on every terminal outcome — success, expiry, or
// attempts exhausted — means a code is never usable a second time no
// matter how it stopped being valid.
async function verifyOtpOrThrow({ email, purpose, code }) {
  const record = await OtpCode.findLatest({ email, purpose });
  if (!record) throw ApiError.badRequest('Invalid or expired code', 'code');

  if (new Date(record.expires_at) < new Date()) {
    await OtpCode.consume(record.id);
    throw ApiError.badRequest('This code has expired — request a new one', 'code');
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await OtpCode.consume(record.id);
    throw ApiError.badRequest('Too many incorrect attempts — request a new code', 'code');
  }

  if (!otpMatches(code, record.code_hash)) {
    await OtpCode.incrementAttempts(record.id);
    throw ApiError.badRequest('Incorrect code', 'code');
  }

  await OtpCode.consume(record.id);
}

// --- Sign Up ---------------------------------------------------------------

export async function requestSignup({ name, email, password }) {
  const existing = await User.findByEmail(email);

  if (existing && existing.email_verified) {
    throw ApiError.conflict('An account with this email already exists', 'email');
  }
  if (existing && !existing.email_verified) {
    // An abandoned earlier signup attempt for this email — clear it so
    // they can try again cleanly (e.g. they mistyped the password the
    // first time and never got as far as verifying).
    await User.removeUnverifiedByEmail(email);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.createUnverified({ name, email, passwordHash });

  await issueAndSendOtp({
    email,
    purpose: 'signup',
    subject: 'Verify your Ledger Inventory account',
    bodyFor: (code) => `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function confirmSignup({ email, code }) {
  const user = await User.findByEmail(email);
  if (!user || user.email_verified) {
    throw ApiError.badRequest('No pending signup found for this email', 'email');
  }

  await verifyOtpOrThrow({ email, purpose: 'signup', code });
  await User.markEmailVerified(email);

  // Log the person straight in on success — they just proved they own the
  // email and chose a password moments ago; making them then go type that
  // same password into a separate login screen would be redundant friction.
  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  return { token: signToken(publicUser), user: publicUser };
}

// --- Forgot Password ---------------------------------------------------------

export async function requestPasswordReset({ email }) {
  const user = await User.findByEmail(email);
  // No error thrown, no distinction made in the response either way,
  // whether or not `user` exists — see authController.forgotPassword for
  // why: this is what stops the endpoint being usable to test which
  // emails have accounts (email enumeration).
  if (!user || !user.email_verified) return;

  await issueAndSendOtp({
    email,
    purpose: 'password_reset',
    subject: 'Reset your Ledger Inventory password',
    bodyFor: (code) => `Your password reset code is ${code}. It expires in 10 minutes.`,
  });
}

export async function confirmPasswordReset({ email, code, newPassword }) {
  const user = await User.findByEmail(email);
  if (!user || !user.email_verified) throw ApiError.badRequest('Invalid or expired code', 'code');

  await verifyOtpOrThrow({ email, purpose: 'password_reset', code });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updatePassword(email, passwordHash);
}

// --- Resend ------------------------------------------------------------------

export async function resendOtp({ email, purpose }) {
  const user = await User.findByEmail(email);

  if (purpose === 'signup') {
    if (!user || user.email_verified) throw ApiError.badRequest('No pending signup found for this email', 'email');
  } else {
    if (!user || !user.email_verified) return; // same anti-enumeration behavior as requestPasswordReset
  }

  await issueAndSendOtp({
    email,
    purpose,
    subject: purpose === 'signup' ? 'Verify your Ledger Inventory account' : 'Reset your Ledger Inventory password',
    bodyFor: (code) =>
      `Your ${purpose === 'signup' ? 'verification' : 'password reset'} code is ${code}. It expires in 10 minutes.`,
  });
}
