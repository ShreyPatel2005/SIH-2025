import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import database from './database/connection.js';

// Import routes
import terminologyRoutes from './routes/terminology.js';
import mappingRoutes from './routes/mapping.js';
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
app.use(`${apiPrefix}/mapping`, mappingRoutes);
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
    
    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      console.log('\n🚀 Ayush Terminology Portal API Server');
      console.log('=====================================');
      console.log(`📡 Server running on port ${config.server.port}`);
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(`📊 Database: ${database.isConnected() ? 'Connected' : 'Disconnected'}`);
      console.log(`🔗 API Base URL: http://localhost:${config.server.port}${apiPrefix}`);
      console.log(`📖 Health Check: http://localhost:${config.server.port}/health`);
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

// Initialize sample data if needed
async function initializeSampleData() {
  try {
    const Terminology = (await import('./models/Terminology.js')).default;
    const Mapping = (await import('./models/Mapping.js')).default;
    
    // Check if we already have data
    const termCount = await Terminology.countDocuments();
    
    if (termCount === 0) {
      console.log('📝 Initializing sample data...');
      
      // Sample NAMASTE terminology
      const sampleTerms = [
        { term: 'Vataja Jvara', code: 'NAM-A01.1', system: 'NAMASTE', description: 'Fever caused by Vata dosha imbalance', category: 'Fever' },
        { term: 'Vataja Atisara', code: 'NAM-A01.2', system: 'NAMASTE', description: 'Diarrhea caused by Vata dosha imbalance', category: 'Digestive' },
        { term: 'Pittaja Jvara', code: 'NAM-A02.1', system: 'NAMASTE', description: 'Fever caused by Pitta dosha imbalance', category: 'Fever' },
        { term: 'Kaphaja Jvara', code: 'NAM-A03.1', system: 'NAMASTE', description: 'Fever caused by Kapha dosha imbalance', category: 'Fever' },
        { term: 'Sannipata Jvara', code: 'NAM-A04.1', system: 'NAMASTE', description: 'Fever caused by all three doshas imbalance', category: 'Fever' },
        { term: 'Qi-Phase Wind-Heat Pattern', code: 'JA20.0', system: 'ICD-11 TM2', description: 'Traditional medicine pattern', category: 'TM2' },
        { term: 'Yang-Phase Heat Pattern', code: 'JA21.0', system: 'ICD-11 TM2', description: 'Traditional medicine pattern', category: 'TM2' },
        { term: 'Fever of unknown origin', code: 'MG2A.01', system: 'ICD-11 Biomedicine', description: 'Fever without identifiable cause', category: 'Biomedicine' },
        { term: 'Acute diarrhoea', code: 'DD90', system: 'ICD-11 Biomedicine', description: 'Acute diarrheal condition', category: 'Biomedicine' },
        { term: 'Jvara', code: 'AYU-001', system: 'WHO Ayurveda', description: 'Ayurvedic fever classification', category: 'Ayurveda' }
      ];
      
      await Terminology.insertMany(sampleTerms);
      console.log(`✅ Inserted ${sampleTerms.length} sample terminology records`);
      
      // Sample mappings
      const sampleMappings = [
        {
          sourceTerm: { term: 'Vataja Jvara', code: 'NAM-A01.1', system: 'NAMASTE' },
          mappedTerms: [
            { term: 'Qi-Phase Wind-Heat Pattern', code: 'JA20.0', system: 'ICD-11 TM2', confidence: 0.9, mappingType: 'exact' },
            { term: 'Fever of unknown origin', code: 'MG2A.01', system: 'ICD-11 Biomedicine', confidence: 0.8, mappingType: 'broad' }
          ],
          mappingStatus: 'approved',
          reviewedBy: 'system',
          reviewedAt: new Date()
        },
        {
          sourceTerm: { term: 'Vataja Atisara', code: 'NAM-A01.2', system: 'NAMASTE' },
          mappedTerms: [
            { term: 'Acute diarrhoea', code: 'DD90', system: 'ICD-11 Biomedicine', confidence: 0.9, mappingType: 'exact' }
          ],
          mappingStatus: 'approved',
          reviewedBy: 'system',
          reviewedAt: new Date()
        }
      ];
      
      await Mapping.insertMany(sampleMappings);
      console.log(`✅ Inserted ${sampleMappings.length} sample mapping records`);
    }
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
}

// Start the server
startServer().then(() => {
  // Initialize sample data after server starts
  setTimeout(initializeSampleData, 2000);
});
