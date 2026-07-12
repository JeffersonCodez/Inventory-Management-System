import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { emailReportLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/:type/export', reportController.exportReport);
router.post('/:type/email', emailReportLimiter, reportController.emailReport);
router.get('/:type', reportController.get);

export default router;
