const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} = require('../validators/product.validator');

// All product routes require authentication
router.use(protect);

// GET /api/products
router.get('/', productController.getAllProducts);

// POST /api/products  (admin only)
router.post('/', authorize('admin'), validate(createProductSchema), productController.createProduct);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// PUT /api/products/:id  (admin only)
router.put('/:id', authorize('admin'), validate(updateProductSchema), productController.updateProduct);

// DELETE /api/products/:id  (admin only)
router.delete('/:id', authorize('admin'), productController.deleteProduct);

// PATCH /api/products/:id/stock  (admin only)
router.patch('/:id/stock', authorize('admin'), validate(adjustStockSchema), productController.adjustStock);

module.exports = router;
