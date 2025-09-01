// const Joi = require('joi');

// const validateRegistration = (req, res, next) => {
//   const schema = Joi.object({
//     sector: Joi.string().required().trim(),
//     fullname: Joi.string().required().trim(),
//     position: Joi.string().required().trim(),
//     email: Joi.string().email().required().lowercase().trim(),
//     password: Joi.string().min(8).required(),
//     role: Joi.string().valid('admin', 'staff').default('staff')
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message
//     });
//   }

//   next();
// };

// const validateLogin = (req, res, next) => {
//   const schema = Joi.object({
//     email: Joi.string().email().required().lowercase().trim(),
//     password: Joi.string().required()
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message
//     });
//   }

//   next();
// };

// const validateSinnerRecord = (req, res, next) => {
//   const schema = Joi.object({
//     identification_type: Joi.string().valid('rwandan', 'foreign_refugee', 'none').required(),
//     national_id: Joi.string().when('identification_type', {
//       is: 'rwandan',
//       then: Joi.required(),
//       otherwise: Joi.optional()
//     }),
//     passport_id: Joi.string().when('identification_type', {
//       is: Joi.not('rwandan'),
//       then: Joi.required(),
//       otherwise: Joi.optional()
//     }),
//     first_name: Joi.string().required().trim(),
//     last_name: Joi.string().required().trim(),
//     marital_status: Joi.string().optional(),
//     gender: Joi.string().valid('Male', 'Female').required(),
//     date_of_birth: Joi.date().optional(),
//     country: Joi.string().optional().trim(),
//     district: Joi.string().optional().trim(),
//     cell: Joi.string().optional().trim(),
//     village: Joi.string().optional().trim(),
//     crime_type: Joi.string().required().trim(),
//     description: Joi.string().required().trim()
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message
//     });
//   }

//   next();
// };

// const validateVictimRecord = (req, res, next) => {
//   const schema = Joi.object({
//     identification_type: Joi.string().valid('rwandan', 'foreign_refugee', 'none').required(),
//     national_id: Joi.string().when('identification_type', {
//       is: 'rwandan',
//       then: Joi.required(),
//       otherwise: Joi.optional()
//     }),
//     first_name: Joi.string().required().trim(),
//     last_name: Joi.string().required().trim(),
//     address: Joi.string().required().trim(),
//     marital_status: Joi.string().optional(),
//     gender: Joi.string().valid('Male', 'Female').required(),
//     sinner_identification: Joi.string().required().trim(),
//     crime_type: Joi.string().required().trim(),
//     evidence: Joi.string().required().trim(),
//     date_committed: Joi.date().required(),
//     phone: Joi.string().required().trim(),
//     victim_email: Joi.string().email().optional()
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message
//     });
//   }

//   next();
// };

// const validateNotification = (req, res, next) => {
//   const schema = Joi.object({
//     near_rib: Joi.string().required().trim(),
//     fullname: Joi.string().required().trim(),
//     address: Joi.string().required().trim(),
//     phone: Joi.string().required().trim(),
//     message: Joi.string().required().trim()
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message
//     });
//   }

//   next();
// };

// module.exports = {
//   validateRegistration,
//   validateLogin,
//   validateSinnerRecord,
//   validateVictimRecord,
//   validateNotification
// };



const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    sector: Joi.string().required().trim(),
    fullname: Joi.string().required().trim(),
    position: Joi.string().required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'staff').default('staff')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Updated validation for criminal_record table
const validateCriminalRecord = (req, res, next) => {
  const schema = Joi.object({
    id_type: Joi.string().valid('indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport').required(),
    id_number: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    address_now: Joi.string().required().trim(),
    crime_type: Joi.string().required().trim(),
    description: Joi.string().optional().allow('').trim(),
    date_committed: Joi.date().optional(),
    victim_id: Joi.number().integer().optional().allow(null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Updated validation for victim table
const validateVictimRecord = (req, res, next) => {
  console.log('Validating victim record:', req.body);
  
  const schema = Joi.object({
    id_type: Joi.string().valid('indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport').required(),
    id_number: Joi.string().required().trim(),
    address_now: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    victim_email: Joi.string().email().optional().allow('').trim(),
    marital_status: Joi.string().valid('Single', 'Married', 'Widower', 'Divorce').optional(),
    sinner_identification: Joi.string().required().trim(),
    crime_type: Joi.string().required().trim(),
    evidence: Joi.string().required().trim(),
    date_committed: Joi.date().required(),
    criminal_id: Joi.number().integer().optional().allow(null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

const validateNotification = (req, res, next) => {
  const schema = Joi.object({
    near_rib: Joi.string().required().trim(),
    fullname: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    message: Joi.string().required().trim()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Additional validation for updating criminal records (excluding auto-filled fields)
const validateCriminalRecordUpdate = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().optional().trim(),
    address_now: Joi.string().optional().trim(),
    crime_type: Joi.string().optional().trim(),
    description: Joi.string().optional().allow('').trim(),
    date_committed: Joi.date().optional(),
    victim_id: Joi.number().integer().optional().allow(null)
  }).min(1);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Additional validation for updating victim records (excluding auto-filled fields)
const validateVictimRecordUpdate = (req, res, next) => {
  const schema = Joi.object({
    address_now: Joi.string().optional().trim(),
    phone: Joi.string().optional().trim(),
    victim_email: Joi.string().email().optional().allow('').trim(),
    marital_status: Joi.string().valid('Single', 'Married', 'Widower', 'Divorce').optional(),
    sinner_identification: Joi.string().optional().trim(),
    crime_type: Joi.string().optional().trim(),
    evidence: Joi.string().optional().trim(),
    date_committed: Joi.date().optional(),
    criminal_id: Joi.number().integer().optional().allow(null)
  }).min(1);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Validation for search parameters
const validateSearchId = (req, res, next) => {
  const schema = Joi.object({
    idNumber: Joi.string().required().trim().min(1)
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Valid ID number is required'
    });
  }

  next();
};

// Validation for pagination parameters
const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    crime_type: Joi.string().optional().trim(),
    gender: Joi.string().valid('Male', 'Female').optional()
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.query = value;
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCriminalRecord,
  validateVictimRecord,
  validateNotification,
  validateCriminalRecordUpdate,
  validateVictimRecordUpdate,
  validateSearchId,
  validatePagination
};