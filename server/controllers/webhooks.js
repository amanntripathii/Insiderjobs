import { Webhook } from "svix"
import User from "../models/User.js"

//API controller fn to manage clerk user with database
export const clerkWebhooks = async (req, res)=>{
    try{

        //Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // // 🚨 FIX 1: Convert the raw buffer to a string for Svix verification
        // const payloadString = req.body.toString('utf8');

        // 🚨 FIX 1: Safely convert the request body to a string depending on its type
        let payloadString;
        if (Buffer.isBuffer(req.body)) {
            payloadString = req.body.toString('utf8');
        } else if (typeof req.body === 'string') {
            payloadString = req.body;
        } else {
            payloadString = JSON.stringify(req.body);
        }


        //Verifying Headers to ensure req is from clerk
        await whook.verify(payloadString, { //stringify() converts the JS object into JSON string 
            "svix-id": req.headers["svix-id"], //svix-id is a header that is sent by clerk to verify the request
            "svix-timestamp": req.headers["svix-timestamp"], //svix-timestamp is a header that is sent by clerk to verify the request
            "svix-signature": req.headers["svix-signature"] //svix-signature is a header that is sent by clerk to verify the request
        }) //Verifying is necessary for security 
        
        // 🚨 FIX 2: Parse the string back into a JavaScript object so we can use it
        const parsedBody = JSON.parse(payloadString);
        const { data, type } = parsedBody; //data is the user data, type is the type of event(eg. user created, user deleted, etc.)

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
                res.status(200).json({}) //response back to clerk to confirm receipt of webhook
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + ' ' + data.last_name,
                    image: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData) //update the user in the database
                res.status(200).json({})
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id) //delete the user from the database
                res.status(200).json({})
                break;
            }

            default:
                // 🚨 FIX 3: You MUST respond to unhandled events, otherwise Clerk times out and says "Failed"
                res.status(200).json({}) 
                break;
                
        }

    }catch(error){
        console.log("WEBHOOK ERROR:", error.message) // Check your terminal for this exact text!
        res.status(400).json({
            success: false,
            message: "Webhooks Error"
        })
    }
}