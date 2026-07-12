import { Router } from 'express';
import { body } from 'express-validator';
import * as supplierController from '../controllers/supplierController.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Same reasoning as categoryValidation: Supplier.update() overwrites every
// column directly from the request body (see models/Supplier.js) rather
// than merging with the existing row, so `name` stays required on PUT too.
// `email`, when provided, is checked against a real email format — this
// used to accept any string at all, including obvious typos.
export const supplierValidation = [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Enter a valid email address'),
  body('phone').optional({ values: 'falsy' }).isString().withMessage('Phone must be text'),
];

router.get('/', supplierController.list);
router.post('/', supplierValidation, validate, supplierController.create);
router.put('/:id', supplierValidation, validate, supplierController.update);
router.delete('/:id', authorize('admin'), supplierController.remove);

export default router;
