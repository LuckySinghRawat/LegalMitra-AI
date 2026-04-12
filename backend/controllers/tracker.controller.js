const Complaint = require('../models/Complaint');

// @desc    Get complaints grouped by upcoming, active, past
// @route   GET /api/tracker/grouped
exports.getGrouped = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch all user complaints
    const complaints = await Complaint.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const upcoming = [];
    const active = [];
    const past = [];

    for (const c of complaints) {
      const isResolved = ['resolved', 'rejected'].includes(c.status);
      const hasUpcomingDate = c.scheduledDate && new Date(c.scheduledDate) >= now && new Date(c.scheduledDate) <= sevenDaysFromNow;
      const hasFutureDate = c.scheduledDate && new Date(c.scheduledDate) > now;
      const hasOverdueDate = c.scheduledDate && new Date(c.scheduledDate) < now && !isResolved;

      if (isResolved) {
        past.push(c);
      } else if (hasUpcomingDate || hasOverdueDate) {
        upcoming.push(c);
      } else {
        active.push(c);
      }
    }

    // Sort upcoming by scheduledDate (soonest first)
    upcoming.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    res.json({
      success: true,
      upcoming,
      active,
      past,
      counts: {
        upcoming: upcoming.length,
        active: active.length,
        past: past.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merged chronological timeline for a complaint
// @route   GET /api/tracker/timeline/:id
exports.getTimeline = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).lean();

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const timeline = [];

    // 1. Complaint creation
    timeline.push({
      type: 'created',
      label: 'Complaint Created',
      description: `"${complaint.title}" was submitted`,
      date: complaint.createdAt,
      icon: 'plus'
    });

    // 2. Status history entries
    if (complaint.statusHistory) {
      complaint.statusHistory.forEach(entry => {
        // Skip the initial 'created' entry since we already added it
        if (entry.notes === 'Complaint created') return;
        timeline.push({
          type: 'status',
          label: `Status → ${entry.status}`,
          description: entry.notes || `Status changed to "${entry.status}"`,
          date: entry.changedAt,
          icon: 'status',
          status: entry.status
        });
      });
    }

    // 3. AI analysis (if done)
    if (complaint.status !== 'pending' && complaint.aiAnalysis?.category) {
      // Estimate analysis time as shortly after creation or first status change to 'analyzed'
      const analyzedEntry = complaint.statusHistory?.find(h => h.status === 'analyzed');
      if (analyzedEntry) {
        timeline.push({
          type: 'ai',
          label: 'AI Analysis Completed',
          description: `Category: ${complaint.aiAnalysis.category}, Urgency: ${complaint.aiAnalysis.urgency || 'N/A'}, Confidence: ${complaint.aiAnalysis.confidenceScore}%`,
          date: analyzedEntry.changedAt,
          icon: 'brain'
        });
      }
    }

    // 4. User notes
    if (complaint.notes) {
      complaint.notes.forEach(note => {
        timeline.push({
          type: 'note',
          label: 'Note Added',
          description: note.text,
          date: note.addedAt,
          icon: 'note'
        });
      });
    }

    // 5. Scheduled date (if set)
    if (complaint.scheduledDate) {
      timeline.push({
        type: 'scheduled',
        label: 'Scheduled Hearing / Deadline',
        description: `Scheduled for ${new Date(complaint.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        date: complaint.scheduledDate,
        icon: 'calendar'
      });
    }

    // 6. Formal letter generated
    if (complaint.aiAnalysis?.formalLetter) {
      timeline.push({
        type: 'letter',
        label: 'Formal Letter Generated',
        description: 'AI-generated complaint letter is ready',
        date: complaint.updatedAt, // approximate
        icon: 'letter'
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      timeline,
      complaint: {
        _id: complaint._id,
        title: complaint.title,
        status: complaint.status,
        category: complaint.category,
        scheduledDate: complaint.scheduledDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a note to a complaint
// @route   POST /api/tracker/:id/notes
exports.addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    complaint.notes.push({
      text: text.trim(),
      addedAt: new Date()
    });

    await complaint.save();

    res.json({
      success: true,
      note: complaint.notes[complaint.notes.length - 1],
      message: 'Note added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update scheduled date
// @route   PATCH /api/tracker/:id/schedule
exports.setSchedule = async (req, res, next) => {
  try {
    const { scheduledDate } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    complaint.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;

    // Log as a note
    if (scheduledDate) {
      complaint.notes.push({
        text: `Hearing/deadline scheduled for ${new Date(scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        addedAt: new Date()
      });
    }

    await complaint.save();

    res.json({
      success: true,
      complaint: {
        _id: complaint._id,
        scheduledDate: complaint.scheduledDate
      },
      message: scheduledDate ? 'Schedule set successfully' : 'Schedule cleared'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get count of upcoming complaints (for nav badge)
// @route   GET /api/tracker/upcoming-count
exports.getUpcomingCount = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const count = await Complaint.countDocuments({
      user: req.user._id,
      status: { $nin: ['resolved', 'rejected'] },
      scheduledDate: { $ne: null, $lte: sevenDaysFromNow }
    });

    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
