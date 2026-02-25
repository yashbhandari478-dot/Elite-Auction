const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getActiveProducts,
  getProductsByCategory,
  getSupplierProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  acceptBid,
  rejectBid,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getScheduledProducts,
  scheduleProduct,
  rescheduleProduct,
  cancelScheduling
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes - MUST come before generic routes
router.get('/admin/pending', protect, authorize('admin'), getPendingProducts);
router.put('/:id/approve', protect, authorize('admin'), approveProduct);
router.put('/:id/reject', protect, authorize('admin'), rejectProduct);

// Supplier routes - MUST come before generic routes
router.get('/supplier/my-products', protect, authorize('supplier'), getSupplierProducts);
router.get('/supplier/scheduled', protect, authorize('supplier'), getScheduledProducts);
router.post('/', protect, authorize('supplier'), createProduct);
router.put('/:id', protect, authorize('supplier'), updateProduct);
router.delete('/:id', protect, authorize('supplier'), deleteProduct);
router.post('/:id/schedule', protect, authorize('supplier'), scheduleProduct);
router.put('/:id/reschedule', protect, authorize('supplier'), rescheduleProduct);
router.delete('/:id/cancel-schedule', protect, authorize('supplier'), cancelScheduling);
router.post('/:id/accept-bid', protect, authorize('supplier'), acceptBid);
router.post('/:id/reject-bid', protect, authorize('supplier'), rejectBid);

// Public routes
router.get('/', getAllProducts);
router.get('/active', getActiveProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

module.exports = router;
