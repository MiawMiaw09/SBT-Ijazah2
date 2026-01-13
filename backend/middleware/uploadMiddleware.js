const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Pastikan folder uploads ada
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Format: ijazah-nim-timestamp.ext
    const nim = req.body.nim || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `ijazah-${nim}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Filter file (hanya PDF dan gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file PDF, JPG, dan PNG yang diperbolehkan'));
  }
};

// Buat instance upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// Fungsi untuk generate hash file
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

module.exports = {
  upload,
  generateFileHash
};