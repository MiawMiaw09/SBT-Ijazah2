const path = require('path');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = (process.env.DB_URL || process.env.DATABASE_URL || '').trim();
const dbHost = (process.env.DB_HOST || '').trim();
const dbUser = (process.env.DB_USER || '').trim();
const dbPassword = (process.env.DB_PASSWORD || '').trim();
const dbName = (process.env.DB_NAME || '').trim();
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
const useLocalDb = process.env.USE_LOCAL_DB === 'true';

const postgresConfig = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

const sqliteConfig = {
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// Determine connection strategy
let sequelize;
let dbType = 'unknown';

if (useLocalDb) {
  console.log('📀 Menggunakan SQLite (mode offline)...');
  sequelize = new Sequelize(sqliteConfig);
  dbType = 'sqlite';
} else if (dbUrl) {
  console.log('🔌 Menggunakan DB_URL untuk koneksi PostgreSQL...');
  sequelize = new Sequelize(dbUrl, postgresConfig);
  dbType = 'postgres-url';
} else if (dbHost && dbUser) {
  console.log('🔌 Menggunakan DB_HOST untuk koneksi PostgreSQL...');
  sequelize = new Sequelize(dbName || 'postgres', dbUser || 'postgres', dbPassword || '', {
    ...postgresConfig,
    host: dbHost || 'localhost',
    port: dbPort
  });
  dbType = 'postgres-host';
} else {
  console.log('⚠️  Fallback ke PostgreSQL localhost...');
  sequelize = new Sequelize('postgres', 'postgres', '', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
  dbType = 'postgres-local';
}

const testConnection = async (maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log(`✅ Koneksi ke ${dbType} berhasil!`);
      return true;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retry ${attempt}/${maxRetries - 1}... (waiting 2s)`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  // If original attempt failed and it's Postgres, try fallback to SQLite
  if (dbType !== 'sqlite' && dbType !== 'postgres-local') {
    console.error(`❌ Gagal terkoneksi ke ${dbType}:`, lastError.message);
    console.log('\n🔄 Auto-fallback ke SQLite...\n');
    
    // Switch to SQLite
    sequelize = new Sequelize(sqliteConfig);
    dbType = 'sqlite';
    
    try {
      await sequelize.authenticate();
      console.log('✅ SQLite fallback berhasil! (mode offline)');
      console.log('⚠️  Database lokal akan digunakan sampai koneksi Supabase tersedia');
      return true;
    } catch (sqliteError) {
      console.error('❌ SQLite fallback juga gagal:', sqliteError.message);
      return false;
    }
  }
  
  console.error('❌ Gagal terkoneksi ke database:', lastError.message);
  console.log('\n💡 Solusi:');
  if (dbType.includes('postgres')) {
    console.log('1. Install PostgreSQL lokal atau gunakan SQLite:');
    console.log('   - set USE_LOCAL_DB=true di .env');
    console.log('2. Untuk Supabase, cek koneksi IPv4:');
    console.log('   - NODE_OPTIONS="--dns-result-order=ipv4first"');
  }
  
  return false;
};

module.exports = {
  sequelize,
  testConnection,
  dbType
};