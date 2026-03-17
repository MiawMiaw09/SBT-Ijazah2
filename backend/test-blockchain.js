// test-blockchain.js
const blockchainService = require('./services/blockchainService');
const pinataService = require('./services/pinataService');

async function test() {
  console.log('🧪 Testing Blockchain Connection...');
  const status = await blockchainService.checkConnection();
  console.log(status);
  
  console.log('\n🧪 Testing Pinata Connection...');
  const pinataStatus = await pinataService.testConnection();
  console.log(pinataStatus);
}

test();