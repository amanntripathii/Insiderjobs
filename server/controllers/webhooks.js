import { Webhook } from "svix"
import User from "../models/User.js"

//API controller fn to manage clerk user with database
export const clerkWebhooks = async (req, res)=>{
    try{

        //Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //Verifying Headers to ensure req is from clerk
        await whook.verify(JSON.stringify(req.body), { //stringify() converts the JS object into JSON string 
            "svix-id": req.headers["svix-id"], //svix-id is a header that is sent by clerk to verify the request
            "svix-timestamp": req.headers["svix-timestamp"], //svix-timestamp is a header that is sent by clerk to verify the request
            "svix-signature": req.headers["svix-signature"] //svix-signature is a header that is sent by clerk to verify the request
        }) //Verifying is necessary for security 
        
        const {data,type} = req.body //data is the user data, type is the type of event(eg. user created, user deleted, etc.)

        //Switch statemnet to handle different types of events
        switch(type){
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + ' ' + data.last_name,
                    image: data.image_url,
                    resume: ''
                }
                await User.create(userData) //create the user in the database
                res.json({}) //response back to clerk to confirm receipt of webhook
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + ' ' + data.last_name,
                    image: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData) //update the user in the database
                res.json({})
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id) //delete the user from the database
                res.json({})
                break;
            }

            default:
            break;
                
        }

    }catch(error){
        console.log(error.message)
        res.json({
            success: false,
            message: "Webhooks Error"
        })
    }
}