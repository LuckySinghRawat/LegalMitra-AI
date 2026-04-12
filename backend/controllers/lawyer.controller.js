const Lawyer = require('../models/Lawyer');

// Map complaint categories to lawyer specializations and categories
const CATEGORY_TO_SPECIALIZATION = {
  Consumer: ['Consumer Law', 'Civil Law', 'General Practice'],
  Labor: ['Labor Law', 'Civil Law', 'General Practice'],
  Property: ['Property Law', 'Civil Law', 'General Practice'],
  Criminal: ['Criminal Law', 'General Practice'],
  Family: ['Family Law', 'Civil Law', 'General Practice'],
  Cyber: ['Cyber Law', 'Criminal Law', 'General Practice'],
  Traffic: ['Traffic Law', 'Criminal Law', 'General Practice'],
  Environmental: ['Environmental Law', 'Civil Law', 'General Practice'],
  Government: ['Constitutional Law', 'Civil Law', 'General Practice'],
  Healthcare: ['Healthcare Law', 'Consumer Law', 'General Practice'],
  Education: ['Education Law', 'Civil Law', 'General Practice'],
  Financial: ['Financial Law', 'Consumer Law', 'Corporate Law', 'General Practice'],
  Other: ['General Practice', 'Civil Law'],
};

// IPC / keyword based category detection from issue text
const KEYWORD_TO_CATEGORY = {
  Criminal: ['theft', 'murder', 'assault', 'robbery', 'kidnapping', 'ipc', 'fir', 'crime', 'police', 'arrest', 'bail', 'stolen', 'attack', 'violence', 'threat', 'extortion', 'dacoity', 'cheating'],
  Cyber: ['hack', 'online fraud', 'cybercrime', 'phishing', 'data breach', 'identity theft', 'cyber', 'internet', 'social media', 'website', 'digital', 'otp fraud', 'upi fraud'],
  Family: ['divorce', 'domestic violence', 'custody', 'maintenance', 'alimony', 'dowry', 'marriage', 'husband', 'wife', 'child support', 'domestic abuse', 'family dispute'],
  Consumer: ['product', 'refund', 'defective', 'warranty', 'purchase', 'delivery', 'overcharge', 'service', 'complaint', 'consumer', 'seller', 'ecommerce', 'shop', 'scam'],
  Labor: ['salary', 'employer', 'workplace', 'fired', 'termination', 'wages', 'overtime', 'harassment at work', 'labor', 'pf', 'provident fund', 'epf', 'working conditions'],
  Property: ['land', 'property', 'rent', 'tenant', 'landlord', 'encroachment', 'real estate', 'flat', 'builder', 'possession', 'registration', 'eviction'],
  Traffic: ['accident', 'traffic', 'challan', 'driving', 'hit and run', 'rash driving', 'license', 'vehicle'],
  Environmental: ['pollution', 'waste', 'water contamination', 'noise', 'deforestation', 'environment', 'factory emissions', 'dumping'],
  Government: ['corruption', 'bribe', 'rti', 'public servant', 'government', 'bureaucracy', 'municipality', 'panchayat'],
  Healthcare: ['doctor', 'hospital', 'medical negligence', 'surgery', 'treatment', 'medicine', 'health', 'patient', 'clinic'],
  Education: ['school', 'college', 'university', 'admission', 'education', 'teacher', 'exam', 'student', 'scholarship', 'fees'],
  Financial: ['bank', 'loan', 'insurance', 'investment', 'fraud', 'credit card', 'emi', 'interest', 'financial', 'stock', 'mutual fund', 'npa'],
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Detect category from issue text using keywords
function detectCategoryFromText(text) {
  if (!text) return 'Other';
  const lower = text.toLowerCase();

  let bestCategory = 'Other';
  let bestMatchCount = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_TO_CATEGORY)) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// @desc    Search for lawyers near a location
// @route   GET /api/lawyers?lat=xx&lng=yy&category=criminal&issue=text&radius=20
exports.searchLawyers = async (req, res, next) => {
  try {
    const { lat, lng, category, issue, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Location coordinates (lat, lng) are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = Math.min(parseInt(radius), 500); // cap at 500km

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Determine the category to search for
    let searchCategory = category || 'Other';
    let detectedFromText = false;

    // If issue text provided, try to detect category from it
    if (issue && (!category || category === 'Other')) {
      searchCategory = detectCategoryFromText(issue);
      detectedFromText = true;
    }

    // Build query filter
    const filter = { availability: { $ne: 'unavailable' } };

    // Filter by category if we have one
    if (searchCategory && searchCategory !== 'Other') {
      filter.categories = searchCategory;
    }

    // Fetch all matching lawyers
    let lawyers = await Lawyer.find(filter).lean();

    // Calculate distance and filter by radius
    lawyers = lawyers
      .map(lawyer => {
        const dist = calculateDistance(
          userLat, userLng,
          lawyer.location.coordinates.lat,
          lawyer.location.coordinates.lng
        );
        return { ...lawyer, distance: Math.round(dist * 10) / 10 };
      })
      .filter(lawyer => lawyer.distance <= maxRadius)
      .sort((a, b) => {
        // Sort by: relevance (verified first) → rating → distance
        if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
        if (Math.abs(b.rating - a.rating) > 0.2) return b.rating - a.rating;
        return a.distance - b.distance;
      });

    // Get specialization info for response
    const specializations = CATEGORY_TO_SPECIALIZATION[searchCategory] || CATEGORY_TO_SPECIALIZATION['Other'];

    res.json({
      success: true,
      category: searchCategory,
      detectedFromText,
      specializations,
      radius: maxRadius,
      total: lawyers.length,
      lawyers: lawyers.map(l => ({
        _id: l._id,
        name: l.name,
        specialization: l.specialization,
        experience: l.experience,
        rating: l.rating,
        reviewCount: l.reviewCount,
        contact: l.contact,
        barCouncilId: l.barCouncilId,
        location: {
          city: l.location.city,
          state: l.location.state,
          address: l.location.address,
        },
        languages: l.languages,
        availability: l.availability,
        consultationFee: l.consultationFee,
        categories: l.categories,
        isVerified: l.isVerified,
        distance: l.distance,
        distanceText: l.distance < 1 ? `${Math.round(l.distance * 1000)}m` : `${l.distance} km`,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Detect category from issue text (helper endpoint)
// @route   POST /api/lawyers/detect-category
exports.detectCategory = async (req, res, next) => {
  try {
    const { issue } = req.body;

    if (!issue) {
      return res.status(400).json({ error: 'Issue text is required' });
    }

    const category = detectCategoryFromText(issue);
    const specializations = CATEGORY_TO_SPECIALIZATION[category] || CATEGORY_TO_SPECIALIZATION['Other'];

    res.json({
      success: true,
      category,
      specializations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique cities where lawyers are available
// @route   GET /api/lawyers/cities
exports.getCities = async (req, res, next) => {
  try {
    const cities = await Lawyer.aggregate([
      { $match: { availability: { $ne: 'unavailable' } } },
      { $group: { _id: { city: '$location.city', state: '$location.state' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      cities: cities.map(c => ({
        city: c._id.city,
        state: c._id.state,
        lawyerCount: c.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};
