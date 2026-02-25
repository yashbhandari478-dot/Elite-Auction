const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const winningBidSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplierName: { type: String, required: true },
  winningAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  auctionEndTime: { type: Date, required: true },

  /* ── Platform Fees ── */
  // Buyer's Premium: charged ON TOP of winningAmount (customer pays more)
  buyersPremiumRate: { type: Number, default: 0.03 },    // 3%
  buyersPremium: { type: Number, default: 0 },        // ₹ amount
  // Platform Commission: deducted FROM winningAmount (supplier receives less)
  platformFeeRate: { type: Number, default: 0.05 },    // 5%
  platformFee: { type: Number, default: 0 },        // ₹ amount
  // Derived totals stored for clarity
  customerTotalAmount: { type: Number, default: 0 },     // winningAmount + buyersPremium
  supplierPayout: { type: Number, default: 0 },     // winningAmount - platformFee

  /* ── Delivery Tracking ── */
  deliveryStatus: {
    type: String,
    enum: ['order_placed', 'payment_confirmed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'],
    default: 'order_placed'
  },
  estimatedDelivery: { type: Date },
  deliveryAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String
  },
  trackingHistory: [trackingEventSchema]

}, { timestamps: true });

module.exports = mongoose.model('WinningBid', winningBidSchema);
