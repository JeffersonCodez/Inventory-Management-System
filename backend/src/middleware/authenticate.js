import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
});
