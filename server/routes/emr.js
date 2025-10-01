import express from 'express';
import EMRData from '../models/EMRData.js';
import Terminology from '../models/Terminology.js';

const router = express.Router();

// Cache to store recent FHIR bundles (max 5)
const recentBundlesCache = {
  bundles: [],
  maxSize: 5,
  add(bundle, metadata) {
    // Add new bundle to the beginning of the array
    this.bundles.unshift({
      bundle,
      metadata,
      timestamp: new Date()
    });
    
    // Trim the cache if it exceeds maxSize
    if (this.bundles.length > this.maxSize) {
      this.bundles.pop();
    }
  },
  getAll() {
    return this.bundles;
  },
  getById(id) {
    return this.bundles.find(item => item.metadata.id === id);
  }
};

// POST /api/emr/submit - Submit EMR data
router.post('/submit', async (req, res) => {
  try {
    const { patientId, clinicianId, encounterNotes, fhirBundle } = req.body;
    
    // Validate required fields
    if (!patientId || !clinicianId || !encounterNotes || !fhirBundle) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, clinicianId, encounterNotes, fhirBundle' 
      });
    }
    
    // Create EMR data record
    const emrData = new EMRData({
      patientId,
      clinicianId,
      encounterNotes,
      fhirBundle,
      status: 'pending',
      submittedBy: 'system'
    });
    
    await emrData.save();
    
    // Add the FHIR bundle to the cache
    recentBundlesCache.add(fhirBundle, {
      id: emrData._id.toString(),
      patientId,
      clinicianId,
      timestamp: new Date()
    });
    
    // Process the FHIR bundle (this would be more complex in a real implementation)
    try {
      await processFHIRBundle(emrData._id, fhirBundle);
      
      // Update status to completed
      await EMRData.findByIdAndUpdate(emrData._id, { 
        status: 'completed',
        processedAt: new Date()
      });
      
      res.status(201).json({
        message: 'EMR data submitted and processed successfully',
        emrId: emrData._id,
        status: 'completed',
        cachedBundles: recentBundlesCache.bundles.length
      });
    } catch (processingError) {
      // Update status to failed
      await EMRData.findByIdAndUpdate(emrData._id, { 
        status: 'failed',
        errorMessage: processingError.message
      });
      
      res.status(500).json({
        error: 'EMR data submitted but processing failed',
        emrId: emrData._id,
        status: 'failed'
      });
    }
    
  } catch (error) {
    console.error('Submit EMR error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emr/:id - Get EMR data by ID
router.get('/:id', async (req, res) => {
  try {
    const emrData = await EMRData.findById(req.params.id);
    
    if (!emrData) {
      return res.status(404).json({ error: 'EMR data not found' });
    }
    
    res.json(emrData);
  } catch (error) {
    console.error('Get EMR error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emr/patient/:patientId - Get EMR data by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const emrData = await EMRData.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await EMRData.countDocuments({ patientId: req.params.patientId });
    
    res.json({
      emrData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get patient EMR error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emr/recent-bundles - Get recent FHIR bundles from cache
router.get('/recent-bundles', (req, res) => {
  try {
    // Get all recent bundles from cache
    const recentBundles = recentBundlesCache.getAll();
    
    // Return only metadata and timestamp to avoid large response
    const bundlesList = recentBundles.map(item => ({
      id: item.metadata.id,
      patientId: item.metadata.patientId,
      clinicianId: item.metadata.clinicianId,
      timestamp: item.timestamp,
      bundleAvailable: true
    }));
    
    res.json({
      recentBundles: bundlesList,
      count: bundlesList.length,
      maxCacheSize: recentBundlesCache.maxSize
    });
  } catch (error) {
    console.error('Get recent bundles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emr/recent-bundles/:id - Get specific recent FHIR bundle from cache
router.get('/recent-bundles/:id', (req, res) => {
  try {
    const bundleId = req.params.id;
    const cachedItem = recentBundlesCache.getById(bundleId);
    
    if (!cachedItem) {
      return res.status(404).json({ error: 'Bundle not found in cache' });
    }
    
    res.json({
      metadata: cachedItem.metadata,
      timestamp: cachedItem.timestamp,
      bundle: cachedItem.bundle
    });
  } catch (error) {
    console.error('Get specific bundle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emr - Get all EMR data with filters
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      patientId, 
      clinicianId,
      page = 1, 
      limit = 10,
      startDate,
      endDate
    } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (clinicianId) query.clinicianId = clinicianId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const emrData = await EMRData.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-fhirBundle'); // Exclude large FHIR bundle from list view
    
    const total = await EMRData.countDocuments(query);
    
    res.json({
      emrData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get EMR list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to process FHIR bundle
async function processFHIRBundle(emrId, fhirBundle) {
  try {
    const processedTerms = [];
    
    // Extract conditions from FHIR bundle
    if (fhirBundle.entry) {
      for (const entry of fhirBundle.entry) {
        if (entry.resource && entry.resource.resourceType === 'Condition') {
          const condition = entry.resource;
          
          // Process each coding in the condition
          if (condition.code && condition.code.coding) {
            for (const coding of condition.code.coding) {
              // Get system identifier from URL
              const systemUrl = coding.system;
              let systemIdentifier = null;
              
              // Map system URLs to system identifiers
              const systemUrlMap = {
                'http://namaste.gov.in': 'NAMASTE',
                'http://id.who.int/icd/entity/148929940': 'ICD-11 TM2',
                'http://id.who.int/icd/entity/12345': 'ICD-11 BIOMEDICINE',
                'http://who.int/ayurveda': 'WHO AYURVEDA'
              };
              
              // Get system identifier or extract from URL
              systemIdentifier = systemUrlMap[systemUrl] || 
                                 systemUrl.split('/').pop().toUpperCase().replace(/-/g, ' ');
              
              // First try to find the term in our terminology database
              const term = await Terminology.findOne({
                code: coding.code,
                system: systemIdentifier,
                isActive: true
              });
              
              // Then look for mappings
              const mapping = await Mapping.findOne({
                'sourceTerm.code': coding.code,
                'sourceTerm.system': systemIdentifier,
                isActive: true,
                mappingStatus: { $in: ['reviewed', 'approved'] }
              });
              
              if (mapping) {
                const mappedCodes = mapping.mappedTerms.map(item => ({
                  code: item.code,
                  system: item.system,
                  term: item.term
                }));
                
                processedTerms.push({
                  originalTerm: coding.display,
                  originalSystem: systemIdentifier,
                  mappedCodes,
                  fhirResource: condition
                });
              } else if (term) {
                // If we found the term but no mapping, still record it
                processedTerms.push({
                  originalTerm: coding.display,
                  originalSystem: systemIdentifier,
                  mappedCodes: [],
                  fhirResource: condition
                });
              }
            }
          }
        }
      }
    }
    
    // Update EMR data with processed terms
    await EMRData.findByIdAndUpdate(emrId, {
      processedTerms,
      status: 'completed',
      processedAt: new Date()
    });
    
  } catch (error) {
    console.error('Process FHIR bundle error:', error);
    throw error;
  }
}

export default router;
