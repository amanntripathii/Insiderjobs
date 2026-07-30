import './config/instrument.js'
import dns from 'dns'

// Vercel automatically sets NODE_ENV to 'production'.
// So, this says: "If we are NOT on Vercel, use the Google fix."
if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'
import * as Sentry from '@sentry/node'
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from "@clerk/express"
import aiRoutes from './routes/aiRoutes.js'

//Initialize app
const app = express()

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: CORS — locked to ALLOWED_ORIGINS in production, permissive in dev.
// Set ALLOWED_ORIGINS in your .env to a comma-separated list of frontend URLs,
// e.g. ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-app.com
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : null // null = allow all origins in development

app.use((req, res, next) => {
    const origin = req.headers.origin
    if (!allowedOrigins) {
        // Development: allow everything
        res.setHeader('Access-Control-Allow-Origin', '*')
    } else if (origin && allowedOrigins.includes(origin)) {
        // Production: only allow whitelisted origins
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Vary', 'Origin')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token')
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }
    next()
})

// STEP 1b: cors() package as secondary layer
app.use(cors({
    origin: allowedOrigins || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}))

// STEP 3: Attempt DB connect at startup (best-effort — may fail on cold starts)
try {
    await connectDB()
    await connectCloudinary()
} catch (err) {
    console.error('Startup connection error:', err.message)
}

// STEP 4: Body parsers
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json())

// ─── STEP 4b: Rate Limiting ──────────────────────────────────────────────────
// Global limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
})

// Strict limiter for expensive/sensitive endpoints: 10 requests per minute per IP
const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Rate limit exceeded. Please wait before retrying.' }
})

app.use(globalLimiter)

// STEP 5: Per-request DB connection guard
// Ensures the connection is live before hitting any route, even if the
// startup connect above failed or the serverless container was recycled.
app.use(async (req, res, next) => {
    try {
        await connectDB()
    } catch (err) {
        console.error('Per-request DB connection error:', err.message)
        // Don't block the request — let the route handle the DB error naturally
    }
    next()
})

// STEP 6: Clerk auth middleware
app.use(clerkMiddleware())


// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('API is working!')
})
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
})

app.use('/api/company/login', strictLimiter)            // Prevent brute-force login attempts
app.use('/api/company/register', strictLimiter)         // Prevent registration spam
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ai', strictLimiter, aiRoutes)           // AI endpoints are expensive (LLM calls)

// ─── Sentry error handler (must be after routes) ─────────────────────────────
const PORT = process.env.PORT || 5000
Sentry.setupExpressErrorHandler(app)

// Disable Vercel's default bodyParser helper so that express.raw() can read
// the raw body for Svix/Clerk webhooks
export const config = {
    api: {
        bodyParser: false,
    },
}

// Start the server only if running locally, not on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app