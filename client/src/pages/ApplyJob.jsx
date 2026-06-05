import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react'
import { assets } from '../assets/assets';
import { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth, useUser } from '@clerk/react';


// ─── AI Match Score Panel ─────────────────────────────────────────────────────
const MatchScorePanel = ({ jobId, backendUrl }) => {
  const { getToken } = useAuth()
  const { user } = useUser()

  const [analysis, setAnalysis] = useState(null)   // null = not run yet
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkMatch = async () => {
    if (!user) return toast.error('Please log in to check your match score')

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const { data } = await axios.post(
        backendUrl + '/api/ai/candidate-match',
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setAnalysis(data.analysis)
      } else if (data.message === 'no_resume') {
        setError('upload_resume')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 75) return { ring: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Strong Match', labelColor: 'text-emerald-700' }
    if (score >= 50) return { ring: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate Match', labelColor: 'text-amber-700' }
    return { ring: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Low Match', labelColor: 'text-red-600' }
  }

  // Not logged in
  if (!user) return null

  // Not yet run
  if (!analysis && !loading && !error) {
    return (
      <div className='border border-blue-100 rounded-xl p-4 bg-blue-50'>
        <p className='text-sm font-semibold text-blue-800 mb-1'>Check Your Match Score</p>
        <p className='text-xs text-blue-600 mb-3'>See how well your resume matches this job before applying.</p>
        <button
          onClick={checkMatch}
          className='w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors'
        >
          Analyze My Resume
        </button>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-center'>
        <div className='inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2'></div>
        <p className='text-xs text-gray-500'>Analyzing your resume against this job...</p>
      </div>
    )
  }

  // Error states
  if (error === 'upload_resume') {
    return (
      <div className='border border-amber-200 rounded-xl p-4 bg-amber-50'>
        <p className='text-sm font-semibold text-amber-800 mb-1'>Resume Required</p>
        <p className='text-xs text-amber-700'>Upload your resume to see your match score for this job.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='border border-red-100 rounded-xl p-4 bg-red-50'>
        <p className='text-xs text-red-600'>{error}</p>
        <button onClick={checkMatch} className='mt-2 text-xs text-red-500 underline'>Try again</button>
      </div>
    )
  }

  // Result
  const style = getScoreColor(analysis.matchScore)

  return (
    <div className={`border ${style.border} rounded-xl overflow-hidden`}>
      {/* Score header */}
      <div className={`${style.bg} px-4 py-3 flex items-center justify-between`}>
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>AI Match Score</p>
          <p className={`text-3xl font-bold ${style.ring} mt-0.5`}>{analysis.matchScore}%</p>
          <span className={`text-xs font-semibold ${style.labelColor}`}>{style.label}</span>
        </div>
        <button
          onClick={checkMatch}
          className='text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2 py-1 transition-colors'
        >
          Recheck
        </button>
      </div>

      {/* Skills */}
      <div className='bg-white px-4 py-3 space-y-3'>

        {/* Matched skills */}
        {analysis.candidateSkills?.length > 0 && (
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Skills Matched</p>
            <div className='flex flex-wrap gap-1.5'>
              {analysis.candidateSkills.slice(0, 8).map((skill, i) => (
                <span key={i} className='text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium'>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {analysis.missingSkills?.length > 0 && (
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Missing Skills</p>
            <div className='flex flex-wrap gap-1.5'>
              {analysis.missingSkills.map((skill, i) => (
                <span key={i} className='text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md font-medium'>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {analysis.summary && (
          <p className='text-xs text-gray-500 italic leading-relaxed border-t border-gray-100 pt-2'>
            "{analysis.summary}"
          </p>
        )}
      </div>
    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────
const ApplyJob = () => {

  const { getToken } = useAuth()

  const { id } = useParams()
  const [jobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)

  const { jobs, backendUrl, userData, userApplications, fetchUserApplications } = useContext(AppContext)

  const navigate = useNavigate()

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)
      if (data.success) {
        setJobData(data.job)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error('Login to apply for the job')
      }
      if (!userData.resume) {
        navigate('/applications')
        return toast.error('Upload resume to apply')
      }

      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/users/apply',
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(item => item.jobId._id === jobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  useEffect(() => {
    fetchJob() // fetch job data when job list is loaded
  }, [id])

  useEffect(() => {
    if (userApplications.length > 0 && jobData) {
      checkAlreadyApplied()
    }
  }, [userApplications, jobData, id])

  return jobData ? (
    <>
      <Navbar />

      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full'>
          <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl'>
            <div className='flex flex-col md:flex-row items-center'>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={jobData.companyId.image} alt="" />
              <div className='text-center md:text-left text-neutral-700'>
                <h1 className='text-2xl sm:text-4xl font-medium'>{jobData.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.money_icon} alt="" />
                    CTC : {kconvert.convertTo(jobData.salary)} {/*convert salary to 'k' format*/}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col items-center justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
              <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded cursor-pointer'>
                {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
              </button>
              <p className='mt-2 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p> {/* format date*/}
            </div>
          </div>

          <div className='flex flex-col lg:flex-row justify-between items-start'>
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4'>Job description</h2>
              <div className='rich-text' dangerouslySetInnerHTML={{ __html: jobData.description }}></div>
              <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded mt-10 cursor-pointer'>
                {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>

            {/* Right Side bar */}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5'>

              {/* AI Match Score Panel */}
              <MatchScorePanel jobId={jobData._id} backendUrl={backendUrl} />

              <h2>More jobs from {jobData.companyId.name}</h2>
              {jobs
                .filter(job => job._id !== jobData._id && job.companyId._id === jobData.companyId._id) // filter out the current job and jobs from other companies
                .filter(job => {
                  //Set of applied jobs
                  const appliedJobIds = new Set(userApplications.map(app => app.jobId._id))
                  //Return true if user has not applied for the job
                  return !appliedJobIds.has(job._id)
                })
                .slice(0, 4) // take top 4 jobs
                .map((job, index) => <JobCard key={index} job={job} />)
              }
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  ) : (
    <Loading /> // loading screen when job data is not loaded
  )
}

export default ApplyJob