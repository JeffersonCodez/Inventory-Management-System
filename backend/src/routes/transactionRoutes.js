import { Router } from 'express';
import { body } from 'express-validator';
import * as transactionController from '../controllers/transactionController.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const stockInValidation = [
  body('productId').isInt().withMessage('A valid product is required'),
  body('supplierId').isInt().withMessage('A valid supplier is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const stockOutValidation = [
  body('productId').isInt().withMessage('A valid product is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.get('/', transactionController.list);
router.get('/recent', transactionController.recent);
router.get('/monthly-movement', transactionController.monthlyMovement);
router.get('/:id', transactionController.getOne);
router.post('/stock-in', stockInValidation, validate, transactionController.createStockIn);
router.post('/stock-out', stockOutValidation, validate, transactionController.createStockOut);

export default router;
