const express = require('express');
const router = express.Router();
const {
  getGrouped,
  getTimeline,
  addNote,
  setSchedule,
  getUpcomingCount
} = require('../controllers/tracker.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route GET /api/tracker/grouped
router.get('/grouped', getGrouped);

// @route GET /api/tracker/upcoming-count
router.get('/upcoming-count', getUpcomingCount);

// @route GET /api/tracker/timeline/:id
router.get('/timeline/:id', getTimeline);

// @route POST /api/tracker/:id/notes
router.post('/:id/notes', addNote);

// @route PATCH /api/tracker/:id/schedule
router.patch('/:id/schedule', setSchedule);

module.exports = router;
