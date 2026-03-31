const Joi = require('joi');

const purchaseSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Product ID is required',
    'string.length': 'Invalid product ID format',
    'string.hex': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  price: Joi.number().min(0).optional(),
  note: Joi.string().trim().max(200).optional().allow(''),
  date: Joi.date().iso().optional(),
});

const saleSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Product ID is required',
    'string.length': 'Invalid product ID format',
    'string.hex': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  price: Joi.number().min(0).optional(),
  note: Joi.string().trim().max(200).optional().allow(''),
  date: Joi.date().iso().optional(),
});

module.exports = { purchaseSchema, saleSchema };
