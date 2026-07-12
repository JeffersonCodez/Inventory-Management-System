import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Used on BOTH create and update — unlike products, Category.update()
// overwrites `name`/`description` directly from the request body rather
// than merging with the existing row (see models/Category.js). That means
// `name` can never be treated as optional on PUT: a request that omitted
// it would silently set the category's name to NULL in the database.
export const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional({ values: 'falsy' }).isString().withMessage('Description must be text'),
];

router.get('/', categoryController.list);
router.post('/', categoryValidation, validate, categoryController.create);
router.put('/:id', categoryValidation, validate, categoryController.update);
router.delete('/:id', authorize('admin'), categoryController.remove);

export default router;
