const Product = require('../models/Product');
const { AppError } = require('../utils/response');

const buildProductQuery = (query) => {
  const filter = {};
  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.search) filter.name = new RegExp(query.search, 'i');
  if (query.sku) filter.sku = new RegExp(query.sku, 'i');
  if (query.minPrice) filter.sellingPrice = { $gte: Number(query.minPrice) };
  if (query.maxPrice) {
    filter.sellingPrice = { ...filter.sellingPrice, $lte: Number(query.maxPrice) };
  }
  return filter;
};

const getAllProducts = async (query, userId) => {
  const filter = buildProductQuery(query);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id).lean({ virtuals: true });
  if (!product) throw new AppError('Product not found.', 404);
  return product;
};

const createProduct = async (data, userId) => {
  const existing = await Product.findOne({ sku: data.sku.toUpperCase() });
  if (existing) throw new AppError(`SKU '${data.sku}' already exists.`, 409);

  const product = await Product.create({ ...data, createdBy: userId });
  return product.toObject({ virtuals: true });
};

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean({ virtuals: true });

  if (!product) throw new AppError('Product not found.', 404);
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found.', 404);
  return true;
};

const adjustStock = async (id, quantity, note, userId) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404);

  const newQty = product.quantity + quantity;
  if (newQty < 0) {
    throw new AppError(
      `Insufficient stock. Current stock: ${product.quantity}, adjustment: ${quantity}`,
      400
    );
  }

  product.quantity = newQty;
  await product.save();
  return product.toObject({ virtuals: true });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
};
