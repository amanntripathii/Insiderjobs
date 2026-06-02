import './config/instrument.js'
import dns from 'dns'
// Vercel automatically sets NODE_ENV to 'production'.
// So, this says: "If we are NOT on Vercel, use the Google fix."
if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'
import * as Sentry from '@sentry/node'
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from "@clerk/express"





//Initialize app
const app = express()



//Connect to Database
await connectDB() //asynchronous function so we use await
await connectCloudinary()



//Middlewares
app.use(cors()) //allow cross origin requests

app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks) //webhook endpoint to handle clerk events

app.use(express.json()) // allow json format

//Use clerk middleware for protected routes (authentication)
app.use(clerkMiddleware())



//Routes
app.get('/', (req, res) => { //default route
    res.send('API is working!')
})
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
}); //error on the browser at the route: localhost:5000/debug-sentry

//Company routes
app.use('/api/company', companyRoutes)
//Job routes
app.use('/api/jobs', jobRoutes)
//User routes
app.use('/api/users', userRoutes)



//Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);



//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})