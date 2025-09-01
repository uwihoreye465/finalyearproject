

// const express = require('express');
// const router = express.Router();
// const VictimController = require('../controllers/victimController');
// const { body } = require('express-validator');

// // Validation middleware for creating/updating victims
// const victimValidation = [
//   body('id_type')
//     .isIn(['indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport'])
//     .withMessage('Invalid ID type'),
//   body('id_number')
//     .notEmpty()
//     .withMessage('ID number is required')
//     .isLength({ min: 5, max: 20 })
//     .withMessage('ID number must be between 5 and 20 characters'),
//   body('first_name')
//     .notEmpty()
//     .withMessage('First name is required')
//     .isLength({ min: 2, max: 50 })
//     .withMessage('First name must be between 2 and 50 characters'),
//   body('last_name')
//     .notEmpty()
//     .withMessage('Last name is required')
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Last name must be between 2 and 50 characters'),
//   body('gender')
//     .isIn(['Male', 'Female'])
//     .withMessage('Gender must be Male or Female'),
//   body('crime_type')
//     .notEmpty()
//     .withMessage('Crime type is required'),
//   body('date_committed')
//     .isDate()
//     .withMessage('Valid date of crime commission is required')
// ];

// // Routes
// router.post('/', victimValidation, VictimController.createVictim);
// router.get('/', VictimController.getAllVictims);
// router.get('/:id', VictimController.getVictimById);
// router.get('/id-number/:idNumber', VictimController.getVictimByIdNumber);
// router.put('/:id', VictimController.updateVictim);
// router.delete('/:id', VictimController.deleteVictim);

// module.exports = router;


const express = require('express');
const router = express.Router();
const victimController = require('../controllers/victimController');
const { auth } = require('../middleware/auth');
const { 
  validateVictimRecord, 
  validateVictimRecordUpdate,
  validatePagination 
} = require('../middleware/validation');

// All routes require authentication
router.use(auth);

router.post('/', validateVictimRecord, victimController.addVictim);
router.get('/', validatePagination, victimController.getAllVictims);
router.get('/:id', victimController.getVictimById);
router.put('/:id', validateVictimRecordUpdate, victimController.updateVictim);
router.delete('/:id', victimController.deleteVictim);

module.exports = router;