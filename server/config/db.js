import mongoose from "mongoose"; 

//Fn to connect to MongoDb Database
const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log('Database Connected')) //event listener for connection

    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`) //connecting to database

}

export default connectDB