import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    date: {
        type: Number,
        required: true
    },
    aiAnalysis: {
        matchScore:      { type: Number, default: null },
        candidateSkills: [{ type: String }],
        requiredSkills:  [{ type: String }],
        missingSkills:   [{ type: String }],
        summary:         { type: String, default: '' },
        lastAnalyzedAt:  { type: Date }
    }
})

// ─── Indexes for query performance ───────────────────────────────────────────
// Prevents duplicate applications at the DB level and speeds up lookups
JobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true })
// Recruiter dashboard: fetch all applications for a company
JobApplicationSchema.index({ companyId: 1 })
// Candidate dashboard: fetch all applications by a user
JobApplicationSchema.index({ userId: 1 })

const JobApplication = mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
export default JobApplication