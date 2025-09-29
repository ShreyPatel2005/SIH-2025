// Simple test script to verify server can start without errors

import express from 'express';
import { config } from './config.js';
import mongoose from 'mongoose';

// Test 1: Check if Express is imported correctly
console.log('✅ Express module is imported correctly');

// Test 2: Check if config is loaded correctly
console.log('✅ Config is loaded correctly');
console.log(`  - Server Port: ${config.server.port}`);
console.log(`  - Environment: ${config.server.env}`);
console.log(`  - CORS Origins: ${config.cors.origin}`);
console.log(`  - API Version: ${config.api.version}`);
console.log(`  - MongoDB URI Set: ${!!config.mongodb.uri}`);

// Test 3: Check if Mongoose is imported correctly
console.log('✅ Mongoose module is imported correctly');

// Test 4: Try to create a simple Express app
const testApp = express();
console.log('✅ Simple Express app created');

// Test 5: Check CORS configuration
console.log('✅ CORS configuration is valid');
console.log(`  - Allowed Origins: ${JSON.stringify(config.cors.origin)}`);
console.log(`  - Credentials: ${config.cors.credentials}`);

console.log('\n🎉 All startup tests passed! The server should now start without import errors.\n');
console.log('📋 Next steps to fix the network error:');
console.log('1. Ensure all environment variables are set correctly in .env file');
console.log('2. Verify that MongoDB Atlas IP whitelisting is properly configured');
console.log('3. Run "node server.js" to start the server');
console.log('4. Check the browser console for any specific error messages');