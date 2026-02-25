const Product = require('../models/Product');
const WinningBid = require('../models/WinningBid');
const Bid = require('../models/Bid');
const logger = require('../utils/logger');

/**
 * @desc    Get supplier analytics dashboard data
 * @route   GET /api/analytics/supplier/dashboard
 * @access  Private/Supplier
 */
exports.getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Total Revenue & Payment Stats
    const revenueData = await WinningBid.aggregate([
      {
        $match: {
          supplierId: req.user._id,
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$winningAmount' },
          totalPlatformFees: { $sum: { $multiply: ['$winningAmount', 0.05] } },
          supplierPayout: { $sum: '$supplierPayout' },
          completedSales: { $sum: 1 }
        }
      }
    ]);

    // 2. Sales Trend (Last 6 months)
    const salesTrend = await WinningBid.aggregate([
      {
        $match: {
          supplierId: req.user._id,
          paymentStatus: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$winningAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 3. Product Stats
    const productStats = await Product.aggregate([
      { $match: { supplierId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Conversion Rate (Products Listed vs Sold)
    const totalProducts = await Product.countDocuments({ supplierId: req.user._id });
    const soldProducts = await WinningBid.countDocuments({ supplierId: req.user._id });
    const conversionRate = totalProducts > 0 ? ((soldProducts / totalProducts) * 100).toFixed(2) : 0;

    // 5. Top Selling Products (by bids)
    const topProducts = await Product.aggregate([
      { $match: { supplierId: req.user._id } },
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'productId',
          as: 'bids'
        }
      },
      {
        $lookup: {
          from: 'winningbids',
          localField: '_id',
          foreignField: 'productId',
          as: 'sale'
        }
      },
      {
        $addFields: {
          bidCount: { $size: '$bids' },
          saleStatus: { $cond: [{ $gt: [{ $size: '$sale' }, 0] }, 'sold', 'unsold'] },
          highestBid: { $max: '$bids.bidAmount' }
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          basePrice: 1,
          bidCount: 1,
          saleStatus: 1,
          highestBid: 1,
          status: 1
        }
      },
      { $sort: { bidCount: -1 } },
      { $limit: 10 }
    ]);

    // 6. Customer Insights
    const customerInsights = await WinningBid.aggregate([
      { $match: { supplierId: req.user._id } },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          purchases: { $sum: 1 },
          totalSpent: { $sum: '$winningAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          customerName: 1,
          purchases: 1,
          totalSpent: 1,
          avgOrderValue: { $divide: ['$totalSpent', '$purchases'] }
        }
      }
    ]);

    // 7. Average Bid & Auction Performance
    const auctionPerformance = await Bid.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.supplierId': req.user._id } },
      {
        $group: {
          _id: null,
          avgBidsPerAuction: { $avg: 1 },
          avgBidIncrement: {
            $avg: {
              $subtract: ['$bidAmount', { $ifNull: ['$previousBidAmount', '$product.basePrice'] }]
            }
          },
          totalBidsReceived: { $sum: 1 }
        }
      }
    ]);

    // 8. Category Performance
    const categoryPerformance = await WinningBid.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.supplierId': req.user._id } },
      {
        $group: {
          _id: '$product.category',
          sales: { $sum: 1 },
          revenue: { $sum: '$winningAmount' },
          avgPrice: { $avg: '$winningAmount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 9. Pending Deliveries & Payments
    const pendingStats = await WinningBid.aggregate([
      { $match: { supplierId: req.user._id } },
      {
        $group: {
          _id: null,
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          pendingDeliveries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentStatus', 'completed'] },
                    { $ne: ['$deliveryStatus', 'delivered'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const formatSalesTrend = salesTrend.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      sales: item.sales,
      revenue: item.revenue
    }));

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalPlatformFees: 0,
      supplierPayout: 0,
      completedSales: 0
    };

    const productBreakdown = productStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { active: 0, pending: 0, completed: 0, rejected: 0 });

    const auctions = auctionPerformance[0] || {
      avgBidsPerAuction: 0,
      avgBidIncrement: 0,
      totalBidsReceived: 0
    };

    const pending = pendingStats[0] || {
      pendingPayments: 0,
      pendingDeliveries: 0
    };

    const dashboard = {
      summary: {
        totalRevenue: revenue.totalRevenue,
        supplierPayout: revenue.supplierPayout,
        platformFees: revenue.totalPlatformFees,
        completedSales: revenue.completedSales,
        totalProducts: totalProducts,
        conversionRate: parseFloat(conversionRate),
        avgOrderValue: revenue.completedSales > 0 ? (revenue.totalRevenue / revenue.completedSales).toFixed(2) : 0
      },
      pending: {
        pendingPayments: pending.pendingPayments,
        pendingDeliveries: pending.pendingDeliveries
      },
      productBreakdown,
      salesTrend: formatSalesTrend,
      topProducts: topProducts.slice(0, 10),
      topCustomers: customerInsights.slice(0, 10),
      auctionMetrics: auctions,
      categoryPerformance: categoryPerformance
    };

    logger.info('Supplier analytics retrieved', {
      supplierId: req.user._id,
      email: req.user.email,
      completedSales: revenue.completedSales
    });

    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('Error fetching supplier analytics', { error: error.message, supplierId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
  }
};

/**
 * @desc    Get supplier revenue trend (customizable date range)
 * @route   GET /api/analytics/supplier/revenue-trend
 * @access  Private/Supplier
 * @query   startDate, endDate (ISO format), groupBy (day|week|month)
 */
exports.getRevenueTrend = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const supplierId = req.user._id;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const timeUnit = {
      day: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
      week: { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
      month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
    };

    const trend = await WinningBid.aggregate([
      {
        $match: {
          supplierId,
          paymentStatus: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: timeUnit[groupBy],
          revenue: { $sum: '$winningAmount' },
          sales: { $sum: 1 },
          avgPrice: { $avg: '$winningAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    logger.info('Revenue trend generated', { supplierId, groupBy, days: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) });
    res.json({ success: true, data: trend });
  } catch (error) {
    logger.error('Error generating revenue trend', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to generate revenue trend' });
  }
};

/**
 * @desc    Get product performance metrics
 * @route   GET /api/analytics/supplier/product-performance
 * @access  Private/Supplier
 */
exports.getProductPerformance = async (req, res) => {
  try {
    const supplierId = req.user._id;

    const performance = await Product.aggregate([
      { $match: { supplierId } },
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'productId',
          as: 'bids'
        }
      },
      {
        $lookup: {
          from: 'winningbids',
          localField: '_id',
          foreignField: 'productId',
          as: 'sale'
        }
      },
      {
        $addFields: {
          bidCount: { $size: '$bids' },
          highestBid: { $max: '$bids.bidAmount' },
          finalPrice: {
            $cond: [
              { $gt: [{ $size: '$sale' }, 0] },
              { $arrayElemAt: ['$sale.winningAmount', 0] },
              null
            ]
          },
          saleStatus: { $cond: [{ $gt: [{ $size: '$sale' }, 0] }, 'sold', 'unsold'] },
          roi: {
            $cond: [
              { $gt: [{ $size: '$sale' }, 0] },
              {
                $multiply: [
                  { $divide: [{ $subtract: [{ $arrayElemAt: ['$sale.winningAmount', 0] }, '$basePrice'] }, '$basePrice'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          basePrice: 1,
          status: 1,
          bidCount: 1,
          highestBid: 1,
          finalPrice: 1,
          saleStatus: 1,
          roi: { $round: ['$roi', 2] },
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    logger.info('Product performance retrieved', { supplierId, productCount: performance.length });
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('Error fetching product performance', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch product performance' });
  }
};
