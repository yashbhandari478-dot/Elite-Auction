# Online Auction System - Full Stack Application

A comprehensive online auction platform with three user panels (Admin, Supplier, Customer) featuring real-time bidding, secure authentication, and efficient auction management.

## 🚀 Features

### Admin Panel
- Dashboard with system statistics
- User management (approve, block, delete customers & suppliers)
- Category management
- Monitor all auctions and bids
- Generate reports

### Supplier Panel
- Product/auction listing management
- Set base prices and auction duration
- Real-time bid monitoring
- Accept/reject highest bids
- Sales history tracking

### Customer Panel
- Browse auctions by category
- Real-time bidding on active auctions
- Bid history tracking
- Won auctions management
- Live auction countdown timers

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript
- **Styling**: CSS3
- **Real-time**: Socket.IO Client
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Real-time**: Socket.IO Server
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

### Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Management Tool**: MongoDB Compass

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **MongoDB Compass** (optional) - [Download](https://www.mongodb.com/try/download/compass)
- **Angular CLI** (v17 or higher) - Install with `npm install -g @angular/cli`

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd online-auction-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB service
# On Windows: net start MongoDB
# On macOS/Linux: sudo systemctl start mongod

# Seed the database (creates admin user and categories)
node src/utils/seed.js

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:3000`

**Default Admin Credentials:**
- Email: `admin@auction.com`
- Password: `admin123`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Angular development server
npm start
```

Frontend will run on `http://localhost:4200`

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## 📁 Project Structure

```
online-auction-system/
├── frontend/                    # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── admin/      # Admin panel components
│   │   │   │   ├── supplier/   # Supplier panel components
│   │   │   │   ├── customer/   # Customer panel components
│   │   │   │   └── shared/     # Shared components
│   │   │   ├── services/       # API services
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   ├── guards/         # Route guards
│   │   │   └── interceptors/   # HTTP interceptors
│   │   └── styles.css          # Global styles
│   └── package.json
│
├── backend/                     # Express.js backend application
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── config/             # Configuration files
│   │   ├── utils/              # Utility functions
│   │   └── server.js           # Main server file
│   ├── .env                    # Environment variables
│   └── package.json
│
└── README.md                   # This file
```

## 🔐 User Roles & Access

### Admin
- Full system access
- Manage users (approve, block, delete)
- Manage categories
- Monitor all auctions
- Auto-approved upon creation

### Supplier
- Create and manage auction products
- View bids on their products
- Accept/reject highest bids
- View sales history
- **Requires admin approval after registration**

### Customer
- Browse and search auctions
- Place bids on active auctions
- View bid history
- Track won auctions
- **Requires admin approval after registration**

## 🔄 Workflow

1. **Admin Setup**
   - Run database seed script to create admin account
   - Login as admin
   - Create categories for products

2. **Supplier Registration**
   - Supplier registers on the platform
   - Admin approves supplier account
   - Supplier can now add products for auction

3. **Product Listing**
   - Supplier creates product listing
   - Sets base price and auction duration
   - Auction becomes active at start time

4. **Customer Bidding**
   - Customer registers and gets approved by admin
   - Customer browses active auctions
   - Places bids on desired products
   - Receives real-time updates on bid status

5. **Auction Completion**
   - Auction ends at specified time
   - Supplier accepts or rejects highest bid
   - If accepted, customer wins the auction

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/approve` - Approve user
- `PUT /api/users/:id/block` - Block user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/active` - Get active auctions
- `POST /api/products` - Create product (Supplier)
- `PUT /api/products/:id` - Update product (Supplier)
- `DELETE /api/products/:id` - Delete product (Supplier)

### Bids
- `POST /api/bids` - Place bid (Customer)
- `GET /api/bids/my-bids` - Get user's bids (Customer)
- `GET /api/bids/product/:id` - Get product bids

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)

## 🔧 Configuration

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/online_auction_system
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
ADMIN_EMAIL=admin@auction.com
ADMIN_PASSWORD=admin123
```

### Frontend (Environment)
Update API URL in service files if needed:
- Located in `frontend/src/app/services/*.service.ts`
- Default: `http://localhost:3000/api`

## 📊 Database Collections

1. **users** - User accounts (admin, suppliers, customers)
2. **products** - Auction products/listings
3. **bids** - Bid records
4. **categories** - Product categories
5. **winningbids** - Auction winning records

## 🔴 Real-time Features

The application uses Socket.IO for real-time updates:

- **Bid Updates**: All users viewing a product receive instant bid updates
- **Auction Status**: Live countdown timers on active auctions
- **Price Changes**: Current price updates in real-time

## 🧪 Testing the Application

1. **Admin Login**
   - Email: `admin@auction.com`
   - Password: `admin123`

2. **Create Test Supplier**
   - Register as supplier
   - Approve from admin panel
   - Add test products

3. **Create Test Customer**
   - Register as customer
   - Approve from admin panel
   - Place test bids

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Frontend (4200)
ng serve --port 4201

# Backend (3000)
# Update PORT in .env file
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm start  # Runs ng serve
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
ng build --configuration production
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Ensure MongoDB is accessible
3. Run `npm start`

### Frontend Deployment
1. Build the application: `ng build --prod`
2. Deploy the `dist/` folder to hosting platform
3. Update API URLs in environment files

## 📄 License

This project is developed for educational purposes.

## 👥 Support

For issues or questions:
1. Check the README files in frontend/ and backend/ directories
2. Review the troubleshooting section
3. Check MongoDB and server logs

## 🎯 Future Enhancements

- Email notifications
- Payment gateway integration
- Image upload functionality
- Advanced search filters
- Bid analytics dashboard
- Mobile app version
- Automated auction scheduling
- Multi-language support

---

**Happy Auctioning! 🎉**
