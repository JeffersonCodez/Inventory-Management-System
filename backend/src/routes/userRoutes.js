import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authorize('admin'));

router.get('/', userController.list);
router.post(
  '/',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  validate,
  userController.create
);
router.delete('/:id', userController.remove);

export default router;
