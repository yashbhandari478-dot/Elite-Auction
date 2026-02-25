const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitRating,
  getSupplierRatings,
  getProductRatings,
  getMyRatings,
  updateRating,
  deleteRating,
  markHelpful,
  markNotHelpful,
  getSupplierStats,
  respondToRating
} = require('../controllers/ratingController');

// Public routes
router.get('/product/:productId', getProductRatings);
router.get('/supplier/:supplierId', getSupplierRatings);
router.get('/supplier/:supplierId/stats', getSupplierStats);
router.post('/:ratingId/helpful', markHelpful);
router.post('/:ratingId/not-helpful', markNotHelpful);

// Private routes
router.post('/', protect, submitRating);
router.get('/customer/my-ratings', protect, getMyRatings);
router.put('/:ratingId', protect, updateRating);
router.delete('/:ratingId', protect, deleteRating);

// Supplier routes
router.post('/:ratingId/respond', protect, authorize('supplier'), respondToRating);

module.exports = router;
