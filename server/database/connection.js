import mongoose from 'mongoose';
import { config } from '../config.js';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      console.log('Connecting to MongoDB...');
      
      // Check if MongoDB URI is provided
      if (!config.mongodb.uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      this.connection = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
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
      console.error('❌ Failed to connect to MongoDB:', error.message);
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
