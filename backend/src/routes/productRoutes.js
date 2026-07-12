import { Router } from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/productController.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// One rule set, two modes. `optional: true` is used for PUT — the
// controller merges whatever fields ARE sent with the existing row
// (`req.body.name ?? existing.name`, etc.), so a field being ABSENT is
// fine; a field that IS present still has to be valid. `optional: false`
// is used for POST, where there's no existing row to fall back to, so
// every field is mandatory.
function productRules(optional) {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('name').notEmpty().withMessage('Product name is required'),
    field('sku').notEmpty().withMessage('SKU is required'),
    field('categoryId').isInt().withMessage('A valid category is required'),
    field('supplierId').isInt().withMessage('A valid supplier is required'),
    field('unit').notEmpty().withMessage('Unit is required'),
    field('quantity').isInt({ min: 0 }).withMessage('Quantity must be zero or more'),
    field('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be zero or more'),
    // { min: 0.01 }, not { min: 0 } — a price of exactly zero is never a
    // real product, it's an unfilled field slipping through (this is
    // exactly the bug that shipped a product with no selling price at
    // all, which then produced a nonsensical negative "profit" the moment
    // it was sold). Applies to both create AND update (via the `optional`
    // wrapper above) — an edit can't set a price back to zero either.
    field('purchasePrice').isFloat({ min: 0.01 }).withMessage('Purchase price must be greater than zero'),
    field('sellingPrice').isFloat({ min: 0.01 }).withMessage('Selling price must be greater than zero'),
  ];
}

export const productCreateValidation = productRules(false);
export const productUpdateValidation = productRules(true);

router.get('/', productController.list);
router.get('/summary', productController.summary);
router.get('/:id', productController.getOne);
router.post('/', productCreateValidation, validate, productController.create);
router.put('/:id', productUpdateValidation, validate, productController.update);
router.delete('/:id', authorize('admin'), productController.remove);
router.post('/:id/restore', authorize('admin'), productController.restore);

export default router;
