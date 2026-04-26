const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const getDashboardOverviewStats = async () => {
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
          tottalstockvalue: {
            $sum: { $multiply: ['$quantity', '$costPrice'] },
          },
        },
      },
    ]),
  ]);
};
