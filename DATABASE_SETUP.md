# MongoDB Database Setup Guide

Complete guide for setting up MongoDB for the Online Auction System.

## Table of Contents
1. [Installation](#installation)
2. [Starting MongoDB](#starting-mongodb)
3. [Database Configuration](#database-configuration)
4. [Initial Setup](#initial-setup)
5. [MongoDB Compass](#mongodb-compass)
6. [Troubleshooting](#troubleshooting)

## Installation

### Windows

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download the MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Select "Install MongoDB as a Service"
   - Keep default settings

3. **Verify Installation**
   ```cmd
   mongod --version
   ```

### macOS

1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Verify Installation**
   ```bash
   mongod --version
   ```

### Linux (Ubuntu/Debian)

1. **Import MongoDB public key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Create list file**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Verify Installation**
   ```bash
   mongod --version
   ```

## Starting MongoDB

### Windows

**Method 1: As a Service (Automatic)**
```cmd
net start MongoDB
```

**Method 2: Manual Start**
```cmd
mongod --dbpath "C:\data\db"
```

**Stop MongoDB Service**
```cmd
net stop MongoDB
```

### macOS

**Start MongoDB**
```bash
brew services start mongodb-community
```

**Stop MongoDB**
```bash
brew services stop mongodb-community
```

**Check Status**
```bash
brew services list
```

### Linux

**Start MongoDB**
```bash
sudo systemctl start mongod
```

**Enable auto-start on boot**
```bash
sudo systemctl enable mongod
```

**Stop MongoDB**
```bash
sudo systemctl stop mongod
```

**Check Status**
```bash
sudo systemctl status mongod
```

## Database Configuration

### Default Configuration

MongoDB runs on:
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `online_auction_system`

### Connection String

```
mongodb://localhost:27017/online_auction_system
```

This is configured in the backend `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/online_auction_system
```

## Initial Setup

### 1. Start MongoDB Service

Ensure MongoDB is running before proceeding.

### 2. Run Database Seeder

The backend includes a seeder script that creates:
- Admin user
- Sample categories

```bash
# Navigate to backend directory
cd backend

# Run the seeder
node src/utils/seed.js
```

**Expected Output:**
```
✓ MongoDB Connected: localhost
✓ Admin user created
✓ Category "Electronics" created
✓ Category "Furniture" created
✓ Category "Vehicles" created
...

✓ Database seeding completed successfully!

Admin Credentials:
Email: admin@auction.com
Password: admin123
```

### 3. Verify Database Creation

**Using MongoDB Shell:**
```bash
# Connect to MongoDB
mongosh

# Switch to database
use online_auction_system

# Show collections
show collections

# View admin user
db.users.find({ role: "admin" }).pretty()

# View categories
db.categories.find().pretty()

# Exit
exit
```

## MongoDB Compass

MongoDB Compass is a GUI tool for managing MongoDB databases.

### Installation

Download from: https://www.mongodb.com/try/download/compass

### Connecting to Database

1. **Open MongoDB Compass**
2. **Connection String**: `mongodb://localhost:27017`
3. **Click "Connect"**

### Viewing Data

1. In the left sidebar, find `online_auction_system`
2. Click to expand and view collections:
   - users
   - products
   - bids
   - categories
   - winningbids

### Useful Operations

**View Documents:**
- Click on a collection to view all documents
- Use the filter bar to search: `{ role: "admin" }`

**Add Documents:**
- Click "Add Data" → "Insert Document"
- Enter JSON data

**Edit Documents:**
- Click on a document
- Modify fields
- Click "Update"

**Delete Documents:**
- Hover over a document
- Click the trash icon

## Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ["admin", "supplier", "customer"],
  phone: String,
  address: String,
  isApproved: Boolean,
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### products
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  basePrice: Number,
  currentPrice: Number,
  images: [String],
  supplierId: ObjectId,
  supplierName: String,
  auctionStartTime: Date,
  auctionEndTime: Date,
  status: ["pending", "active", "completed", "cancelled"],
  highestBid: Number,
  highestBidder: ObjectId,
  winnerId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### bids
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  productName: String,
  customerId: ObjectId,
  customerName: String,
  customerEmail: String,
  bidAmount: Number,
  bidTime: Date,
  isWinning: Boolean,
  status: ["active", "won", "lost", "rejected"],
  createdAt: Date,
  updatedAt: Date
}
```

#### categories
```javascript
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  imageUrl: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### winningbids
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  productName: String,
  customerId: ObjectId,
  customerName: String,
  supplierId: ObjectId,
  supplierName: String,
  winningAmount: Number,
  status: ["pending", "accepted", "rejected"],
  paymentStatus: ["pending", "completed", "failed"],
  auctionEndTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Cannot Connect to MongoDB

**Check if MongoDB is running:**
```bash
# Windows
tasklist | findstr mongod

# macOS/Linux
ps aux | grep mongod
```

**Check MongoDB logs:**
```bash
# Windows
C:\Program Files\MongoDB\Server\6.0\log\mongod.log

# macOS
/usr/local/var/log/mongodb/mongo.log

# Linux
/var/log/mongodb/mongod.log
```

### Port 27017 Already in Use

**Find process using the port:**
```bash
# Windows
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :27017
```

**Kill the process:**
```bash
# Windows (replace PID with actual process ID)
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Database Not Created

MongoDB creates databases automatically when you first insert data. If the database doesn't appear:

1. Ensure MongoDB is running
2. Run the seeder script
3. Refresh MongoDB Compass
4. Check backend connection string in `.env`

### Permission Issues (Linux/macOS)

```bash
# Give proper permissions to MongoDB directories
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Restart MongoDB
sudo systemctl restart mongod
```

### Data Directory Not Found (Windows)

Create the data directory:
```cmd
mkdir C:\data\db
```

## Backup and Restore

### Backup Database

```bash
# Backup entire database
mongodump --db online_auction_system --out ./backup

# Backup specific collection
mongodump --db online_auction_system --collection users --out ./backup
```

### Restore Database

```bash
# Restore entire database
mongorestore --db online_auction_system ./backup/online_auction_system

# Restore specific collection
mongorestore --db online_auction_system --collection users ./backup/online_auction_system/users.bson
```

## Security Best Practices

### 1. Enable Authentication (Production)

```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})
```

### 2. Update Connection String

```
mongodb://admin:secure_password@localhost:27017/online_auction_system?authSource=admin
```

### 3. Bind to Specific IP

Edit MongoDB configuration file (`mongod.conf`):
```yaml
net:
  bindIp: 127.0.0.1
```

## Useful MongoDB Commands

```bash
# Connect to MongoDB shell
mongosh

# Show all databases
show dbs

# Use specific database
use online_auction_system

# Show collections
show collections

# Count documents in collection
db.users.countDocuments()

# Find all documents
db.users.find()

# Find with filter
db.users.find({ role: "admin" })

# Find one document
db.users.findOne({ email: "admin@auction.com" })

# Update document
db.users.updateOne(
  { email: "admin@auction.com" },
  { $set: { name: "Super Admin" } }
)

# Delete document
db.users.deleteOne({ email: "test@example.com" })

# Drop collection
db.users.drop()

# Drop database
db.dropDatabase()
```

## Resources

- **Official Documentation**: https://docs.mongodb.com/
- **MongoDB University**: https://university.mongodb.com/
- **Community Forums**: https://www.mongodb.com/community/forums/
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/mongodb

---

For application-specific help, refer to the main README.md file.
