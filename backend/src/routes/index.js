import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import reportRoutes from './reportRoutes.js';
import profitRoutes from './profitRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Public
router.use('/auth', authRoutes);

// Everything below requires a valid JWT. Per-route admin checks (e.g. delete
// endpoints, all of /users) are applied inside each route file.
router.use('/products', authenticate, productRoutes);
router.use('/categories', authenticate, categoryRoutes);
router.use('/suppliers', authenticate, supplierRoutes);
router.use('/transactions', authenticate, transactionRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/profit', authenticate, profitRoutes);
router.use('/users', authenticate, userRoutes);

export default router;
