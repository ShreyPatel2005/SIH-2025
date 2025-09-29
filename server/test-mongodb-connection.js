import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
try {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
  console.log('Loaded .env file from:', path.resolve(process.cwd(), '../.env'));
} catch (error) {
  console.log('No local .env file found, using environment variables');
}

// MongoDB Atlas recommended connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority'
};

// Test MongoDB connection
async function testMongoDBConnection() {
  const mongodbUri = process.env.MONGODB_URI;
  
  if (!mongodbUri) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    console.error('Please set MONGODB_URI in your .env file before running this test');
    process.exit(1);
  }
  
  console.log('📋 Testing MongoDB connection...');
  console.log('MongoDB URI: Set (masked)');
  console.log('Connection options:', JSON.stringify(connectionOptions));
  
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(mongodbUri, connectionOptions);
    
    console.log('✅ MongoDB connection successful!');
    console.log(`Connected to: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    
    // Test a simple operation
    console.log('🔍 Testing database operation...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections in the database`);
    
    // Cleanup
    await mongoose.disconnect();
    console.log('📴 MongoDB connection closed');
    
    console.log('\n✅✅✅ MongoDB connection test passed! ✅✅✅');
    console.log('Your MongoDB Atlas connection is working correctly from your current location.');
    console.log('If you still have issues on Render, make sure to:');
    console.log('1. Add Render\'s IP addresses or enable "Allow access from anywhere" in MongoDB Atlas');
    console.log('2. Verify all environment variables are correctly set in the Render dashboard');
    console.log('3. Ensure your MongoDB Atlas cluster is in a region compatible with Render\'s region');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    console.error('\n💡 Troubleshooting steps:');
    console.error('1. Make sure your current IP address is whitelisted in MongoDB Atlas');
    console.error('2. Verify that MONGODB_URI is correctly formatted (check username, password, cluster name)');
    console.error('3. Ensure your MongoDB Atlas cluster is running and accessible');
    console.error('4. Check your network connection and firewall settings');
    
    if (error.message.includes('IP that isn\'t whitelisted')) {
      console.error('\n⚠️ Critical: Your IP address is not whitelisted in MongoDB Atlas!');
      console.error('Please add your current IP address to the IP whitelist in MongoDB Atlas:');
      console.error('1. Go to https://cloud.mongodb.com/');
      console.error('2. Navigate to your cluster -> Security -> Network Access');
      console.error('3. Click "Add IP Address" and either add your specific IP or choose "Allow access from anywhere"');
    }
    
    // Cleanup if partially connected
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    
    process.exit(1);
  }
}

testMongoDBConnection();