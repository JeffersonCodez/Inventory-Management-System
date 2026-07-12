import { Router } from 'express';
import * as profitController from '../controllers/profitController.js';
import { emailReportLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Specific paths (summary, trend, report, export) are declared before the
// generic '/' — with only fixed-word paths here (no '/:id' route) the
// order isn't strictly required, but it's kept this way to match the
// declared-before-generic convention already used in reportRoutes.js.
router.get('/summary', profitController.summary);
router.get('/trend', profitController.trend);
router.get('/report', profitController.report);
router.get('/export', profitController.exportProfit);
router.post('/email', emailReportLimiter, profitController.emailProfit);
router.get('/', profitController.list);

export default router;
