import express from 'express';

// Create a simple test router that we can add to server.js
export const testRouter = express.Router();

// Very basic endpoint to test route registration
testRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Additional test endpoints to verify different HTTP methods
testRouter.post('/echo', (req, res) => {
  res.json({
    success: true,
    message: 'POST request received',
    data: req.body
  });
});

testRouter.get('/params/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Route with parameters is working',
    id: req.params.id
  });
});

/**
 * INSTRUCTIONS FOR USE:
 * 
 * 1. Add this import to your server.js file:
 *    import { testRouter } from './test-route.js';
 * 
 * 2. Add this route registration to your server.js file after the other route registrations:
 *    // Test route for debugging
 *    app.use('/test-route', testRouter);
 *    
 * 3. Also add a direct route without any prefix for testing:
 *    app.get('/direct-test', (req, res) => {
 *      res.json({ success: true, message: 'Direct test route works!' });
 *    });
 * 
 * 4. After redeploying, test these endpoints:
 *    - https://your-render-url.onrender.com/test-route
 *    - https://your-render-url.onrender.com/direct-test
 *    - https://your-render-url.onrender.com/test-route/echo (POST)
 *    - https://your-render-url.onrender.com/test-route/params/123
 * 
 * 5. Check if these routes work - this will help determine if the issue is with all routes or just specific ones.
 */