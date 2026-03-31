const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Product name is required',
  }),
  sku: Joi.string().trim().uppercase().alphanum().min(2).max(30).required().messages({
    'string.empty': 'SKU is required',
    'string.alphanum': 'SKU must contain only letters and numbers',
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Category is required',
  }),
  description: Joi.string().trim().max(500).optional().allow(''),
  costPrice: Joi.number().min(0).required().messages({
    'number.base': 'Cost price must be a number',
    'number.min': 'Cost price cannot be negative',
    'any.required': 'Cost price is required',
  }),
  sellingPrice: Joi.number().min(0).required().messages({
    'number.base': 'Selling price must be a number',
    'number.min': 'Selling price cannot be negative',
    'any.required': 'Selling price is required',
  }),
  quantity: Joi.number().integer().min(0).default(0),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  category: Joi.string().trim().min(2).max(50).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  costPrice: Joi.number().min(0).optional(),
  sellingPrice: Joi.number().min(0).optional(),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

const adjustStockSchema = Joi.object({
  quantity: Joi.number().integer().required().messages({
    'number.base': 'Quantity must be a number',
    'any.required': 'Quantity is required',
  }),
  note: Joi.string().trim().max(200).optional().allow(''),
});

module.exports = { createProductSchema, updateProductSchema, adjustStockSchema };
