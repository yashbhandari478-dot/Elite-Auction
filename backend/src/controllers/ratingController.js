const Rating = require('../models/Rating');
const WinningBid = require('../models/WinningBid');
const User = require('../models/User');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * @desc    Submit a rating/review
 * @route   POST /api/ratings
 * @access  Private/Customer
 */
exports.submitRating = async (req, res) => {
  try {
    const { productId, supplierId, rating, review, qualityRating, communicationRating, shippingRating } = req.body;

    // Validation
    if (!productId || !supplierId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'productId, supplierId, and rating are required'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify supplier exists
    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Check if customer has won this product (verified purchase)
    const winningBid = await WinningBid.findOne({
      productId,
      customerId: req.user._id,
      paymentStatus: 'completed'
    });

    // Check if customer already rated this product
    const existingRating = await Rating.findOne({
      productId,
      customerId: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this product'
      });
    }

    const ratingObj = await Rating.create({
      productId,
      productName: product.name,
      supplierId,
      supplierName: supplier.name,
      customerId: req.user._id,
      customerName: req.user.name,
      rating,
      review: review || '',
      qualityRating: qualityRating || null,
      communicationRating: communicationRating || null,
      shippingRating: shippingRating || null,
      isVerifiedPurchase: !!winningBid,
      winningBidId: winningBid ? winningBid._id : null
    });

    logger.info('Rating submitted', {
      ratingId: ratingObj._id,
      customerId: req.user._id,
      supplierId,
      rating
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: ratingObj
    });
  } catch (error) {
    logger.error('Error submitting rating', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all ratings for a supplier
 * @route   GET /api/ratings/supplier/:supplierId
 * @access  Public
 */
exports.getSupplierRatings = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Rating.countDocuments({
      supplierId,
      isApproved: true,
      isHidden: false
    });

    const ratings = await Rating.find({
      supplierId,
      isApproved: true,
      isHidden: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name')
      .select('-flaggedAsInappropriate');

    // Calculate statistics
    const allRatings = await Rating.find({
      supplierId,
      isApproved: true,
      isHidden: false
    });

    const stats = {
      totalReviews: total,
      averageRating: allRatings.length > 0
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
        : 0,
      ratingDistribution: {
        5: allRatings.filter(r => r.rating === 5).length,
        4: allRatings.filter(r => r.rating === 4).length,
        3: allRatings.filter(r => r.rating === 3).length,
        2: allRatings.filter(r => r.rating === 2).length,
        1: allRatings.filter(r => r.rating === 1).length
      },
      verifiedPurchaseCount: allRatings.filter(r => r.isVerifiedPurchase).length
    };

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
      ratings
    });
  } catch (error) {
    logger.error('Error fetching supplier ratings', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get ratings for a specific product
 * @route   GET /api/ratings/product/:productId
 * @access  Public
 */
exports.getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Rating.countDocuments({
      productId,
      isApproved: true,
      isHidden: false
    });

    const ratings = await Rating.find({
      productId,
      isApproved: true,
      isHidden: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name');

    const allRatings = await Rating.find({
      productId,
      isApproved: true,
      isHidden: false
    });

    const stats = {
      totalReviews: total,
      averageRating: allRatings.length > 0
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
        : 0,
      ratingDistribution: {
        5: allRatings.filter(r => r.rating === 5).length,
        4: allRatings.filter(r => r.rating === 4).length,
        3: allRatings.filter(r => r.rating === 3).length,
        2: allRatings.filter(r => r.rating === 2).length,
        1: allRatings.filter(r => r.rating === 1).length
      }
    };

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
      ratings
    });
  } catch (error) {
    logger.error('Error fetching product ratings', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get my ratings (customer's own ratings)
 * @route   GET /api/ratings/my-ratings
 * @access  Private/Customer
 */
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('productId', 'name images')
      .populate('supplierId', 'name email');

    res.json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    logger.error('Error fetching my ratings', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a rating
 * @route   PUT /api/ratings/:ratingId
 * @access  Private/Customer
 */
exports.updateRating = async (req, res) => {
  try {
    let rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    // Check ownership
    if (rating.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this rating' });
    }

    const { ratingValue, review, qualityRating, communicationRating, shippingRating } = req.body;

    if (ratingValue) rating.rating = ratingValue;
    if (review) rating.review = review;
    if (qualityRating) rating.qualityRating = qualityRating;
    if (communicationRating) rating.communicationRating = communicationRating;
    if (shippingRating) rating.shippingRating = shippingRating;

    await rating.save();

    logger.info('Rating updated', { ratingId: req.params.ratingId, customerId: req.user._id });

    res.json({
      success: true,
      message: 'Rating updated successfully',
      rating
    });
  } catch (error) {
    logger.error('Error updating rating', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a rating
 * @route   DELETE /api/ratings/:ratingId
 * @access  Private/Customer
 */
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    // Check ownership
    if (rating.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this rating' });
    }

    await Rating.findByIdAndDelete(req.params.ratingId);

    logger.info('Rating deleted', { ratingId: req.params.ratingId, customerId: req.user._id });

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting rating', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark rating as helpful
 * @route   POST /api/ratings/:ratingId/helpful
 * @access  Public
 */
exports.markHelpful = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    rating.helpfulCount += 1;
    await rating.save();

    res.json({
      success: true,
      message: 'Rating marked as helpful',
      helpfulCount: rating.helpfulCount
    });
  } catch (error) {
    logger.error('Error marking rating as helpful', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark rating as not helpful
 * @route   POST /api/ratings/:ratingId/not-helpful
 * @access  Public
 */
exports.markNotHelpful = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    rating.notHelpfulCount += 1;
    await rating.save();

    res.json({
      success: true,
      message: 'Rating marked as not helpful',
      notHelpfulCount: rating.notHelpfulCount
    });
  } catch (error) {
    logger.error('Error marking rating as not helpful', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get supplier statistics (for profile)
 * @route   GET /api/ratings/supplier/:supplierId/stats
 * @access  Public
 */
exports.getSupplierStats = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const ratings = await Rating.find({
      supplierId,
      isApproved: true,
      isHidden: false
    });

    const stats = {
      totalReviews: ratings.length,
      averageRating: ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0,
      averageQualityRating: ratings.filter(r => r.qualityRating)
        ? (ratings.filter(r => r.qualityRating).reduce((sum, r) => sum + r.qualityRating, 0) / 
           ratings.filter(r => r.qualityRating).length).toFixed(2)
        : 0,
      averageCommunicationRating: ratings.filter(r => r.communicationRating)
        ? (ratings.filter(r => r.communicationRating).reduce((sum, r) => sum + r.communicationRating, 0) / 
           ratings.filter(r => r.communicationRating).length).toFixed(2)
        : 0,
      averageShippingRating: ratings.filter(r => r.shippingRating)
        ? (ratings.filter(r => r.shippingRating).reduce((sum, r) => sum + r.shippingRating, 0) / 
           ratings.filter(r => r.shippingRating).length).toFixed(2)
        : 0,
      ratingDistribution: {
        5: ratings.filter(r => r.rating === 5).length,
        4: ratings.filter(r => r.rating === 4).length,
        3: ratings.filter(r => r.rating === 3).length,
        2: ratings.filter(r => r.rating === 2).length,
        1: ratings.filter(r => r.rating === 1).length
      },
      verifiedPurchaseCount: ratings.filter(r => r.isVerifiedPurchase).length,
      positiveRatingsPercent: ratings.length > 0
        ? Math.round((ratings.filter(r => r.rating >= 4).length / ratings.length) * 100)
        : 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching supplier stats', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Supplier responds to rating
 * @route   POST /api/ratings/:ratingId/respond
 * @access  Private/Supplier
 */
exports.respondToRating = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Response must be at least 5 characters'
      });
    }

    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    // Check ownership (must be the supplier)
    if (rating.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this rating' });
    }

    rating.sellerResponse = {
      text: response,
      respondedAt: new Date()
    };

    await rating.save();

    logger.info('Supplier responded to rating', {
      ratingId: req.params.ratingId,
      supplierId: req.user._id
    });

    res.json({
      success: true,
      message: 'Response added successfully',
      rating
    });
  } catch (error) {
    logger.error('Error responding to rating', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};
