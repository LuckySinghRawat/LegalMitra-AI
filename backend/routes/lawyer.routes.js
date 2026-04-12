const express = require('express');
const router = express.Router();
const { searchLawyers, detectCategory, getCities } = require('../controllers/lawyer.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route GET /api/lawyers?lat=xx&lng=yy&category=criminal&issue=text&radius=20
router.get('/', searchLawyers);

// @route POST /api/lawyers/detect-category
router.post('/detect-category', detectCategory);

// @route GET /api/lawyers/cities
router.get('/cities', getCities);

module.exports = router;
