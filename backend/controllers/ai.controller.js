const Complaint = require('../models/Complaint');
const aiService = require('../services/ai.service');

// @desc    Analyze a complaint with AI
// @route   POST /api/ai/analyze
exports.analyzeComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check ownership
    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Run AI analysis
    const analysis = await aiService.analyzeComplaint(
      complaint.description,
      complaint.category,
      complaint.location,
      complaint.language
    );

    // Update complaint with analysis
    complaint.aiAnalysis = analysis;
    complaint.category = analysis.category || complaint.category;
    complaint.status = 'analyzed';
    await complaint.save();

    res.json({
      success: true,
      analysis,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate formal complaint letter
// @route   POST /api/ai/generate-letter
exports.generateLetter = async (req, res, next) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findById(complaintId).populate('user', 'name email');
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const letter = await aiService.generateLetter(
      complaint,
      complaint.user.name || req.user.name,
      complaint.language
    );

    // Save letter to complaint
    complaint.aiAnalysis.formalLetter = letter;
    await complaint.save();

    res.json({
      success: true,
      letter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest authority based on category and location
// @route   POST /api/ai/suggest-authority
exports.suggestAuthority = async (req, res, next) => {
  try {
    const { category, location } = req.body;

    const authority = await aiService.suggestAuthority(
      category || 'Other',
      location
    );

    res.json({
      success: true,
      authority
    });
  } catch (error) {
    next(error);
  }
};
