// Script to verify and troubleshoot Render API endpoints
const axios = require('axios');

// Your Render backend URL
const RENDER_URL = 'https://sih-2025-rrcx.onrender.com';

// Test function for a specific endpoint
async function testEndpoint(url, method = 'GET', data = null) {
  try {
    console.log(`Testing ${method} ${url}...`);
    const options = { method, url };
    if (data) {
      options.data = data;
    }
    const response = await axios(options);
    console.log('✅ Success:', response.status);
    console.log('Response data:', response.data);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.code);
    console.log('Error message:', error.response?.data || error.message);
    return { success: false, status: error.response?.status, error: error.response?.data || error.message };
  }
}

// Main verification function
async function verifyEndpoints() {
  console.log('=== Render API Endpoint Verification ===\n');
  
  // 1. Test root endpoint to see available endpoints
  console.log('1. Testing root endpoint...');
  const rootResult = await testEndpoint(RENDER_URL);
  console.log('\n---\n');
  
  // 2. Test health endpoint
  console.log('2. Testing health endpoint...');
  const healthResult = await testEndpoint(`${RENDER_URL}/health`);
  console.log('\n---\n');
  
  // 3. Try different API prefix variations
  const prefixesToTest = [
    '/api/v1',
    '/api',
    '/v1',
    ''
  ];
  
  for (const prefix of prefixesToTest) {
    console.log(`3. Testing with prefix: "${prefix}"`);
    const result = await testEndpoint(`${RENDER_URL}${prefix}`);
    if (result.success && result.data.endpoints) {
      console.log('Found valid API structure!');
      break;
    }
    console.log('---');
  }
  
  // 4. If upload endpoint still not found, try specific variations
  console.log('\n4. Testing possible upload endpoint variations...');
  const uploadPaths = [
    '/api/v1/upload',
    '/api/upload',
    '/upload',
    '/api/v1/upload/namaste',
    '/api/upload/namaste',
    '/upload/namaste'
  ];
  
  for (const path of uploadPaths) {
    const result = await testEndpoint(`${RENDER_URL}${path}`);
    if (result.success || result.status !== 404) {
      console.log(`Found non-404 response at ${path}`);
      break;
    }
  }
  
  console.log('\n=== Verification Complete ===');
  console.log('\nTroubleshooting Tips:');
  console.log('1. Check if your Render deployment is running (green status)');
  console.log('2. Verify MongoDB Atlas IP whitelisting is correct');
  console.log('3. Check Render logs for any server startup errors');
  console.log('4. Make sure all environment variables are set correctly in Render dashboard');
  
  // If we found the root endpoint data with endpoints info, display it clearly
  if (rootResult.success && rootResult.data.endpoints) {
    console.log('\n--- Detected API Structure ---');
    console.log(JSON.stringify(rootResult.data, null, 2));
  }
}

// Run the verification
verifyEndpoints().catch(err => {
  console.error('Verification failed:', err);
});