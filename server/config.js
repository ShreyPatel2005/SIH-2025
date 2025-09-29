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
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
      process.env.FRONTEND_URL || 'http://localhost:3000',
      // Add your Vercel frontend URL here
      'https://your-vercel-frontend-url.vercel.app'
    ],
    credentials: true
  },
  
  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: '/api'
  }
};
