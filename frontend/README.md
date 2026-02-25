# Online Auction System - Frontend

Angular-based frontend application for the Online Auction System.

## Features

- **Three User Panels**: Admin, Supplier, and Customer
- **Real-time Bidding**: Live updates using WebSocket
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: JWT-based authentication with role-based access control

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Angular CLI (v17 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Angular CLI globally (if not already installed):
```bash
npm install -g @angular/cli
```

## Running the Application

Start the development server:
```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

## Build for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/          # Admin panel components
│   │   ├── supplier/       # Supplier panel components
│   │   ├── customer/       # Customer panel components
│   │   └── shared/         # Shared components (navbar, login, register)
│   ├── services/           # API services
│   ├── models/             # TypeScript interfaces
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/                 # Static assets
└── styles.css             # Global styles
```

## User Roles

### Admin
- Default credentials: admin@auction.com / admin123
- Manage users (approve, block, delete)
- Manage categories
- Monitor auctions and bids
- View system statistics

### Supplier
- Register and wait for admin approval
- Add, update, delete auction products
- Set base price and auction duration
- View and manage bids
- Accept or reject highest bids

### Customer
- Register and wait for admin approval
- Browse products by category
- Place bids on active auctions
- View bid history
- Track won auctions

## API Configuration

The frontend connects to the backend API at `http://localhost:3000`. To change this, update the `apiUrl` in each service file under `src/app/services/`.

## Real-time Features

- Bid updates are pushed to all users viewing a product in real-time
- Auction timers count down live
- Product status updates automatically

## Technologies Used

- **Angular 17**: Frontend framework
- **RxJS**: Reactive programming
- **Socket.io-client**: Real-time communication
- **TypeScript**: Type-safe development
