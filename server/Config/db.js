import dns from 'node:dns/promises';  // or just 'dns' if using CommonJS

// Force reliable public DNS servers
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Optional: log to confirm (remove later if you want)
console.log('DNS servers forced to:', dns.getServers());

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected Successfully✅`);
  } catch (error) {
    console.error(`MongoDB connection failed ❌`, error.message);
    process.exit(1)
  }
};

export default connectDB;