import Job from "../models/Job.js"

//Get all jobs
export const getJobs = async(req,res) => {

    try{
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 100))
        const skip = (page - 1) * limit

        const jobs = await Job.find({visible: true}) // Only visible jobs are fetched
        .populate({path: 'companyId', select: '-password'}) // Populates company data and excludes password
        .sort({ date: -1 }) // Newest first
        .skip(skip)
        .limit(limit)

        const total = await Job.countDocuments({visible: true})

        res.json({
            success: true,
            jobs,
            total,
            page,
            pages: Math.ceil(total / limit)
        })

    }catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Get a single job by id
export const getJobById = async(req,res) => {

    try{
        const {id} = req.params

        const job = await Job.findById(id)
        .populate({path: 'companyId', select: '-password'})

        if(!job){
            return res.json({
                success: false,
                message: "Job not found"
            })
        }

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