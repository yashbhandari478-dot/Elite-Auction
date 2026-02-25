const Product = require('../models/Product');
const logger = require('./logger');

// Global variable to store the interval ID
let scheduledAuctionInterval = null;

/**
 * Start scheduled auction activation job
 * Runs every 30 seconds to check and activate scheduled auctions
 */
function startScheduledAuctionJob() {
  // Run immediately on start, then every 30 seconds
  activateScheduledAuctions();

  scheduledAuctionInterval = setInterval(activateScheduledAuctions, 30 * 1000);
  
  logger.info('Scheduled auction activation job started (runs every 30 seconds)');
  return scheduledAuctionInterval;
}

/**
 * Check and activate scheduled auctions
 */
async function activateScheduledAuctions() {
  try {
    const now = new Date();
    
    // Find all scheduled products that should be activated
    const scheduledProducts = await Product.find({
      isScheduled: true,
      isActivationTriggered: false,
      status: 'pending',
      isApproved: true,
      scheduledActivationTime: { $lte: now }
    });

    if (scheduledProducts.length === 0) return;

    logger.info(`Found ${scheduledProducts.length} scheduled auctions to activate`);

    for (const product of scheduledProducts) {
      try {
        // Update status to active
        product.status = 'active';
        product.isActivationTriggered = true;
        await product.save();

        logger.info(`Activated scheduled auction`, {
          productId: product._id,
          name: product.name,
          supplierId: product.supplierId,
          activatedAt: new Date()
        });

        // Emit Socket.IO event if available
        const io = global.io;
        if (io) {
          io.emit('auctionActivated', {
            productId: product._id,
            productName: product.name,
            category: product.category,
            basePrice: product.basePrice,
            supplierId: product.supplierId
          });
        }
      } catch (error) {
        logger.error('Error activating scheduled auction', {
          productId: product._id,
          error: error.message
        });
      }
    }
  } catch (error) {
    logger.error('Error in scheduled auction activation', { error: error.message });
  }
}

/**
 * Stop the scheduled auction job
 */
function stopScheduledAuctionJob() {
  if (scheduledAuctionInterval) {
    clearInterval(scheduledAuctionInterval);
    scheduledAuctionInterval = null;
    logger.info('Scheduled auction activation job stopped');
  }
}

module.exports = {
  startScheduledAuctionJob,
  stopScheduledAuctionJob
};
