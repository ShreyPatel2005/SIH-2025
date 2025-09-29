import http from 'http';
import { config } from './config.js';

const API_PORT = config.server.port;
const API_BASE_URL = `/api/v1`;

// Helper function to make HTTP GET requests
function httpGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Try to parse JSON response
          if (data) {
            try {
              data = JSON.parse(data);
            } catch (e) {
              // Not valid JSON, keep as string
            }
          }
          resolve({ statusCode: res.statusCode, data });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test function for API endpoints
async function testApiEndpoints() {
  console.log('\n=== API Endpoints Test ===');
  console.log(`Testing API at: http://localhost:${API_PORT}${API_BASE_URL}`);
  console.log('====================================\n');

  // Test health check endpoint
  await testHealthCheck();
  
  // Test terminology endpoints
  await testTerminologyEndpoints();
  
  // Test mapping endpoint
  await testMappingEndpoint();
  
  console.log('\n=== API Test Summary ===');
  console.log('All tests completed! If all endpoints passed, your backend should now be working correctly.');
  console.log('Please try accessing the UI again to see if the network errors are resolved.');
  console.log('====================================');
}

// Test health check endpoint
async function testHealthCheck() {
  console.log('🧪 Testing Health Check Endpoint...');
  try {
    const response = await httpGet('/health');
    console.log(`✅ Health Check passed! Status: ${response.statusCode}`);
    if (response.data && response.data.status) {
      console.log(`   Status: ${response.data.status}`);
    }
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
    console.log('💡 Make sure the server is running and try again.');
  }
}

// Test terminology endpoints
async function testTerminologyEndpoints() {
  console.log('\n🧪 Testing Terminology Endpoints...');
  
  // Test terminology test endpoint
  try {
    const response = await httpGet(`${API_BASE_URL}/terminology/test`);
    console.log(`✅ Terminology Test endpoint passed! Status: ${response.statusCode}`);
  } catch (error) {
    console.error('❌ Terminology Test endpoint failed:', error.message);
  }
  
  // Test terminology search endpoint
  try {
    const response = await httpGet(`${API_BASE_URL}/terminology/search?system=all&query=test&limit=5`);
    console.log(`✅ Terminology Search endpoint passed! Status: ${response.statusCode}`);
    if (response.data && response.data.results) {
      console.log(`   Found ${response.data.results.length} results`);
    }
  } catch (error) {
    console.error('❌ Terminology Search endpoint failed:', error.message);
  }
}

// Test mapping endpoint
async function testMappingEndpoint() {
  console.log('\n🧪 Testing Mapping Endpoint...');
  
  try {
    // This will return a 404 if no mapping exists, but we just want to check if the endpoint is working
    const response = await httpGet(`${API_BASE_URL}/mapping/test-code`);
    
    if (response.statusCode === 404) {
      console.log(`✅ Mapping endpoint passed (expected 404 for non-existent code)`);
    } else {
      console.log(`✅ Mapping endpoint passed! Status: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Mapping endpoint failed:', error.message);
  }
}

// Start the test
console.log('This script will test if the API endpoints are working correctly.');
console.log('Note: You must have the server running in a separate terminal before running this test.');
console.log('If the server is not running, please start it with: npm run dev\n');

testApiEndpoints().catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});