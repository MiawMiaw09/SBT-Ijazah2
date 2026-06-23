const axios = require('axios');

const API_URL = 'http://localhost:5000';

console.log('\n🔑 TEST LOGIN ENDPOINT\n');

async function testLogin() {
  try {
    console.log('POST /api/auth/login');
    console.log('Body: { username: "admin", password: "admin123" }\n');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Response 200:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('\n✅ LOGIN BERHASIL!');
      console.log(`Token: ${response.data.token.substring(0, 50)}...`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Response ${error.response.status}:`);
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testLogin();
