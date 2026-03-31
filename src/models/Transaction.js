const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['PURCHASE', 'SALE'],
      required: [true, 'Transaction type is required'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate totalAmount before saving
transactionSchema.pre('save', function (next) {
  this.totalAmount = parseFloat((this.quantity * this.price).toFixed(2));
  next();
});

// Compound index for analytics queries
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ productId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
