#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

console.log('🧪 SpendWise API Test Suite');
console.log('===========================\n');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'User Registration',
    url: `${BASE_URL}/api/auth/register`,
    method: 'POST',
    body: {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    },
    expectedStatus: 201
  },
  {
    name: 'Invalid Registration (Missing Fields)',
    url: `${BASE_URL}/api/auth/register`,
    method: 'POST',
    body: {
      name: 'Test User'
      // Missing email and password
    },
    expectedStatus: 400
  },
  {
    name: 'Rewards Contract Info',
    url: `${BASE_URL}/api/rewards/contract-info`,
    method: 'GET',
    expectedStatus: [200, 503] // 503 if blockchain not configured
  },
  {
    name: 'Unauthorized Access',
    url: `${BASE_URL}/api/auth/me`,
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Non-existent Endpoint',
    url: `${BASE_URL}/api/non-existent`,
    method: 'GET',
    expectedStatus: 404
  }
];

// Run tests
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = test.body;
      }

      const result = await makeRequest(test.url, options);
      
      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];
      
      if (expectedStatuses.includes(result.status)) {
        console.log(`✅ PASS - Status: ${result.status}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend configuration and logs.');
  }

  // Additional checks
  console.log('\n🔧 System Checks');
  console.log('================');
  
  // Check if server is running
  try {
    const healthCheck = await makeRequest(`${BASE_URL}/health`);
    if (healthCheck.status === 200) {
      console.log('✅ Backend server is running');
      console.log(`📍 Server URL: ${BASE_URL}`);
      
      if (healthCheck.data && healthCheck.data.environment) {
        console.log(`🌍 Environment: ${healthCheck.data.environment}`);
      }
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible');
    console.log('   Make sure to run: npm run dev');
  }

  // Check blockchain configuration
  try {
    const contractInfo = await makeRequest(`${BASE_URL}/api/rewards/contract-info`);
    if (contractInfo.status === 200) {
      console.log('✅ Blockchain service is configured');
    } else if (contractInfo.status === 503) {
      console.log('⚠️  Blockchain service not configured (optional)');
    }
  } catch (error) {
    console.log('⚠️  Could not check blockchain configuration');
  }

  console.log('\n📚 Next Steps:');
  console.log('==============');
  if (failed === 0) {
    console.log('1. Start the frontend: cd .. && npm run dev');
    console.log('2. Open http://localhost:5173 in your browser');
    console.log('3. Register a new account and test the full application');
  } else {
    console.log('1. Check the backend logs for errors');
    console.log('2. Verify .env configuration');
    console.log('3. Ensure MongoDB is running');
    console.log('4. Run: npm run dev (in backend directory)');
  }
}

// Check if server is running first
console.log(`🔍 Checking backend server at: ${BASE_URL}`);
console.log('Make sure the backend is running with: npm run dev\n');

runTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
