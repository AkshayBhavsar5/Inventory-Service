const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const getDashboardOverview = async () => {
  const [summary, stockSummary] = await Promise.all([
    Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$totalAmount' },
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

  let totalSales = 0;
  let totalPurchase = 0;

  summary.forEach((row) => {
    if (row._id === 'SALE') totalSales = row.totalAmount || 0;
    if (row._id === 'PURCHASE') totalPurchase = row.totalAmount || 0;
  });
  return {
    totalStockOverview: {
      totalStockValue: stockSummary[0]?.totalStockValue || 0,
      totalProducts: stockSummary[0]?.totalProducts || 0,
      totalStockQty: stockSummary[0]?.totalStockQty || 0,
    },
    totalSales,
    totalPurchase,
    netProfit: parseFloat((totalSales - totalPurchase).toFixed(2)),
  };
};

const getSalesVsPurchase = async () => {
  const rows = await Transaction.aggregate([
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  let sales = 0;
  let purchase = 0;
  rows.forEach((row) => {
    if (row._id === 'SALE') sales = row.totalAmount || 0;
    if (row._id === 'PURCHASE') purchase = row.totalAmount || 0;
  });
  return {
    sales,
    purchase,
    bars: [
      { label: 'SALE', value: sales },
      { label: 'PURCHASE', value: purchase },
    ],
  };
};
module.exports = {
  getDashboardOverview,
  getSalesVsPurchase,
};
