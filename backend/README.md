# Online Auction System - Backend

Express.js and MongoDB backend API for the Online Auction System with real-time bidding support.

## Features

- **RESTful API**: Clean and organized API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Supplier, and Customer roles
- **Real-time Updates**: Socket.IO for live bid updates
- **MongoDB Database**: NoSQL database with Mongoose ODM
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling middleware

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- MongoDB Compass (optional, for GUI)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update values as needed
   - Default MongoDB URI: `mongodb://localhost:27017/online_auction_system`
   - Default Admin credentials: `admin@auction.com` / `admin123`

3. Make sure MongoDB is running on your system

## Database Setup

1. Start MongoDB service:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

2. Seed the database with admin user and sample categories:
```bash
node src/utils/seed.js
```

This will create:
- Admin user with credentials from .env file
- 8 sample categories (Electronics, Furniture, Vehicles, etc.)

## Running the Application

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── productController.js # Product/auction logic
│   │   ├── bidController.js     # Bidding logic
│   │   └── categoryController.js # Category management
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Product.js           # Product schema
│   │   ├── Bid.js               # Bid schema
│   │   ├── Category.js          # Category schema
│   │   └── WinningBid.js        # Winning bid schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── bidRoutes.js         # Bid endpoints
│   │   └── categoryRoutes.js    # Category endpoints
│   ├── middleware/
│   │   └── auth.js              # Auth middleware
│   ├── utils/
│   │   └── seed.js              # Database seeder
│   └── server.js                # Main application file
├── .env                         # Environment variables
└── package.json
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (supplier/customer)
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)

### Users (`/api/users`) - Admin Only
- `GET /` - Get all users
- `GET /suppliers` - Get all suppliers
- `GET /customers` - Get all customers
- `PUT /:id/approve` - Approve user
- `PUT /:id/block` - Block user
- `PUT /:id/unblock` - Unblock user
- `DELETE /:id` - Delete user

### Products (`/api/products`)
- `GET /` - Get all products
- `GET /active` - Get active auctions
- `GET /category/:category` - Get products by category
- `GET /:id` - Get single product
- `GET /supplier/my-products` - Get supplier's products (Protected/Supplier)
- `POST /` - Create product (Protected/Supplier)
- `PUT /:id` - Update product (Protected/Supplier)
- `DELETE /:id` - Delete product (Protected/Supplier)
- `POST /:id/accept-bid` - Accept highest bid (Protected/Supplier)
- `POST /:id/reject-bid` - Reject bid (Protected/Supplier)

### Bids (`/api/bids`)
- `POST /` - Place bid (Protected/Customer)
- `GET /product/:productId` - Get bids for product
- `GET /my-bids` - Get customer's bids (Protected/Customer)
- `GET /all` - Get all bids (Protected/Admin)

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `GET /active` - Get active categories
- `GET /:id` - Get single category
- `POST /` - Create category (Protected/Admin)
- `PUT /:id` - Update category (Protected/Admin)
- `DELETE /:id` - Delete category (Protected/Admin)

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'supplier', 'customer'],
  phone: String,
  address: String,
  isApproved: Boolean,
  isBlocked: Boolean,
  timestamps: true
}
```

### Product
```javascript
{
  name: String,
  description: String,
  category: String,
  basePrice: Number,
  currentPrice: Number,
  images: [String],
  supplierId: ObjectId (ref: User),
  supplierName: String,
  auctionStartTime: Date,
  auctionEndTime: Date,
  status: ['pending', 'active', 'completed', 'cancelled'],
  highestBid: Number,
  highestBidder: ObjectId (ref: User),
  winnerId: ObjectId (ref: User),
  timestamps: true
}
```

### Bid
```javascript
{
  productId: ObjectId (ref: Product),
  productName: String,
  customerId: ObjectId (ref: User),
  customerName: String,
  customerEmail: String,
  bidAmount: Number,
  bidTime: Date,
  isWinning: Boolean,
  status: ['active', 'won', 'lost', 'rejected'],
  timestamps: true
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
  imageUrl: String,
  isActive: Boolean,
  timestamps: true
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Real-time Features

Socket.IO is used for real-time bid updates:

### Socket Events

**Client to Server:**
- `joinProduct` - Join a product room for updates
- `leaveProduct` - Leave a product room

**Server to Client:**
- `bidUpdate` - Emitted when a new bid is placed
  ```javascript
  {
    productId: String,
    newBid: Number,
    bidderId: String,
    bidderName: String
  }
  ```

## Default Admin Credentials

After running the seed script:
- Email: `admin@auction.com`
- Password: `admin123`

⚠️ **Important**: Change these credentials in production!

## Technologies Used

- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Socket.IO**: Real-time communication
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Error Handling

The API returns consistent error responses:

```javascript
{
  success: false,
  message: "Error message here"
}
```

## Success Responses

Successful responses follow this format:

```javascript
{
  success: true,
  data: { ... },
  message: "Optional success message"
}
```

## Development Tips

1. Use MongoDB Compass to view and manage your database
2. Check console logs for Socket.IO connection events
3. Use Postman or similar tools to test API endpoints
4. Monitor real-time bid updates in the browser console

## Future Enhancements

- Email notifications for bid updates
- Payment gateway integration
- Image upload functionality
- Advanced search and filters
- Auction scheduling
- Bid history analytics
