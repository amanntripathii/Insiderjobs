import './config/instrument.js'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from '@sentry/node'
import { clerkWebhooks } from './controllers/webhooks.js'



//Initialize app
const app = express()



//Connect to Database
await connectDB() //asynchronous function so we use await



//Middlewares
app.use(cors()) //allow cross origin requests
app.use(express.json()) // allow json format



//Routes
app.get('/', (req, res) => { //default route
    res.send('API is working!')
})
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
}); //error on the browser at the route: localhost:5000/debug-sentry
app.post('/webhooks', clerkWebhooks) //webhook endpoint to handle clerk events



//Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);



//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})