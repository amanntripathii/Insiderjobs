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
import aiRoutes from './routes/aiRoutes.js'





//Initialize app
const app = express()



//Connect to Database
try {
    await connectDB()
    await connectCloudinary()
} catch (err) {
    console.error('Startup connection error:', err.message)
}

// CORS — must list every custom header the client sends (token, Authorization)
const allowedOrigins = [
    'https://insider-jobs-38ff.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
]

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true)
        }
        return callback(null, true) // allow all — remove this line to restrict to allowedOrigins only
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: false
}))

// Handle preflight OPTIONS requests for all routes
app.options('*', cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}))

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
//AI routes
app.use('/api/ai', aiRoutes)



//Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);



//Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })

// Disable Vercel's default bodyParser helper so that express.raw() can read the raw body for Svix/Clerk webhooks
export const config = {
    api: {
        bodyParser: false,
    },
};

// Start the server only if running locally, not on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app;