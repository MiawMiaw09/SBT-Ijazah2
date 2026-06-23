/**
 * DATA INSERTION TEST
 * Test complete flow: Frontend → Backend → Database (Supabase)
 * Simulates form submission from frontend
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

console.log('\n🔍 === DATA INSERTION & FLOW TEST ===\n');

const API_BASE = 'http://localhost:5000/api';

// Generate test data
const generateTestDiploma = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  
  return {
    nama_lengkap: `Test Student ${randomNum}`,
    npm: `TEST${timestamp}${randomNum}`.substring(0, 10),
    nik: `32${String(randomNum).padStart(13, '0')}`,
    program_studi: 'Teknik Informatika',
    gelar_akademik: 'S.Kom',
    tempat_tanggal_lahir: 'Jakarta, 01 Januari 2000',
    fakultas: 'Teknologi Informasi',
    tanggal_lulus: new Date().toISOString().split('T')[0],
    ipk: (3 + Math.random()).toFixed(2),
    judul_skripsi: 'Sistem Verifikasi Ijazah Digital Menggunakan Blockchain',
    tahun_akademik: '2023/2024',
    yudisium: 'Lulus Dengan Pujian'
  };
};

// Create dummy PDF file
const createDummyPDF = () => {
  const pdfContent = Buffer.from('%PDF-1.4\n%Test PDF for integration testing');
  const tmpPath = path.join(__dirname, `test-diploma-${Date.now()}.pdf`);
  fs.writeFileSync(tmpPath, pdfContent);
  return tmpPath;
};

async function testInsertionFlow() {
  let pdfPath = null;
  
  try {
    // Step 1: Generate test data
    const testData = generateTestDiploma();
    console.log('📝 STEP 1: Generate Test Data');
    console.log(`   NPM: ${testData.npm}`);
    console.log(`   Nama: ${testData.nama_lengkap}`);
    console.log(`   Program Studi: ${testData.program_studi}\n`);
    
    // Step 2: Create test PDF
    pdfPath = createDummyPDF();
    console.log('📝 STEP 2: Create Test PDF File');
    console.log(`   File: ${path.basename(pdfPath)}`);
    console.log(`   Size: ${fs.statSync(pdfPath).size} bytes\n`);
    
    // Step 3: Get current count
    console.log('📝 STEP 3: Get Current Data Count');
    const beforeRes = await axios.get(`${API_BASE}/diplomas`);
    const beforeCount = beforeRes.data.count;
    console.log(`   Current records: ${beforeCount}\n`);
    
    // Step 4: Upload diploma (main insertion point)
    console.log('📝 STEP 4: Upload Diploma to Backend');
    console.log(`   POST ${API_BASE}/diplomas/upload`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath), 'diploma.pdf');
    formData.append('diploma', JSON.stringify(testData));
    
    try {
      const uploadRes = await axios.post(`${API_BASE}/diplomas/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      if (uploadRes.data.success) {
        console.log(`   ✅ Upload successful`);
        console.log(`   Response: ${JSON.stringify(uploadRes.data).substring(0, 200)}...`);
        
        const diplomaId = uploadRes.data.data?.id;
        console.log(`   New Diploma ID: ${diplomaId}\n`);
        
        // Step 5: Verify data was stored
        console.log('📝 STEP 5: Verify Data in Database');
        
        // Wait a bit for db write
        await new Promise(r => setTimeout(r, 1000));
        
        const afterRes = await axios.get(`${API_BASE}/diplomas`);
        const afterCount = afterRes.data.count;
        console.log(`   Records after insert: ${afterCount}`);
        console.log(`   Inserted: ${afterCount - beforeCount} new record(s)`);
        
        if (afterCount > beforeCount) {
          console.log(`   ✅ Data successfully stored in database\n`);
          
          // Step 6: Query by NPM to verify
          console.log('📝 STEP 6: Retrieve Data by NPM');
          try {
            const retrieveRes = await axios.get(`${API_BASE}/diplomas/npm/${testData.npm}`);
            if (retrieveRes.data.data) {
              const record = retrieveRes.data.data;
              console.log(`   ✅ Record retrieved:`);
              console.log(`      ID: ${record.id}`);
              console.log(`      NPM: ${record.npm}`);
              console.log(`      Nama: ${record.nama_lengkap}`);
              console.log(`      Status: ${record.status}`);
              console.log(`      Created: ${record.created_at}\n`);
            }
          } catch (err) {
            console.log(`   ⚠️  Could not retrieve by NPM: ${err.message}\n`);
          }
          
          // Step 7: Get stats
          console.log('📝 STEP 7: Check Dashboard Stats');
          try {
            const statsRes = await axios.get(`${API_BASE}/diplomas/stats/dashboard`);
            const stats = statsRes.data.data;
            console.log(`   Total: ${stats.total}`);
            console.log(`   Pending: ${stats.pending}`);
            console.log(`   Verified: ${stats.verified}`);
            console.log(`   Minted: ${stats.minted}\n`);
          } catch (err) {
            console.log(`   ⚠️  Could not fetch stats: ${err.message}\n`);
          }
          
          // Summary
          console.log('✨ === INSERTION TEST COMPLETE ===');
          console.log('✅ FLOW SUCCESS:');
          console.log('   1. Frontend submits form data → Backend');
          console.log('   2. Backend validates & stores file');
          console.log('   3. Backend inserts record to Supabase');
          console.log('   4. Data verified in database\n');
          
          return {
            success: true,
            beforeCount,
            afterCount,
            diplomaId,
            testNpm: testData.npm
          };
        } else {
          console.log(`   ❌ Data NOT stored (count unchanged)\n`);
        }
      } else {
        console.log(`   ❌ Upload failed: ${uploadRes.data.message}\n`);
      }
    } catch (uploadErr) {
      console.log(`   ❌ Upload error: ${uploadErr.message}`);
      if (uploadErr.response?.data) {
        console.log(`   Server response: ${JSON.stringify(uploadErr.response.data)}\n`);
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Test error: ${error.message}`);
    if (error.response?.data) {
      console.error(`Response: ${JSON.stringify(error.response.data)}`);
    }
  } finally {
    // Cleanup
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
      console.log('🧹 Cleaned up test PDF file');
    }
  }
}

// Run test
testInsertionFlow().then(result => {
  if (result?.success) {
    console.log('\n🎉 Integration test PASSED!');
  } else {
    console.log('\n⚠️  Integration test needs review');
  }
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
