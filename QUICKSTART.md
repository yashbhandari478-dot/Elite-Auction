# 🚀 Quick Start Guide - Online Auction System

Get your auction system up and running in 5 minutes!

## Prerequisites Checklist
- [ ] Node.js installed (v16+)
- [ ] MongoDB installed and running
- [ ] Angular CLI installed globally

## Step-by-Step Setup

### 1️⃣ Install Node.js
If not already installed:
- Download from: https://nodejs.org/
- Install the LTS version
- Verify: `node --version` and `npm --version`

### 2️⃣ Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Install and start the service
- Verify: MongoDB should be running on `localhost:27017`

### 3️⃣ Install Angular CLI
```bash
npm install -g @angular/cli
```

### 4️⃣ Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd online-auction-system/backend

# Install dependencies
npm install

# Seed database (creates admin & categories)
node src/utils/seed.js

# Start backend server
npm run dev
```

✅ Backend running on http://localhost:3000

**Admin Login:**
- Email: admin@auction.com
- Password: admin123

### 5️⃣ Frontend Setup (Terminal 2 - New Window)

```bash
# Navigate to frontend (from project root)
cd online-auction-system/frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

✅ Frontend running on http://localhost:4200

### 6️⃣ Access the Application

Open your browser and go to: **http://localhost:4200**

## First Time Use

### A. Login as Admin
1. Go to http://localhost:4200
2. Click "Login"
3. Select role: **Admin**
4. Email: `admin@auction.com`
5. Password: `admin123`
6. You should see the admin dashboard!

### B. Create a Supplier Account
1. Logout from admin
2. Click "Register"
3. Select role: **Supplier**
4. Fill in the form:
   - Name: Test Supplier
   - Email: supplier@test.com
   - Password: supplier123
5. Click "Register"
6. You'll see a message: "Wait for admin approval"

### C. Approve the Supplier (as Admin)
1. Login as admin
2. Go to "Users" from the navbar
3. Find the supplier you just created
4. Click "Approve"
5. Supplier is now active!

### D. Add a Product (as Supplier)
1. Logout and login as supplier
   - Email: supplier@test.com
   - Password: supplier123
2. Click "Add New Product"
3. Fill in product details:
   - Name: iPhone 15 Pro
   - Category: Electronics
   - Base Price: 50000
   - Description: Brand new iPhone
   - Start Time: (current time)
   - End Time: (1 hour from now)
4. Click "Create Product"

### E. Create a Customer Account
1. Logout from supplier
2. Register as **Customer**
   - Email: customer@test.com
   - Password: customer123
3. Approve from admin panel (repeat step C)

### F. Place a Bid (as Customer)
1. Login as customer
2. Browse products
3. Click on the product
4. Enter bid amount (higher than base price)
5. Click "Place Bid"
6. Watch real-time updates!

## Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"
**Solution:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ❌ "Port 3000 already in use"
**Solution:** Kill the process or change port in backend/.env

### ❌ "Port 4200 already in use"
**Solution:**
```bash
ng serve --port 4201
```

### ❌ Frontend can't connect to backend
**Solution:** Make sure backend is running on http://localhost:3000

### ❌ Admin user not found
**Solution:**
```bash
cd backend
node src/utils/seed.js
```

## Verify Everything is Working

### ✅ Backend Health Check
Visit: http://localhost:3000
Should see: API information

### ✅ Frontend Health Check
Visit: http://localhost:4200
Should see: Login/Register page

### ✅ Database Check
Using MongoDB Compass:
- Connect to: mongodb://localhost:27017
- Check database: online_auction_system
- Collections should include: users, categories

## Project Structure Overview

```
online-auction-system/
├── frontend/          ← Angular app (Port 4200)
│   ├── src/app/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   └── package.json
│
├── backend/           ← Express.js API (Port 3000)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
└── README.md         ← Full documentation
```

## Development Workflow

### Normal Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### After Making Changes
- **Backend changes**: Server auto-restarts (nodemon)
- **Frontend changes**: Browser auto-reloads (Angular)

## Testing the Real-time Features

1. Open TWO browser windows
2. Window 1: Login as supplier, go to product page
3. Window 2: Login as customer, go to same product
4. Place a bid from Window 2
5. Watch Window 1 update in real-time! ⚡

## Next Steps

1. ✅ Explore admin panel
2. ✅ Create more suppliers and customers
3. ✅ Add multiple products
4. ✅ Test the bidding system
5. ✅ Review the code structure
6. ✅ Customize for your needs

## Need More Help?

- **Full Documentation**: README.md
- **Database Guide**: DATABASE_SETUP.md
- **Frontend Details**: frontend/README.md
- **Backend Details**: backend/README.md

## Default Test Accounts

After seeding, you have these accounts:

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@auction.com  | admin123    |

Create your own suppliers and customers through registration!

---

**🎉 Happy Auctioning!**

Need more features? Check the "Future Enhancements" section in README.md
