import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://Shrey:gqW7H2aw8PBhTYAP@cluster0.q25cjkt.mongodb.net/ayush_terminology?retryWrites=true&w=majority&appName=Cluster0',
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
