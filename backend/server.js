const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables - use absolute path so it works regardless of cwd
const envPath = path.resolve(__dirname, '../.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error(`❌ Failed to load .env from ${envPath}:`, envResult.error.message);
} else {
  console.log(`✅ Loaded .env from ${envPath}`);
}

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/lawyers', require('./routes/lawyer.routes'));
app.use('/api/whatsapp', require('./routes/whatsapp.routes'));
app.use('/api/tracker', require('./routes/tracker.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LegalMitra API is running' });
});

app.get("/api", (req, res) => {
  res.send("LegalMitra API is running 🚀");
});

// Multer error handling (file upload errors)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }
  if (err.message && err.message.includes('File type not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Global error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 LegalMitra Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  // AI key diagnostics
  const aiKey = process.env.GROK_API_KEY || process.env.OPENAI_API_KEY;
  if (aiKey) {
    console.log(`🤖 AI API key loaded (${aiKey.substring(0, 8)}...${aiKey.substring(aiKey.length - 4)})`);
    console.log(`🌐 AI Base URL: ${process.env.AI_BASE_URL || 'default'}`);
    console.log(`🧠 AI Model: ${process.env.AI_MODEL || 'default'}`);
  } else {
    console.warn('⚠️  NO AI API key found! AI features will use mock/fallback responses.');
    console.warn('   Set API_KEY in your .env file.');
  }
});

module.exports = app;
