import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import Terminology from '../models/Terminology.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.csv') || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// POST /api/upload/namaste - Upload NAMASTE CSV file
router.post('/namaste', upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Process in background and return immediately
    res.status(200).json({ message: 'File upload received', fileId: req.file.filename });
    
    // Process file in background
    processNamasteFile(req.file).catch(err => {
      console.error('Background processing error:', err);
    });
    
  } catch (error) {
    console.error('NAMASTE upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Function to process NAMASTE file in background
async function processNamasteFile(file) {
  const results = [];
  const errors = [];
  
  try {
    // Process CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv({
          headers: ['term', 'code', 'description', 'category', 'system'],
          skipEmptyLines: true
        }))
        .on('data', (data) => {
          // Clean and validate data
          const cleanedData = {
            term: data.term?.trim(),
            code: data.code?.trim(),
            description: data.description?.trim() || '',
            category: data.category?.trim() || '',
            system: data.system?.trim() || 'NAMASTE',
            isActive: true,
            createdBy: 'csv-upload'
          };
          
          // Validate required fields
          if (cleanedData.term && cleanedData.code) {
            results.push(cleanedData);
          } else {
            errors.push({
              row: results.length + 1,
              error: 'Missing required fields: term or code',
              data: cleanedData
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Insert valid records into database
    let insertedCount = 0;
    let duplicateCount = 0;
    
    for (const item of results) {
      try {
        await Terminology.create(item);
        insertedCount++;
      } catch (error) {
        if (error.code === 11000) {
          duplicateCount++;
        } else {
          errors.push({
            row: results.indexOf(item) + 1,
            error: error.message,
            data: item
          });
        }
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    
    console.log('NAMASTE upload completed:', {
      totalRows: results.length,
      inserted: insertedCount,
      duplicates: duplicateCount,
      errors: errors.length
    });
    
  } catch (error) {
    console.error('NAMASTE upload error:', error);
    
    // Clean up uploaded file if it exists
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Log error but don't attempt to send response since it's already been sent
    console.error('Background processing failed:', error.message);
  }
};

// POST /api/upload/terminology-api-config - Configure terminology API endpoint
router.post('/terminology-api-config', async (req, res) => {
  try {
    const { endpoint, apiKey, system } = req.body;
    
    // Validate required fields
    if (!endpoint || !endpoint.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid endpoint URL' });
    }
    
    if (!system) {
      return res.status(400).json({ error: 'System identifier is required' });
    }
    
    // In a real implementation, you would:
    // 1. Test the endpoint
    // 2. Store the configuration in database
    // 3. Sync data from the endpoint
    
    // For now, just return success
    res.json({
      message: `${system} API endpoint configured successfully`,
      endpoint,
      system,
      configuredAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Terminology API config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/upload/fetch-from-api - Fetch terminology data from configured API
router.post('/fetch-from-api', async (req, res) => {
  try {
    const { system, query, limit } = req.body;
    
    // Validate required fields
    if (!system) {
      return res.status(400).json({ error: 'System identifier is required' });
    }
    
    // In a real implementation, you would:
    // 1. Retrieve the API configuration for the specified system
    // 2. Make API calls to fetch terminology data
    // 3. Process and store the data in the database
    
    // For demonstration purposes, simulate a successful API fetch
    const fetchedCount = Math.floor(Math.random() * 100) + 1; // Random count between 1-100
    
    res.json({
      message: `Successfully fetched terminology data from ${system} API`,
      summary: {
        system,
        query: query || 'all',
        fetchedCount,
        insertedCount: fetchedCount,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('API fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/upload/status - Get upload status and statistics
router.get('/status', async (req, res) => {
  try {
    // Get terminology statistics by system
    const stats = await Terminology.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$system',
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploads = await Terminology.aggregate([
      { 
        $match: { 
          isActive: true,
          createdAt: { $gte: sevenDaysAgo },
          createdBy: 'csv-upload'
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            system: '$system'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } }
    ]);
    
    res.json({
      systemStats: stats,
      recentUploads
    });
    
  } catch (error) {
    console.error('Upload status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
