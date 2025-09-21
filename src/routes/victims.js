const express = require('express');
const router = express.Router();
const victimController = require('../controllers/victimController');
const { auth } = require('../middleware/auth');
const { 
  validateVictimRecord, 
  validateVictimRecordUpdate,
  validatePagination,
  validateSearchId
} = require('../middleware/validation');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');

// Public download routes (no authentication required)
router.get('/download/evidence/:filename', victimController.getEvidenceFile);
router.get('/:vicId/download/evidence', victimController.downloadVictimEvidence);
router.get('/:vicId/download/evidence/:fileIndex', victimController.downloadVictimEvidenceFile);

router.use(auth);

// Statistics and recent data routes (must come before :id routes)
router.get('/statistics', victimController.getVictimStatistics);
router.get('/recent', victimController.getRecentVictims);

// Search routes
router.get('/search/:idNumber', validateSearchId, victimController.searchVictimByIdNumber);

// File upload routes for evidence
router.post('/upload-evidence', uploadSingle, handleUploadError, victimController.uploadEvidence);
router.post('/upload-multiple-evidence', uploadMultiple, handleUploadError, victimController.uploadMultipleEvidence);
router.post('/:victimId/upload-evidence', uploadMultiple, handleUploadError, victimController.uploadVictimEvidence);

// CRUD routes
router.post('/', uploadMultiple, validateVictimRecord, victimController.addVictim);
router.get('/', validatePagination, victimController.getAllVictims);
router.get('/:id', victimController.getVictimById);
router.put('/:id', validateVictimRecordUpdate, victimController.updateVictim);
router.delete('/:id', victimController.deleteVictim);

module.exports = router;