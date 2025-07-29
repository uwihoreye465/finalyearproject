const express = require('express');
const router = express.Router();
const victimController = require('../controllers/victimController');
const { auth } = require('../middleware/auth');
const { validateVictimRecord } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

router.post('/', validateVictimRecord, victimController.addVictim);
router.get('/', victimController.getAllVictims);
router.get('/:id', victimController.getVictimById);
router.put('/:id', victimController.updateVictim);
router.delete('/:id', victimController.deleteVictim);

module.exports = router;