const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 201, 'User registered successfully.', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 200, 'Login successful.', result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return sendSuccess(res, 200, 'User profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
