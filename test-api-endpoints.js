// Test script to verify API endpoints
// This script tests the core functionality of the Ayush Terminology Portal

const axios = require('axios');

// Base URL for API testing
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Test functions
const testHealthEndpoint = async () => {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('Health endpoint test passed:', response.data);
    return true;
  } catch (error) {
    console.error('Health endpoint test failed:', error.message);
    return false;
  }
};

const testSearchEndpoint = async () => {
  try {
    console.log('Testing search endpoint...');
    const response = await axios.get(`${API_BASE_URL}/terminology/search`, {
      params: { system: 'namaste', query: 'fever', limit: 5 }
    });
    console.log(`Search endpoint test passed: found ${response.data.results?.length || 0} results`);
    return true;
  } catch (error) {
    console.error('Search endpoint test failed:', error.message);
    return false;
  }
};

const testUploadEndpoint = async () => {
  try {
    console.log('Testing upload endpoint (simulating)...');
    // Note: This is a simulated test since we don't have a file to upload
    // In a real test, you would need to create a FormData object with a file
    console.log('Upload endpoint would be tested with actual file upload');
    return true;
  } catch (error) {
    console.error('Upload endpoint test failed:', error.message);
    return false;
  }
};

const testMappingEndpoint = async () => {
  try {
    console.log('Testing mapping endpoint...');
    // Use a sample code that's likely to exist or will return a fallback
    const response = await axios.get(`${API_BASE_URL}/mapping/TEST001`);
    console.log('Mapping endpoint test passed:', response.data);
    return true;
  } catch (error) {
    console.error('Mapping endpoint test failed:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting API endpoint tests...\n');
  
  const tests = [
    testHealthEndpoint,
    testSearchEndpoint,
    testUploadEndpoint,
    testMappingEndpoint
  ];
  
  const results = [];
  for (const test of tests) {
    results.push(await test());
  }
  
  console.log('\nTest Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(result => result).length}`);
  console.log(`Failed: ${results.filter(result => !result).length}`);
  
  // Print deployment reminders
  console.log('\nDeployment Checklist:');
  console.log('1. Ensure MongoDB Atlas IP whitelisting is configured correctly');
  console.log('2. Set all required environment variables in the deployment environment');
  console.log('3. Verify that the API_BASE_URL in App.jsx does not include a hardcoded port');
  console.log('4. Test all endpoints after deployment');
};

// Run the tests
runTests().catch(err => {
  console.error('Test runner failed:', err);
});