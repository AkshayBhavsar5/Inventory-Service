const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return sendError(res, 422, 'Validation failed', errors);
  }

  req.body = value;
  next();
};

module.exports = validate;
