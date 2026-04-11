/**
 * Utility helper functions
 */

// Sanitize user input
exports.sanitizeInput = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

// Format date for Indian locale
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Generate complaint reference number
exports.generateRefNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LM-${timestamp}-${random}`;
};

// Validate MongoDB ObjectId
exports.isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Truncate text
exports.truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
