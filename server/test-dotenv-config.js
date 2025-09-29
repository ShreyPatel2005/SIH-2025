import { config } from './config.js';

console.log('=== DOTENV AND CONFIGURATION TEST ===');
console.log('API Prefix:', config.api.prefix);
console.log('API Version:', config.api.version);
console.log('Combined API Prefix:', `${config.api.prefix}/${config.api.version}`);
console.log('Server Port:', config.server.port);
console.log('Environment:', config.server.env);

// Test if dotenv is properly imported and working
console.log('\nTesting if process.env is accessible:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

console.log('\nTest complete. If you see all values printed correctly, the configuration is working.');
console.log('If you encounter errors, check the dotenv import in config.js.');