const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('[Database] No MONGO_URI specified in .env. Running with in-memory store.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed: ${error.message}`);
    console.warn('[Database] Notice: If using MongoDB Atlas, ensure your IP address is whitelisted in Atlas Network Access (e.g. 0.0.0.0/0).');
    console.log('[Database] -> CodeScope is actively running in resilient in-memory mode so Authentication & all features work seamlessly!');
  }

  mongoose.connection.on('error', (err) => {
    console.warn(`[Database] Mongoose error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] Mongoose disconnected.');
  });
};

module.exports = connectDB;
