import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Function to verify the server configuration
async function verifyConfiguration() {
  console.log('🚀 Deployment Verification');
  console.log('======================');
  
  // Check if required files exist
  console.log('\n🔍 Checking required files:');
  const requiredFiles = [
    'server.js',
    'config.js',
    'test-route.js',
    'test-dotenv-config.js',
    'database/connection.js',
    'routes/terminology.js',
    'routes/mapping.js',
    'routes/emr.js',
    'routes/upload.js',
    '../verify-render-endpoints.js'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    const exists = fileExists(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  }
  
  // Check for package.json and dependencies
  console.log('\n📦 Checking dependencies:');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fileExists(packageJsonPath)) {
    console.log('❌ package.json not found');
    allFilesExist = false;
  }
  
  if (!fileExists(nodeModulesPath)) {
    console.log('⚠️  node_modules directory not found. You should run "npm install"');
  }
  
  // Check if .env file exists
  console.log('\n🔑 Checking environment configuration:');
  const envFilePath = path.join(__dirname, '.env');
  if (!fileExists(envFilePath)) {
    console.log('⚠️  .env file not found. Make sure to set environment variables on Render');
  } else {
    console.log('✅ .env file exists (local development only)');
  }
  
  // Check if uploads directory exists
  console.log('\n📁 Checking directories:');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fileExists(uploadsDir)) {
    console.log('⚠️  uploads directory not found. It will be created automatically on startup');
  } else {
    console.log('✅ uploads directory exists');
  }
  
  // Check server.js for test routes
  console.log('\n🧪 Checking test routes configuration:');
  const serverJsPath = path.join(__dirname, 'server.js');
  if (fileExists(serverJsPath)) {
    const serverContent = fs.readFileSync(serverJsPath, 'utf8');
    const hasTestRouterImport = serverContent.includes("import { testRouter } from './test-route.js'");
    const hasTestRoute = serverContent.includes("app.use('/test-route', testRouter)");
    const hasDirectTest = serverContent.includes("app.get('/direct-test',");
    
    console.log(`${hasTestRouterImport ? '✅' : '❌'} Test router imported`);
    console.log(`${hasTestRoute ? '✅' : '❌'} Test route registered`);
    console.log(`${hasDirectTest ? '✅' : '❌'} Direct test route registered`);
  }
  
  // Final summary
  console.log('\n📋 Final Verification Summary:');
  if (allFilesExist) {
    console.log('✅ All required files are present');
  } else {
    console.log('❌ Some required files are missing');
  }
  
  console.log('\n✅ Verification complete. Make sure to:');
  console.log('1. Run "npm install" if you haven\'t already');
  console.log('2. Set all required environment variables on Render');
  console.log('3. Verify MongoDB Atlas IP whitelisting');
  console.log('4. Check Render build and start commands');
  console.log('5. After deployment, use verify-render-endpoints.js to test all endpoints');
  console.log('\n💡 For detailed troubleshooting, refer to DEPLOYMENT_TROUBLESHOOTING.md');
}

// Run the verification
verifyConfiguration().catch(err => {
  console.error('❌ Verification failed:', err);
});