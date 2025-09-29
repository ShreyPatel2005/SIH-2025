import { config } from './config.js';
import database from './database/connection.js';

// Test environment variable loading
console.log('\n=== Environment Configuration Test ===');
console.log('MongoDB URI:', config.mongodb.uri ? 'Set (masked)' : 'Not set');
console.log('Server Port:', config.server.port);
console.log('Server Environment:', config.server.env);
console.log('CORS Origin:', config.cors.origin);
console.log('API Version:', config.api.version);
console.log('====================================');

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('\n=== Database Connection Test ===');
    if (!config.mongodb.uri) {
      console.log('❌ MongoDB URI is not set. Please check your .env file.');
      console.log('💡 Create a .env file in the project root with MONGODB_URI=your_mongodb_connection_string');
      return;
    }
    
    console.log('Attempting to connect to MongoDB...');
    await database.connect();
    console.log('✅ Database connection test successful!');
    
    // Cleanup
    await database.disconnect();
    console.log('📴 Database disconnected successfully');
    console.log('====================================');
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('Error message:', error.message);
    console.error('\n💡 Common solutions:');
    console.error('1. Make sure your .env file exists in the project root');
    console.error('2. Verify that MONGODB_URI is correctly set in the .env file');
    console.error('3. Check if your MongoDB server is running and accessible');
    console.error('4. Ensure your IP address is whitelisted if using MongoDB Atlas');
    console.error('====================================');
  }
}

testDatabaseConnection();