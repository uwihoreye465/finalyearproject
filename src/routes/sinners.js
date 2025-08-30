const express = require('express');
const router = express.Router();
const SinnerController = require('../controllers/sinnerController');
const { body } = require('express-validator');

// Validation middleware for creating/updating sinners
const sinnerValidation = [
  body('id_type')
    .isIn(['indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport'])
    .withMessage('Invalid ID type'),
  body('id_number')
    .notEmpty()
    .withMessage('ID number is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('ID number must be between 5 and 20 characters'),
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('gender')
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
  body('crime_type')
    .notEmpty()
    .withMessage('Crime type is required'),
  body('date_committed')
    .isDate()
    .withMessage('Valid date of crime commission is required')
];

// Routes
router.post('/', sinnerValidation, SinnerController.createSinner);
router.get('/', SinnerController.getAllSinners);
router.get('/:id', SinnerController.getSinnerById);
router.get('/id-number/:idNumber', SinnerController.getSinnerByIdNumber);
router.put('/:id', SinnerController.updateSinner);
router.delete('/:id', SinnerController.deleteSinner);

module.exports = router;