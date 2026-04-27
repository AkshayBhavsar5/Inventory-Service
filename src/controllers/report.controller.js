report.controller.js;

const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response');

const getOverview = async (req, res, next) => {
  try {
    const report = await reportService.getOverview(req.query);
    return sendSuccess(res, 200, 'Overview report fetched.', { report });
  } catch (error) {
    next(error);
  }
};

// const getProductReport = async (req, res, next) => {
//   try {
//     const report = await reportService.getProductReport(req.params.id, req.query);
//     return sendSuccess(res, 200, 'Product report fetched.', { report });
//   } catch (error) {
//     next(error);
//   }
// };

const getBestSellingProducts = async (req, res, next) => {
  try {
    const products = await reportService.getBestSellingProducts(req.query);
    return sendSuccess(res, 200, 'Best selling products fetched.', {
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const trends = await reportService.getTrends(req.query);
    return sendSuccess(res, 200, 'Trends report fetched.', { trends });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getBestSellingProducts,
  getTrends,
};
