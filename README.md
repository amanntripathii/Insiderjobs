# InsiderJobs

A full-stack MERN job portal with dual-role authentication, AI-driven candidate ranking, and real-time application tracking.

---

## Tech Stack

**Frontend:** React.js · React Router · Axios · Tailwind CSS · Clerk · React Toastify

**Backend:** Node.js · Express.js · MongoDB (Mongoose) · JWT · Multer · Sentry

**AI / Services:** Groq API (Llama 3.1-8b) · pdf-parse · Cloudinary · Clerk Webhooks

**DevOps:** Vercel

---

## Features

### Candidate
- Sign up / log in via **Clerk OAuth** (Google, GitHub, etc.)
- Browse and search jobs by title, location, and category
- Upload resume (PDF) — stored on **Cloudinary**
- Apply to jobs with one click
- View application status (Pending / Accepted / Rejected)
- **AI Match Score** — see your resume's match % against any job before applying, with matched and missing skills breakdown

### Recruiter
- Register and log in via **JWT-based** company auth
- Post new jobs with rich text descriptions and salary info
- Manage all posted jobs (edit, delete)
- View all applicants per job with resume download
- Accept or Reject applicants directly from the dashboard
- **AI Candidate Ranking** — bulk-analyze all applicants with one click using Groq (Llama 3.1), ranked by match score with skill gap analysis
- Analysis results cached in MongoDB — re-ranking skips already-processed candidates (100% reduction in redundant AI API calls)

---

## Project Structure

```
Job-Portal/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Navbar, Footer, JobCard, Loading
│       ├── context/         # AppContext (global state)
│       └── pages/           # Home, ApplyJob, Applications, Dashboard, ViewApplications
│
└── server/                  # Express backend
    ├── config/              # DB, Cloudinary, Sentry setup
    ├── controllers/         # userController, companyController, aiController, webhooks
    ├── middleware/          # authMiddleware (JWT protectCompany)
    ├── models/              # User, Job, JobApplication, Company
    ├── routes/              # userRoutes, companyRoutes, jobRoutes, aiRoutes
    └── services/            # aiService (Groq), pdfService (pdf-parse)
```

---

## Environment Variables

### `server/.env`

```env
JWT_SECRET=your_jwt_secret

# Groq AI (free at console.groq.com)
GROQ_API_KEY=gsk_...

# MongoDB
MONGODB_URI=mongodb+srv://...

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret

# Clerk
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### `client/.env`

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/amanntripathii/Job-Portal.git
cd Job-Portal

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install

# 4. Add environment variables (see above)

# 5. Run both servers
cd server && npm run server   # runs on :5000
cd client && npm run dev      # runs on :5173
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | Public | List all jobs |
| GET | `/api/jobs/:id` | Public | Get job details |
| POST | `/api/users/apply` | Clerk | Apply for a job |
| GET | `/api/users/applications` | Clerk | Get applied jobs |
| POST | `/api/users/update-resume` | Clerk | Upload/update resume |
| POST | `/api/company/register` | Public | Recruiter registration |
| POST | `/api/company/login` | Public | Recruiter login |
| POST | `/api/company/add-job` | JWT | Post a new job |
| GET | `/api/company/applicants` | JWT | Get all applicants |
| POST | `/api/company/change-status` | JWT | Accept / Reject applicant |
| POST | `/api/ai/analyze-job-applications` | JWT | Bulk AI rank applicants |
| POST | `/api/ai/candidate-match` | Clerk | Candidate AI match score |

---

## AI Architecture

```
Recruiter clicks "Rank with AI"
        │
        ▼
For each applicant:
  ┌─ Resume text cached in DB? ──Yes──► Skip PDF extraction
  │                                          │
  No                                         │
  │                                          │
  ▼                                          ▼
Fetch PDF from Cloudinary            Send resumeText + JD to Groq
Parse with pdf-parse                 (Llama 3.1-8b-instant)
Cache resumeText in MongoDB                  │
        │                                    ▼
        └──────────────────────────► Save matchScore, skills,
                                     summary → MongoDB
```

**Result:** 100% of re-ranking calls skip AI for already-analyzed candidates.

---

## License

MIT
