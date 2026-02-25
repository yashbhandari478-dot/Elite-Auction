const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // The product being reviewed
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },

  // The supplier being reviewed
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },

  // The customer who is rating
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },

  // Rating details
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  review: {
    type: String,
    trim: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  },

  // Rating categories (for detailed feedback)
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  shippingRating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Verified purchase (only customers who won auctions can rate)
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  winningBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WinningBid'
  },

  // Admin moderation
  isApproved: {
    type: Boolean,
    default: true // Auto-approve initially, can be marked inappropriate by admin
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  flaggedAsInappropriate: {
    type: Boolean,
    default: false
  },

  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },

  // Seller response
  sellerResponse: {
    text: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
ratingSchema.index({ supplierId: 1, isApproved: 1, isHidden: 1 });
ratingSchema.index({ productId: 1, isApproved: 1 });
ratingSchema.index({ customerId: 1 });
ratingSchema.index({ createdAt: -1 });

// Virtual for average rating across categories
ratingSchema.virtual('averageCategoryRating').get(function() {
  const ratings = [];
  if (this.qualityRating) ratings.push(this.qualityRating);
  if (this.communicationRating) ratings.push(this.communicationRating);
  if (this.shippingRating) ratings.push(this.shippingRating);
  
  if (ratings.length === 0) return null;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
});

module.exports = mongoose.model('Rating', ratingSchema);
