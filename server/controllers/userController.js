import User from "../models/User.js"
import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import { v2 as cloudinary } from "cloudinary"
import { getAuth } from '@clerk/express'
import { extractTextFromPdfUrl } from '../services/pdfService.js'

//Get user data
export const getUserData = async(req,res) => {

    const { userId } = getAuth(req) //Whenever we send any token from frontend,
    //it will be decoded by clerkMiddleware to .auth and we can access user id from 

    try{
        const user = await User.findById(userId)
        if(!user){
            return res.json({
                success: false,
                message: 'User not found'
            })
        }

        res.json({
            success: true,
            user
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Apply for job
export const applyForJob = async(req,res) => {

    const {jobId} = req.body
    const { userId } = getAuth(req)

    try{
        //To see if user has already applied for the job
        const isAlreadyApplied = await JobApplication.find({jobId,userId})

        if(isAlreadyApplied.length > 0){
            return res.json({
                success: false,
                message: 'You have already applied for this job'
            })
        }

        const jobData = await Job.findById(jobId) //To get the job details by its id

        if(!jobData){
            return res.json({
                success: false,
                message: 'Job not found'
            })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            jobId,
            userId,
            date: Date.now()
        })

        res.json({
            success: true,
            message: 'Applied successfully'
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Get user applied applications
export const getUserJobApplications = async(req,res) => {

    try{
        const { userId } = getAuth(req)

        const applications = await JobApplication.find({userId})
        .populate('companyId','name email image') //It gives company data for companyId
        .populate('jobId', 'title description salary location level category') //It gives job data for jobId
        .exec()

        // Note: find() always returns [] not null, so no null check needed
        res.json({
            success: true,
            applications
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Update user profile(resume)
export const updateUserResume = async(req,res) => {
    try{
        const { userId } = getAuth(req)
        const resumeFile = req.file
        
        console.log("DEBUG RESUME UPLOAD:", { userId, auth: req.auth, resumeFile })

        const userData = await User.findById(userId)

        if(resumeFile){
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path) //Uploading the file to cloudinary
            userData.resume = resumeUpload.secure_url //Storing secure url of the uploaded file in database

            // Extract and cache text so AI doesn't need to re-parse PDF later
            try {
                const extractedText = await extractTextFromPdfUrl(resumeUpload.secure_url)
                userData.resumeText = extractedText
            } catch (extractErr) {
                console.warn('Could not extract resume text (non-critical):', extractErr.message)
            }
        }

        await userData.save()

        return res.json({
            success: true,
            message: 'Resume updated successfully'
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}