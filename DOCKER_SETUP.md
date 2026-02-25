# Docker Deployment Guide

This guide explains how to run the Online Auction System using Docker and Docker Compose.

## Prerequisites

- Docker (latest version)
- Docker Compose (latest version)
- Git

## Quick Start with Docker Compose

### 1. Clone the Repository
```bash
git clone <repository-url>
cd online-auction-system
```

### 2. Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

This command will:
- Start MongoDB container on port 27017
- Start Backend (Express) on port 3000
- Start Frontend (Angular) on port 4200
- Create a bridge network for inter-service communication

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

### 4. Default Admin Credentials

- Email: `admin@auction.com`
- Password: `admin123`

## Docker Compose Services

### MongoDB
- **Service Name**: `mongodb`
- **Port**: 27017
- **Root User**: admin
- **Root Password**: admin123
- **Data**: Persisted in `mongodb_data` volume

### Backend
- **Service Name**: `backend`
- **Port**: 3000
- **Environment**: Development mode with hot reload
- **Dependencies**: MongoDB

### Frontend
- **Service Name**: `frontend`
- **Port**: 4200
- **Build**: Optimized production build
- **Web Server**: Nginx

## Common Docker Compose Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart backend

# Run a command in a container
docker-compose exec backend npm run seed
docker-compose exec backend node src/utils/seed.js
```

## Manual Docker Build (Without Compose)

### Build Backend Image
```bash
docker build -f backend/Dockerfile -t auction-backend .
docker run -d -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017/online_auction_system \
  -e JWT_SECRET=your_secret_key \
  --name auction_backend \
  auction-backend
```

### Build Frontend Image
```bash
docker build -f frontend/Dockerfile -t auction-frontend .
docker run -d -p 4200:4200 \
  --name auction_frontend \
  auction-frontend
```

## Environment Variables

The `docker-compose.yml` includes default environment variables. To customize:

1. Create a `.env.docker` file in the project root
2. Update variables as needed
3. Modify `docker-compose.yml` to use `env_file: .env.docker`

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB container status
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Rebuild backend image
docker-compose up --build backend
```

### Port Already in Use
```bash
# Change port mapping in docker-compose.yml
# Example: Change "3000:3000" to "3001:3000"

# Or kill the process using the port
# Linux/macOS:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Initialization
```bash
# Seed the database
docker-compose exec backend node src/utils/seed.js
```

## Performance Optimization

### Production Deployment
For production, use optimized images without development dependencies:

```bash
# Rebuild without hot reload
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Backend
```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3
```

## Volume Management

```bash
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Backup MongoDB data
docker run --rm -v mongodb_data:/data -v $(pwd):/backup \
  mongo:6.0 mongodump --out /backup/mongodb_backup
```

## Network Communication

Services communicate via the `auction_network`:
- Backend connects to MongoDB at `mongodb:27017`
- Frontend connects to Backend at `http://backend:3000`
- All services use internal network (not exposed to host unless specified)

## Cleanup

```bash
# Remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove Docker images
docker rmi auction-backend auction-frontend mongo:6.0 nginx:alpine
```

---

For more information, see the main README.md
