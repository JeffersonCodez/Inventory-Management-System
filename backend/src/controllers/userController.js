import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SALT_ROUNDS = 10;

export const list = asyncHandler(async (req, res) => {
  res.json(await User.findAll());
});

export const create = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email) throw ApiError.badRequest('Name and email are required', 'name');

  const existing = await User.findByEmail(email);
  if (existing) throw ApiError.conflict('A user with that email already exists', 'email');

  const passwordHash = await bcrypt.hash(password || cryptoRandomPassword(), SALT_ROUNDS);
  const user = await User.create({ name, email, role, passwordHash });
  res.status(201).json(user);
});

export const remove = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    throw ApiError.badRequest('You cannot remove your own account');
  }
  const existing = await User.findById(req.params.id);
  if (!existing) throw ApiError.notFound('User not found');

  await User.remove(req.params.id);
  res.status(204).end();
});

// Users created by an admin without an initial password get a random one —
// in production this should trigger an invite/reset-password email instead.
function cryptoRandomPassword() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
