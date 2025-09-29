import path from 'path';
import dotenv from 'dotenv';

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
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true
  },
  
  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: '/api'
  }
};
