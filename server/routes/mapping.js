import express from 'express';
import Mapping from '../models/Mapping.js';

const router = express.Router();

// GET /api/mapping/code/:code - Alternative endpoint for getting mappings
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { system } = req.query;
    
    console.log(`Alternative endpoint - Received mapping request for code: ${code}`);
    
    // Find mappings where this code is the source
    const query = { 'sourceTerm.code': code };
    
    // Add source system filter if provided
    if (system) {
      query['sourceTerm.system'] = system;
    }
    
    const mappings = await Mapping.find(query).lean();
    
    if (mappings.length === 0) {
      return res.status(404).json({ 
        error: 'No mappings found',
        source: { code, system: system || 'Unknown' },
        mapped: []
      });
    }
    
    // Group by source details
    const source = {
      code: mappings[0].sourceTerm.code,
      term: mappings[0].sourceTerm.term,
      system: mappings[0].sourceTerm.system
    };
    
    // Format mapped items
    const mapped = mappings[0].mappedTerms.map(item => ({
      code: item.code,
      term: item.term,
      system: item.system,
      confidence: item.confidence
    }));
    
    res.json({ source, mapped });
  } catch (error) {
    console.error('Get mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mapping/:code - Get mappings for a specific code
router.get('/:code', async (req, res) => {
  try {
    let { code } = req.params;
    const { system } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Code parameter is required' });
    }
    
    // Handle codes with dots and special characters
    // The code might come in as NAM-A01.1 format
    console.log(`Received mapping request for code: ${code}, system: ${system || 'not specified'}`);
    
    // Find mappings where this code is the source
    // Use regex for more flexible matching
    const query = { 
      'sourceTerm.code': { $regex: new RegExp('^' + code.replace(/\./g, '\\.') + '$', 'i') }
    };
    
    // Add source system filter if provided
    if (system) {
      query['sourceTerm.system'] = system;
    }
    
    const mappings = await Mapping.find(query).lean();
    
    if (mappings.length === 0) {
      return res.status(404).json({ 
        error: 'No mappings found',
        source: { code, system: system || 'Unknown' },
        mapped: []
      });
    }
    
    // Group by source details
    const source = {
      code: mappings[0].sourceTerm.code,
      term: mappings[0].sourceTerm.term,
      system: mappings[0].sourceTerm.system
    };
    
    // Format mapped items
    const mapped = mappings[0].mappedTerms.map(item => ({
      code: item.code,
      term: item.term,
      system: item.system,
      confidence: item.confidence
    }));
    
    res.json({ source, mapped });
  } catch (error) {
    console.error('Get mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mapping - Get all mappings (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sourceSystem, targetSystem } = req.query;
    
    const query = {};
    
    // Add filters if provided
    if (sourceSystem) query.sourceSystem = sourceSystem;
    if (targetSystem) query.targetSystem = targetSystem;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const mappings = await Mapping.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .lean();
    
    const total = await Mapping.countDocuments(query);
    
    res.json({
      mappings,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalMappings: total
    });
  } catch (error) {
    console.error('List mappings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;