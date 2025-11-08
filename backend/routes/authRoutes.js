const express = require('express');
const { body } = require('express-validator');
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateOTP = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
];

const validateResetPassword = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Handle validation errors
const handleValidation = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Routes
router.post('/register', validateRegister, handleValidation, register);
router.post('/verify-otp', validateOTP, handleValidation, verifyOTP);
router.post('/resend-otp', body('email').isEmail(), handleValidation, resendOTP);
router.post('/login', validateLogin, handleValidation, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', body('email').isEmail(), handleValidation, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidation, resetPassword);

module.exports = router;