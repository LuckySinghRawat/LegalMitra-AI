const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get all complaints (admin)
// @route   GET /api/admin/complaints
exports.getAllComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;
    const search = req.query.search;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
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

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    // Overall stats
    const totalComplaints = await Complaint.countDocuments();
    const totalUsers = await User.countDocuments();

    // Status distribution
    const statusStats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Category distribution
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Urgency distribution
    const urgencyStats = await Complaint.aggregate([
      { $match: { 'aiAnalysis.urgency': { $ne: '' } } },
      { $group: { _id: '$aiAnalysis.urgency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Sentiment distribution
    const sentimentStats = await Complaint.aggregate([
      { $match: { 'aiAnalysis.sentiment': { $ne: '' } } },
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } }
    ]);

    // Complaints over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timelineStats = await Complaint.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: {
        totalComplaints,
        totalUsers,
        statusStats,
        categoryStats,
        urgencyStats,
        sentimentStats,
        timelineStats,
        recentComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (admin notes, status)
// @route   PATCH /api/admin/complaints/:id
exports.updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    await complaint.save();

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};
