const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const { startScheduledAuctionJob } = require('./utils/scheduledAuctionJob');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Parse CORS origins
const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200,http://localhost:4201').split(',').map(url => url.trim());

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join product room for real-time updates
  socket.on('joinProduct', (productId) => {
    socket.join(productId);
    console.log(`User ${socket.id} joined product room: ${productId}`);
  });

  // Leave product room
  socket.on('leaveProduct', (productId) => {
    socket.leave(productId);
    console.log(`User ${socket.id} left product room: ${productId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' }
});

const bidLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many bid requests, please slow down.' }
});

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Sanitize MongoDB query injection

// Apply general rate limit globally
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/bids', bidLimiter, require('./routes/bidRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Online Auction System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      bids: '/api/bids',
      categories: '/api/categories',
      analytics: '/api/analytics',
      ratings: '/api/ratings'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

// ── Auto-finalize expired auctions ──────────────────────────
const Product = require('./models/Product');
const Bid = require('./models/Bid');
const WinningBid = require('./models/WinningBid');

async function finalizeExpiredAuctions() {
  try {
    const now = new Date();
    // Find active products whose auction end time has passed
    const expiredProducts = await Product.find({
      status: 'active',
      auctionEndTime: { $lte: now }
    });

    for (const product of expiredProducts) {
      // Mark as completed
      product.status = 'completed';
      await product.save();

      // Skip if WinningBid record already exists
      const existing = await WinningBid.findOne({ productId: product._id });
      if (existing) continue;

      // Get the highest bid
      const highestBid = await Bid.findOne({ productId: product._id })
        .sort({ bidAmount: -1 });

      if (highestBid) {
        await WinningBid.create({
          productId: product._id,
          productName: product.name,
          customerId: highestBid.customerId,
          customerName: highestBid.customerName,
          supplierId: product.supplierId,
          supplierName: product.supplierName || '',
          winningAmount: highestBid.bidAmount,
          status: 'pending',
          paymentStatus: 'pending',
          auctionEndTime: product.auctionEndTime
        });
        console.log(`[Finalize] Created WinningBid for "${product.name}" — winner: ${highestBid.customerName}`);
      }
    }

    if (expiredProducts.length > 0) {
      console.log(`[Finalize] Processed ${expiredProducts.length} expired auction(s)`);
    }
  } catch (err) {
    console.error('[Finalize] Error:', err.message);
  }
}

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.IO server running on port ${PORT}`);

  // Start scheduled auction activation job
  startScheduledAuctionJob();

  // Run immediately on start, then every 60 seconds
  finalizeExpiredAuctions();
  setInterval(finalizeExpiredAuctions, 60 * 1000);
  console.log('[Finalize] Auction auto-finalization scheduler started (every 60s)');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
