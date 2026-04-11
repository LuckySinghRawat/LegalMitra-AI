const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  updateStatus,
  deleteComplaint,
  getStats
} = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route GET /api/complaints/stats
router.get('/stats', getStats);

// @route POST /api/complaints
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
  ],
  createComplaint
);

// @route GET /api/complaints
router.get('/', getMyComplaints);

// @route GET /api/complaints/:id
router.get('/:id', getComplaint);

// @route PATCH /api/complaints/:id/status
router.patch('/:id/status', updateStatus);

// @route DELETE /api/complaints/:id
router.delete('/:id', deleteComplaint);

// @route POST /api/complaints/:id/pdf - Download complaint as PDF
router.post('/:id/pdf', async (req, res, next) => {
  try {
    const Complaint = require('../models/Complaint');
    const pdfService = require('../services/pdf.service');

    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const letterContent = complaint.aiAnalysis?.formalLetter || complaint.description;
    const pdfBuffer = await pdfService.generatePDF(complaint, complaint.user.name, letterContent);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=complaint-${complaint._id}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

// @route POST /api/complaints/:id/email - Email complaint letter
router.post('/:id/email', async (req, res, next) => {
  try {
    const Complaint = require('../models/Complaint');
    const pdfService = require('../services/pdf.service');
    const emailService = require('../services/email.service');

    const { recipientEmail } = req.body;
    if (!recipientEmail) return res.status(400).json({ error: 'Recipient email is required' });

    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const letterContent = complaint.aiAnalysis?.formalLetter || complaint.description;
    const pdfBuffer = await pdfService.generatePDF(complaint, complaint.user.name, letterContent);

    const result = await emailService.sendComplaintEmail(
      recipientEmail,
      complaint.title,
      letterContent,
      pdfBuffer
    );

    res.json({ success: true, message: 'Email sent successfully', ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
