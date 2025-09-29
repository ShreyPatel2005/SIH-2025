import express from 'express';
import Mapping from '../models/Mapping.js';
import Terminology from '../models/Terminology.js';

const router = express.Router();

// GET /api/mapping/:code - Get mapping for a specific code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // First, find the source term
    const sourceTerm = await Terminology.findOne({ 
      code: code, 
      isActive: true 
    });
    
    if (!sourceTerm) {
      return res.status(404).json({ 
        error: 'Source term not found',
        source: null,
        mapped: []
      });
    }
    
    // Find the mapping
    const mapping = await Mapping.findOne({
      'sourceTerm.code': code,
      isActive: true,
      mappingStatus: { $in: ['reviewed', 'approved'] }
    });
    
    if (!mapping) {
      // Return source term with empty mappings
      return res.json({
        source: {
          term: sourceTerm.term,
          code: sourceTerm.code,
          system: sourceTerm.system
        },
        mapped: []
      });
    }
    
    // Format the response
    const response = {
      source: {
        term: mapping.sourceTerm.term,
        code: mapping.sourceTerm.code,
        system: mapping.sourceTerm.system
      },
      mapped: mapping.mappedTerms.map(item => ({
        term: item.term,
        code: item.code,
        system: item.system,
        confidence: item.confidence,
        mappingType: item.mappingType
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mapping - Create new mapping
router.post('/', async (req, res) => {
  try {
    const mapping = new Mapping(req.body);
    await mapping.save();
    
    res.status(201).json(mapping);
  } catch (error) {
    console.error('Create mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/mapping/:id - Update mapping
router.put('/:id', async (req, res) => {
  try {
    const mapping = await Mapping.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    
    res.json(mapping);
  } catch (error) {
    console.error('Update mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mapping - Get all mappings with filters
router.get('/', async (req, res) => {
  try {
    const { 
      system, 
      status = 'approved', 
      page = 1, 
      limit = 10,
      search 
    } = req.query;
    
    let query = { isActive: true };
    
    if (system) {
      query['sourceTerm.system'] = system;
    }
    
    if (status) {
      query.mappingStatus = status;
    }
    
    if (search) {
      query.$or = [
        { 'sourceTerm.term': { $regex: search, $options: 'i' } },
        { 'sourceTerm.code': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const mappings = await Mapping.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviewedBy', 'name email');
    
    const total = await Mapping.countDocuments(query);
    
    res.json({
      mappings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mapping/bulk - Bulk create mappings
router.post('/bulk', async (req, res) => {
  try {
    const { mappings } = req.body;
    
    if (!Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Mappings must be an array' });
    }
    
    const createdMappings = await Mapping.insertMany(mappings);
    
    res.status(201).json({
      message: `${createdMappings.length} mappings created successfully`,
      mappings: createdMappings
    });
  } catch (error) {
    console.error('Bulk create mappings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mapping/stats - Get mapping statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Mapping.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            system: '$sourceTerm.system',
            status: '$mappingStatus'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.system',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);
    
    res.json({ stats });
  } catch (error) {
    console.error('Mapping stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
