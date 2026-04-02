const db = require('../models');
const Diploma = db.Diploma;
const { generateFileHash } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// Import services
const blockchainService = require('../services/blockchainService');
const pinataService = require('../services/pinataService');

// ========== FUNGSI UTAMA ==========

// @desc    Upload ijazah baru (dengan PDF ke IPFS)
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

    // Cek apakah CERTIFICATE ID sudah ada
    if (req.body.certificate_id) {
      const existingCertId = await Diploma.findOne({ where: { certificate_id: req.body.certificate_id } });
      if (existingCertId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Certificate ID sudah digunakan'
        });
      }
    }

    // Upload file PDF ke IPFS via Pinata
    console.log('📤 Uploading PDF to IPFS...');
    const fileStream = fs.createReadStream(req.file.path);
    
    const pinataResult = await pinataService.uploadFile(
      fileStream, 
      `ijazah-${req.body.npm}-${Date.now()}.pdf`
    );
    
    if (!pinataResult.success) {
      fs.unlinkSync(req.file.path);
      throw new Error('Gagal upload PDF ke IPFS: ' + pinataResult.error);
    }
    
    const pdfIpfsHash = pinataResult.ipfsHash;
    console.log('✅ PDF uploaded to IPFS:', pdfIpfsHash);

    // Format tanggal
    let tanggalLulus = req.body.tanggal_lulus;
    if (tanggalLulus && tanggalLulus.includes('/')) {
      const parts = tanggalLulus.split('/');
      if (parts.length === 3) {
        tanggalLulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    let tanggalSKRektor = req.body.tanggal_sk_rektor;
    if (tanggalSKRektor && tanggalSKRektor.includes('/')) {
      const parts = tanggalSKRektor.split('/');
      if (parts.length === 3) {
        tanggalSKRektor = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Buat data diploma
    const diplomaData = {
      certificate_id: req.body.certificate_id,
      nama_lengkap: req.body.nama_lengkap,
      npm: req.body.npm,
      nik: req.body.nik,
      program_studi: req.body.program_studi,
      gelar_akademik: req.body.gelar_akademik,
      tempat_tanggal_lahir: req.body.tempat_tanggal_lahir,
      fakultas: req.body.fakultas,
      tanggal_lulus: tanggalLulus,
      ipk: req.body.ipk ? parseFloat(req.body.ipk) : null,
      judul_skripsi: req.body.judul_skripsi,
      tahun_akademik: req.body.tahun_akademik,
      yudisium: req.body.yudisium,
      nomor_sk_rektor: req.body.nomor_sk_rektor || null,
      tanggal_sk_rektor: tanggalSKRektor || null,
      wallet_address: req.body.wallet_address,
      
      nama_file: req.file.originalname,
      path_file: req.file.path,
      ukuran_file: req.file.size,
      tipe_file: req.file.mimetype,
      file_hash: fileHash,
      
      // PDF HASH (dari upload)
      ipfs_hash: pdfIpfsHash,
      ipfs_url: `https://gateway.pinata.cloud/ipfs/${pdfIpfsHash}`,
      
      // Metadata hash akan diisi nanti saat minting
      metadata_ipfs_hash: null,
      metadata_ipfs_url: null,
      
      uploaded_by: req.body.uploaded_by || 'user',
      status: 'pending'
    };

    console.log('📝 Data yang akan disimpan:', {
      certificate_id: diplomaData.certificate_id,
      nama_lengkap: diplomaData.nama_lengkap,
      npm: diplomaData.npm,
      ipfs_hash: diplomaData.ipfs_hash
    });

    const diploma = await Diploma.create(diplomaData);

    console.log('✅ Data berhasil disimpan dengan ID:', diploma.id);
    console.log('✅ PDF IPFS Hash:', diploma.ipfs_hash);

    res.status(201).json({
      success: true,
      message: 'Ijazah berhasil diupload dan menunggu verifikasi',
      data: {
        id: diploma.id,
        nama_lengkap: diploma.nama_lengkap,
        npm: diploma.npm,
        certificate_id: diploma.certificate_id,
        ipfs_hash: diploma.ipfs_hash,
        status: diploma.status,
        created_at: diploma.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error uploading diploma:', error);
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

// @desc    Get semua ijazah
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

// @desc    Get ijazah berdasarkan certificate ID
// @route   GET /api/diplomas/certificate/:certificateId
// @access  Public
exports.getDiplomaByCertificateId = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const diploma = await Diploma.findOne({ 
      where: { certificate_id: certificateId }
    });
    
    if (!diploma) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ijazah tidak ditemukan' 
      });
    }
    
    return res.json({ 
      success: true, 
      data: diploma 
    });
    
  } catch (error) {
    console.error('Error fetching diploma by certificate ID:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

// @desc    Verify ijazah (cek keaslian) - DIPERBAIKI
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
        nik: diploma.nik,
        program_studi: diploma.program_studi,
        gelar_akademik: diploma.gelar_akademik,
        tempat_tanggal_lahir: diploma.tempat_tanggal_lahir,
        tanggal_lulus: diploma.getFormattedDate ? diploma.getFormattedDate() : diploma.tanggal_lulus,
        status: diploma.status,
        certificate_id: diploma.certificate_id,
        transaction_hash: diploma.transaction_hash,
        minted_at: diploma.minted_at,
        
        // ✅ PDF (dari upload awal)
        pdf_ipfs_hash: diploma.ipfs_hash,
        pdf_ipfs_url: diploma.ipfs_url,
        
        // ✅ METADATA JSON (dari proses minting) - fallback ke ipfs_hash jika kosong
        metadata_ipfs_hash: diploma.metadata_ipfs_hash || diploma.ipfs_hash,
        metadata_ipfs_url: diploma.metadata_ipfs_url || diploma.ipfs_url
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

// @desc    Get pending diplomas
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
        ipfs_hash: d.ipfs_hash,
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

// @desc    Update status menjadi minted (legacy)
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
        npm: diploma.npm,
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

// ========== FUNGSI MINTING OTOMATIS ==========

// @desc    Upload metadata JSON ke IPFS
// @route   POST /api/diplomas/:id/upload-ipfs
// @access  Private/Admin
exports.uploadToIPFS = async (req, res) => {
  try {
    const { id } = req.params;
    const { diplomaData } = req.body;

    const diploma = await Diploma.findByPk(id);
    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    console.log('📤 Uploading diploma metadata to IPFS:', diploma.nama_lengkap);

    const fileName = `${diploma.nama_lengkap.replace(/\s+/g, '_')}-${diploma.npm}.json`;

    const uploadResult = await pinataService.uploadJSON(diplomaData, fileName);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Gagal upload ke IPFS',
        error: uploadResult.error
      });
    }

    // ✅ SIMPAN KE DUA KOLOM (agar kompatibel dengan kedua versi)
    await diploma.update({
      ipfs_hash: uploadResult.ipfsHash,           // ← untuk minting (kode pertama)
      ipfs_url: uploadResult.ipfsUrl,             // ← untuk minting
      metadata_ipfs_hash: uploadResult.ipfsHash,  // ← untuk verifikasi
      metadata_ipfs_url: uploadResult.ipfsUrl     // ← untuk verifikasi
    });

    console.log('✅ Metadata JSON uploaded to IPFS:', uploadResult.ipfsHash);
    console.log('✅ PDF Hash (tetap):', diploma.ipfs_hash);

    res.json({
      success: true,
      message: 'Berhasil upload metadata ke IPFS',
      data: {
        id: diploma.id,
        certificate_id: diploma.certificate_id,
        ipfsHash: uploadResult.ipfsHash,
        ipfsUrl: uploadResult.ipfsUrl,
        pinataUrl: uploadResult.pinataUrl,
        fileName: fileName
      }
    });

  } catch (error) {
    console.error('❌ Upload to IPFS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading to IPFS',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Mint ke blockchain via Polygon Amoy dan update status
// @route   POST /api/diplomas/:id/mint-blockchain
// @access  Private/Admin
exports.mintToBlockchain = async (req, res) => {
  try {
    const { id } = req.params;
    const { ipfsHash, walletAddress } = req.body;

    const diploma = await Diploma.findByPk(id);
    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    if (diploma.status === 'minted') {
      return res.status(400).json({
        success: false,
        message: 'Ijazah sudah pernah di-mint'
      });
    }

    // ✅ Gunakan ipfs_hash (yang sudah diupdate saat upload metadata)
    if (!ipfsHash && !diploma.ipfs_hash) {
      return res.status(400).json({
        success: false,
        message: 'IPFS hash metadata tidak ditemukan. Upload metadata ke IPFS terlebih dahulu.'
      });
    }

    const finalIpfsHash = ipfsHash || diploma.ipfs_hash;
    console.log(`🔗 Using IPFS hash for minting: ${finalIpfsHash}`);

    const recipientAddress = walletAddress || diploma.wallet_address || process.env.DEFAULT_WALLET;
    
    if (!recipientAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address tidak ditemukan'
      });
    }

    console.log(`🔗 Minting to blockchain for ${diploma.nama_lengkap}...`);

    const mintResult = await blockchainService.mintSBT(
      recipientAddress,
      finalIpfsHash,
      diploma.certificate_id
    );

    if (!mintResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mint ke blockchain',
        error: mintResult.error
      });
    }

    console.log(`✅ Minting berhasil, mengupdate status database untuk ID: ${id}`);
    
    await diploma.update({
      status: 'minted',
      transaction_hash: mintResult.transactionHash,
      contract_address: mintResult.contractAddress,
      token_id: mintResult.tokenId,
      block_number: mintResult.blockNumber,
      minted_at: new Date(),
      minted_by: req.body.minted_by || 'admin'
    });

    console.log(`✅ Status berhasil diupdate menjadi minted untuk ${diploma.nama_lengkap}`);

    res.json({
      success: true,
      message: 'Berhasil mint ke blockchain dan update status',
      data: {
        id: diploma.id,
        npm: diploma.npm,
        certificate_id: diploma.certificate_id,
        status: diploma.status,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        blockNumber: mintResult.blockNumber,
        contractAddress: mintResult.contractAddress,
        minted_at: diploma.minted_at
      }
    });

  } catch (error) {
    console.error('❌ Mint to blockchain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error minting to blockchain',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ========== FUNGSI LAINNYA ==========

// @desc    Estimasi gas fee
// @route   GET /api/diplomas/estimate-gas
// @access  Public
exports.estimateGas = async (req, res) => {
  try {
    const testAddress = '0x0000000000000000000000000000000000000000';
    const testIpfsHash = 'QmTest123456789';
    
    const estimate = await blockchainService.estimateGas(testAddress, testIpfsHash);
    
    res.json({
      success: true,
      estimatedGas: estimate.success ? estimate.totalCost : '0.01',
      details: estimate
    });
  } catch (error) {
    console.error('❌ Gas estimation error:', error);
    res.json({
      success: true,
      estimatedGas: '0.01'
    });
  }
};

// @desc    Cek koneksi blockchain
// @route   GET /api/diplomas/blockchain-status
// @access  Public
exports.checkBlockchainStatus = async (req, res) => {
  try {
    const status = await blockchainService.checkConnection();
    
    res.json({
      success: status.success,
      data: status
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Blockchain not connected',
      error: error.message
    });
  }
};

// @desc    Get PDF dari IPFS
// @route   GET /api/diplomas/:id/pdf
// @access  Public
exports.getDiplomaPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const diploma = await Diploma.findByPk(id);
    
    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }
    
    if (!diploma.ipfs_hash) {
      return res.status(404).json({
        success: false,
        message: 'PDF tidak ditemukan di IPFS'
      });
    }
    
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${diploma.ipfs_hash}`;
    
    res.json({
      success: true,
      pdf_url: gatewayUrl,
      pdf_ipfs_hash: diploma.ipfs_hash
    });
    
  } catch (error) {
    console.error('❌ Error getting PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ========== FUNGSI STATISTIK ==========

exports.getStatistics = async (req, res) => {
  try {
    const total = await Diploma.count();
    const pending = await Diploma.count({ where: { status: 'pending' } });
    const minted = await Diploma.count({ where: { status: 'minted' } });

    res.json({
      success: true,
      data: { total, pending, minted }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Diploma.count();
    const minted = await Diploma.count({ where: { status: 'minted' } });
    const pending = await Diploma.count({ where: { status: 'pending' } });
    
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

// ========== FUNGSI CRUD ==========

exports.deleteDiploma = async (req, res) => {
  try {
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
        message: 'Tidak dapat menghapus ijazah yang sudah di-mint'
      });
    }

    if (diploma.path_file && fs.existsSync(diploma.path_file)) {
      fs.unlinkSync(diploma.path_file);
    }

    await diploma.destroy();

    res.json({
      success: true,
      message: 'Ijazah berhasil dihapus'
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

exports.updateDiploma = async (req, res) => {
  try {
    const diploma = await Diploma.findByPk(req.params.id);
    if (!diploma) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah tidak ditemukan'
      });
    }

    let updateData = { ...req.body };
    if (updateData.tanggal_lulus && updateData.tanggal_lulus.includes('/')) {
      const parts = updateData.tanggal_lulus.split('/');
      if (parts.length === 3) {
        updateData.tanggal_lulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    if (updateData.ipk) {
      updateData.ipk = parseFloat(updateData.ipk);
    }

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

exports.softDeleteDiploma = async (req, res) => {
  try {
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
        message: 'Tidak dapat menghapus ijazah yang sudah di-mint'
      });
    }

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
        npm: diploma.npm,
        status: diploma.status,
        verification_notes: diploma.verification_notes
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

exports.healthCheck = async (req, res) => {
  try {
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