import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const NEW_PASSWORD = 'Google@123' // ← change this to whatever you want

await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`)

const Company = mongoose.model('Company', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    image: String
}))

const hashed = await bcrypt.hash(NEW_PASSWORD, 10)
const result = await Company.findOneAndUpdate(
    { email: 'google@demo.com' },
    { password: hashed },
    { new: true }
)

if (result) {
    console.log(`\n✅ Password reset successfully for: ${result.name} (${result.email})`)
    console.log(`   New password: ${NEW_PASSWORD}`)
} else {
    console.log('❌ Company not found')
}

process.exit(0)
