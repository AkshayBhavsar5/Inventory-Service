const productService = require('../services/product.service');
const { sendSuccess } = require('../utils/response');

const getAllProducts = async (req, res, next) => {
  try {
    const { products, meta } = await productService.getAllProducts(req.query, req.user._id);
    return sendSuccess(res, 200, 'Products fetched successfully.', { products }, meta);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, 200, 'Product fetched successfully.', { product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user._id);
    return sendSuccess(res, 201, 'Product created successfully.', { product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, 200, 'Product updated successfully.', { product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return sendSuccess(res, 200, 'Product deleted successfully.', {});
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;
    const product = await productService.adjustStock(req.params.id, quantity, note, req.user._id);
    return sendSuccess(res, 200, 'Stock adjusted successfully.', { product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
};
