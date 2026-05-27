import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useState} from 'react'
import {assets} from '../assets/assets';
import {useContext} from 'react'
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import kconvert from 'k-convert'; // to convert salary to 'k' format
import moment from 'moment'; // to format date
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';


const ApplyJob = () => {

  const { id } = useParams() // to get job id from url
  const [jobData,setJobData] = useState(null) // to store job data

  const { jobs } = useContext(AppContext) // to get job data from app context

  const fetchJob = async() => {
    const data = jobs.filter(job => job._id === id) // to fetch job data based on id from context
    if(data.length !== 0){
      setJobData(data[0]) // set job data
      console.log(data[0])
    }
  }

  useEffect(()=>{
    if(jobs.length > 0){
      fetchJob(); // fetch job data when job list is loaded
    }
  },[id,jobs])

  return jobData ? (
    <>
      <Navbar/>

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
              <button className='bg-blue-600 p-2.5 px-10 text-white rounded cursor-pointer'>Apply Now</button>
              <p className='mt-2 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p> {/* format date*/}
            </div>

          </div>

          <div className='flex flex-col lg:flex-row justify-between items-start'>
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4'>Job description</h2>
              <div className='rich-text' dangerouslySetInnerHTML={{ __html: jobData.description }}></div>
              <button className='bg-blue-600 p-2.5 px-10 text-white rounded mt-10 cursor-pointer'>Apply Now</button>
            </div>
            {/* Right Side bar */}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5'>
              <h2>More jobs from {jobData.companyId.name}</h2>
              {jobs.filter( job => job._id !== jobData._id && job.companyId._id === jobData.companyId._id) // filter out the current job and jobs from other companies
              .filter( job => true ) // true for all jobs (i.e. no filter on level or other)
              .slice(0,4) // take top 4 jobs
              .map((job,index) => <JobCard key={index} job={job}/>)}  
            </div>
          </div>

        </div>
      </div>

      <Footer/>

    </>
  ) : (
    <Loading/> // loading screen when job data is not loaded
  )
}

export default ApplyJob