const { Sequelize, DataTypes } = require('sequelize');
const { sequelize, testConnection } = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import model Diploma
db.Diploma = require('./Diploma')(sequelize, DataTypes);

// Fungsi untuk sync database dengan opsi yang aman
const syncDatabase = async (options = {}) => {
  const { 
    force = false, 
    alter = false, // ⚠️ Default false untuk menghindari error indexes
    safeMode = true 
  } = options;
  
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('\n🔄 Mensinkronisasi database...');
    console.log(`📋 Mode: force=${force}, alter=${alter}, safe=${safeMode}`);
    
    if (safeMode && alter) {
      console.log('⚠️  Safe mode: Mengubah alter dari true ke false untuk menghindari error indexes');
      await sequelize.sync({ force, alter: false });
    } else {
      await sequelize.sync({ force, alter });
    }
    
    console.log('✅ Database berhasil disinkronisasi!');
    
  } catch (error) {
    console.error('❌ Error sinkronisasi database:', error.message);
    
    // Auto-recovery: coba tanpa alter jika gagal
    if (alter === true) {
      try {
        console.log('🔄 Auto-recovery: Mencoba sync tanpa alter...');
        await sequelize.sync({ force: false, alter: false });
        console.log('✅ Recovery berhasil! Database tersinkronisasi.');
      } catch (recoveryError) {
        console.error('❌ Recovery gagal:', recoveryError.message);
      }
    }
    
    // Jangan exit process, biarkan server tetap jalan
    console.log('⚠️  Server tetap berjalan dengan error sinkronisasi...');
  }
};

// Fungsi untuk membersihkan indexes (harus dijalankan manual)
const cleanupIndexes = async () => {
  try {
    console.log('🔧 Membersihkan indexes yang berlebihan...');
    
    // Query untuk melihat indexes
    const [indexes] = await sequelize.query(`
      SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'diplomas'
      ORDER BY INDEX_NAME
    `);
    
    console.log('📊 Indexes saat ini:', indexes);
    
    // Hanya log info, tidak hapus otomatis
    console.log('ℹ️  Untuk hapus indexes, jalankan SQL manual di phpMyAdmin');
    
  } catch (error) {
    console.error('❌ Error cleanup indexes:', error.message);
  }
};

db.syncDatabase = syncDatabase;
db.testConnection = testConnection;
db.cleanupIndexes = cleanupIndexes;

module.exports = db;