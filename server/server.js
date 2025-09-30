import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import database from './database/connection.js';
import { testRouter } from './test-route.js';

// Import routes
import terminologyRoutes from './routes/terminology.js';

import emrRoutes from './routes/emr.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// API Routes
const apiPrefix = `${config.api.prefix}/${config.api.version}`;

app.use(`${apiPrefix}/terminology`, terminologyRoutes);

app.use(`${apiPrefix}/emr`, emrRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Ayush Terminology Portal API',
    version: config.api.version,
    endpoints: {
      health: '/health',
      terminology: `${apiPrefix}/terminology`,
      mapping: `${apiPrefix}/mapping`,
      emr: `${apiPrefix}/emr`,
      upload: `${apiPrefix}/upload`
    },
    documentation: 'https://github.com/your-repo/ayush-terminology-portal'
  });
});

// Test routes for debugging
app.use('/test-route', testRouter);
app.get('/direct-test', (req, res) => {
  res.json({ success: true, message: 'Direct test route works!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  
  if (err.message === 'Only CSV files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.server.env === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Start HTTP server - bind to 0.0.0.0 for Render deployment
    const server = app.listen(config.server.port, '0.0.0.0', () => {
      console.log('\n🚀 Ayush Terminology Portal API Server');
      console.log('=====================================');
      console.log(`📡 Server running on port ${config.server.port}`);
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(`📊 Database: ${database.isConnected() ? 'Connected' : 'Disconnected'}`);
      console.log(`🔗 API Base URL: ${config.server.env === 'development' ? `http://localhost:${config.server.port}` : 'PRODUCTION_URL'}/api/v1`);
      console.log(`📖 Health Check: ${config.server.env === 'development' ? `http://localhost:${config.server.port}` : 'PRODUCTION_URL'}/health`);
      console.log('=====================================\n');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}



// Start the server
startServer();
