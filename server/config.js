import dotenv from 'dotenv';
import path from 'path';
// Load .env file from the project root directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  // MongoDB Configuration
  // Note: MONGODB_URI must be set in the .env file
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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: '/api'
  }
};
