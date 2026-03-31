const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const getOverview = async (query) => {
  const matchStage = {};
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const [summary, stockSummary] = await Promise.all([
    Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$totalAmount' },
          totalQty: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalStockValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          totalProducts: { $sum: 1 },
          totalStockQty: { $sum: '$quantity' },
        },
      },
    ]),
  ]);

  const result = {
    totalSales: 0,
    totalPurchases: 0,
    salesCount: 0,
    purchasesCount: 0,
    totalSalesQty: 0,
    totalPurchasesQty: 0,
    profitOrLoss: 0,
    totalStockValue: stockSummary[0]?.totalStockValue || 0,
    totalProducts: stockSummary[0]?.totalProducts || 0,
    totalStockQty: stockSummary[0]?.totalStockQty || 0,
  };

  summary.forEach((item) => {
    if (item._id === 'SALE') {
      result.totalSales = item.totalAmount;
      result.salesCount = item.count;
      result.totalSalesQty = item.totalQty;
    }
    if (item._id === 'PURCHASE') {
      result.totalPurchases = item.totalAmount;
      result.purchasesCount = item.count;
      result.totalPurchasesQty = item.totalQty;
    }
  });

  result.profitOrLoss = parseFloat((result.totalSales - result.totalPurchases).toFixed(2));

  return result;
};

const getProductReport = async (productId, query) => {
  const matchStage = { productId: require('mongoose').Types.ObjectId.createFromHexString(productId) };

  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const [report, product] = await Promise.all([
    Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$totalAmount' },
          totalQty: { $sum: '$quantity' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
    ]),
    Product.findById(productId).lean({ virtuals: true }),
  ]);

  if (!product) throw { statusCode: 404, message: 'Product not found.' };

  const result = {
    product: {
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.quantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      totalStockValue: product.totalStockValue,
    },
    totalPurchaseAmount: 0,
    totalSalesAmount: 0,
    totalPurchasedQty: 0,
    totalSoldQty: 0,
    purchasesCount: 0,
    salesCount: 0,
    profitOrLoss: 0,
  };

  report.forEach((item) => {
    if (item._id === 'SALE') {
      result.totalSalesAmount = item.totalAmount;
      result.totalSoldQty = item.totalQty;
      result.salesCount = item.count;
    }
    if (item._id === 'PURCHASE') {
      result.totalPurchaseAmount = item.totalAmount;
      result.totalPurchasedQty = item.totalQty;
      result.purchasesCount = item.count;
    }
  });

  result.profitOrLoss = parseFloat((result.totalSalesAmount - result.totalPurchaseAmount).toFixed(2));

  return result;
};

const getTrends = async (query) => {
  const matchStage = {};
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const groupBy = query.groupBy || 'day'; // day | month | year

  const dateFormat =
    groupBy === 'year'
      ? '%Y'
      : groupBy === 'month'
      ? '%Y-%m'
      : '%Y-%m-%d';

  const trends = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: '$date' } },
          type: '$type',
        },
        totalAmount: { $sum: '$totalAmount' },
        totalQty: { $sum: '$quantity' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
    {
      $group: {
        _id: '$_id.date',
        entries: {
          $push: {
            type: '$_id.type',
            totalAmount: '$totalAmount',
            totalQty: '$totalQty',
            count: '$count',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        entries: 1,
      },
    },
  ]);

  return trends;
};

module.exports = { getOverview, getProductReport, getTrends };
