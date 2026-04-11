const express = require('express');
const router = express.Router();
const { getAllComplaints, getAnalytics, updateComplaint } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// @route GET /api/admin/complaints
router.get('/complaints', getAllComplaints);

// @route GET /api/admin/analytics
router.get('/analytics', getAnalytics);

// @route PATCH /api/admin/complaints/:id
router.patch('/complaints/:id', updateComplaint);

module.exports = router;
