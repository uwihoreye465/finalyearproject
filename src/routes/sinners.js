const express = require('express');
const router = express.Router();
const sinnerController = require('../controllers/sinnerController');
const { auth } = require('../middleware/auth');
const { validateSinnerRecord } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

router.get('/search/:nationalId', sinnerController.searchSinner);
router.get('/', sinnerController.getAllSinners);
router.post('/', validateSinnerRecord, sinnerController.addSinner);
router.put('/:id', sinnerController.updateSinner);
router.delete('/:id', sinnerController.deleteSinner);

module.exports = router;