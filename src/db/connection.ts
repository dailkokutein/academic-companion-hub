
import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.log('Running in browser environment, MongoDB connection will be simulated');
    return null; // Return null for browser environment
  }
  
  try {
    // For demo purposes - using a free MongoDB Atlas cluster
    // In production, this would be an environment variable
    const MONGO_URI = 'mongodb+srv://demo:demo1234@studycluster.mongodb.net/studyportal?retryWrites=true&w=majority';
    
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    if (mongoose.connection.readyState >= 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }
    
    const conn = await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return null;
  }
};

export default connectDB;
