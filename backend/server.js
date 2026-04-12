const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
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

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/lawyers', require('./routes/lawyer.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LegalMitra API is running' });
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
    console.warn('   Set OPENAI_API_KEY or GROK_API_KEY in your .env file.');
  }
});

module.exports = app;
