const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, getMe, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// @route POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  signup
);

// @route POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

// @route GET /api/auth/me
router.get('/me', protect, getMe);

// @route PUT /api/auth/me
router.put('/me', protect, updateProfile);

module.exports = router;
