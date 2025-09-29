import mongoose from 'mongoose';
import { config } from '../config.js';

// MongoDB Atlas recommended connection options
const DEFAULT_MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority'
};

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      console.log('Connecting to MongoDB...');
      console.log(`MongoDB URI: ${config.mongodb.uri ? 'Set (masked)' : 'Not set'}`);
      
      // Check if MongoDB URI is provided
      if (!config.mongodb.uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      // Merge config options with defaults
      const connectionOptions = {
        ...DEFAULT_MONGODB_OPTIONS,
        ...(config.mongodb.options || {})
      };
      
      console.log('Using MongoDB connection options:', JSON.stringify(connectionOptions));
      
      this.connection = await mongoose.connect(config.mongodb.uri, connectionOptions);
      
      console.log(`✅ MongoDB connected successfully to: ${this.connection.connection.host}`);
      console.log(`📊 Database: ${this.connection.connection.name}`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('\n💡 Common issues and solutions:');
      console.error('1. Make sure your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Verify that MONGODB_URI environment variable is correctly set');
      console.error('3. Check that your MongoDB Atlas cluster is running and accessible');
      console.error('4. Ensure network connectivity from your deployment environment to MongoDB Atlas\n');
      process.exit(1);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('📴 MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }
}

export default new Database();
