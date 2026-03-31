const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { purchaseSchema, saleSchema } = require('../validators/transaction.validator');

// All transaction routes require authentication
router.use(protect);

// POST /api/transactions/purchase
router.post('/purchase', authorize('admin'), validate(purchaseSchema), transactionController.purchase);

// POST /api/transactions/sale
router.post('/sale', authorize('admin'), validate(saleSchema), transactionController.sale);

// GET /api/transactions
router.get('/', transactionController.getAllTransactions);

// GET /api/transactions/:id
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
