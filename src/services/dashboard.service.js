const dashboardService = require('../services/dashbaord.service');
const { sendSuccess } = require('../utils/response');

const getDashboardOverview = async (req, res, next) => {
  try {
    const overview = await dashboardService.getDashboardOverview();
    return sendSuccess(res, 200, 'Dashboard overview fetched.', { overview });
  } catch (error) {
    next(error);
  }
};
const getSalesVsPurchase = async (req, res, next) => {
  try {
    const comparison = await dashboardService.getSalesVsPurchase();
    return sendSuccess(res, 200, 'Sales vs purchase fetched.', { comparison });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getSalesVsPurchase,
};
