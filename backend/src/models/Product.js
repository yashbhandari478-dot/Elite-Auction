const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide a base price'],
    min: 0
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.basePrice;
    }
  },
  images: [{
    type: String
  }],
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierName: {
    type: String
  },
  auctionStartTime: {
    type: Date,
    required: [true, 'Please provide auction start time']
  },
  auctionEndTime: {
    type: Date,
    required: [true, 'Please provide auction end time']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  highestBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalReason: {
    type: String
  },
  // Scheduling fields
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledActivationTime: {
    type: Date,
    default: null
  },
  isActivationTriggered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update status based on time
productSchema.methods.updateStatus = function() {
  const now = new Date();
  if (this.status === 'pending' && now >= this.auctionStartTime) {
    this.status = 'active';
  }
  if (this.status === 'active' && now >= this.auctionEndTime) {
    this.status = 'completed';
  }
};

module.exports = mongoose.model('Product', productSchema);
