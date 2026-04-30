const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

// overall data only
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/sales-vs-purchase', dashboardController.getSalesVsPurchase);
router.get(
  '/top-performing-products',
  dashboardController.getTopPerformingProducts,
);

module.exports = router;
