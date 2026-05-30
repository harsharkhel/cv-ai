# CVAlign AI

CVAlign AI is an AI-powered resume analysis and job recommendation platform. It helps users upload or paste their resume, compare it with a job description, get an ATS-style match score, identify missing skills, improve resume content, and discover relevant job opportunities.

The goal of this project is to make job preparation easier by combining resume analysis, skill-gap detection, AI suggestions, and job discovery in one platform.

---

## 🚀 Features

### Resume Analysis
- Upload or paste resume content
- Paste job description for comparison
- ATS-style resume score
- Keyword matching
- Missing skills detection
- Resume improvement suggestions
- AI-generated bullet point recommendations

### Job Recommendation
- Recommend jobs based on resume skills
- Show matching roles by profession and skill set
- Provide job links for users to apply
- Suggest skills required for selected roles

### Authentication
- Email and password login
- Google login support
- Secure user authentication using JWT/session-based auth
- Password hashing for safe storage

### User Dashboard
- Resume analysis history
- Job match results
- Recommended skills
- AI-based career suggestions

### Admin/Backend Features
- Store user data securely
- Manage resume analysis records
- Validate user input
- Rate limiting to prevent spam
- Secure API structure using environment variables

---

## 🧠 How CVAlign AI Works

1. User signs up or logs in.
2. User uploads a resume or pastes resume text.
3. User adds a job description.
4. The system extracts skills, keywords, and important job requirements.
5. CVAlign AI compares the resume with the job description.
6. The platform gives:
   - ATS match score
   - Missing keywords
   - Skill gap analysis
   - Resume improvement tips
   - Relevant job recommendations

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

### Backend
- Node.js
- Express.js
- JWT Authentication
- Google OAuth
- bcrypt for password hashing
- CORS
- Rate Limiting
- Input Validation

### Database
- MongoDB / PostgreSQL / MySQL  
  *(Use whichever database your project is currently using)*

### AI / NLP
- Resume parsing
- Keyword extraction
- Skill matching
- AI-generated suggestions
- Job recommendation logic

---

## 📁 Project Structure

```bash
CVAlign-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
