const transactionService = require('../services/transaction.service');
const { sendSuccess } = require('../utils/response');

const purchase = async (req, res, next) => {
  try {
    const transaction = await transactionService.createPurchase(req.body, req.user._id);
    return sendSuccess(res, 201, 'Purchase recorded successfully.', { transaction });
  } catch (error) {
    next(error);
  }
};

const sale = async (req, res, next) => {
  try {
    const transaction = await transactionService.createSale(req.body, req.user._id);
    return sendSuccess(res, 201, 'Sale recorded successfully.', { transaction });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { transactions, meta } = await transactionService.getAllTransactions(req.query);
    return sendSuccess(res, 200, 'Transactions fetched successfully.', { transactions }, meta);
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    return sendSuccess(res, 200, 'Transaction fetched successfully.', { transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = { purchase, sale, getAllTransactions, getTransactionById };
