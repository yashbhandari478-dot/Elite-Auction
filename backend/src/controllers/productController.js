const Product = require('../models/Product');
const User = require('../models/User');

// Helper function to update product status based on auction times
const updateProductStatus = (product) => {
  const now = new Date();
  if (product.status === 'pending' && now >= new Date(product.auctionStartTime)) {
    product.status = 'active';
  }
  if ((product.status === 'active' || product.status === 'pending') && now >= new Date(product.auctionEndTime)) {
    product.status = 'completed';
  }
  return product;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('supplierId', 'name email');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active products
// @route   GET /api/products/active
// @access  Public
exports.getActiveProducts = async (req, res) => {
  try {
    const now = new Date();
    // Get APPROVED products that are active or pending with start time passed and end time not passed
    let products = await Product.find({
      isApproved: true,
      $or: [
        { status: 'active' },
        { 
          status: 'pending',
          auctionStartTime: { $lte: now }
        }
      ],
      auctionEndTime: { $gt: now }
    }).populate('supplierId', 'name email');
    
    // Update status for each product
    products = products.map(p => updateProductStatus(p));
    
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category }).populate('supplierId', 'name email');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get supplier's own products
// @route   GET /api/products/supplier/my-products
// @access  Private/Supplier
exports.getSupplierProducts = async (req, res) => {
  try {
    const products = await Product.find({ supplierId: req.user._id });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplierId', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update status based on auction times
    updateProductStatus(product);

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Supplier
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, basePrice, images, auctionStartTime, auctionEndTime } = req.body;

    const supplier = await User.findById(req.user._id);

    // Determine initial status based on start time
    const now = new Date();
    const startTime = new Date(auctionStartTime);
    let initialStatus = 'pending';
    if (startTime <= now) {
      initialStatus = 'active';
    }

    const product = await Product.create({
      name,
      description,
      category,
      basePrice,
      images,
      auctionStartTime,
      auctionEndTime,
      supplierId: req.user._id,
      supplierName: supplier.name,
      currentPrice: basePrice,
      status: initialStatus
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Supplier
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Can only update if status is pending
    if (product.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update product after auction has started'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Supplier
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Can only delete if status is pending
    if (product.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product after auction has started'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept highest bid
// @route   POST /api/products/:id/accept-bid
// @access  Private/Supplier
exports.acceptBid = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (product.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Auction must be completed to accept bid'
      });
    }

    if (!product.highestBidder) {
      return res.status(400).json({
        success: false,
        message: 'No bids to accept'
      });
    }

    product.winnerId = product.highestBidder;
    await product.save();

    res.json({
      success: true,
      message: 'Bid accepted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject highest bid
// @route   POST /api/products/:id/reject-bid
// @access  Private/Supplier
exports.rejectBid = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    product.status = 'cancelled';
    await product.save();

    res.json({
      success: true,
      message: 'Bid rejected successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending products for approval
// @route   GET /api/products/admin/pending
// @access  Private/Admin
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false })
      .populate('supplierId', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a product
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isApproved = true;
    product.approvedBy = req.user._id;
    product.approvalReason = req.body.reason || '';
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject a product
// @route   PUT /api/products/:id/reject
// @access  Private/Admin
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.status = 'cancelled';
    product.approvalReason = req.body.reason || 'Rejected by admin';
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get scheduled products for supplier
// @route   GET /api/products/supplier/scheduled
// @access  Private/Supplier
exports.getScheduledProducts = async (req, res) => {
  try {
    const products = await Product.find({
      supplierId: req.user._id,
      isScheduled: true,
      status: 'pending',
      isActivationTriggered: false
    }).sort({ scheduledActivationTime: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Schedule a product
// @route   POST /api/products/:id/schedule
// @access  Private/Supplier
exports.scheduleProduct = async (req, res) => {
  try {
    const { scheduledActivationTime } = req.body;

    if (!scheduledActivationTime) {
      return res.status(400).json({
        success: false,
        message: 'scheduledActivationTime is required'
      });
    }

    const activationTime = new Date(scheduledActivationTime);
    const now = new Date();

    if (activationTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled activation time must be in the future'
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule this product'
      });
    }

    // Can only schedule pending products
    if (product.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only schedule pending products'
      });
    }

    product.isScheduled = true;
    product.scheduledActivationTime = activationTime;
    product.isActivationTriggered = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product scheduled successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reschedule a product
// @route   PUT /api/products/:id/reschedule
// @access  Private/Supplier
exports.rescheduleProduct = async (req, res) => {
  try {
    const { scheduledActivationTime } = req.body;

    if (!scheduledActivationTime) {
      return res.status(400).json({
        success: false,
        message: 'scheduledActivationTime is required'
      });
    }

    const activationTime = new Date(scheduledActivationTime);
    const now = new Date();

    if (activationTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled activation time must be in the future'
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this product'
      });
    }

    // Can only reschedule scheduled products that haven't been activated
    if (!product.isScheduled || product.isActivationTriggered) {
      return res.status(400).json({
        success: false,
        message: 'Can only reschedule products that are scheduled and not yet activated'
      });
    }

    product.scheduledActivationTime = activationTime;
    await product.save();

    res.json({
      success: true,
      message: 'Product rescheduled successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel scheduling for a product
// @route   DELETE /api/products/:id/cancel-schedule
// @access  Private/Supplier
exports.cancelScheduling = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel scheduling for this product'
      });
    }

    // Can only cancel for scheduled products that haven't been activated
    if (!product.isScheduled || product.isActivationTriggered) {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel scheduling for products that are scheduled and not yet activated'
      });
    }

    product.isScheduled = false;
    product.scheduledActivationTime = null;
    product.isActivationTriggered = false;
    await product.save();

    res.json({
      success: true,
      message: 'Scheduling cancelled successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
