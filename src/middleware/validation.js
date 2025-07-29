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

const validateSinnerRecord = (req, res, next) => {
  const schema = Joi.object({
    identification_type: Joi.string().valid('rwandan', 'foreign_refugee', 'none').required(),
    national_id: Joi.string().when('identification_type', {
      is: 'rwandan',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    passport_id: Joi.string().when('identification_type', {
      is: Joi.not('rwandan'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    first_name: Joi.string().required().trim(),
    last_name: Joi.string().required().trim(),
    marital_status: Joi.string().optional(),
    gender: Joi.string().valid('Male', 'Female').required(),
    date_of_birth: Joi.date().optional(),
    country: Joi.string().optional().trim(),
    district: Joi.string().optional().trim(),
    cell: Joi.string().optional().trim(),
    village: Joi.string().optional().trim(),
    crime_type: Joi.string().required().trim(),
    description: Joi.string().required().trim()
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

const validateVictimRecord = (req, res, next) => {
  const schema = Joi.object({
    identification_type: Joi.string().valid('rwandan', 'foreign_refugee', 'none').required(),
    national_id: Joi.string().when('identification_type', {
      is: 'rwandan',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    first_name: Joi.string().required().trim(),
    last_name: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
    marital_status: Joi.string().optional(),
    gender: Joi.string().valid('Male', 'Female').required(),
    sinner_identification: Joi.string().required().trim(),
    crime_type: Joi.string().required().trim(),
    evidence: Joi.string().required().trim(),
    date_committed: Joi.date().required(),
    phone: Joi.string().required().trim(),
    victim_email: Joi.string().email().optional()
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

module.exports = {
  validateRegistration,
  validateLogin,
  validateSinnerRecord,
  validateVictimRecord,
  validateNotification
};