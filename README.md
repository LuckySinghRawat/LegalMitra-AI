# ⚖️ LegalMitra AI — Smart Complaint AI Platform

> AI-powered legal complaint platform for India. Submit complaints, get instant AI analysis with relevant Indian laws, generate formal complaint letters, and track complaint status — all in Hindi and English.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** — Secure signup/login with role-based access (User/Admin)
- 📝 **Complaint Submission** — Text input with character count and multi-step wizard
- 🎙️ **Voice Input** — Voice-to-text in Hindi and English (Web Speech API)
- 🤖 **AI Analysis** — Classification, sentiment, urgency, confidence score, legal validity
- 📚 **Indian Law References** — Auto-suggests relevant acts, sections, and legal provisions
- ✉️ **Auto Letter Generation** — AI-generated formal complaint letters
- 📊 **Dashboard** — Track complaints with stats, filters, and category breakdown
- 🛡️ **Admin Panel** — View all complaints, analytics, status management

### Advanced Features
- 🌐 **Multilingual** — Full Hindi + English UI and AI responses
- 📍 **Geolocation** — Auto-detect location, suggest relevant local authorities
- 📄 **PDF Download** — Generate and download complaint letters as PDF
- 📧 **Email Integration** — Send complaint letters via email with PDF attachment
- 🎨 **Modern UI** — Glassmorphism, dark mode, animations, responsive design

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Vite, React Router, Axios |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| AI | Grok API (xAI) — OpenAI-compatible |
| PDF | PDFKit |
| Email | Nodemailer |
| Auth | JWT (jsonwebtoken), bcryptjs |

---

## 📁 Project Structure

```
LegalMitra-AI/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Route handlers
│   ├── middleware/                # Auth & error handling
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API routes
│   ├── services/                 # AI, PDF, Email services
│   ├── data/indianLaws.json      # Indian laws reference
│   ├── utils/helpers.js          # Utility functions
│   └── server.js                 # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # API client
│   │   ├── components/           # Reusable components
│   │   ├── context/              # Auth context
│   │   ├── pages/                # Page components
│   │   └── utils/constants.js    # Categories, strings, etc.
│   └── vite.config.js
│
├── .env.example                  # Environment template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Grok API Key** from [x.ai](https://console.x.ai) (or OpenAI API key)

### 1. Clone & Configure

```bash
git clone https://github.com/your-repo/LegalMitra-AI.git
cd LegalMitra-AI

# Copy environment template
cp .env.example .env
```

Edit `.env` with your actual values:
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
GROK_API_KEY=xai-your-api-key
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```
Server runs at `http://localhost:5000`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### 4. Create Admin Account

After signing up through the UI, update a user's role in MongoDB:
```javascript
// In MongoDB Atlas or Compass:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints` | Get user's complaints |
| GET | `/api/complaints/stats` | Get user stats |
| GET | `/api/complaints/:id` | Get single complaint |
| PATCH | `/api/complaints/:id/status` | Update status |
| DELETE | `/api/complaints/:id` | Delete complaint |
| POST | `/api/complaints/:id/pdf` | Download PDF |
| POST | `/api/complaints/:id/email` | Send via email |

### AI Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Analyze complaint with AI |
| POST | `/api/ai/generate-letter` | Generate formal letter |
| POST | `/api/ai/suggest-authority` | Suggest relevant authority |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/complaints` | Get all complaints |
| GET | `/api/admin/analytics` | Get analytics data |
| PATCH | `/api/admin/complaints/:id` | Update complaint |

---

## 🧠 AI Prompts

The platform uses structured prompts to:
1. **Classify** complaints into 13 categories (Consumer, Cyber, Criminal, etc.)
2. **Detect** sentiment (positive/negative/neutral) and urgency (low to critical)
3. **Validate** legal standing with confidence scores
4. **Suggest** relevant Indian laws with specific acts and sections
5. **Generate** formal complaint letters in Hindi/English

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy `dist/` to Vercel
```

### Backend → Render/Railway
- Set environment variables in dashboard
- Build command: `npm install`
- Start command: `node server.js`

### Database → MongoDB Atlas
- Use the M0 free cluster
- Whitelist `0.0.0.0/0` for cloud deployment

---

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing |
| `GROK_API_KEY` | ✅ | xAI/Grok API key |
| `AI_BASE_URL` | ❌ | AI API base URL (default: x.ai) |
| `AI_MODEL` | ❌ | AI model name (default: grok-3-mini) |
| `SMTP_HOST` | ❌ | Email SMTP host |
| `SMTP_PORT` | ❌ | Email SMTP port |
| `SMTP_USER` | ❌ | Email username |
| `SMTP_PASS` | ❌ | Email password |
| `PORT` | ❌ | Backend port (default: 5000) |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS |
| `VITE_API_URL` | ❌ | API URL for frontend |

---

## 🏆 Built for Hackathon

This project is built as an end-to-end AI-powered legal tech platform specifically designed for Indian citizens, featuring:
- Real Indian legal framework integration (70+ laws referenced)
- Multilingual support (Hindi + English)
- Voice accessibility
- Geolocation-aware authority suggestions
- Production-ready architecture

---

**Made with ❤️ for India 🇮🇳**
