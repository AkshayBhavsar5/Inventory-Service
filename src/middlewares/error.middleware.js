const mongoose = require('mongoose');
const { sendError } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Mongoose: Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
    return sendError(res, 422, message, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
    statusCode = 401;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${err.stack}`);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorMiddleware;
