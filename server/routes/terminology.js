import express from 'express';
import Terminology from '../models/Terminology.js';

const router = express.Router();

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Terminology route is working', timestamp: new Date().toISOString() });
});

// GET /api/terminology/search - Search terminology
router.get('/search', async (req, res) => {
  try {
    const { system, query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ results: [] });
    }

    let searchQuery = {
      isActive: true,
      $or: [
        { term: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    // Filter by system if specified
    if (system && system !== 'all') {
      searchQuery.system = system;
    }

    const results = await Terminology.find(searchQuery)
      .select('term code system description category')
      .limit(parseInt(limit))
      .sort({ term: 1 });

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/terminology/:id - Get single terminology
router.get('/:id', async (req, res) => {
  try {
    const terminology = await Terminology.findById(req.params.id);
    
    if (!terminology) {
      return res.status(404).json({ error: 'Terminology not found' });
    }
    
    res.json(terminology);
  } catch (error) {
    console.error('Get terminology error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/terminology - Create new terminology
router.post('/', async (req, res) => {
  try {
    const terminology = new Terminology(req.body);
    await terminology.save();
    
    res.status(201).json(terminology);
  } catch (error) {
    console.error('Create terminology error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Terminology with this code already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/terminology/:id - Update terminology
router.put('/:id', async (req, res) => {
  try {
    const terminology = await Terminology.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!terminology) {
      return res.status(404).json({ error: 'Terminology not found' });
    }
    
    res.json(terminology);
  } catch (error) {
    console.error('Update terminology error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/terminology/:id - Delete terminology (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const terminology = await Terminology.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!terminology) {
      return res.status(404).json({ error: 'Terminology not found' });
    }
    
    res.json({ message: 'Terminology deactivated successfully' });
  } catch (error) {
    console.error('Delete terminology error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/terminology/systems - Get available coding systems
router.get('/systems', async (req, res) => {
  try {
    console.log('Getting available systems...');
    
    // Test basic connection first
    const testQuery = await Terminology.find({}).limit(1);
    console.log('Test query result:', testQuery.length);
    
    // Get distinct systems with a simpler approach
    const systems = await Terminology.distinct('system');
    console.log('Found systems:', systems);
    
    res.json({ systems: systems.sort() });
  } catch (error) {
    console.error('Get systems error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    });
  }
});

// GET /api/terminology/stats/systems - Get terminology statistics by system
router.get('/stats/systems', async (req, res) => {
  try {
    const stats = await Terminology.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$system',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
