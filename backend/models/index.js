const { Sequelize, DataTypes } = require('sequelize');
const { sequelize, testConnection } = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import model Diploma saja dulu
db.Diploma = require('./Diploma')(sequelize, DataTypes);

// Fungsi untuk sync database
const syncDatabase = async (force = false, alter = true) => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('\n🔄 Mensinkronisasi database...');
    
    await sequelize.sync({ 
      force: force,
      alter: alter
    });
    
    console.log('✅ Database berhasil disinkronisasi!');
    
  } catch (error) {
    console.error('❌ Error sinkronisasi database:', error.message);
    process.exit(1);
  }
};

db.syncDatabase = syncDatabase;
db.testConnection = testConnection;

module.exports = db;