import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const user = await User.findByEmailWithPassword(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw ApiError.unauthorized('Invalid email or password');

  // Checked AFTER the password matches, deliberately — checking email
  // verification first would let someone probe whether an email is
  // registered-but-unverified without knowing its password at all. A 403
  // (not 401) is used here specifically so the frontend can tell "wrong
  // credentials" apart from "right credentials, just not verified yet" and
  // offer a "resend code" action instead of just "try again".
  if (!user.email_verified) {
    throw ApiError.forbidden('Please verify your email before logging in.');
  }

  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token: signToken(publicUser), user: publicUser });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json(user);
});

export const logout = (req, res) => {
  // Stateless JWTs: there's nothing to invalidate server-side. The client
  // discards the token. (A denylist/refresh-token store would go here if
  // that's ever needed.)
  res.status(204).end();
};

// --- Sign Up -----------------------------------------------------------

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  await authService.requestSignup({ name, email, password });
  res.status(202).json({ message: 'Verification code sent — check your email.' });
});

export const verifySignup = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const result = await authService.confirmSignup({ email, code });
  res.json(result); // { token, user } — logs them straight in
});

// --- Forgot Password -----------------------------------------------------

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset({ email });
  // Same message whether or not the account exists — see
  // authService.requestPasswordReset for why (prevents email enumeration).
  res.status(202).json({ message: 'If that email is registered, a reset code was sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  await authService.confirmPasswordReset({ email, code, newPassword });
  res.json({ message: 'Password updated — you can now log in.' });
});

// --- Shared resend, used by both flows -----------------------------------

export const resendOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  await authService.resendOtp({ email, purpose });
  res.status(202).json({ message: 'If needed, a new code was sent.' });
});
