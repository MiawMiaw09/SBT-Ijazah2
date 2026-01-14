const db = require('../models');
const Diploma = db.Diploma;
const { generateFileHash } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// ========== FUNGSI UTAMA ==========

// @desc    Upload ijazah baru
// @route   POST /api/diplomas/upload
// @access  Public
exports.uploadDiploma = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Harus upload file ijazah'
      });
    }

    // Generate hash dari file
    const fileHash = await generateFileHash(req.file.path);
    
    // Cek apakah file sudah pernah diupload
    const existingDiploma = await Diploma.findOne({ where: { file_hash: fileHash } });
    if (existingDiploma) {
      // Hapus file yang baru diupload
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'File ijazah ini sudah pernah diupload',
        data: existingDiploma
      });
    }

    // Cek apakah NPM sudah ada
    const existingNPM = await Diploma.findOne({ where: { npm: req.body.npm } });
    if (existingNPM) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'NPM sudah terdaftar'
      });
    }

    // Format tanggal dari dd/mm/yyyy ke yyyy-mm-dd
    let tanggalLulus = req.body.tanggal_lulus;
    if (tanggalLulus && tanggalLulus.includes('/')) {
      const parts = tanggalLulus.split('/');
      if (parts.length === 3) {
        tanggalLulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Buat data diploma
    const diplomaData = {
      nama_lengkap: req.body.nama_lengkap,
      npm: req.body.npm,
      program_studi: req.body.program_studi,
      gelar_akademik: req.body.gelar_akademik,
      fakultas: req.body.fakultas,
      tanggal_lulus: tanggalLulus,
      ipk: req.body.ipk ? parseFloat(req.body.ipk) : null,
      judul_skripsi: req.body.judul_skripsi,
      tahun_akademik: req.body.tahun_akademik,
      yudisium: req.body.yudisium,
      wallet_address: req.body.wallet_address,
      nama_file: req.file.originalname,
      path_file: req.file.path,
      ukuran_file: req.file.size,
      tipe_file: req.file.mimetype,
      file_hash: fileHash,
      uploaded_by: req.body.uploaded_by || 'user',
      status: 'pending'
    };

    // Simpan ke database
    const diploma = await Diploma.create(diplomaData);

    res.status(201).json({
      success: true,
      message: 'Ijazah berhasil diupload dan menunggu verifikasi',
      data: {
        id: diploma.id,
        nama_lengkap: diploma.nama_lengkap,
        npm: diploma.npm,
        certificate_id: diploma.certificate_id,
        status: diploma.status,
        created_at: diploma.created_at
      }
    });

  } catch (error) {
    // Hapus file jika ada error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get semua ijazah (untuk admin)
// @route   GET /api/diplomas
// @access  Public
exports.getAllDiplomas = async (req, res) => {
  try {
    const diplomas = await Diploma.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: diplomas.length,
      data: diplomas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diplomas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get ijazah by ID
// @route   GET /api/diplomas/:id
// @access  Public
exports.getDiplomaById = async (req, res) => {
  try {
    const diploma = await Diploma.findByPk(req.params.id);

    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: diploma
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get ijazah by NPM
// @route   GET /api/diplomas/npm/:npm
// @access  Public
exports.getDiplomaByNpm = async (req, res) => {
  try {
    const diploma = await Diploma.findOne({ where: { npm: req.params.npm } });

    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah dengan NPM tersebut tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: diploma
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Verify ijazah (cek keaslian)
// @route   GET /api/diplomas/verify/:npm
// @access  Public
exports.verifyDiploma = async (req, res) => {
  try {
    const diploma = await Diploma.findOne({ where: { npm: req.params.npm } });

    if (!diploma) {
      return res.json({
        success: false,
        verified: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    res.json({
      success: true,
      verified: diploma.status === 'minted',
      data: {
        nama_lengkap: diploma.nama_lengkap,
        npm: diploma.npm,
        program_studi: diploma.program_studi,
        gelar_akademik: diploma.gelar_akademik,
        tanggal_lulus: diploma.getFormattedDate ? diploma.getFormattedDate() : diploma.tanggal_lulus,
        status: diploma.status,
        certificate_id: diploma.certificate_id,
        transaction_hash: diploma.transaction_hash,
        minted_at: diploma.minted_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get pending diplomas (untuk admin dashboard)
// @route   GET /api/diplomas/pending
// @access  Public
exports.getPendingDiplomas = async (req, res) => {
  try {
    const diplomas = await Diploma.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: diplomas.length,
      data: diplomas.map(d => ({
        id: d.id,
        nama_lengkap: d.nama_lengkap,
        npm: d.npm,
        program_studi: d.program_studi,
        gelar_akademik: d.gelar_akademik,
        certificate_id: d.certificate_id,
        created_at: d.created_at,
        status: d.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending diplomas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update status menjadi minted (simulasi mint SBT)
// @route   PUT /api/diplomas/mint/:id
// @access  Public
exports.mintDiploma = async (req, res) => {
  try {
    const { transaction_hash, contract_address, token_id, block_number, minted_by } = req.body;

    const diploma = await Diploma.findByPk(req.params.id);

    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    if (diploma.status === 'minted') {
      return res.status(400).json({
        success: false,
        message: 'Ijazah sudah di-mint sebelumnya'
      });
    }

    // Update data
    await diploma.update({
      status: 'minted',
      transaction_hash: transaction_hash || `0x${Date.now().toString(16)}`,
      contract_address: contract_address || '0x0000000000000000000000000000000000000000',
      token_id: token_id || Math.floor(Math.random() * 10000).toString(),
      block_number: block_number || Math.floor(Math.random() * 1000000),
      minted_at: new Date(),
      minted_by: minted_by || 'admin'
    });

    res.json({
      success: true,
      message: 'Ijazah berhasil di-mark sebagai minted',
      data: {
        id: diploma.id,
        nim: diploma.nim,
        certificate_id: diploma.certificate_id,
        status: diploma.status,
        transaction_hash: diploma.transaction_hash,
        token_id: diploma.token_id,
        minted_at: diploma.minted_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error minting diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get statistics untuk dashboard (LEGACY - untuk kompatibilitas)
// @route   GET /api/diplomas/stats
// @access  Public
exports.getStatistics = async (req, res) => {
  try {
    const total = await Diploma.count();
    const pending = await Diploma.count({ where: { status: 'pending' } });
    const minted = await Diploma.count({ where: { status: 'minted' } });

    res.json({
      success: true,
      data: {
        total,
        pending,
        minted
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get statistics untuk dashboard (NEW - dengan format lengkap)
// @route   GET /api/diplomas/stats/dashboard
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard statistics...");
    
    const total = await Diploma.count();
    const minted = await Diploma.count({ where: { status: 'minted' } });
    const pending = await Diploma.count({ where: { status: 'pending' } });
    
    // Hitung persentase
    const mintedPercentage = total > 0 ? Math.round((minted / total) * 100) : 0;
    const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
    
    const data = {
      total,
      minted,
      pending,
      mintedPercentage,
      pendingPercentage,
      percentages: {
        minted: `${mintedPercentage}%`,
        pending: `${pendingPercentage}%`
      }
    };
    
    console.log("📊 Dashboard stats:", data);
    console.log("📊 Dashboard stats response:", {
      total,
      minted,
      pending,
      mintedPercentage,
      pendingPercentage
    });
    
    res.json({
      success: true,
      message: 'Dashboard statistics fetched successfully',
      data: data
    });

  } catch (error) {
    console.error("❌ Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ========== FUNGSI TAMBAHAN ==========

// @desc    Delete diploma by ID
// @route   DELETE /api/diplomas/:id
// @access  Private/Admin
exports.deleteDiploma = async (req, res) => {
  try {
    console.log(`🗑️ DELETE request for diploma ID: ${req.params.id}`);
    
    const diploma = await Diploma.findByPk(req.params.id);

    if (!diploma) {
      console.log(`❌ Diploma not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    console.log(`📋 Diploma found: ${diploma.nama_lengkap} (${diploma.nim}), Status: ${diploma.status}`);

    // Cek status, jangan izinkan hapus jika sudah di-mint
    if (diploma.status === 'minted') {
      console.log(`⛔ Cannot delete: Diploma ${diploma.id} is already minted`);
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus ijazah yang sudah di-mint'
      });
    }

    // Simpan info untuk response
    const diplomaInfo = {
      id: diploma.id,
      nama_lengkap: diploma.nama_lengkap,
      nim: diploma.nim,
      certificate_id: diploma.certificate_id,
      file_path: diploma.path_file
    };

    // Hapus file fisik jika ada
    if (diploma.path_file && fs.existsSync(diploma.path_file)) {
      try {
        fs.unlinkSync(diploma.path_file);
        console.log(`✅ Physical file deleted: ${diploma.path_file}`);
      } catch (fileError) {
        console.warn(`⚠️ Failed to delete physical file: ${fileError.message}`);
        // Lanjutkan meskipun gagal hapus file
      }
    } else {
      console.log(`ℹ️ No physical file to delete for diploma ${diploma.id}`);
    }

    // Hapus dari database
    await diploma.destroy();
    console.log(`✅ Database record deleted for diploma ID: ${diploma.id}`);

    res.json({
      success: true,
      message: 'Ijazah berhasil dihapus',
      data: diplomaInfo
    });

  } catch (error) {
    console.error('❌ Error deleting diploma:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update diploma data
// @route   PUT /api/diplomas/:id
// @access  Private/Admin
exports.updateDiploma = async (req, res) => {
  try {
    const diploma = await Diploma.findByPk(req.params.id);

    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    // Format tanggal jika ada
    let updateData = { ...req.body };
    if (updateData.tanggal_lulus && updateData.tanggal_lulus.includes('/')) {
      const parts = updateData.tanggal_lulus.split('/');
      if (parts.length === 3) {
        updateData.tanggal_lulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Parse IPK jika ada
    if (updateData.ipk) {
      updateData.ipk = parseFloat(updateData.ipk);
    }

    // Update data
    await diploma.update(updateData);

    res.json({
      success: true,
      message: 'Ijazah berhasil diperbarui',
      data: diploma
    });

  } catch (error) {
    console.error('❌ Error updating diploma:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Soft delete diploma (ubah status menjadi rejected)
// @route   PUT /api/diplomas/:id/soft-delete
// @access  Private/Admin
exports.softDeleteDiploma = async (req, res) => {
  try {
    const diploma = await Diploma.findByPk(req.params.id);

    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    // Cek status, jangan izinkan hapus jika sudah di-mint
    if (diploma.status === 'minted') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus ijazah yang sudah di-mint'
      });
    }

    // Update status menjadi 'rejected'
    await diploma.update({
      status: 'rejected',
      verification_notes: req.body.notes || 'Dihapus oleh admin',
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Ijazah berhasil di-soft delete (status: rejected)',
      data: {
        id: diploma.id,
        nama_lengkap: diploma.nama_lengkap,
        nim: diploma.nim,
        status: diploma.status,
        verification_notes: diploma.verification_notes,
        updated_at: diploma.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error soft deleting diploma:', error);
    res.status(500).json({
      success: false,
      message: 'Error soft deleting diploma',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get diplomas by status
// @route   GET /api/diplomas/status/:status
// @access  Public
exports.getDiplomasByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'minted', 'verified', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`
      });
    }

    const diplomas = await Diploma.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: diplomas.length,
      data: diplomas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diplomas by status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Check health endpoint
// @route   GET /api/diplomas/health
// @access  Public
exports.healthCheck = async (req, res) => {
  try {
    // Cek koneksi database
    const count = await Diploma.count();
    
    res.json({
      success: true,
      message: 'API is healthy',
      data: {
        database: 'connected',
        diplomas_count: count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API health check failed',
      error: error.message
    });
  }
};
