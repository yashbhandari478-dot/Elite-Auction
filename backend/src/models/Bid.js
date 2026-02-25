const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String
  },
  customerEmail: {
    type: String
  },
  bidAmount: {
    type: Number,
    required: [true, 'Please provide a bid amount'],
    min: 0
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'rejected'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
bidSchema.index({ productId: 1, bidAmount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
