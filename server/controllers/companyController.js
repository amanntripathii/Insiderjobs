import Company from '../models/Company.js'
import bcrypt from 'bcrypt'
import generateToken from '../utils/generateToken.js'
import { v2 as cloudinary } from 'cloudinary'
import Job from '../models/Job.js'
import JobApplication from '../models/JobApplication.js'


//Register a new company
export const registerCompany = async(req,res) => {

    const {name, email, password} = req.body

    //To get logo first we have to parse the form data and get image as a variable
    //We will get image file in req.file

    const imageFile = req.file

    //Check if all the required fields are filled
    if(!name || !email || !password || !imageFile){
        return res.json({
            success: false,
            message: "Missing details"
        })
    }

    try {
        //Check if company already exists
        const companyExists = await Company.findOne({email})

        if(companyExists){
            return res.json({
                success: false,
                message: "Company already exists"
            })
        }

        const salt = await bcrypt.genSalt(10) //It does some random shuffling of the password
        const hashPassword = await bcrypt.hash(password, salt) //It hashes the password

        const imageUpload = await cloudinary.uploader.upload(imageFile.path) //Uploads image to cloudinary

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company:{
                id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id) //Generate token for company for authentication
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Company login
export const loginCompany = async(req,res) => {
    const {email,password} = req.body

    try {
        const company = await Company.findOne({email})

        if (!company) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

        if(await bcrypt.compare(password, company.password)){
            res.json({
                success: true,
                company:{
                    id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id) //Generate token for company for authentication
            })
        }else{
            res.json({
                success: false,
                message: "Invalid credentials"
            })
        }
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Get company data
export const getCompanyData = async(req,res) => {

    try{
        const company = req.company //Get company data from auth middleware

        res.json({
            success: true,
            company
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Post a new job
export const postJob = async(req,res) => {

    const {title,description,location,salary,level,category} = req.body

    const companyId = req.company._id

    try{
        
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            level,
            category,
            companyId,
            date: Date.now()
        })

        await newJob.save()

        res.json({
            success: true,
            newJob
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }

}

//Get company job applicants
export const getCompanyJobApplicants = async(req,res) => {
    try{
        const companyId = req.company._id

        const applications = await JobApplication.find({companyId})
        .populate('userId','name image resume')
        .populate('jobId','title location category level salary')
        .exec()

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

//Get company posted jobs
export const getCompanyPostedJobs = async(req,res) => {

    try{
        const companyId = req.company._id

        const jobs = await Job.find({companyId})

        //Adding no. of job applicants info in data
        const jobsData = await Promise.all(jobs.map(async(job) => {
            const applicants = await JobApplication.find({jobId: job._id})
            return {...job.toObject(), applicants: applicants.length}
        })) 

        res.json({
            success: true,
            jobsData
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Change job application status
export const changeJobApplicationStatus = async(req,res) => {

    try{
        const {id, status} = req.body

        //Find job application and update status
        await JobApplication.findOneAndUpdate({_id: id}, {status})

        res.json({
            success: true,
            message: 'Status updated successfully'
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Change job visibility
export const changeVisibility = async(req,res) => {

    try{
        const {id} = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if(companyId.toString() === job.companyId.toString()){
            job.visible = !job.visible
        }

        await job.save()

        res.json({
            success: true,
            job
        })
    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}