const dashboardService = require('../services/dashbaord.service');
const { sendSuccess } = require('../utils/response');

getDashboardOverview = async (req, res, next) => {
  try {
    const overview = await dashboardService.getDashboardOverview();
    return sendSuccess(res, 200, 'Dashboard overview fetched.', {
      overview,
    });
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

const getTopPerformingProducts = async (req, res, next) => {
  try {
    const products = await dashboardService.getTopPerformingProducts(req.query);
    return sendSuccess(res, 200, 'Top performing products fetched.', {
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getSalesVsPurchase,
  getTopPerformingProducts,
};
