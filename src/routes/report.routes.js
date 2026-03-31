const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');

// All report routes require authentication
router.use(protect);

// GET /api/reports/overview?startDate=&endDate=
router.get('/overview', reportController.getOverview);

// GET /api/reports/product/:id?startDate=&endDate=
router.get('/product/:id', reportController.getProductReport);

// GET /api/reports/trends?startDate=&endDate=&groupBy=day|month|year
router.get('/trends', reportController.getTrends);

module.exports = router;
