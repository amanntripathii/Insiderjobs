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
        serverSelectionTimeoutMS: 30000,
        // How long a send/receive on the socket is allowed to take
        socketTimeoutMS: 45000,
        // How long Mongoose will buffer a query waiting for a connection.
        // Do NOT set bufferCommands: false — it makes queries throw immediately
        // on cold starts before the connection handshake finishes.
        bufferTimeoutMS: 30000,
    });
}

export default connectDB