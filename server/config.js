import dotenv from 'dotenv';
import path from 'path';

// Load .env file for local development
try {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
} catch (error) {
  // On Render, environment variables will be set through the dashboard
  console.log('No local .env file found, using environment variables');
}

export const config = {
  // MongoDB Configuration
  // Note: MONGODB_URI must be set in the .env file or Render dashboard
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      // Removed deprecated options that are no longer needed for MongoDB driver 4.0+
    }
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // CORS Configuration
  cors: {
    origin: '*', // Allow all origins temporarily to fix network errors
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: '/api'
  },
  

};
