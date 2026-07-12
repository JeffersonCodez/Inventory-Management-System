import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, otpRequestLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/login',
  loginLimiter,
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  authController.login
);

router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// --- Sign Up ---------------------------------------------------------------

// Deliberately basic on the password rule — a strict "must contain a
// symbol/number/uppercase" rule tends to push people toward predictable
// substitutions (Password1!) rather than actually stronger passwords.
// Length is the strongest single signal, and 8 is a reasonable floor.
export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const verifySignupValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6-digit code'),
];

router.post('/register', otpRequestLimiter, registerValidation, validate, authController.register);
router.post('/verify-signup', verifySignupValidation, validate, authController.verifySignup);

// --- Forgot Password ---------------------------------------------------------

export const forgotPasswordValidation = [body('email').isEmail().withMessage('A valid email is required')];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6-digit code'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/forgot-password', otpRequestLimiter, forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// --- Shared resend -----------------------------------------------------------

export const resendOtpValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('purpose').isIn(['signup', 'password_reset']).withMessage('Invalid request'),
];

router.post('/resend-otp', otpRequestLimiter, resendOtpValidation, validate, authController.resendOtp);

export default router;
