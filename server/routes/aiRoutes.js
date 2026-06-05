import express from 'express'
import {
    analyzeApplication,
    getApplicationAnalysis,
    analyzeAllApplicationsForJob,
    candidateJobMatch
} from '../controllers/aiController.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Analyze a single application (POST body: { applicationId })
router.post('/analyze-application', protectCompany, analyzeApplication)

// Get cached analysis for a single application
router.get('/application-analysis/:applicationId', protectCompany, getApplicationAnalysis)

// Bulk analyze all applications for a job (POST body: { jobId })
router.post('/analyze-job-applications', protectCompany, analyzeAllApplicationsForJob)

// Candidate: check their own match score for a job (Clerk auth, POST body: { jobId })
router.post('/candidate-match', candidateJobMatch)

export default router
