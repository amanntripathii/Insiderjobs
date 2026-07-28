import mongoose from "mongoose";

// Cache connection across Vercel serverless warm invocations
let isConnected = false;

const connectDB = async () => {

    // Reuse existing connection if already open
    if (isConnected || mongoose.connection.readyState >= 1) {
        isConnected = true;
        return;
    }

    mongoose.connection.on('connected', () => {
        console.log('Database Connected');
        isConnected = true;
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`, {
        // How long the driver will wait to find an available server
        serverSelectionTimeoutMS: 10000,
        // How long a send/receive on the socket is allowed to take
        socketTimeoutMS: 45000,
        // Disable mongoose's internal buffering — fail immediately instead of
        // queuing operations that will timeout after 10 s on cold starts
        bufferCommands: false,
    });
}

export default connectDB