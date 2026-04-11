const express = require('express');
const router = express.Router();
const { analyzeComplaint, generateLetter, suggestAuthority } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route POST /api/ai/analyze
router.post('/analyze', analyzeComplaint);

// @route POST /api/ai/generate-letter
router.post('/generate-letter', generateLetter);

// @route POST /api/ai/suggest-authority
router.post('/suggest-authority', suggestAuthority);

module.exports = router;
