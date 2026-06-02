import jwt from "jsonwebtoken"
import Company from "../models/Company.js"

export const protectCompany = async(req,res,next) => {
    
    const token = req.headers.token

    if(!token){
        return res.json({
            success: false,
            message: "Not authorized, Login again"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET) //Returns Decoded token

        req.company = await Company.findById(decoded.id).select('-password') //It will attach company data to request for using it in future

        next() //Calls the next middleware or controller
    }catch(error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}