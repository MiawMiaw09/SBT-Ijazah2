const express = require('express');
const router = express.Router();
const diplomaController = require('../controllers/diplomaController');
const { upload } = require('../middleware/uploadMiddleware');

// @route   POST /api/diplomas/upload
// @desc    Upload ijazah baru
router.post('/upload', 
  upload.single('ijazah_file'),
  diplomaController.uploadDiploma
);

// @route   GET /api/diplomas
// @desc    Get semua ijazah
router.get('/', diplomaController.getAllDiplomas);

// @route   GET /api/diplomas/pending
// @desc    Get ijazah yang pending
router.get('/pending', diplomaController.getPendingDiplomas);

// @route   GET /api/diplomas/:id
// @desc    Get ijazah by ID
router.get('/:id', diplomaController.getDiplomaById);

// @route   GET /api/diplomas/npm/:npm
// @desc    Get ijazah by NPM
router.get('/npm/:npm', diplomaController.getDiplomaByNpm);

// @route   GET /api/diplomas/verify/:npm
// @desc    Verify keaslian ijazah
router.get('/verify/:npm', diplomaController.verifyDiploma);

// @route   GET /api/diplomas/certificate/:certificateId
// @desc    Get ijazah by certificate ID (untuk verifikasi publik)
router.get('/certificate/:certificateId', diplomaController.getDiplomaByCertificateId);

// @route   PUT /api/diplomas/mint/:id
// @desc    Mark ijazah sebagai minted (SBT)
router.put('/mint/:id', diplomaController.mintDiploma);

// ========== STATISTICS ROUTES ==========

// @route   GET /api/diplomas/stats/dashboard
// @desc    Get dashboard statistics (dengan persentase)
router.get('/stats/dashboard', diplomaController.getDashboardStats);

// @route   GET /api/diplomas/stats
// @desc    Get basic statistics (tanpa persentase)
router.get('/stats', diplomaController.getStatistics);

// ========== CRUD & UTILITY ROUTES ==========

// @route   DELETE /api/diplomas/:id
// @desc    Hapus ijazah (hard delete)
router.delete('/:id', diplomaController.deleteDiploma);

// @route   PUT /api/diplomas/:id
// @desc    Update data ijazah
router.put('/:id', diplomaController.updateDiploma);

// @route   PUT /api/diplomas/:id/soft-delete
// @desc    Soft delete ijazah (ubah status menjadi rejected)
router.put('/:id/soft-delete', diplomaController.softDeleteDiploma);

// @route   GET /api/diplomas/status/:status
// @desc    Get ijazah berdasarkan status
router.get('/status/:status', diplomaController.getDiplomasByStatus);

// @route   GET /api/diplomas/health
// @desc    Health check endpoint
router.get('/health', diplomaController.healthCheck);

module.exports = router;