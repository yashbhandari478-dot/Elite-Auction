const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const WinningBid = require('../models/WinningBid');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({ role: 'admin' });
    // await Category.deleteMany({});

    // Create admin user
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@auction.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isApproved: true,
        isBlocked: false
      });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create sample categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        isActive: true
      },
      {
        name: 'Furniture',
        description: 'Home and office furniture',
        isActive: true
      },
      {
        name: 'Vehicles',
        description: 'Cars, bikes, and other vehicles',
        isActive: true
      },
      {
        name: 'Art & Collectibles',
        description: 'Artwork, antiques, and collectibles',
        isActive: true
      },
      {
        name: 'Books',
        description: 'Books and magazines',
        isActive: true
      },
      {
        name: 'Fashion',
        description: 'Clothing, accessories, and fashion items',
        isActive: true
      },
      {
        name: 'Sports Equipment',
        description: 'Sports and fitness equipment',
        isActive: true
      },
      {
        name: 'Home Appliances',
        description: 'Kitchen and home appliances',
        isActive: true
      }
    ];

    for (const category of categories) {
      const exists = await Category.findOne({ name: category.name });
      if (!exists) {
        await Category.create(category);
        console.log(`✓ Category "${category.name}" created`);
      } else {
        console.log(`✓ Category "${category.name}" already exists`);
      }
    }

    // Create test supplier
    let supplier = await User.findOne({ email: 'supplier@auction.com' });
    if (!supplier) {
      supplier = await User.create({
        name: 'Test Supplier',
        email: 'supplier@auction.com',
        password: 'supplier123',
        role: 'supplier',
        phone: '9876543210',
        address: '123 Business St'
      });
      console.log('✓ Test supplier created');
    }

    // Create sample approved products
    const admin = await User.findOne({ role: 'admin' });
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const sampleProducts = [
      {
        name: 'iPhone 14 Pro',
        description: 'Latest Apple smartphone with advanced features',
        category: 'Electronics',
        basePrice: 50000,
        images: ['https://placehold.co/300x300?text=iPhone+14'],
        supplierId: supplier._id,
        supplierName: supplier.name,
        currentPrice: 50000,
        auctionStartTime: now,
        auctionEndTime: in3Days,
        status: 'active',
        isApproved: true,
        approvedBy: admin._id
      },
      {
        name: 'Wooden Dining Table',
        description: 'Beautiful handcrafted dining table for 6 people',
        category: 'Furniture',
        basePrice: 15000,
        images: ['https://placehold.co/300x300?text=Dining+Table'],
        supplierId: supplier._id,
        supplierName: supplier.name,
        currentPrice: 15000,
        auctionStartTime: now,
        auctionEndTime: in3Days,
        status: 'active',
        isApproved: true,
        approvedBy: admin._id
      },
      {
        name: 'Mountain Bike',
        description: 'Professional grade mountain bike with 21 gears',
        category: 'Sports Equipment',
        basePrice: 25000,
        images: ['https://placehold.co/300x300?text=Mountain+Bike'],
        supplierId: supplier._id,
        supplierName: supplier.name,
        currentPrice: 25000,
        auctionStartTime: now,
        auctionEndTime: tomorrow,
        status: 'active',
        isApproved: true,
        approvedBy: admin._id
      }
    ];

    for (const productData of sampleProducts) {
      const exists = await Product.findOne({ name: productData.name });
      if (!exists) {
        await Product.create(productData);
        console.log(`✓ Sample product "${productData.name}" created (APPROVED)`);
      }
    }

    // Create test customer
    let customer = await User.findOne({ email: 'customer@auction.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Test Customer',
        email: 'customer@auction.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543219',
        address: '789 Customer Ave'
      });
      console.log('✓ Test customer created with ID:', customer._id);
    } else {
      console.log('✓ Test customer already exists with ID:', customer._id);
      // Refresh customer object to ensure we have the latest ID
      customer = await User.findById(customer._id);
    }

    // Create sample winning bids (completed auctions)
    // First, delete old winning bids to ensure fresh data with correct customer ID
    await WinningBid.deleteMany({ productName: { $in: ['Vintage Camera', 'Wireless Headphones'] } });
    console.log('✓ Cleaned up old winning bids');

    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

    const sampleWinningBids = [
      {
        productId: null,
        productName: 'Vintage Camera',
        customerId: customer._id,
        customerName: customer.name,
        supplierId: supplier._id,
        supplierName: supplier.name,
        winningAmount: 12500,
        status: 'pending',
        paymentStatus: 'pending',
        auctionEndTime: pastDate
      },
      {
        productId: null,
        productName: 'Wireless Headphones',
        customerId: customer._id,
        customerName: customer.name,
        supplierId: supplier._id,
        supplierName: supplier.name,
        winningAmount: 8900,
        status: 'accepted',
        paymentStatus: 'completed',
        auctionEndTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const winningBidData of sampleWinningBids) {
      await WinningBid.create(winningBidData);
      console.log(`✓ Sample winning bid for "${winningBidData.productName}" created (Customer ID: ${customer._id})`);
    }

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\n--- Test Accounts ---');
    console.log('Admin:');
    console.log('  Email:', process.env.ADMIN_EMAIL || 'admin@auction.com');
    console.log('  Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('\nSupplier:');
    console.log('  Email: supplier@auction.com');
    console.log('  Password: supplier123');
    console.log('\nCustomer:');
    console.log('  Email: customer@auction.com');
    console.log('  Password: customer123');
    console.log('\n--- Features ---');
    console.log('✓ Sample products are pre-approved for testing');
    console.log('✓ Sample winning bids created (check Won Auctions as customer)');
    console.log('✓ Create your own products as supplier - admin must approve them to be visible');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
