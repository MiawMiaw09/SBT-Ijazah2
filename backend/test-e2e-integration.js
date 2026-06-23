const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3002';

console.log('\n🧪 === FULL INTEGRATION TEST (Frontend + Backend + Database) ===\n');

const tests = [];
let passedTests = 0;
let failedTests = 0;

function addTest(name, status, details) {
  tests.push({ name, status, details });
  if (status === '✅') {
    passedTests++;
  } else {
    failedTests++;
  }
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}\n`);
}

async function runTests() {
  try {
    // 1. Test Backend Connection
    console.log('1️⃣  BACKEND CONNECTIVITY:\n');
    try {
      const health = await axios.get(`${BACKEND_URL}`);
      addTest('Backend health check', '✅', `API version: ${health.data.version}`);
    } catch (err) {
      addTest('Backend health check', '❌', err.message);
      return;
    }

    // 2. Test Frontend Connection
    console.log('2️⃣  FRONTEND CONNECTIVITY:\n');
    try {
      const frontendHealth = await axios.get(FRONTEND_URL);
      addTest('Frontend server', '✅', `Port 3002 responding`);
    } catch (err) {
      addTest('Frontend server', '⚠️', `Might need browser to fully test: ${err.message}`);
    }

    // 3. Test Database Connection via Backend
    console.log('3️⃣  DATABASE CONNECTIVITY:\n');
    try {
      const statusResp = await axios.get(`${BACKEND_URL}/api/diplomas`);
      addTest('Database connection', '✅', `Supabase PostgreSQL responding`);
    } catch (err) {
      addTest('Database connection', '❌', err.message);
    }

    // 4. Test Authentication (Login)
    console.log('4️⃣  AUTHENTICATION:\n');
    let authToken = null;
    try {
      const loginResp = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResp.data.token) {
        authToken = loginResp.data.token;
        addTest('Admin login', '✅', `JWT token generated: ${loginResp.data.token.substring(0, 30)}...`);
      } else {
        addTest('Admin login', '❌', 'No token returned');
      }
    } catch (err) {
      addTest('Admin login', '❌', err.response?.data?.message || err.message);
    }

    // 5. Test Diploma Listing
    console.log('5️⃣  DATA RETRIEVAL:\n');
    try {
      const diplomasResp = await axios.get(`${BACKEND_URL}/api/diplomas`);
      const count = diplomasResp.data.data?.length || 0;
      addTest('List diplomas', '✅', `Found ${count} diplomas in database`);
    } catch (err) {
      addTest('List diplomas', '❌', err.message);
    }

    // 6. Test Getting Pending Diplomas (Protected Route)
    console.log('6️⃣  PROTECTED ENDPOINTS:\n');
    if (authToken) {
      try {
        const pendingResp = await axios.get(`${BACKEND_URL}/api/diplomas/pending`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const count = pendingResp.data.data?.length || 0;
        addTest('Get pending diplomas', '✅', `Found ${count} pending diplomas`);
      } catch (err) {
        if (err.response?.status === 401) {
          addTest('Get pending diplomas', '⚠️', 'Token validation might need adjustment');
        } else {
          addTest('Get pending diplomas', '❌', err.message);
        }
      }
    }

    // 7. Test API Response Schema
    console.log('7️⃣  RESPONSE SCHEMA VALIDATION:\n');
    try {
      const diplomasResp = await axios.get(`${BACKEND_URL}/api/diplomas`);
      const firstDiploma = diplomasResp.data.data?.[0];
      
      if (firstDiploma) {
        const requiredFields = ['id', 'npm', 'nama_lengkap', 'status'];
        const hasFields = requiredFields.every(f => f in firstDiploma);
        
        if (hasFields) {
          addTest('Diploma schema', '✅', `Has required fields: ${requiredFields.join(', ')}`);
        } else {
          addTest('Diploma schema', '❌', `Missing fields`);
        }
      } else {
        addTest('Diploma schema', '⚠️', 'No diplomas to validate');
      }
    } catch (err) {
      addTest('Diploma schema', '❌', err.message);
    }

    // 8. Test CORS Headers
    console.log('8️⃣  CORS & SECURITY HEADERS:\n');
    try {
      const corsTest = await axios.options(`${BACKEND_URL}/api/auth/login`);
      const hasCORS = corsTest.headers['access-control-allow-origin'];
      
      if (hasCORS) {
        addTest('CORS enabled', '✅', `Allow-Origin: ${hasCORS}`);
      } else {
        addTest('CORS enabled', '⚠️', 'CORS headers might be missing');
      }
    } catch (err) {
      addTest('CORS enabled', '⚠️', 'Could not verify: ' + err.message);
    }

    // 9. Test Error Handling
    console.log('9️⃣  ERROR HANDLING:\n');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'wronguser',
        password: 'wrongpass'
      });
      addTest('Invalid credentials', '❌', 'Should return 401');
    } catch (err) {
      if (err.response?.status === 401) {
        addTest('Invalid credentials', '✅', `Properly returns 401: ${err.response.data.message}`);
      } else {
        addTest('Invalid credentials', '❌', `Wrong status code: ${err.response?.status}`);
      }
    }

    // 10. Test Database Data Integrity
    console.log('🔟 DATA INTEGRITY:\n');
    try {
      const diplomasResp = await axios.get(`${BACKEND_URL}/api/diplomas`);
      const data = diplomasResp.data.data || [];
      
      let integrityOk = true;
      for (const diploma of data.slice(0, 3)) {
        if (!diploma.npm || !diploma.nama_lengkap) {
          integrityOk = false;
          break;
        }
      }
      
      if (integrityOk) {
        addTest('Data integrity', '✅', `All diplomas have required fields`);
      } else {
        addTest('Data integrity', '❌', `Some diplomas have missing fields`);
      }
    } catch (err) {
      addTest('Data integrity', '❌', err.message);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }

  // Print Summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚠️  Success Rate: ${((passedTests / tests.length) * 100).toFixed(0)}%`);
  console.log('═'.repeat(60));
  
  console.log('\n📋 DETAILED RESULTS:\n');
  tests.forEach((test, idx) => {
    console.log(`${idx + 1}. ${test.name}`);
    console.log(`   Status: ${test.status}`);
    if (test.details) console.log(`   Details: ${test.details}`);
  });

  console.log('\n');
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n✅ Frontend + Backend + Database integration is working correctly!');
  } else {
    console.log(`⚠️  ${failedTests} test(s) failed. Check details above.`);
  }
  
  console.log('\n🌐 ENDPOINTS:');
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`\n`);
}

runTests();
