// server/routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  logoutStudent,
  logoutAdmin,
  forgotPassword,
  resetPassword,
  checkEmailAvailability,
} from '../controllers/authController.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many accounts created from this IP. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many password reset requests. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/check-email', checkEmailAvailability);
router.post('/register', registerLimiter, registerStudent);
router.post('/login', loginLimiter, loginStudent);
router.post('/logout', logoutStudent);
router.post('/admin-login', loginLimiter, loginAdmin);
router.post('/admin-logout', logoutAdmin);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
