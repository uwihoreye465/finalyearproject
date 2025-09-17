// const express = require('express');
// const router = express.Router();
// const criminalRecordController = require('../controllers/criminalRecordController');
// const { auth } = require('../middleware/auth');
// const { 
//   validateCriminalRecord, 
//   validateCriminalRecordUpdate,
//   validateSearchId,
//   validatePagination 
// } = require('../middleware/validation');

// // All routes require authentication
// router.use(auth);

// router.get('/search/:idNumber', validateSearchId, criminalRecordController.searchPerson);
// router.get('/', validatePagination, criminalRecordController.getAllCriminalRecords);
// router.post('/', validateCriminalRecord, criminalRecordController.addCriminalRecord);
// router.get('/:id', criminalRecordController.getCriminalRecordById);
// router.put('/:id', validateCriminalRecordUpdate, criminalRecordController.updateCriminalRecord);
// router.delete('/:id', criminalRecordController.deleteCriminalRecord);

// module.exports = router;


const express = require('express');
const router = express.Router();
const criminalRecordController = require('../controllers/criminalRecordController');
const { auth } = require('../middleware/auth');
const { 
  validateCriminalRecord, 
  validateCriminalRecordUpdate,
  validateSearchId,
  validatePagination 
} = require('../middleware/validation');

// Public routes (no authentication required)
// Search routes
router.get('/search/:idNumber', validateSearchId, criminalRecordController.searchPerson);
// Get all criminal records
router.get('/', validatePagination, criminalRecordController.getAllCriminalRecords);

// Protected routes (require authentication)
// Statistics and recent data routes (must come before :id routes)
router.get('/statistics', auth, criminalRecordController.getCriminalRecordStatistics);
router.get('/recent', auth, criminalRecordController.getRecentCriminalRecords);

// CRUD routes
router.get('/:id', auth, criminalRecordController.getCriminalRecordById);
router.post('/', auth, validateCriminalRecord, criminalRecordController.addCriminalRecord);
router.put('/:id', auth, validateCriminalRecordUpdate, criminalRecordController.updateCriminalRecord);
router.delete('/:id', auth, criminalRecordController.deleteCriminalRecord);

module.exports = router;