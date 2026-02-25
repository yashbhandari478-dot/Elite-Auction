const Bid = require('../models/Bid');
const Product = require('../models/Product');
const User = require('../models/User');
const WinningBid = require('../models/WinningBid');
const logger = require('../utils/logger');
const { isValidBidAmount, isValidMongoId } = require('../utils/validators');

// @desc    Place a bid
// @route   POST /api/bids
// @access  Private/Customer
exports.placeBid = async (req, res) => {
  try {
    const { productId, bidAmount } = req.body;

    // Input validation
    if (!productId || !isValidMongoId(productId)) {
      logger.warn('Invalid product ID in bid request', { productId });
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (!isValidBidAmount(bidAmount)) {
      logger.warn('Invalid bid amount', { bidAmount, userId: req.user._id });
      return res.status(400).json({ success: false, message: 'Bid amount must be a positive number' });
    }

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      logger.warn('Product not found', { productId });
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if auction is active
    if (product.status !== 'active') {
      logger.warn('Auction is not active', { productId, status: product.status });
      return res.status(400).json({ success: false, message: 'Auction is not active' });
    }

    // Check if bid is higher than current price
    const currentPrice = product.currentPrice || product.basePrice;
    if (bidAmount <= currentPrice) {
      return res.status(400).json({
        success: false,
        message: `Bid must be higher than current price of ₹${currentPrice}`
      });
    }

    // Get customer info
    const customer = await User.findById(req.user._id);

    // Create bid
    const bid = await Bid.create({
      productId,
      productName: product.name,
      customerId: req.user._id,
      customerName: customer.name,
      customerEmail: customer.email,
      bidAmount,
      isWinning: true
    });

    // Update previous winning bid
    await Bid.updateMany(
      { productId, _id: { $ne: bid._id } },
      { isWinning: false }
    );

    // Update product
    product.currentPrice = bidAmount;
    product.highestBid = bidAmount;
    product.highestBidder = req.user._id;
    await product.save();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(productId).emit('bidUpdate', {
        productId,
        newBid: bidAmount,
        bidderId: req.user._id,
        bidderName: customer.name
      });
    }

    res.status(201).json({
      message: 'Bid placed successfully',
      bid,
      currentHighestBid: bidAmount
    });
  } catch (error) {
    logger.error('Error placing bid', { error: error.message, userId: req.user._id, productId: req.body.productId });
    res.status(500).json({ success: false, message: 'Failed to place bid. Please try again.' });
  }
};

// @desc    Get bids for a product
// @route   GET /api/bids/product/:productId
// @access  Public
exports.getBidsByProduct = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const bids = await Bid.find({ productId: req.params.productId })
      .sort({ bidAmount: -1 })
      .populate('customerId', 'name email');
    
    res.json(bids);
  } catch (error) {
    logger.error('Error fetching bids for product', { error: error.message, productId: req.params.productId });
    res.status(500).json({ success: false, message: 'Failed to fetch bids. Please try again.' });
  }
};

// @desc    Get customer's own bids
// @route   GET /api/bids/my-bids
// @access  Private/Customer
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ customerId: req.user._id })
      .sort({ bidTime: -1 })
      .populate('productId', 'name status auctionEndTime');
    
    res.json(bids);
  } catch (error) {
    logger.error('Error fetching user bids', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to fetch your bids. Please try again.' });
  }
};

// @desc    Get all bids (admin) with pagination
// @route   GET /api/bids/all
// @access  Private/Admin
exports.getAllBids = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Bid.countDocuments();
    const bids = await Bid.find()
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('productId', 'name status')
      .populate('customerId', 'name email');

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's winning bids (completed + currently winning on active auctions)
// @route   GET /api/bids/my-winning-bids
// @access  Private/Customer
exports.getMyWinningBids = async (req, res) => {
  try {
    const customerId = req.user._id;

    // 1. Fetch finalized WinningBid records for this customer
    const winningBids = await WinningBid.find({ customerId })
      .sort({ createdAt: -1 })
      .populate('productId', 'name category images')
      .populate('supplierId', 'name email');

    // 2. Also find bids where this customer is currently winning on ACTIVE auctions
    const activeBids = await Bid.find({ customerId, isWinning: true })
      .sort({ bidTime: -1 })
      .populate('productId', 'name category images status auctionEndTime supplierId supplierName');

    // Filter to only bids on genuinely-active products
    const activeWins = activeBids
      .filter(bid => bid.productId && bid.productId.status === 'active')
      .map(bid => ({
        _id: 'active_' + bid._id,
        productId: bid.productId,
        productName: bid.productId?.name || bid.productName,
        customerId,
        customerName: bid.customerName,
        supplierId: bid.productId?.supplierId,
        supplierName: bid.productId?.supplierName || '',
        winningAmount: bid.bidAmount,
        status: 'active',
        paymentStatus: 'pending',
        auctionEndTime: bid.productId?.auctionEndTime,
        createdAt: bid.bidTime
      }));

    // Merge: finalized first, then active wins (avoid duplicates by productId)
    const finalizedProductIds = new Set(winningBids.map(w => String(w.productId?._id || w.productId)));
    const merged = [
      ...winningBids,
      ...activeWins.filter(a => !finalizedProductIds.has(String(a.productId?._id || a.productId)))
    ];

    console.log(`[MyWinningBids] Customer ${req.user.email}: ${winningBids.length} finalized + ${activeWins.length} active wins`);
    res.json(merged);
  } catch (error) {
    console.error('Error in getMyWinningBids:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supplier's winning bids (sales)
// @route   GET /api/bids/supplier-winning-bids
// @access  Private/Supplier
exports.getSupplierWinningBids = async (req, res) => {
  try {
    const winningBids = await WinningBid.find({ supplierId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('productId', 'name category')
      .populate('customerId', 'name email phone address');
    res.json(winningBids);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Finalize completed auctions and create winning bids
// @route   POST /api/bids/finalize-auctions
// @access  Private/Admin
exports.finalizeAuctions = async (req, res) => {
  try {
    const now = new Date();
    const completedProducts = await Product.find({
      status: 'completed',
      auctionEndTime: { $lte: now }
    });

    let createdRecords = 0;
    for (const product of completedProducts) {
      const existingWinningBid = await WinningBid.findOne({ productId: product._id });
      if (existingWinningBid) continue;

      const highestBid = await Bid.findOne({ productId: product._id }).sort({ bidAmount: -1 });
      if (highestBid) {
        await WinningBid.create({
          productId: product._id,
          productName: product.name,
          customerId: highestBid.customerId,
          customerName: highestBid.customerName,
          supplierId: product.supplierId,
          supplierName: product.supplierName,
          winningAmount: highestBid.bidAmount,
          status: 'pending',
          paymentStatus: 'pending',
          auctionEndTime: product.auctionEndTime
        });
        createdRecords++;
      }
    }

    res.json({ success: true, message: `${createdRecords} winning bids created`, createdCount: createdRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process payment for a winning bid
// @route   POST /api/bids/:winningBidId/payment
// @access  Private/Customer
exports.processPayment = async (req, res) => {
  try {
    const { winningBidId } = req.params;
    const { paymentMethod, deliveryAddress } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const winningBid = await WinningBid.findById(winningBidId);
    if (!winningBid) {
      return res.status(404).json({ success: false, message: 'Winning bid not found' });
    }
    if (String(winningBid.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (winningBid.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // ── Fee Calculations ──────────────────────────────────────────
    const BUYERS_PREMIUM_RATE = 0.03;  // 3%  – charged ON TOP to customer
    const PLATFORM_FEE_RATE = 0.05;  // 5%  – deducted FROM supplier payout

    const base = winningBid.winningAmount;
    const buyersPremium = Math.round(base * BUYERS_PREMIUM_RATE * 100) / 100;
    const platformFee = Math.round(base * PLATFORM_FEE_RATE * 100) / 100;
    const customerTotal = Math.round((base + buyersPremium) * 100) / 100;
    const supplierPayout = Math.round((base - platformFee) * 100) / 100;
    // ─────────────────────────────────────────────────────────────

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    winningBid.paymentStatus = 'completed';
    winningBid.status = 'accepted';
    winningBid.deliveryStatus = 'payment_confirmed';
    winningBid.estimatedDelivery = estimatedDelivery;

    // Store fee breakdown
    winningBid.buyersPremiumRate = BUYERS_PREMIUM_RATE;
    winningBid.buyersPremium = buyersPremium;
    winningBid.platformFeeRate = PLATFORM_FEE_RATE;
    winningBid.platformFee = platformFee;
    winningBid.customerTotalAmount = customerTotal;
    winningBid.supplierPayout = supplierPayout;

    if (deliveryAddress) winningBid.deliveryAddress = deliveryAddress;

    winningBid.trackingHistory = [
      {
        status: 'order_placed',
        location: 'AuctionHub Warehouse',
        description: 'Your order has been placed successfully.',
        timestamp: winningBid.createdAt || now
      },
      {
        status: 'payment_confirmed',
        location: 'AuctionHub Payment Gateway',
        description: `Payment of ₹${customerTotal.toLocaleString('en-IN')} confirmed via ${paymentMethod}. (Bid: ₹${base.toLocaleString('en-IN')} + Buyer's Premium: ₹${buyersPremium.toLocaleString('en-IN')})`,
        timestamp: now
      }
    ];

    await winningBid.save();
    console.log(`[Payment] WinningBid ${winningBidId} paid via ${paymentMethod} | Customer: ₹${customerTotal} | Platform fee: ₹${platformFee} | Supplier payout: ₹${supplierPayout}`);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      winningBid,
      breakdown: { base, buyersPremium, platformFee, customerTotal, supplierPayout }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get delivery tracking for a winning bid
// @route   GET /api/bids/:winningBidId/tracking
// @access  Private/Customer
exports.getDeliveryTracking = async (req, res) => {
  try {
    const winningBid = await WinningBid.findById(req.params.winningBidId);
    if (!winningBid) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (String(winningBid.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({
      success: true,
      tracking: {
        _id: winningBid._id,
        productName: winningBid.productName,
        supplierName: winningBid.supplierName,
        winningAmount: winningBid.winningAmount,
        deliveryStatus: winningBid.deliveryStatus,
        estimatedDelivery: winningBid.estimatedDelivery,
        deliveryAddress: winningBid.deliveryAddress,
        trackingHistory: winningBid.trackingHistory,
        paymentStatus: winningBid.paymentStatus,
        createdAt: winningBid.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery status (supplier advances shipping stages)
// @route   PUT /api/bids/:winningBidId/delivery-status
// @access  Private/Supplier
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { winningBidId } = req.params;
    const { deliveryStatus, location, description } = req.body;

    const allowedStatuses = ['dispatched', 'in_transit', 'out_for_delivery', 'delivered'];
    if (!allowedStatuses.includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const winningBid = await WinningBid.findById(winningBidId);
    if (!winningBid) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify supplier owns the product
    if (String(winningBid.supplierId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Must have payment before shipping
    if (winningBid.paymentStatus !== 'completed') {
      return res.status(400).json({ success: false, message: 'Payment must be completed before updating delivery status' });
    }

    const statusLabels = {
      dispatched: 'Order Dispatched',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };

    winningBid.deliveryStatus = deliveryStatus;

    // Add tracking history entry
    winningBid.trackingHistory.push({
      status: deliveryStatus,
      location: location || 'In Transit',
      description: description || statusLabels[deliveryStatus],
      timestamp: new Date()
    });

    await winningBid.save();
    console.log(`[Delivery] WinningBid ${winningBidId} status updated to ${deliveryStatus}`);

    res.json({ success: true, message: 'Delivery status updated', winningBid });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin statistics
// @route   GET /api/bids/admin-stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalBids,
      totalAuctions,
      completedAuctions,
      pendingPayments,
      completedPayments,
      revenueData,
      platformFeeData,
      buyersPremiumData
    ] = await Promise.all([
      Bid.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ status: 'completed' }),
      WinningBid.countDocuments({ paymentStatus: 'pending', status: { $ne: 'active' } }),
      WinningBid.countDocuments({ paymentStatus: 'completed' }),
      // Total GMV (all winning amounts paid)
      WinningBid.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$winningAmount' } } }
      ]),
      // Platform commission earned (5% from supplier)
      WinningBid.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
      ]),
      // Buyer's premium collected (3% from customer)
      WinningBid.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$buyersPremium' } } }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    const totalPlatformFees = platformFeeData.length > 0 ? platformFeeData[0].total : 0;
    const totalBuyersPremiums = buyersPremiumData.length > 0 ? buyersPremiumData[0].total : 0;
    const totalPlatformRevenue = Math.round((totalPlatformFees + totalBuyersPremiums) * 100) / 100;

    // Recent winning bids
    const recentWins = await WinningBid.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('productId', 'name')
      .populate('customerId', 'name email');

    res.json({
      success: true,
      stats: {
        totalBids,
        totalAuctions,
        completedAuctions,
        pendingPayments,
        completedPayments,
        totalRevenue,           // GMV — total winning amounts
        totalPlatformFees,      // 5% commission from suppliers
        totalBuyersPremiums,    // 3% premium from customers
        totalPlatformRevenue    // Admin's actual earnings
      },
      recentWins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

