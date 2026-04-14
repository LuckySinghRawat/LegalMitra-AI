const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');

// @desc    Create a new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, category, language, location } = req.body;

    // Handle file attachments from multer
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Ensure description has a value (file-only uploads may have no description)
    const finalDescription = description || (attachments.length > 0
      ? `Complaint submitted via file upload. ${attachments.length} file(s) attached.`
      : '');

    // Parse location if it comes as a JSON string (from FormData)
    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = {};
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description: finalDescription,
      category: category || 'Other',
      language: language || req.user.language || 'en',
      location: parsedLocation || req.user.location || {},
      attachments
    });

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints for current user
// @route   GET /api/complaints
exports.getMyComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let filter = { user: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check ownership or admin
    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this complaint' });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await complaint.deleteOne();

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint stats for current user
// @route   GET /api/complaints/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [stats] = await Complaint.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          analyzed: { $sum: { $cond: [{ $eq: ['$status', 'analyzed'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats || { total: 0, pending: 0, analyzed: 0, resolved: 0, inProgress: 0 },
      categoryStats
    });
  } catch (error) {
    next(error);
  }
};
