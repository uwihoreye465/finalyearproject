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

router.use(auth);

// Statistics and recent data routes (must come before :id routes)
router.get('/statistics', criminalRecordController.getCriminalRecordStatistics);
router.get('/recent', criminalRecordController.getRecentCriminalRecords);

// Search routes
router.get('/search/:idNumber', validateSearchId, criminalRecordController.searchPerson);

// CRUD routes
router.get('/', validatePagination, criminalRecordController.getAllCriminalRecords);
router.post('/', validateCriminalRecord, criminalRecordController.addCriminalRecord);
router.get('/:id', criminalRecordController.getCriminalRecordById);
router.put('/:id', validateCriminalRecordUpdate, criminalRecordController.updateCriminalRecord);
router.delete('/:id', criminalRecordController.deleteCriminalRecord);

module.exports = router;