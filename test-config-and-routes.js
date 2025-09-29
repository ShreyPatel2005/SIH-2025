import { config } from './server/config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test 1: Verify config values
console.log('=== CONFIGURATION TEST ===');
console.log('API Prefix:', config.api.prefix);
console.log('API Version:', config.api.version);
console.log('Combined API Prefix:', `${config.api.prefix}/${config.api.version}`);
console.log('Server Port:', config.server.port);
console.log('Environment:', config.server.env);

// Test 2: Try importing route files to check for errors
console.log('\n=== ROUTE IMPORT TEST ===');
let routeImportErrors = false;

try {
  import('./server/routes/upload.js').then(() => {
    console.log('✅ upload.js imported successfully');
  }).catch(err => {
    console.error('❌ Error importing upload.js:', err.message);
    routeImportErrors = true;
  });
} catch (err) {
  console.error('❌ Error importing upload.js:', err.message);
  routeImportErrors = true;
}

try {
  import('./server/routes/terminology.js').then(() => {
    console.log('✅ terminology.js imported successfully');
  }).catch(err => {
    console.error('❌ Error importing terminology.js:', err.message);
    routeImportErrors = true;
  });
} catch (err) {
  console.error('❌ Error importing terminology.js:', err.message);
  routeImportErrors = true;
}

// Test 3: Create a minimal express app to simulate route registration
console.log('\n=== ROUTE REGISTRATION TEST ===');
const app = express();
const apiPrefix = `${config.api.prefix}/${config.api.version}`;

// Mock route handlers for testing
const mockRouter = express.Router();
mockRouter.get('/', (req, res) => res.json({ success: true }));
mockRouter.get('/test', (req, res) => res.json({ test: 'success' }));

// Register mock routes
app.use(`${apiPrefix}/upload`, mockRouter);
app.use(`${apiPrefix}/terminology`, mockRouter);
app.use(`${apiPrefix}/mapping`, mockRouter);
app.use(`${apiPrefix}/emr`, mockRouter);

// Print registered routes
console.log(`Registered route pattern: ${apiPrefix}/upload/*`);
console.log(`Registered route pattern: ${apiPrefix}/terminology/*`);
console.log(`Registered route pattern: ${apiPrefix}/mapping/*`);
console.log(`Registered route pattern: ${apiPrefix}/emr/*`);

console.log('\n=== TEST COMPLETE ===');
console.log('If you see all ✅ marks, the configuration and routes look good.');
console.log('If you see ❌ errors, fix those issues before redeploying.');
console.log('\nNext steps:');
console.log('1. Run this test locally to ensure everything works');
console.log('2. Check Render deployment logs for any startup errors');
console.log('3. Verify MongoDB Atlas IP whitelisting');
console.log('4. Ensure all required environment variables are set in Render dashboard');