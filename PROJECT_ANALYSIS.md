# 🔍 LegalMitra-AI: Complete Project Analysis

## 📋 Executive Summary
**LegalMitra-AI** is an AI-powered legal complaint platform for India that uses the **Grok AI API (xAI)** to analyze complaints, suggest relevant Indian laws, generate formal letters, and track complaint status. It's a full-stack MERN application with multilingual support (Hindi & English).

---

## 🏗️ Architecture Overview

### Tech Stack
| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19 + Vite + Tailwind CSS + React Router |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Cloud) + Mongoose ODM |
| **AI Engine** | Grok API (xAI) - OpenAI-compatible |
| **Authentication** | JWT + bcryptjs |
| **PDF Generation** | PDFKit |
| **Email** | Nodemailer |

### Application Flow Diagram
```
User (Frontend) 
    ↓
React UI (pages, forms, context)
    ↓
Axios API Client
    ↓
Express.js Backend API
    ↓
MongoDB Database
    ↓
Grok AI API (for analysis)
    ↓
Response with Analysis & Indian Laws
```

---

## 💾 DATABASE STRUCTURE

### MongoDB Collections (2 Main Collections)

#### 1️⃣ **User Collection** (Users Table)
**Purpose**: Store user account information and authentication

```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (unique, required),
  password: String (bcrypted, min 6 chars),
  role: String (enum: 'user' or 'admin', default: 'user'),
  language: String (enum: 'en' or 'hi', default: 'en'),
  phone: String,
  location: {
    city: String,
    state: String,
    lat: Number,        // Latitude for geolocation
    lng: Number         // Longitude for geolocation
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Fields Explanation**:
- `role`: Determines access level (user can only see own complaints, admin sees all)
- `language`: UI language preference
- `location`: Auto-detects user's city/state for suggesting relevant authorities

---

#### 2️⃣ **Complaint Collection** (Complaints Table)
**Purpose**: Store all legal complaints and AI analysis results

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),        // Link to complainant
  title: String (required, max 200 chars),
  description: String (required, max 5000 chars),
  
  // Classification
  category: String (enum: 'Consumer', 'Labor', 'Property', 'Criminal', 
                         'Family', 'Cyber', 'Traffic', 'Environmental',
                         'Government', 'Healthcare', 'Education', 
                         'Financial', 'Other'),
  
  language: String (enum: 'en' or 'hi'),
  
  // Location Information
  location: {
    city: String,
    state: String,
    lat: Number,
    lng: Number
  },
  
  // Complaint Status Tracking
  status: String (enum: 'pending', 'analyzed', 'in-progress', 
                        'resolved', 'rejected'),
  
  // AI Analysis Results (Core Intelligence)
  aiAnalysis: {
    category: String,                    // Recategorized by AI
    sentiment: String (positive/negative/neutral/mixed),
    urgency: String (low/medium/high/critical),
    confidenceScore: Number (0-100),     // AI confidence %
    isReasonable: Boolean,               // Legal validity check
    validityExplanation: String,         // Why complaint is/isn't valid
    suggestedActions: [String],          // 3-5 recommended next steps
    relevantLaws: [{                     // Matched laws from dataset
      name: String,                      // e.g., "Consumer Protection Act, 2019"
      section: String,                   // e.g., "Section 35"
      description: String                // Explanation of the section
    }],
    formalLetter: String,                // AI-generated formal letter
    suggestedAuthority: String           // Which authority to approach
  },
  
  // Additional Fields  
  attachments: [String],                 // File URLs
  adminNotes: String,                    // Admin comments
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes for Performance**:
```javascript
- Text search index: { title: 'text', description: 'text' }
- User filter: { user: 1, createdAt: -1 }
- Status filter: { status: 1 }
- Category filter: { category: 1 }
```

---

## 📊 Database Statistics

| Aspect | Details |
|--------|---------|
| **Total Collections** | 2 (User + Complaint) |
| **Relationships** | Complaint → User (one-to-many) |
| **Database Type** | MongoDB (NoSQL, document-based) |
| **Connection** | MongoDB Atlas (Cloud) |
| **Connection URL** | `MONGODB_URI` from `.env` |
| **Connection String Example** | `mongodb+srv://username:password@cluster.mongodb.net/legalmitra` |

---

## 📚 DATASET: Indian Laws Reference

### Location: `backend/data/indianLaws.json`

### Structure
The dataset is a **JSON object** with **13 complaint categories** as keys, each containing an array of relevant Indian laws:

```json
{
  "Consumer": [ laws... ],
  "Labor": [ laws... ],
  "Property": [ laws... ],
  "Criminal": [ laws... ],
  "Family": [ laws... ],
  "Cyber": [ laws... ],
  "Traffic": [ laws... ],
  "Environmental": [ laws... ],
  "Government": [ laws... ],
  "Healthcare": [ laws... ],
  "Education": [ laws... ],
  "Financial": [ laws... ]
}
```

### Example: Consumer Category
```json
"Consumer": [
  {
    "name": "Consumer Protection Act, 2019",
    "section": "Section 2(7)",
    "description": "Defines consumer and their rights including right to seek redressal"
  },
  {
    "name": "Sale of Goods Act, 1930",
    "section": "Section 16",
    "description": "Implied condition as to quality or fitness of goods"
  }
]
```

### Complete Breakdown of Laws in Dataset

| Category | Act/Law Name | Relevant Sections |
|----------|------|-----------|
| **Consumer** (5 laws) | Consumer Protection Act 2019, Sale of Goods Act 1930, E-Commerce Rules 2020 | 2(7), 35, 39, 16, Rule 4 |
| **Labor** (5 laws) | Industrial Disputes Act 1947, Payment of Wages Act 1936, EPF Act 1952, Gratuity Act 1972 | 2A, 3, 12, 6, 4 |
| **Property** (5 laws) | Transfer of Property Act 1882, Registration Act 1908, RERA 2016 | 54, 17, 18, 10, 4 |
| **Criminal** (5 laws) | Bharatiya Nyaya Sanhita 2023, Prevention of SC/ST Atrocities 1989 | 303-308, 351, 173, 61-65, 3 |
| **Family** (5 laws) | Hindu Marriage Act 1955, Domestic Violence Act 2005, Dowry Prohibition 1961 | 13, 12, 6, 4, 3 |
| **Cyber** (5 laws) | Information Technology Act 2000, IT Rules 2021 | 43, 66, 66C, 66D, 3(1)(b) |
| **Traffic** (4 laws) | Motor Vehicles Act 1988 | 177, 185, 184, 166 |
| **Environmental** (5 laws) | Environment Protection Act 1986, Water Pollution Act 1974, Green Tribunal 2010 | 15, 24, 21, 14, Rule 3 |
| **Government** (4 laws) | Right to Information Act 2005, Lokpal Act 2013, Prevention of Corruption 1988 | 6, 14, 7, 14 |
| **Healthcare** (4 laws) | Consumer Protection Act 2019, Clinical Establishments 2010, Medical Council 1956 | 2(42), 12, 20A, 18 |
| **Education** (4 laws) | Right to Education 2009, UGC Act 1956, AICTE Act 1987 | 3, 12A, 10 |
| **Financial** (5 laws) | RBI Act 1934, Banking Regulation 1949, SEBI Act 1992, Insurance Act 1938 | 35A, 21A, 11, 45, Clause 8 |

**Total Laws in Dataset: 60+ laws with 100+ sections**

---

## 🤖 HOW IPC SECTIONS ARE DETERMINED

### The AI Analysis Process

#### Step 1: Complaint Submission
User submits complaint with:
- Title
- Description (text/voice)
- Category (optional - user can self-assign or leave as "Other")
- Location
- Language (Hindi/English)

#### Step 2: AI Analysis Flow
```
Complaint Text
    ↓
Sent to Grok AI API with Prompt
    ↓
AI Engine Processes Using:
  - Complaint description content
  - User-selected category (if provided)
  - Location (for context)
  - Language preference
    ↓
AI Returns JSON with:
  {
    "category": "Consumer",          // Predicted category
    "sentiment": "negative",
    "urgency": "high",
    "confidenceScore": 85,           // How sure is the AI?
    "isReasonable": true,
    "validityExplanation": "...",
    "suggestedActions": [...],
    "relevantLaws": [                ← MATCHED FROM indianLaws.json
      {
        "name": "Consumer Protection Act, 2019",
        "section": "Section 35",
        "description": "Filing of complaints before District Commission"
      }
    ],
    "suggestedAuthority": "Consumer Disputes Redressal Commission"
  }
    ↓
Complaint Updated in MongoDB
```

#### Step 3: Law Matching Strategy

**The AI doesn't just pick randomly - it:**

1. **Understands complaint context** using natural language processing
2. **Maps to category** (Consumer, Labor, Criminal, etc.)
3. **Uses the indianLaws.json dataset** as a reference to match relevant laws
4. **Returns actual sections** from the dataset that apply to the complaint

**Example Workflow:**
```
User Complaint: "I paid ₹50,000 for a phone from an online store, 
                  but it's defective and seller won't give refund"

AI Analysis:
├─ Category: Consumer (recognized from "payment", "defective", "refund")
├─ Relevance: HIGH (clear consumer issue)
├─ Laws Matched from indianLaws.json:
│  ├─ Consumer Protection Act 2019 - Section 2(7) - Defines consumer rights
│  ├─ Consumer Protection Act 2019 - Section 35 - Filing complaint process
│  ├─ Consumer Protection Act 2019 - Section 39 - Appeal against decisions
│  └─ Sale of Goods Act 1930 - Section 16 - Quality & fitness conditions
└─ Suggested Authority: "Consumer Disputes Redressal Commission"
```

---

## 📱 Complete Application Workflow

### User Journey

#### 1. Authentication
```
User Flow: Signup/Login → JWT Token Created → Token Stored in Frontend
Backend: Password hashed with bcryptjs, JWT issued on login
Database: User record created/verified in MongoDB
```

#### 2. Submit Complaint
```
Frontend: User fills form (title, description, category, location)
         ↓
Backend: POST /api/complaints
         ├─ Validate input data
         ├─ Create complaint record in MongoDB
         └─ Status: "pending"
Database: New Complaint document created
```

#### 3. AI Analysis
```
Frontend: User clicks "Analyze Complaint"
         ↓
Backend: POST /api/ai/analyze
         ├─ Extract complaint text
         ├─ Call Grok AI API with:
         │  ├─ Complaint description
         │  ├─ Category
         │  ├─ Location
         │  └─ Language preference
         ├─ Parse AI response (JSON)
         └─ Save analysis to MongoDB
         ↓
AI Service: 
         ├─ Uses indianLaws.json as context
         ├─ Returns matched laws & sections
         └─ Suggests legal authority
         ↓
Database: complaintSchema.aiAnalysis updated with:
         ├─ Matched laws from dataset
         ├─ Confidence score
         ├─ Urgency level
         └─ Validity explanation
Status Changed: "pending" → "analyzed"
```

#### 4. Generate Formal Letter
```
Frontend: User requests formal letter
         ↓
Backend: POST /api/ai/generate-letter
         ├─ Get complaint with analysis
         ├─ Call Grok AI to generate letter
         ├─ Letter includes:
         │  ├─ Proper legal format
         │  ├─ Relevant sections quoted
         │  └─ Location-specific authority
         └─ Save letter to complaint
Database: complaintSchema.aiAnalysis.formalLetter saved
```

#### 5. Track & Manage
```
Frontend: Dashboard shows complaint status
         ↓
Backend: GET /api/complaints
         ├─ Fetch user's complaints
         ├─ Show status, analysis, letters
         └─ Admin can view all complaints
Database: Query Complaint collection with filters
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/profile` - Get user profile

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### AI Services
- `POST /api/ai/analyze` - Analyze complaint with AI
- `POST /api/ai/generate-letter` - Generate formal letter
- `POST /api/ai/suggest-authority` - Suggest relevant authority

### Admin
- `GET /api/admin/complaints` - View all complaints
- `GET /api/admin/statistics` - Analytics
- `PUT /api/admin/complaints/:id/status` - Update complaint status

---

## 🔐 Security Features

✅ **JWT Authentication** - Token-based user sessions  
✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **CORS Protection** - Restricted origins  
✅ **Rate Limiting** - 100 requests per 15 minutes per IP  
✅ **Helmet.js** - HTTP headers security  
✅ **Input Validation** - express-validator  
✅ **Authorization Checks** - Role-based access (user/admin)  

---

## 🎯 Key Components

### Backend Controllers
| Controller | Responsibility |
|------------|-----------------|
| `auth.controller.js` | User signup, login, profile |
| `complaint.controller.js` | CRUD operations for complaints |
| `ai.controller.js` | AI analysis & letter generation |
| `admin.controller.js` | Admin dashboard & analytics |

### Frontend Components
| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation header |
| `AuthContext` | Global auth state management |
| `LandingPage` | Home page with features |
| `LoginPage` | User authentication |
| `SubmitComplaintPage` | Complaint form |
| `DashboardPage` | User's complaint list |
| `ComplaintDetailPage` | View single complaint with analysis |
| `AdminPage` | Admin dashboard |

---

## 📊 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (React)
│
├─ User submits complaint form
│  ├─ Title, description, category, location
│  └─ Language preference
│
└─ Sends POST to /api/complaints
   │
   └──→ BACKEND (Node.js/Express)
       │
       ├─ Validate input
       ├─ Create complaint in MongoDB
       │  └─ Status: "pending"
       │
       └─ When user clicks "Analyze":
          │
          ├─ Call AI Analysis → Grok API
          │  │
          │  ├─ AI reads complaint text
          │  ├─ Matches to category
          │  ├─ Queries indianLaws.json dataset
          │  └─ Returns relevant laws & sections
          │
          ├─ Update complaint record:
          │  └─ aiAnalysis: {
          │     ├─ category
          │     ├─ relevantLaws ← FROM DATASET
          │     ├─ urgency
          │     ├─ confidence
          │     └─ suggestedAuthority
          │     }
          │
          ├─ Status changed: "analyzed"
          ├─ Save to MongoDB
          │
          └─ Return analysis to Frontend
             │
             └──→ User sees:
                 ├─ Category prediction
                 ├─ Relevant IPC/Act sections
                 ├─ Suggested authority
                 ├─ Urgency level
                 └─ Option to generate formal letter
```

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Setup Environment (.env)
```env
# Backend .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legalmitra
JWT_SECRET=your-secret-key
GROK_API_KEY=xai-your-api-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Start Backend
```bash
cd backend
npm run dev    # Development with auto-reload
npm start      # Production
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

---

## 📈 Future Enhancements

- [ ] Voice input transcription to text
- [ ] Real-time complaint status notifications
- [ ] Integration with real legal authorities' complaint systems
- [ ] Machine learning model for better law matching
- [ ] Multi-document uploads
- [ ] Video evidence support
- [ ] Lawyer network integration

---

## ✅ Conclusion

**LegalMitra-AI** is a sophisticated legal complaint platform that:
1. ✅ **Uses MongoDB** with 2 collections (Users + Complaints)
2. ✅ **References indianLaws.json** - a dataset of 60+ Indian laws
3. ✅ **Uses Grok AI** to analyze complaints and match relevant laws
4. ✅ **Automatically suggests IPC sections** based on complaint content
5. ✅ **Generates formal letters** in Hindi & English
6. ✅ **Provides admin dashboard** for oversight

The system intelligently maps complaints to relevant Indian legal acts and sections using AI-powered analysis combined with the indianLaws.json reference dataset!
