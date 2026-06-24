const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import database
const db = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const diplomaRoutes = require('./routes/diplomaRoutes');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration - whitelist frontend domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sbt-ijazah2.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check exact match or *.vercel.app pattern
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    return callback(null, true); // Allow all for now, log warnings
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/diplomas', diplomaRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ Digital Diploma Verification System API',
    version: '1.0.0',
    author: 'Your Name',
    endpoints: {
      upload: 'POST /api/diplomas/upload',
      getAll: 'GET /api/diplomas',
      getPending: 'GET /api/diplomas/pending',
      getById: 'GET /api/diplomas/:id',
      getByNPM: 'GET /api/diplomas/npm/:npm',
      verify: 'GET /api/diplomas/verify/:certificateId',
      mint: 'PUT /api/diplomas/mint/:id',
      stats: 'GET /api/diplomas/stats/dashboard'
    },
    description: 'Sistem verifikasi ijazah digital menggunakan Soulbound Token berbasis blockchain'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Multer error (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File terlalu besar. Maksimal 10MB'
    });
  }
  
  // File type error
  if (err.message.includes('Hanya file')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: err.message
  });
});

// Sync database dan start server
const PORT = process.env.PORT || 5000;

db.syncDatabase({ force: false, alter: true }).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✨ ======================================== ✨`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'diploma_db'}`);
    console.log(`📁 Upload folder: ${path.join(__dirname, 'uploads')}`);
    console.log(`✨ ======================================== ✨\n`);
    
    console.log('📋 Available endpoints:');
    console.log(`   📍 Home: http://localhost:${PORT}`);
    console.log(`   📤 Upload: POST http://localhost:${PORT}/api/diplomas/upload`);
    console.log(`   📋 Pending: GET http://localhost:${PORT}/api/diplomas/pending`);
    console.log(`   ✅ Verify: GET http://localhost:${PORT}/api/diplomas/verify/:certificateId`);
    console.log(`   🪙 Mint: PUT http://localhost:${PORT}/api/diplomas/mint/:id`);
    console.log(`   📊 Stats: GET http://localhost:${PORT}/api/diplomas/stats/dashboard\n`);
  });
});