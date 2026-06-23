const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || '';
const dbUrlRegex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = dbUrl.match(dbUrlRegex);

if (!match) {
  console.error('❌ Tidak bisa parse DATABASE_URL');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

const { Client } = require('pg');

const client = new Client({
  user: user,
  password: password,
  host: host,
  port: parseInt(port),
  database: database,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkData() {
  try {
    await client.connect();
    console.log('\n✅ Terhubung ke Supabase\n');

    // Check tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(r => r.table_name);
    
    console.log('📊 SUPABASE STATUS:');
    console.log(`Tables: ${tables.join(', ')}`);
    
    // Count rows in each table
    console.log('\n📈 DATA COUNT:');
    for (const tableName of tables) {
      const countResult = await client.query(`SELECT COUNT(*) as total FROM "${tableName}";`);
      const count = countResult.rows[0].total;
      console.log(`  ${tableName}: ${count} rows`);
    }
    
    // Get diplomas data sample
    const diplomasCount = await client.query(`SELECT COUNT(*) as total FROM "diplomas";`);
    if (diplomasCount.rows[0].total > 0) {
      console.log('\n✅ DATA DITEMUKAN DI SUPABASE!');
      const sampleResult = await client.query(`SELECT npm, nama_lengkap, status FROM "diplomas" LIMIT 3;`);
      console.log('Sample diplomas:');
      sampleResult.rows.forEach(row => {
        console.log(`  - NPM: ${row.npm}, Nama: ${row.nama_lengkap}, Status: ${row.status}`);
      });
    } else {
      console.log('\n⚠️  SUPABASE KOSONG - Tidak ada data diplomas');
      console.log('Langkah berikutnya: Upload data via API /api/diplomas/upload');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
