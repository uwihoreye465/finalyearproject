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

// Enhanced victim validation with better debugging
const validateVictimRecord = (req, res, next) => {
  console.log('🔍 Validating victim record - Raw body:', req.body);
  console.log('🔍 Headers - Content-Type:', req.get('Content-Type'));
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request URL:', req.url);
  
  // Check if body is empty
  if (Object.keys(req.body).length === 0) {
    console.log('❌ ERROR: Request body is empty!');
    console.log('❌ Possible causes:');
    console.log('   - Missing Content-Type: application/json header');
    console.log('   - Body parsing middleware not working');
    console.log('   - Another middleware clearing the body');
    console.log('   - Postman sending data in wrong format');
    
    return res.status(400).json({
      success: false,
      message: 'Request body cannot be empty. Please ensure: 1) Content-Type: application/json header is set, 2) You are sending valid JSON data',
      details: {
        receivedBody: req.body,
        contentType: req.get('Content-Type'),
        method: req.method,
        url: req.url
      }
    });
  }

  const schema = Joi.object({
    id_type: Joi.string()
      .valid('indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport')
      .required()
      .messages({
        'any.required': '"id_type" is required',
        'any.only': '"id_type" must be one of: indangamuntu_yumunyarwanda, indangamuntu_yumunyamahanga, indangampunzi, passport'
      }),
    id_number: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"id_number" cannot be empty',
        'any.required': '"id_number" is required'
      }),
    address_now: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"address_now" cannot be empty',
        'any.required': '"address_now" is required'
      }),
    phone: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"phone" cannot be empty',
        'any.required': '"phone" is required'
      }),
    victim_email: Joi.string()
      .email()
      .optional()
      .allow('')
      .trim()
      .messages({
        'string.email': '"victim_email" must be a valid email'
      }),
    sinner_identification: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"sinner_identification" cannot be empty',
        'any.required': '"sinner_identification" is required'
      }),
    crime_type: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"crime_type" cannot be empty',
        'any.required': '"crime_type" is required'
      }),
    evidence: Joi.string()
      .required()
      .trim()
      .messages({
        'string.empty': '"evidence" cannot be empty',
        'any.required': '"evidence" is required'
      }),
    date_committed: Joi.date()
      .required()
      .messages({
        'date.base': '"date_committed" must be a valid date',
        'any.required': '"date_committed" is required'
      }),
    criminal_id: Joi.number()
      .integer()
      .optional()
      .allow(null)
      .messages({
        'number.base': '"criminal_id" must be a number'
      })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    console.log('❌ Validation errors:', error.details);
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      receivedData: req.body
    });
  }

  // Replace req.body with validated and cleaned data
  req.body = value;
  console.log('✅ Validation passed - Cleaned data:', req.body);
  next();
};

// FIXED: Criminal record update validation - only allow updatable fields
const validateCriminalRecordUpdate = (req, res, next) => {
  console.log('🔍 Validating criminal record update:', req.body);
  
  const schema = Joi.object({
    // Only fields that can be manually updated
    phone: Joi.string().optional().trim(),
    address_now: Joi.string().optional().trim(),
    crime_type: Joi.string().optional().trim(),
    description: Joi.string().optional().allow('').trim(),
    date_committed: Joi.date().optional(),
    victim_id: Joi.number().integer().optional().allow(null)
    // DO NOT include id_type - it's immutable after creation
  }).min(1);

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

// FIXED: Victim update validation - only allow updatable fields
// FIXED: Victim update validation - only allow updatable fields
const validateVictimRecordUpdate = (req, res, next) => {
  console.log('🔍 Validating victim record update:', req.body);
  
  const schema = Joi.object({
    // Only fields that can be manually updated
    address_now: Joi.string().optional().trim()
      .messages({
        'string.empty': '"address_now" cannot be empty if provided'
      }),
    phone: Joi.string().optional().trim()
      .messages({
        'string.empty': '"phone" cannot be empty if provided'
      }),
    victim_email: Joi.string().email().optional().allow('').trim()
      .messages({
        'string.email': '"victim_email" must be a valid email if provided'
      }),
    sinner_identification: Joi.string().optional().trim()
      .messages({
        'string.empty': '"sinner_identification" cannot be empty if provided'
      }),
    crime_type: Joi.string().optional().trim()
      .messages({
        'string.empty': '"crime_type" cannot be empty if provided'
      }),
    evidence: Joi.string().optional().trim()
      .messages({
        'string.empty': '"evidence" cannot be empty if provided'
      }),
    date_committed: Joi.date().optional()
      .messages({
        'date.base': '"date_committed" must be a valid date if provided'
      }),
    criminal_id: Joi.number().integer().optional().allow(null)
      .messages({
        'number.base': '"criminal_id" must be a number if provided'
      })
  }).min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
    'any.unknown': 'Field "{{#label}}" is not allowed for update. Only address_now, phone, victim_email, sinner_identification, crime_type, evidence, date_committed, and criminal_id can be updated.'
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    console.log('❌ Validation errors:', error.details);
    
    // Check if the error is about restricted fields
    const restrictedFieldError = error.details.find(detail => 
      detail.context?.key && ['id_type', 'id_number', 'first_name', 'last_name', 'gender', 'date_of_birth', 'province', 'district', 'marital_status'].includes(detail.context.key)
    );

    if (restrictedFieldError) {
      return res.status(400).json({
        success: false,
        message: `"${restrictedFieldError.context.key}" cannot be updated. Personal details are auto-filled from ID records.`
      });
    }

    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessage,
      details: error.details
    });
  }

  // Replace req.body with validated and cleaned data
  req.body = value;
  console.log('✅ Validation passed - Cleaned update data:', req.body);
  next();
};


// Enhanced validation to detect wrong request body
const validateUserApproval = (req, res, next) => {
  console.log('🔍 Validating user approval:', req.body);
  
  // Check if the request body looks like registration data instead of approval
  if (req.body.sector || req.body.fullname || req.body.position || req.body.email || req.body.password) {
    console.log('❌ Wrong request body detected - looks like registration data');
    return res.status(400).json({
      success: false,
      message: 'Wrong request format. For approval, send only { "approved": true/false }'
    });
  }

  const schema = Joi.object({
    approved: Joi.alternatives()
      .try(
        Joi.boolean().required(),
        Joi.string().valid('true', 'false', '1', '0').required()
      )
      .messages({
        'alternatives.types': '"approved" must be either a boolean or string "true"/"false"',
        'any.required': '"approved" is required'
      })
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    console.log('❌ Validation errors:', error.details);
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }

  // Convert string to boolean if needed
  if (typeof value.approved === 'string') {
    if (value.approved === 'true' || value.approved === '1') {
      value.approved = true;
    } else if (value.approved === 'false' || value.approved === '0') {
      value.approved = false;
    }
  }

  req.body = value;
  console.log('✅ Validation passed:', req.body);
  next();
};

// Other validation functions remain the same but with added logging
const validateRegistration = (req, res, next) => {
  console.log('🔍 Validating registration:', req.body);
  
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
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  console.log('🔍 Validating login:', req.body);
  
  const schema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
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

const validateCriminalRecord = (req, res, next) => {
  console.log('🔍 Validating criminal record:', req.body);
  
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
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

const validateNotification = (req, res, next) => {
  console.log('🔍 Validating notification:', req.body);
  
  const schema = Joi.object({
    near_rib: Joi.string().required().trim(),
    fullname: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    message: Joi.string().required().trim()
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

const validateSearchId = (req, res, next) => {
  console.log('🔍 Validating search ID:', req.params);
  
  const schema = Joi.object({
    idNumber: Joi.string().required().trim().min(1)
  });

  const { error } = schema.validate(req.params);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: 'Valid ID number is required'
    });
  }

  next();
};


const validatePagination = (req, res, next) => {
  console.log('🔍 Validating pagination:', req.query);
  
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    crime_type: Joi.string().optional().allow('').trim(),
    gender: Joi.string().valid('Male', 'Female').optional().allow(''),
    search: Joi.string().optional().allow('').trim()
  });

  const { error, value } = schema.validate(req.query);
  if (error) {
    console.log('Validation error:', error.details[0].message);
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