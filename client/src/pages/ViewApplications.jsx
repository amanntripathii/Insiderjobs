import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'

// ─── Score Badge ────────────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        Not Analyzed
      </span>
    )
  }

  const getStyle = () => {
    if (score >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Excellent' }
    if (score >= 55) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Good' }
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Low' }
  }

  const s = getStyle()

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
      <span className="text-sm font-bold">{score}%</span>
      <span className="text-xs font-medium opacity-75">{s.label}</span>
    </div>
  )
}

// ─── Score Ring ──────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  if (score === null || score === undefined) return null

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} stroke="#f1f5f9" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  )
}

// ─── Skill Chip ──────────────────────────────────────────────────────────────
const SkillChip = ({ label, variant = 'default' }) => {
  const styles = {
    default: 'bg-blue-50 text-blue-700 border border-blue-200',
    missing: 'bg-red-50 text-red-700 border border-red-200',
    required: 'bg-purple-50 text-purple-700 border border-purple-200',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

// ─── Applicant Card ──────────────────────────────────────────────────────────
const ApplicantCard = ({ applicant, index, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ai = applicant.aiAnalysis || {}
  const hasAnalysis = !!ai.lastAnalyzedAt
  const isError = hasAnalysis && ai.matchScore === null

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Rank + Avatar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <img
            src={applicant.userId?.image}
            alt={applicant.userId?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
          />
        </div>

        {/* Name + Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{applicant.userId?.name}</h3>
          <p className="text-sm text-gray-500 truncate">
            {applicant.jobId?.title} · {applicant.jobId?.location}
          </p>
        </div>

        {/* Score Ring */}
        {hasAnalysis && !isError && (
          <div className="flex-shrink-0 hidden sm:block">
            <ScoreRing score={ai.matchScore} />
          </div>
        )}

        {/* Right actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0 ml-auto">
          <ScoreBadge score={hasAnalysis ? ai.matchScore : undefined} />

          <a
            href={applicant.userId?.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <img src={assets.resume_download_icon} alt="" className="w-3.5 h-3.5" />
            Resume
          </a>

          {/* Status control */}
          {applicant.status === 'Pending' ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                ···
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onMouseDown={() => onStatusChange(applicant._id, 'Accepted')}
                    className="block w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onMouseDown={() => onStatusChange(applicant._id, 'Rejected')}
                    className="block w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${applicant.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              {applicant.status}
            </span>
          )}

          {/* Expand toggle */}
          {hasAnalysis && !isError && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              {expanded ? 'Hide' : 'Details'}
              <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {expanded && hasAnalysis && !isError && (
        <div className="border-t border-gray-100 bg-gradient-to-b from-slate-50 to-white px-5 py-4 space-y-4">

          {/* Summary */}
          <div className="flex items-start gap-2">
            <p className="text-sm text-gray-700 leading-relaxed italic">"{ai.summary}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate Skills */}
            {ai.candidateSkills?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Candidate Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ai.candidateSkills.map((skill, i) => (
                    <SkillChip key={i} label={skill} variant="default" />
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {ai.missingSkills?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ai.missingSkills.map((skill, i) => (
                    <SkillChip key={i} label={skill} variant="missing" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analyzed timestamp */}
          <p className="text-xs text-gray-400">
            Analyzed {new Date(ai.lastAnalyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="border-t border-gray-100 bg-red-50 px-5 py-3">
          <p className="text-xs text-red-600">⚠️ {ai.summary || 'Could not analyze this resume.'}</p>
        </div>
      )}
    </div>
  )
}

// ─── Job Group Header ────────────────────────────────────────────────────────
const JobGroupHeader = ({ jobTitle, jobLocation, count, score, onAnalyze, analyzing }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
    <div>
      <h2 className="text-base font-semibold text-gray-800">{jobTitle}</h2>
      <p className="text-sm text-gray-500">{jobLocation} · {count} applicant{count !== 1 ? 's' : ''}</p>
    </div>
    <button
      onClick={onAnalyze}
      disabled={analyzing}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm
        ${analyzing
          ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:shadow-md active:scale-95'
        }`}
    >
      {analyzing ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Analyzing…
        </>
      ) : (
        <>Rank with AI</>
      )}
    </button>
  </div>
)

// ─── Main Component ──────────────────────────────────────────────────────────
const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext)

  const [applicants, setApplicants] = useState(false)
  const [analyzingJobId, setAnalyzingJobId] = useState(null)

  const fetchCompanyJobApplicants = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/applicants', {
        headers: { token: companyToken }
      })
      if (data.success) {
        setApplicants(data.applications)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/company/change-status',
        { id, status },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        // Update status in-place — don't re-fetch so list order stays the same
        setApplicants(prev =>
          prev.map(a => a._id === id ? { ...a, status } : a)
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const analyzeJobApplicants = async (jobId) => {
    setAnalyzingJobId(jobId)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/ai/analyze-job-applications',
        { jobId },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        // Merge AI analysis into existing applicants in-place — preserve original order
        const analysisMap = {}
        data.applications.forEach(a => { analysisMap[a._id] = a.aiAnalysis })

        setApplicants(prev =>
          prev.map(a => analysisMap[a._id] ? { ...a, aiAnalysis: analysisMap[a._id] } : a)
        )
        if (data.failedCount > 0) {
          toast.warn(`Ranking done. ${data.failedCount} resume(s) could not be processed — check the error details on each card.`)
        } else {
          toast.success('AI ranking complete!')
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAnalyzingJobId(null)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplicants()
    }
  }, [companyToken])

  if (!applicants) return <Loading />

  if (applicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <span className="text-5xl">📭</span>
        <p className="text-xl text-gray-500 font-medium">No applications yet</p>
        <p className="text-sm text-gray-400">Applications will appear here once candidates apply.</p>
      </div>
    )
  }

  // Group by jobId
  const grouped = applicants
    .filter(a => a.jobId && a.userId)
    .reduce((acc, app) => {
      const jid = app.jobId._id || app.jobId
      if (!acc[jid]) acc[jid] = { job: app.jobId, apps: [] }
      acc[jid].apps.push(app)
      return acc
    }, {})

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-10">

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Use AI ranking to instantly surface your strongest candidates.</p>
        </div>
      </div>

      {/* Job Groups */}
      {Object.entries(grouped).map(([jobId, { job, apps }]) => {
        const isAnalyzing = analyzingJobId === jobId

        // Keep original order — sorting only happens on explicit user action
        const sorted = apps

        const avgScore = apps.filter(a => a.aiAnalysis?.matchScore != null).length
          ? Math.round(apps.filter(a => a.aiAnalysis?.matchScore != null)
            .reduce((s, a) => s + a.aiAnalysis.matchScore, 0) /
            apps.filter(a => a.aiAnalysis?.matchScore != null).length)
          : null

        return (
          <section key={jobId}>
            <JobGroupHeader
              jobTitle={job.title}
              jobLocation={job.location}
              count={apps.length}
              score={avgScore}
              onAnalyze={() => analyzeJobApplicants(jobId)}
              analyzing={isAnalyzing}
            />

            {/* Average score summary bar */}
            {avgScore !== null && (
              <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                <span className="text-sm text-indigo-700">
                  <span className="font-bold">{apps.filter(a => a.aiAnalysis?.matchScore != null).length}</span> of <span className="font-bold">{apps.length}</span> analyzed
                </span>
                <span className="text-indigo-300">·</span>
                <span className="text-sm text-indigo-700">
                  Average match: <span className="font-bold">{avgScore}%</span>
                </span>
              </div>
            )}

            <div className="space-y-3">
              {sorted.map((applicant, idx) => (
                <ApplicantCard
                  key={applicant._id}
                  applicant={applicant}
                  index={idx}
                  onStatusChange={changeJobApplicationStatus}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ViewApplications