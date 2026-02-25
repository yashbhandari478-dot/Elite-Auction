const express = require('express');
const router = express.Router();
const {
  getSupplierDashboard,
  getRevenueTrend,
  getProductPerformance
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All analytics routes require supplier authentication
router.use(protect, authorize('supplier'));

// @route   GET /api/analytics/supplier/dashboard
// @desc    Get comprehensive supplier analytics (summary, trends, top products, customers)
router.get('/supplier/dashboard', getSupplierDashboard);

// @route   GET /api/analytics/supplier/revenue-trend
// @desc    Get revenue trend with customizable date range and grouping
// @query   startDate, endDate (ISO), groupBy (day|week|month)
router.get('/supplier/revenue-trend', getRevenueTrend);

// @route   GET /api/analytics/supplier/product-performance
// @desc    Get detailed product performance metrics (ROI, bids, conversion)
router.get('/supplier/product-performance', getProductPerformance);

module.exports = router;
