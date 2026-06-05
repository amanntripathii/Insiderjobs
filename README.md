# 💼 Insiderjobs

A modern, high-performance, and feature-rich full-stack **Job Portal Application** designed to connect employers with job seekers. Built on the **MERN (MongoDB, Express, React, Node.js)** architecture, the platform features a streamlined application workflow, advanced job search and filtering options, distinct user/company dashboards, Clerk authentication, Sentry performance profiling, Cloudinary media pipeline, and real-time database synchronization via secure webhooks.

---

## 🚀 Key Features

### 👤 For Job Seekers
* **Frictionless Onboarding:** Secure and rapid registration/login utilizing **Clerk Auth** integrations.
* **Advanced Job Discovery:** Real-time job search with multi-tier dynamic filters (job title, geographical location).
* **Profile Management & Resume Upload:** Upload and update resumes seamlessly, processed via **Multer** and securely stored using **Cloudinary's CDN**.
* **Application Tracker:** Track real-time status updates of all submitted applications (*Pending, Approved, Rejected*).

### 🏢 For Recruiters & Companies
* **Dedicated Dashboard:** Complete suite for managing active jobs and viewing applicant pools.
* **Custom JWT Auth:** Lightweight, highly secure custom token-based company login system.
* **Job Posting Suite:** Rich-text job description styling with **Quill.js**, specifying levels (Entry, Mid, Senior), categories, compensation, and location.
* **Applicant Processing Pipeline:** Real-time action buttons to *Approve* or *Reject* applicants, review their profiles, and download their resume directly.
* **Visibility Control:** Toggle visibility on listed jobs to instantly show or hide them from the public feed.

---

## 🛠️ Tech Stack & Services

| Layer | Technologies & Services | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7 | Ultra-fast single page application utilizing CSS gradients and robust component flows |
| **Backend** | Node.js, Express.js (v5.x) | Modern async-await API handling, modular route-controller design |
| **Database** | MongoDB Atlas, Mongoose | Highly queryable document database utilizing structural data relationships |
| **Authentication** | Clerk (Users) & Custom JWT (Companies) | Dual-model authentication system catering to different security footprints |
| **Media Engine** | Cloudinary API, Multer | Automated middleware pipeline for uploading and serving resume PDFs and company logos |
| **Monitoring** | Sentry SDK, Node Profiling | Real-time production APM for error tracking, memory leaks, and query performance |
| **Webhooks** | Svix, Clerk Webhooks | Secure event-driven sync pipeline to seamlessly ingest User profiles into MongoDB |

---

## 📁 Repository Structure

```text
Job-Portal/
├── client/                 # React 19 + Vite Frontend
│   ├── src/
│   │   ├── assets/        # Visual resources and standard icons
│   │   ├── components/    # Reusable UI elements (Navbar, RecruiterLogin, JobCard, etc.)
│   │   ├── context/       # AppContext state engine (axios calls, user states)
│   │   ├── pages/         # Page components (Home, AddJob, ApplyJob, Dashboard, etc.)
│   │   ├── main.jsx       # Client entry point
│   │   └── index.css      # Core styles & Tailwind directives
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Node.js + Express 5.x Backend API
    ├── config/            # Infrastructure setup (db, Cloudinary, Sentry instrumentation)
    ├── controllers/       # Route handlers (company, job, user, webhook business logic)
    ├── middleware/        # Route protection & custom JWT verification
    ├── models/            # Mongoose Schemas (User, Company, Job, JobApplication)
    ├── routes/            # Decoupled Express routers
    ├── utils/             # Helper utilities
    ├── server.js          # API entryway & Sentry express setup
    └── package.json
```

---

## ⚙️ Environment Variables

To run the application locally, you will need to set up two `.env` files.

### 1. Backend Environment Configurations
Create a `.env` file in the `/server` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Database Setup
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

# Cloudinary Storage Configurations
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Authentication & Webhook Sync (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

### 2. Frontend Environment Configurations
Create a `.env` file in the `/client` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:5000
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or Atlas Cluster)
* **Clerk**, **Cloudinary**, and **Sentry** active developer accounts.

### Step 1: Clone and Enter the Directory
```bash
git clone https://github.com/your-username/Job-Portal.git
cd Job-Portal
```

### Step 2: Set Up the Backend
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in developer mode (using Nodemon for hot reloading):
   ```bash
   npm run server
   ```

### Step 3: Set Up the Frontend
1. In a new terminal tab, navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

Open your browser at `http://localhost:5173` to explore the job portal interface.

---

## 🔌 API Endpoints Summary

### 🏢 Company & Recruiter Routes (`/api/company`)
* `POST /register` - Registers a new company with logo image (via Multer/Cloudinary)
* `POST /login` - Authenticators company email & password, returns custom JWT
* `GET /company` - Retrieves authenticated company profile
* `POST /post-job` - Adds a new job listing with level, category, and salary details
* `GET /applicants` - Fetches all job applications for the logged-in company's postings
* `GET /list-jobs` - Fetches all jobs posted by the logged-in company
* `POST /change-status` - Updates an applicant's state (*Approved*, *Rejected*, *Pending*)
* `POST /change-visibility` - Instantly toggles public search visibility for a listed job

### 💼 Public Job Search Routes (`/api/jobs`)
* `GET /` - Fetches all visible job listings (populated with Company details)
* `GET /:id` - Fetches detailed information for a single job listing

### 👤 Job Seeker Routes (`/api/users`)
* `GET /user` - Fetches metadata for Clerk-authenticated User
* `POST /apply` - Submits a job application for a specific listing
* `GET /applications` - Fetches application history and real-time status states
* `POST /update-resume` - Uploads a PDF resume to Cloudinary and links the URL to the user record

---

## 📈 Monitoring & Real-time Synchronization
* **Sentry APM integration:** Built-in telemetry tracking with `Sentry.init` under `server/config/instrument.js` to log errors, profile node transactions, and analyze Mongoose DB query speeds.
* **Svix clerk webhooks:** Seamless webhook endpoint at `/webhooks` that safely verifies Clerk signatures. It automatically parses user events (`user.created`, `user.updated`, `user.deleted`) to maintain flawless database state synchronization.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
