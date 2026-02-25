const express = require('express');
const router = express.Router();
const {
  placeBid,
  getBidsByProduct,
  getMyBids,
  getMyWinningBids,
  getSupplierWinningBids,
  getAllBids,
  finalizeAuctions,
  processPayment,
  getDeliveryTracking,
  updateDeliveryStatus,
  getAdminStats
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes - MUST come before parameterized routes
router.post('/', protect, authorize('customer'), placeBid);
router.get('/my-bids', protect, authorize('customer'), getMyBids);
router.get('/my-winning-bids', protect, authorize('customer'), getMyWinningBids);

// Supplier routes - MUST come before parameterized routes
router.get('/supplier-winning-bids', protect, authorize('supplier'), getSupplierWinningBids);

// Admin routes - MUST come before parameterized routes
router.post('/finalize-auctions', protect, authorize('admin'), finalizeAuctions);
router.get('/all', protect, authorize('admin'), getAllBids);
router.get('/admin-stats', protect, authorize('admin'), getAdminStats);

// Payment and tracking routes (customer)
router.post('/:winningBidId/payment', protect, authorize('customer'), processPayment);
router.get('/:winningBidId/tracking', protect, authorize('customer'), getDeliveryTracking);

// Delivery status update (supplier)
router.put('/:winningBidId/delivery-status', protect, authorize('supplier'), updateDeliveryStatus);

// Public routes - parameterized routes come last
router.get('/product/:productId', getBidsByProduct);

module.exports = router;
