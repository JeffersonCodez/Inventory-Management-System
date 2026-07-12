import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// Must be registered last, after all routes. Express identifies error-handling
// middleware by its four-argument signature.
export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message, field: err.field } });
  }

  // MySQL duplicate-key errors surface here if a uniqueness check was skipped
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'A record with that value already exists' } });
  }

  logger.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: { message: status === 500 ? 'Internal server error' : err.message },
  });
}
