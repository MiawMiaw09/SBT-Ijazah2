/**
 * FRONTEND-BACKEND INTEGRATION TEST
 * Senior-level comprehensive integration testing
 */

const http = require('http');
const https = require('https');

console.log('\n🔍 === FRONTEND-BACKEND INTEGRATION TEST ===\n');

const testConfig = {
  backend: {
    host: 'localhost',
    port: 5000,
    api: 'http://localhost:5000/api'
  },
  frontend: {
    host: 'localhost',
    port: 3001
  }
};

// Test scenarios
const tests = [];

// 1. Test Backend Health
tests.push({
  name: 'Backend Health Check',
  method: 'GET',
  path: 'http://localhost:5000',
  expectedStatus: 200,
  description: 'Verify backend is running'
});

// 2. Test Frontend Health  
tests.push({
  name: 'Frontend Health Check',
  method: 'GET',
  path: 'http://localhost:3001',
  expectedStatus: 200,
  description: 'Verify frontend is running'
});

// 3. Test Get All Diplomas
tests.push({
  name: 'Get All Diplomas',
  method: 'GET',
  path: 'http://localhost:5000/api/diplomas',
  expectedStatus: 200,
  description: 'Fetch all diplomas from backend'
});

// 4. Test Get Dashboard Stats
tests.push({
  name: 'Get Dashboard Stats',
  method: 'GET',
  path: 'http://localhost:5000/api/diplomas/stats/dashboard',
  expectedStatus: 200,
  description: 'Fetch dashboard statistics'
});

// Run tests
async function runTests() {
  console.log('📋 Running Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test.path, test.method);
      
      if (result.status === test.expectedStatus) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Response: ${result.data ? JSON.stringify(result.data).substring(0, 100) : 'OK'}...\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${result.status}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${err.message}\n`);
      failed++;
    }
  }
  
  // Print Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`   ✅ Passed: ${passed}/${tests.length}`);
  console.log(`   ❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n✨ ALL TESTS PASSED - Integration OK!\n');
    
    // Get current data count
    try {
      const diplomasReq = await makeRequest('http://localhost:5000/api/diplomas', 'GET');
      if (diplomasReq.data && diplomasReq.data.data) {
        const count = diplomasReq.data.data.length;
        console.log('📈 Current Data:');
        console.log(`   Diplomas in Database: ${count}`);
        
        if (count > 0) {
          console.log(`   ✅ Database has data`);
          console.log(`   Sample records:`);
          diplomasReq.data.data.slice(0, 3).forEach((d, i) => {
            console.log(`      ${i+1}. NPM: ${d.npm}, Status: ${d.status}`);
          });
        }
      }
    } catch (err) {
      console.log(`⚠️  Could not fetch diploma data: ${err.message}`);
    }
  } else {
    console.log('\n⚠️  Some tests failed - Check configuration\n');
  }
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

runTests();
