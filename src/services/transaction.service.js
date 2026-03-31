const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { AppError } = require('../utils/response');

const buildTransactionFilter = (query) => {
  const filter = {};
  if (query.type) filter.type = query.type.toUpperCase();
  if (query.productId) filter.productId = query.productId;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  return filter;
};

const createPurchase = async ({ productId, quantity, price, note, date }, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError('Product not found.', 404);

    const purchasePrice = price !== undefined ? price : product.costPrice;

    const transaction = await Transaction.create(
      [
        {
          type: 'PURCHASE',
          productId,
          quantity,
          price: purchasePrice,
          totalAmount: quantity * purchasePrice,
          note,
          date: date || new Date(),
          createdBy: userId,
        },
      ],
      { session }
    );

    // Increase product stock
    product.quantity += quantity;
    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    return (await Transaction.findById(transaction[0]._id).populate('productId', 'name sku')).toObject();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const createSale = async ({ productId, quantity, price, note, date }, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new AppError('Product not found.', 404);

    if (product.quantity < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`,
        400
      );
    }

    const salePrice = price !== undefined ? price : product.sellingPrice;

    const transaction = await Transaction.create(
      [
        {
          type: 'SALE',
          productId,
          quantity,
          price: salePrice,
          totalAmount: quantity * salePrice,
          note,
          date: date || new Date(),
          createdBy: userId,
        },
      ],
      { session }
    );

    // Decrease product stock
    product.quantity -= quantity;
    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    return (await Transaction.findById(transaction[0]._id).populate('productId', 'name sku')).toObject();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllTransactions = async (query) => {
  const filter = buildTransactionFilter(query);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sort = { date: -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('productId', 'name sku category')
      .populate('createdBy', 'name email')
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id)
    .populate('productId', 'name sku category costPrice sellingPrice')
    .populate('createdBy', 'name email')
    .lean();

  if (!transaction) throw new AppError('Transaction not found.', 404);
  return transaction;
};

module.exports = { createPurchase, createSale, getAllTransactions, getTransactionById };
