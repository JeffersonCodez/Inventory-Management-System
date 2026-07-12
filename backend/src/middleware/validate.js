import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Place after a chain of express-validator checks:
//   router.post('/', body('name').notEmpty(), validate, controller.create)
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const first = result.array()[0];
  next(ApiError.badRequest(first.msg, first.path || first.param));
}
