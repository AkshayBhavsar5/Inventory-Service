const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const getSalesVsPurchase = async () => {
  const sixMonth = new Date();
  sixMonth.setMonth(sixMonth.getMonth() - 6);
  const rows = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonth },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          type: '$type',
        },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const monthMap = {};
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  rows.forEach((row) => {
    const key = `${monthNames[row._id.month - 1]} ${String(row._id.year).slice(2)}`;
    if (!monthMap[key]) monthMap[key] = { label: key, sales: 0, purchases: 0 };
    if (row._id.type === 'SALE') monthMap[key].sales = row.totalAmount || 0;
    if (row._id.type === 'PURCHASE')
      monthMap[key].purchases = row.totalAmount || 0;
  });
  const data = Object.values(monthMap);

  return {
    data,
    sales: data.reduce((sum, m) => sum + m.sales, 0),
    purchase: data.reduce((sum, m) => sum + m.purchases, 0),
  };
};

const getTopPerformingProducts = async (query = {}) => {
  const limit = parseInt(query.limit, 10) || 5;
  const months = parseInt(query.months, 10) || 6;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const products = await Transaction.aggregate([
    {
      $match: {
        type: 'SALE',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$productId',
        totalRevenue: { $sum: '$totalAmount' },
        totalQuantity: { $sum: '$quantity' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        totalRevenue: 1,
        totalQuantity: 1,
        product: {
          _id: '$product._id',
          name: '$product.name',
          sku: '$product.sku',
          category: '$product.category',
          sellingPrice: '$product.sellingPrice',
          costPrice: '$product.costPrice',
          currentStock: '$product.quantity',
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);

  return products;
};

const getDashboardOverview = async (query = {}) => {
  const months = parseInt(query.months, 10) || 6;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const stockSummary = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalStockValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        totalProducts: { $sum: 1 },
        totalStockQty: { $sum: '$quantity' },
      },
    },
  ]);
  const rows = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          type: '$type',
        },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthMap = {};
  rows.forEach((row) => {
    const year = row._id.year;
    const month = row._id.month;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        label: `${monthNames[month - 1]} ${String(year).slice(2)}`,
        year,
        month,
        sales: 0,
        purchases: 0,
      };
    }
    if (row._id.type === 'SALE') {
      monthMap[key].sales = row.totalAmount || 0;
    }
    if (row._id.type === 'PURCHASE') {
      monthMap[key].purchases = row.totalAmount || 0;
    }
  });

  const data = Object.values(monthMap)
    .sort((a, b) => {
      if (a.year === b.year) return a.month - b.month;
      return a.year - b.year;
    })
    .map((monthData) => {
      const profit = parseFloat(
        (monthData.sales - monthData.purchases).toFixed(2),
      );
      const efficiency = monthData.purchases
        ? parseFloat(((profit / monthData.purchases) * 100).toFixed(2))
        : 0;

      return {
        label: monthData.label,
        year: monthData.year,
        month: monthData.month,
        sales: monthData.sales,
        purchases: monthData.purchases,
        profit,
        efficiency,
      };
    });
  const totals = stockSummary[0] || {};
  const totalSales = data.reduce((sum, m) => sum + m.sales, 0);
  const totalPurchases = data.reduce((sum, m) => sum + m.purchases, 0);
  const totalProfit = parseFloat((totalSales - totalPurchases).toFixed(2));
  const averageEfficiency = data.length
    ? parseFloat(
        (data.reduce((sum, m) => sum + m.efficiency, 0) / data.length).toFixed(
          2,
        ),
      )
    : 0;

  return {
    linechart: data,
    totalStockOverview: {
      totalStockValue: stockSummary[0]?.totalStockValue || 0,
      totalProducts: stockSummary[0]?.totalProducts || 0,
      totalStockQty: stockSummary[0]?.totalStockQty || 0,
    },
    totalSales,
    totalPurchases,
    totalProfit,
    averageEfficiency,
  };
};

module.exports = {
  getDashboardOverview,
  getSalesVsPurchase,
  getTopPerformingProducts,
};
