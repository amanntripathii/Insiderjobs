import JobApplication from '../models/JobApplication.js'
import Job from '../models/Job.js'
import User from '../models/User.js'
import { analyzeResumeJobMatch } from '../services/aiService.js'
import { extractTextFromPdfUrl } from '../services/pdfService.js'
import { getAuth } from '@clerk/express'


/**
 * Ensures a user has resumeText in DB. If not, fetches + parses their resume PDF.
 * Returns the resumeText string.
 */
const ensureResumeText = async (userId, resumeUrl) => {
    const user = await User.findById(userId)

    if (!user) throw new Error('User not found')

    // Return cached text if it exists
    if (user.resumeText && user.resumeText.trim().length > 50) {
        return user.resumeText
    }

    // Extract from PDF and cache
    if (!resumeUrl) throw new Error('No resume URL available for this candidate')

    const text = await extractTextFromPdfUrl(resumeUrl)
    user.resumeText = text
    await user.save()

    return text
}


/**
 * POST /api/ai/analyze-application
 * Analyzes a single application. Protected by protectCompany middleware.
 * Body: { applicationId }
 */
export const analyzeApplication = async (req, res) => {
    try {
        const { applicationId } = req.body

        if (!applicationId) {
            return res.json({ success: false, message: 'applicationId is required' })
        }

        const application = await JobApplication.findById(applicationId)
            .populate('userId', 'name image resume resumeText')
            .populate('jobId', 'title description')

        if (!application) {
            return res.json({ success: false, message: 'Application not found' })
        }

        const resumeText = await ensureResumeText(
            application.userId._id,
            application.userId.resume
        )

        const analysis = await analyzeResumeJobMatch(
            resumeText,
            application.jobId.description,
            application.jobId.title
        )

        // Save to DB (cache)
        application.aiAnalysis = {
            ...analysis,
            lastAnalyzedAt: new Date()
        }
        await application.save()

        return res.json({ success: true, analysis: application.aiAnalysis })

    } catch (error) {
        console.error('analyzeApplication error:', error.message)
        return res.json({ success: false, message: error.message })
    }
}


/**
 * GET /api/ai/application-analysis/:applicationId
 * Returns cached AI analysis for a given application. No AI call if already analyzed.
 */
export const getApplicationAnalysis = async (req, res) => {
    try {
        const { applicationId } = req.params

        const application = await JobApplication.findById(applicationId)
            .select('aiAnalysis')

        if (!application) {
            return res.json({ success: false, message: 'Application not found' })
        }

        if (!application.aiAnalysis?.lastAnalyzedAt) {
            return res.json({ success: false, message: 'No analysis available yet' })
        }

        return res.json({ success: true, analysis: application.aiAnalysis })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


/**
 * POST /api/ai/analyze-job-applications
 * Bulk-analyzes all applications for a given jobId.
 * Skips applications already analyzed (cached). Returns results sorted by matchScore DESC.
 * Body: { jobId }
 */
export const analyzeAllApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.body

        if (!jobId) {
            return res.json({ success: false, message: 'jobId is required' })
        }

        const job = await Job.findById(jobId).select('title description companyId')

        if (!job) {
            return res.json({ success: false, message: 'Job not found' })
        }

        // Verify the recruiter owns this job
        if (job.companyId.toString() !== req.company._id.toString()) {
            return res.json({ success: false, message: 'Unauthorized' })
        }

        const applications = await JobApplication.find({ jobId })
            .populate('userId', 'name image resume resumeText')
            .populate('jobId', 'title description location category level salary')

        if (applications.length === 0) {
            return res.json({ success: true, applications: [] })
        }

        // Process each application — skip if already analyzed
        const results = await Promise.allSettled(
            applications.map(async (application) => {
                // Skip only if already SUCCESSFULLY analyzed (matchScore is not null)
                if (application.aiAnalysis?.lastAnalyzedAt && application.aiAnalysis?.matchScore !== null) {
                    return application
                }

                try {
                    const resumeText = await ensureResumeText(
                        application.userId._id,
                        application.userId.resume
                    )

                    const analysis = await analyzeResumeJobMatch(
                        resumeText,
                        job.description,
                        job.title
                    )

                    application.aiAnalysis = {
                        ...analysis,
                        lastAnalyzedAt: new Date()
                    }
                    await application.save()

                } catch (err) {
                    const errMsg = err.message || 'Unknown error'
                    console.error(`AI analysis failed for application ${application._id}:`, errMsg)
                    application.aiAnalysis = {
                        matchScore: null,
                        candidateSkills: [],
                        requiredSkills: [],
                        missingSkills: [],
                        summary: `Analysis failed: ${errMsg}`,
                        lastAnalyzedAt: new Date()
                    }
                    await application.save()
                }

                return application
            })
        )

        // Extract successful results and sort by matchScore descending (nulls last)
        const analyzedApplications = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)
            .sort((a, b) => {
                const scoreA = a.aiAnalysis?.matchScore ?? -1
                const scoreB = b.aiAnalysis?.matchScore ?? -1
                return scoreB - scoreA
            })

        const failedCount = analyzedApplications.filter(
            a => a.aiAnalysis?.matchScore === null
        ).length

        return res.json({ success: true, applications: analyzedApplications, failedCount })

    } catch (error) {
        console.error('analyzeAllApplicationsForJob error:', error.message)
        return res.json({ success: false, message: error.message })
    }
}


/**
 * POST /api/ai/candidate-match
 * Candidate checks their own match score for any job before/after applying.
 * Uses Clerk auth — no company token needed.
 * Body: { jobId }
 */
export const candidateJobMatch = async (req, res) => {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return res.json({ success: false, message: 'Please log in to check your match score' })
        }

        const { jobId } = req.body
        if (!jobId) {
            return res.json({ success: false, message: 'jobId is required' })
        }

        const user = await User.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        let resumeText = user.resumeText

        // Extract from PDF if not cached yet
        if (!resumeText || resumeText.trim().length < 50) {
            if (!user.resume) {
                return res.json({ success: false, message: 'no_resume' })
            }
            resumeText = await extractTextFromPdfUrl(user.resume)
            user.resumeText = resumeText
            await user.save()
        }

        const job = await Job.findById(jobId).select('title description')
        if (!job) return res.json({ success: false, message: 'Job not found' })

        // Run analysis — not saved to DB (on-demand for browsing)
        const analysis = await analyzeResumeJobMatch(resumeText, job.description, job.title)

        return res.json({ success: true, analysis })

    } catch (error) {
        console.error('candidateJobMatch error:', error.message)
        return res.json({ success: false, message: error.message })
    }
}
