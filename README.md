# 🚗 Vehicle Tracker

A real-time vehicle tracking system built with Node.js, featuring live location updates, geofencing, and historical route playback. The system uses a microservices architecture with RabbitMQ for message queuing, Redis for caching and pub/sub, and WebSocket for real-time communication.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [GPS Data Simulator](#-gps-data-simulator)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality

- **Real-time Vehicle Tracking**: Live location updates via WebSocket connections
- **Historical Route Playback**: View and analyze past vehicle routes
- **Geofencing**: Create, manage, and monitor geographic boundaries
- **Device Management**: Register and manage GPS tracking devices
- **User Authentication**: Secure JWT-based authentication with email verification
- **Role-based Access Control**: Admin and user roles with different permissions

### Technical Features

- **Microservices Architecture**: Separated publisher, consumer, and API gateway services
- **Message Queue**: RabbitMQ for reliable message processing
- **Real-time Communication**: Socket.IO with Redis adapter for scalability
- **Caching Layer**: Redis for improved performance
- **Data Validation**: Joi schema validation for GPS records
- **Security**: Helmet, rate limiting, and CORS protection
- **Containerization**: Full Docker Compose deployment with health checks
- **Service Discovery**: Docker networking for inter-service communication
- **GPS Data Simulator**: Built-in script for testing with simulated vehicle data

## 🏗 Architecture

The system follows a microservices architecture with IoT devices sending data through a message queue:

```
┌──────────────┐
│ IoT Devices  │
│(GPS Trackers)│
└──────┬───────┘
       │ HTTP POST
       ▼
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Publisher      │────────▶│   RabbitMQ   │────────▶│   Consumer      │
│  Service        │         │ Message Queue│         │   Service       │
│  (Port 3001)    │         │  (Port 5672) │         │  (Port 3002)    │
│  - Validate     │         │              │         │  - Process      │
│  - Publish      │         │              │         │  - Store        │
└─────────────────┘         └──────────────┘         └────────┬────────┘
                                                              │
                                                              ▼
                                                         ┌──────────┐
                                                         │  Redis   │
                                                         │ Pub/Sub  │
                                                         │(Port     │
                                                         │    6379) │
                                                         └────┬─────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      User Service (API Gateway)                     │
│                           Port 3000                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ WebSocket│  │   Auth   │  │ Vehicles │  │ Geofence │             │
│  │  Server  │  │   JWT    │  │  CRUD    │  │   CRUD   │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   MongoDB    │
                          │ (Port 27017) │
                          └──────────────┘

                    Docker Network: app-network
         ┌─────────────────────────────────────────────────┐
         │  All services communicate via Docker networking  │
         │  Health checks ensure proper startup order      │
         └─────────────────────────────────────────────────┘
```

### Component Responsibilities

- **IoT Devices**: GPS tracking devices that send location data via HTTP to the Publisher Service
- **Publisher Service** (Port 3001): Receives GPS tracking data from IoT devices, validates it using Joi schemas, and publishes to RabbitMQ queue
- **RabbitMQ** (Ports 5672, 15672): Message broker for decoupling services and ensuring reliable message delivery with management UI
- **Consumer Service** (Port 3002): Processes messages from RabbitMQ, stores records in MongoDB, and publishes real-time updates to Redis pub/sub channel
- **Redis** (Port 6379): Pub/sub messaging for real-time updates and caching layer for improved performance
- **User Service / API Gateway** (Port 3000): Handles HTTP requests, JWT authentication, WebSocket connections, and serves clients
- **MongoDB** (Port 27017): Persistent data storage for vehicles, users, devices, geofences, and tracking records
- **Docker Network**: All services communicate via the `app-network` bridge network with DNS-based service discovery
- **Health Checks**: Ensures services start only when dependencies (MongoDB, Redis, RabbitMQ) are fully ready

## 🛠 Tech Stack

### Backend

- **Node.js** (v22+) & **Express.js** (v5.1.0) - Server framework
- **Socket.IO** (v4.8.1) - Real-time bidirectional communication
- **MongoDB** & **Mongoose** (v8.19.4) - Database and ODM
- **Redis** (v5.10.0) - Caching and pub/sub messaging
- **RabbitMQ** & **amqplib** - Message queuing

### Security & Validation

- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Joi** - Data validation
- **Helmet** (v8.1.0) - Security headers
- **express-rate-limit** (v8.2.1) - Rate limiting
- **CORS** - Cross-Origin Resource Sharing

### DevOps

- **Docker** & **Docker Compose** - Containerization
- **Morgan** - HTTP request logging
- **Nodemon** - Development auto-reload

### Email

- **SendGrid** - Email service for verification

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)
- **Redis** (v7 or higher)
- **RabbitMQ** (v3.12 or higher)
- **Docker** & **Docker Compose** (optional, for containerized deployment)

## 🚀 Installation

### Option 1: Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/ZiadNashaat17/Vehicle-Tracker.git
   cd Vehicle-Tracker
   ```

2. **Install dependencies for each service**

   ```bash
   # Install dependencies for all services
   cd publisher && npm install && cd ..
   cd consumer && npm install && cd ..
   cd user && npm install && cd ..
   ```

3. **Set up environment variables**

   Create `config.env` files in each service directory (publisher, consumer, user):

   ```bash
   # Copy and edit config.env for each service
   cp publisher/config.env.example publisher/config.env
   cp consumer/config.env.example consumer/config.env
   cp user/config.env.example user/config.env
   ```

4. **Start required infrastructure services**

   ```bash
   # Start MongoDB, Redis, and RabbitMQ using Docker Compose
   docker-compose up -d mongo redis rabbitmq
   ```

5. **Run each microservice**

   Open separate terminal windows for each service:

   ```bash
   # Terminal 1 - Publisher Service (Port 3001)
   cd publisher
   npm run start-dev  # or npm start for production

   # Terminal 2 - Consumer Service (Port 3002)
   cd consumer
   npm run start-dev  # or npm start for production

   # Terminal 3 - User Service (Port 3000)
   cd user
   npm run start-dev  # or npm start for production
   ```

### Option 2: Docker Deployment (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/ZiadNashaat17/Vehicle-Tracker.git
   cd Vehicle-Tracker
   ```

2. **Set up environment variables**

   Create `config.env` files for each service:

   ```bash
   # Edit config.env files for each service with your configuration
   nano publisher/config.env
   nano consumer/config.env
   nano user/config.env
   ```

3. **Start all services with Docker Compose**

   ```bash
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up -d --build
   ```

   This will start:

   - MongoDB with health checks
   - Redis with health checks
   - RabbitMQ with management UI and health checks
   - Publisher Service (waits for RabbitMQ to be healthy)
   - Consumer Service (waits for RabbitMQ, Redis, and MongoDB)
   - User Service (waits for Redis and MongoDB)

4. **View logs**

   ```bash
   # View logs for all services
   docker-compose logs -f

   # View logs for specific services
   docker-compose logs -f user-service
   docker-compose logs -f consumer-service
   docker-compose logs -f publisher-service
   docker-compose logs -f rabbitmq
   ```

5. **Stop services**

   ```bash
   # Stop all services
   docker-compose down

   # Stop and remove volumes
   docker-compose down -v
   ```

## ⚙ Configuration

Each microservice requires its own `config.env` file. Create the following configuration files:

### Publisher Service (`publisher/config.env`)

```env
# Server Configuration
PORT=3001

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Consumer Service (`consumer/config.env`)

```env
# Server Configuration
PORT=3002

# Database (use service name for Docker, localhost for local)
DATABASE=mongodb://mongo:27017/consumer

# Redis (use service name for Docker, localhost for local)
REDIS_URL=redis://redis:6379

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672

# Inter-service communication
USER_SERVICE_URL=http://user-service:3000
```

### User Service (`user/config.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database (use service name for Docker, localhost for local)
DATABASE=mongodb://mongo:27017/user

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d

# Redis (use service name for Docker, localhost for local)
REDIS_URL=redis://redis:6379

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=yoursendgridemail@example.com

# Inter-service communication
CONSUMER_SERVICE_URL=http://consumer-service:3002
```

**Note for Local Development**: Replace Docker service names (`mongo`, `redis`, `rabbitmq`, `user-service`, `consumer-service`) with `localhost` when running services outside of Docker.

## 💻 Usage

### Starting the Services

#### Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d
```

#### Local Development

Each microservice runs on its own port:

- **Publisher Service**: `http://localhost:3001` - Receives GPS data from IoT devices
- **Consumer Service**: `http://localhost:3002` - Processes data from RabbitMQ
- **User Service**: `http://localhost:3000` - Main API gateway for client applications

**Access Points**:

- **User**: http://localhost:3000
- **Publisher**: http://localhost:3001
- **Consumer**: http://localhost:3002
- **RabbitMQ Management UI**: http://localhost:15672 (default credentials: guest/guest)
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

Make sure all services are running and healthy for the complete system to function.

### Testing Real-time Tracking

#### Option 1: Using the GPS Simulator (Recommended)

The easiest way to test the system is using the built-in GPS data simulator:

```bash
# Make sure all services are running first
# Terminal 1: Publisher Service
cd publisher && npm start

# Terminal 2: Consumer Service
cd consumer && npm start

# Terminal 3: User Service
cd user && npm start

# Terminal 4: Run the GPS simulator
node publisher/simulateGPS.js
```

The simulator will:

- Generate realistic GPS data for multiple vehicles
- Send data to your API automatically
- Show live updates in the console
- Loop through predefined routes continuously

For detailed configuration options, see [GPS Simulator Documentation](docs/GPS_SIMULATOR.md).

#### Option 2: Manual Testing

1. Open `live-tracking.html` in a browser
2. Connect to the WebSocket server
3. Send GPS coordinates via the `/api/v1/track` endpoint
4. Watch real-time updates on the map

### API Testing

Use tools like Postman to test API endpoints.

## 🛰️ GPS Data Simulator

The project includes a built-in GPS data simulator for testing without physical GPS devices.

### Quick Start

```bash
# Start the simulator with default settings
node ./publisher/simulateGPS.js
```

### Features

- ✅ Simulate single or multiple vehicles
- ✅ Realistic GPS coordinate movement
- ✅ Configurable routes and speeds
- ✅ Automatic looping through waypoints
- ✅ Speed variations for realism (±7.5 km/h)
- ✅ Customizable update intervals

### Configuration

Edit `simulateGPS.js` to customize:

```javascript
const VEHICLES = [
  {
    deviceId: "your-device-id",
    route: [
      { lat: 30.0444, lng: 31.2357 },
      { lat: 30.05, lng: 31.24 },
      // Add more waypoints...
    ],
    speed: 60, // km/h
  },
  // Add more vehicles...
];

const UPDATE_INTERVAL = 3000; // milliseconds
```

### Use Cases

- 🧪 **Testing**: Validate real-time tracking features
- 📊 **Demo**: Showcase the system without hardware
- ⚡ **Load Testing**: Simulate multiple vehicles simultaneously
- 🔧 **Development**: Debug and develop new features

📖 **For detailed documentation, see [GPS_SIMULATOR.md](docs/GPS_SIMULATOR.md)**

## 📚 API Documentation

For complete API documentation with examples and detailed request/response formats, visit:

**[📖 Postman API Documentation](https://documenter.getpostman.com/view/29231674/2sB3dHVsya)**

The documentation includes:

- All available endpoints with descriptions
- Request/response examples
- Authentication flows
- Query parameters and filters
- Error responses

### Quick Reference

### Authentication

#### Register User

```http
POST /api/v1/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

#### Verify Email

```http
GET /api/v1/user/verify-email/:verifyToken
```

#### Login

```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Vehicles

#### Get All Vehicles

```http
GET /api/v1/vehicles
Authorization: Bearer <token>
```

#### Create Vehicle

```http
POST /api/v1/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vehicle 001",
  "deviceId": "device123",
  "plateNumber": "ABC-1234"
}
```

### Tracking

#### Submit GPS Record

```http
POST http://localhost:3001/api/v1/track
Content-Type: application/json

{
  "deviceId": "device123",
  "lat": 30.0444,
  "lng": 31.2357,
  "speed": 60,
  "timestamp": "2025-11-23T10:30:00Z"
}
```

**Note:** GPS tracking data is submitted to the Publisher Service (port 3001).

### Live Tracking

#### Get Live Location

```http
POST /api/v1/live
Authorization: Bearer <token>
Content-Type: application/json

{
  "plateNumber": "SSS-0000"
}
```

### Historical Data

#### Get Vehicle History

```http
POST /api/v1/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle123",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-23T23:59:59Z"
}
```

### Geofencing

#### Create Geofence

```http
POST /api/v1/geofence
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Area",
  "coordinates": [
    { "lat": 30.0444, "lng": 31.2357 },
    { "lat": 30.0500, "lng": 31.2400 },
    { "lat": 30.0450, "lng": 31.2450 }
  ],
  "vehicleId": "vehicle123"
}
```

#### Get All Geofences

```http
GET /api/v1/geofence
Authorization: Bearer <token>
```

### Devices (Admin Only)

#### Create Device

```http
POST /api/v1/device
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "GPS-12345",
  "deviceType": "GPS Tracker Pro",
  "status": "active"
}
```

## 📁 Project Structure

```
Vehicle-Tracker/
├── publisher/                  # Publisher Microservice (Port 3001)
│   ├── src/
│   │   ├── controllers/       # Track data handlers
│   │   │   └── trackController.js
│   │   ├── routes/           # Publisher routes
│   │   │   └── trackRoutes.js
│   │   └── services/         # RabbitMQ publisher, validation
│   │       ├── publishToRabbitMQ.js
│   │       └── validateRecord.js
│   ├── app.js                # Express app configuration
│   ├── server.js             # Publisher entry point
│   ├── simulateGPS.js        # GPS data simulator
│   ├── package.json          # Publisher dependencies
│   ├── config.env            # Publisher configuration
│   └── Dockerfile            # Publisher container image
│
├── consumer/                   # Consumer Microservice (Port 3002)
│   ├── src/
│   │   ├── controllers/       # Record processing
│   │   │   └── recordController.js
│   │   ├── middlewares/       # Authentication middleware
│   │   │   └── authenticateUser.js
│   │   ├── models/           # Record models
│   │   │   └── recordModel.js
│   │   ├── routes/           # Consumer routes
│   │   │   └── recordsRoutes.js
│   │   ├── services/         # RabbitMQ consumer, Redis pub
│   │   │   ├── cache.js
│   │   │   ├── consumeRabbitMQ.js
│   │   │   └── redisChannelPublish.js
│   │   └── util/             # Utility functions
│   │       ├── apiFeatures.js
│   │       ├── appError.js
│   │       ├── catchAsync.js
│   │       ├── email.js
│   │       └── filterObj.js
│   ├── app.js                # Express app configuration
│   ├── server.js             # Consumer entry point
│   ├── package.json          # Consumer dependencies
│   ├── config.env            # Consumer configuration
│   └── Dockerfile            # Consumer container image
│
├── user/                       # User/API Gateway Microservice (Port 3000)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── deviceController.js
│   │   │   ├── geofenceController.js
│   │   │   ├── histroyController.js
│   │   │   ├── liveController.js
│   │   │   ├── userController.js
│   │   │   ├── validateUser.js
│   │   │   └── vehicleController.js
│   │   ├── models/           # Database models
│   │   │   ├── deviceModel.js
│   │   │   ├── geofenceModel.js
│   │   │   ├── userModel.js
│   │   │   └── vehicleModel.js
│   │   ├── routes/           # API routes
│   │   │   ├── deviceRoutes.js
│   │   │   ├── geofenceRoutes.js
│   │   │   ├── historyRoutes.js
│   │   │   ├── liveRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── vehicleRoutes.js
│   │   ├── services/         # Business logic
│   │   │   ├── authenticate.js      # JWT authentication
│   │   │   ├── authorize.js         # Role-based authorization
│   │   │   ├── errorController.js   # Error handling
│   │   │   ├── redisCache.js        # Redis caching
│   │   │   ├── redisChannelSubscribe.js  # Redis pub/sub
│   │   │   └── websocket.js         # WebSocket handling
│   │   └── util/             # Utility functions
│   │       ├── apiFeatures.js
│   │       ├── appError.js
│   │       ├── catchAsync.js
│   │       ├── email.js
│   │       └── filterObj.js
│   ├── app.js                # Express app configuration
│   ├── server.js             # User service entry point
│   ├── live-tracking.html    # Live tracking demo page
│   ├── package.json          # User service dependencies
│   ├── config.env            # User service configuration
│   └── Dockerfile            # User service container image
│
├── docs/
│   └── GPS_SIMULATOR.md      # GPS simulator documentation
├── docker-compose.yml         # Infrastructure services (MongoDB, Redis, RabbitMQ)
└── README.md                  # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 👤 Author

**Ziad Nashaat**

- GitHub: [@ZiadNashaat17](https://github.com/ZiadNashaat17)

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
