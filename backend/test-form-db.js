const db = require('./models');
const crypto = require('crypto'); // Import crypto untuk generate hash

async function testFormDatabase() {
  console.log('🧪 Testing form database structure...\n');
  
  await db.syncDatabase(false, true);
  
  // Generate hash SHA-256 yang valid (64 karakter)
  const generateValidHash = () => {
    return crypto.createHash('sha256')
      .update('ijazah_budi_santoso_' + Date.now()) // buat string unik
      .digest('hex'); // 64 karakter hex
  };
  
  // Test insert data sesuai form
  const diplomaData = {
    nama_lengkap: 'Budi Santoso',
    nim: '20230001',
    program_studi: 'Teknik Informatika',
    gelar_akademik: 'S.Kom.',
    fakultas: 'Fakultas Teknik',
    
    tanggal_lulus: '2023-08-15',
    ipk: 3.75,
    judul_skripsi: 'Sistem Verifikasi Ijazah Digital Berbasis Blockchain',
    tahun_akademik: '2022/2023',
    yudisium: 'Sangat Memuaskan',
    
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e90F1B2e3c4',
    
    nama_file: 'ijazah_budi_santoso.pdf',
    path_file: '/uploads/ijazah_budi_santoso.pdf',
    ukuran_file: 2048000,
    tipe_file: 'application/pdf',
    file_hash: generateValidHash(), // <- Hash 64 karakter yang valid!
    
    uploaded_by: 'admin'
  };
  
  try {
    console.log('📝 Inserting test data...');
    console.log('   File hash length:', diplomaData.file_hash.length, 'characters');
    
    const diploma = await db.Diploma.create(diplomaData);
    
    console.log('\n✅ Data berhasil dimasukkan:');
    console.log('   ID:', diploma.id);
    console.log('   Nama:', diploma.nama_lengkap);
    console.log('   NIM:', diploma.nim);
    console.log('   Program Studi:', diploma.program_studi);
    console.log('   Certificate ID:', diploma.certificate_id || '(auto-generated)');
    console.log('   Status:', diploma.status);
    console.log('   Created at:', diploma.created_at);
    
    // Cek query - PAKAI CARA SEQUELIZE YANG BENAR
    console.log('\n🔍 Querying data by NIM...');
    const byNim = await db.Diploma.findOne({ 
      where: { nim: '20230001' } 
    });
    
    console.log('✅ Query by NIM berhasil:', byNim ? 'Data ditemukan' : 'Data tidak ditemukan');
    if (byNim) {
      console.log('   Nama dari query:', byNim.nama_lengkap);
    }
    
    // Cek semua data
    const allData = await db.Diploma.findAll();
    console.log(`\n📊 Total records in database: ${allData.length}`);
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await diploma.destroy();
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Tampilkan detail error validasi
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    
    // Cek panjang hash jika error tentang file_hash
    if (error.message.includes('file_hash') || error.message.includes('64 karakter')) {
      console.error('\n🔍 Hash length check:');
      console.error('   Provided hash:', diplomaData.file_hash);
      console.error('   Hash length:', diplomaData.file_hash.length);
      console.error('   Required: 64 characters');
    }
  }
  
  // Close connection
  await db.sequelize.close();
  console.log('\n🔌 Database connection closed');
  console.log('\n🎉 Test completed!');
}

// Jalankan test
testFormDatabase();