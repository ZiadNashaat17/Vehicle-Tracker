# 🚗 Vehicle Tracker

A real-time vehicle tracking system built with Node.js, featuring live location updates, geofencing, and historical route playback. The system uses a microservices architecture with an API Gateway as a single entry point, RabbitMQ for message queuing, Redis for caching and pub/sub, and WebSocket for real-time communication.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [GPS Data Simulator](#-gps-data-simulator)
- [API Documentation](#-api-documentation)
- [Data Models](#️-data-models)
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

- **Microservices Architecture**: Separated API Gateway, User Service, Publisher Service, and Consumer Service
- **API Gateway Pattern**: Single entry point for all client requests with request routing to backend services
- **Message Queue**: RabbitMQ for reliable asynchronous message processing
- **Real-time Communication**: Socket.IO with Redis adapter for scalability
- **Caching Layer**: Redis for improved performance and pub/sub messaging
- **Data Validation**: Joi schema validation for GPS records
- **Security**: Helmet, rate limiting, CORS protection, and JWT authentication
- **Containerization**: Full Docker Compose deployment with health checks and dependency management
- **Service Discovery**: Docker networking for inter-service communication
- **GPS Data Simulator**: Built-in script for testing with simulated vehicle data

## 🏗 Architecture

The system follows a microservices architecture with an API Gateway as the single entry point:

```
           ┌──────────────┐                                    ┌─────────────────┐
           │   Clients    │                                    │   IoT Devices   │
           │ (Web/Mobile) │                                    │  (GPS Trackers) │
           └──────┬───────┘                                    └────────┬────────┘
                  │ HTTP/WebSocket                                      │ HTTP POST
                  ▼                                                     ▼
           ┌────────────────────────────────────────────────────────────────────┐
           │                       API Gateway (Port 5000)                      │
           │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
           │  │ Auth Routes  │  │Track Routes  │  │History Routes│              │
           │  │ User Routes  │  │   Proxy to   │  │   Proxy to   │              │
           │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
           └─────────┼──────────────────┼──────────────────┼────────────────────┘
                     │                  │                  │
                     ▼                  ▼                  ▼
              ┌─────────────┐    ┌─────────────┐   ┌─────────────┐
              │    User     │    │  Publisher  │   │  Consumer   │
              │   Service   │    │   Service   │   │   Service   │
              │ (Port 3000) │    │ (Port 3001) │   │ (Port 3002) │
              │             │    │             │   │             │
              │ - Auth/JWT  │    │ - Validate  │   │ - Process   │
              │ - Vehicles  │    │ - Publish   │   │ - Store     │
              │ - Devices   │    │   to Queue  │   │ - Notify    │
              │ - Geofence  │    └──────┬──────┘   └─────┬───┬───┘
              │ - WebSocket │           │                │   │
              └──────┬──────┘           ▼                │   │
                     │           ┌──────────────┐        │   │
                     │           │   RabbitMQ   │────────┘   │
                     │           │ Message Queue│            │
                     │           │ (Port 5672)  │            │
                     │           └──────────────┘            │
                     │                                       │
                     │           ┌──────────────┐            │
                     └──────────▶│   MongoDB    │◀───────────┘
                                 │ (Port 27017) │
                                 │ - Users DB   │
                                 │ - Records DB │
                                 └──────────────┘

                     ┌──────────────────────────┐
                     │        Redis             │
                     │     (Port 6379)          │
                     │  - Caching               │
                     │  - Pub/Sub for real-time │
                     └──────────────────────────┘
                                 ▲
                                 │
                       ┌─────────┴──────────┐
                       │                    │
                Consumer Service      User Service

                     Docker Network: app-network
              ┌─────────────────────────────────────────────────┐
              │  All services communicate via Docker networking │
              │  Health checks ensure proper startup order      │
              └─────────────────────────────────────────────────┘
```

### Component Responsibilities

- **API Gateway** (Port 5000): Single entry point for all client requests, routes requests to appropriate backend services, handles CORS, rate limiting, and request validation
- **User Service** (Port 3000): Manages user authentication (JWT), vehicle management, device management, geofencing, live tracking, and WebSocket connections
- **Publisher Service** (Port 3001): Receives GPS tracking data from IoT devices, validates it using Joi schemas, and publishes to RabbitMQ queue
- **Consumer Service** (Port 3002): Processes messages from RabbitMQ, stores records in MongoDB, and publishes real-time updates to Redis pub/sub channel
- **RabbitMQ** (Ports 5672, 15672): Message broker for asynchronous communication between Publisher and Consumer services with management UI
- **Redis** (Port 6379): Pub/sub messaging for real-time updates and caching layer for improved performance
- **MongoDB** (Port 27017): Persistent data storage for users, vehicles, devices, geofences, and GPS tracking records
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

### For Docker Deployment (Recommended)

- **Docker** & **Docker Compose**

### For Local Development

- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)
- **Redis** (v7 or higher)
- **RabbitMQ** (v3.12 or higher)

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
   cd api-gateway && npm install && cd ..
   cd user && npm install && cd ..
   cd publisher && npm install && cd ..
   cd consumer && npm install && cd ..
   ```

3. **Set up environment variables**

   Create `config.env` files in each service directory:

   ```bash
   # Copy and edit config.env for each service
   cp api-gateway/config.env.example api-gateway/config.env
   cp user/config.env.example user/config.env
   cp publisher/config.env.example publisher/config.env
   cp consumer/config.env.example consumer/config.env
   ```

4. **Start required infrastructure services**

   ```bash
   # Start MongoDB, Redis, and RabbitMQ using Docker Compose
   docker-compose up -d mongo redis rabbitmq
   ```

5. **Run each microservice**

   Open separate terminal windows for each service:

   ```bash
   # Terminal 1 - User Service (Port 3000)
   cd user
   npm run start-dev  # or npm start for production

   # Terminal 2 - Publisher Service (Port 3001)
   cd publisher
   npm run start-dev  # or npm start for production

   # Terminal 3 - Consumer Service (Port 3002)
   cd consumer
   npm run start-dev  # or npm start for production

   # Terminal 4 - API Gateway (Port 5000)
   cd api-gateway
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
   - RabbitMQ with health checks
   - User Service (waits for Redis and MongoDB to be healthy)
   - Publisher Service (waits for RabbitMQ to be healthy)
   - Consumer Service (waits for RabbitMQ, Redis, and MongoDB to be healthy)
   - API Gateway (waits for all backend services to be ready)

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

### API Gateway (`api-gateway/config.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Backend Service URLs (use service names for Docker, localhost for local)
USER_SERVICE_URL=http://user-service:3000
PUBLISHER_SERVICE_URL=http://publisher-service:3001
CONSUMER_SERVICE_URL=http://consumer-service:3002
```

### Publisher Service (`publisher/config.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Consumer Service (`consumer/config.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3002

# Database (use service name for Docker, localhost for local)
DATABASE=mongodb://mongo:27017/consumer

# Redis (use service name for Docker, localhost for local)
REDIS_URL=redis://redis:6379

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672
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
JWT_EXPIRES_IN=30d

# Redis (use service name for Docker, localhost for local)
REDIS_URL=redis://redis:6379

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=yoursendgridemail@example.com

# Base URL for email links
BASE_URL=http://localhost:5000
```

**Note for Local Development**: Replace Docker service names (`mongo`, `redis`, `rabbitmq`, `user-service`, `publisher-service`, `consumer-service`) with `localhost` when running services outside of Docker.

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

- **API Gateway**: `http://localhost:5000` - Single entry point for all client requests
- **User Service**: `http://localhost:3000` - Authentication, vehicles, devices, geofencing
- **Publisher Service**: `http://localhost:3001` - Receives GPS data from IoT devices
- **Consumer Service**: `http://localhost:3002` - Processes data from RabbitMQ

**Access Points**:

- **API Gateway**: http://localhost:5000 (Main entry point)
- **User Service**: http://localhost:3000
- **Publisher**: http://localhost:3001
- **Consumer**: http://localhost:3002
- **RabbitMQ Management UI**: http://localhost:15672 (credentials: guest/guest)
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

Make sure all services are running and healthy for the complete system to function.

### Testing Real-time Tracking

#### Option 1: Using the GPS Simulator (Recommended)

The easiest way to test the system is using the built-in GPS data simulator:

```bash
# Make sure all services are running first (or use docker-compose up)

# If running locally, start services in separate terminals:
# Terminal 1: User Service
cd user && npm start

# Terminal 2: Publisher Service
cd publisher && npm start

# Terminal 3: Consumer Service
cd consumer && npm start

# Terminal 4: API Gateway
cd api-gateway && npm start

# Terminal 5: Run the GPS simulator
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
2. Connect to the Socket.io server
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

**Note:** All requests go through the API Gateway at `http://localhost:5000`

#### Register User

```http
POST http://localhost:5000/api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

**Note**: Registration only accepts `name`, `email`, `password`, and `passwordConfirm` fields. Other fields are filtered out for security. New users are created with `role: 'user'` and `active: true` by default. Only administrators can assign admin roles to users.

#### Verify Email

```http
GET http://localhost:5000/api/user/verify-email/:verifyToken
```

#### Login

```http
POST http://localhost:5000/api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Vehicles

#### Get All Vehicles

```http
GET http://localhost:5000/api/user/vehicle
Authorization: Bearer <token>
```

#### Create Vehicle

```http
POST http://localhost:5000/api/user/vehicle/create-vehicle
Authorization: Bearer <token>
Content-Type: application/json

{
  "brand": "Vehicle brand",
  "model": "model",
  "year": "2025",
  "deviceId": "device123",
  "plateNumber": "ABC-1234",
  "type": "car",
  "status": "Off"
}
```

**Note**: The `deviceId` required for vehicle creation is provided to users by administrators who manage device registration.

### Tracking

#### Submit GPS Record

```http
POST http://localhost:5000/api/track
Content-Type: application/json

{
  "deviceId": "device123",
  "lat": 30.0444,
  "lng": 31.2357,
  "speed": 60,
  "timestamp": "2025-11-23T10:30:00Z"
}
```

**Note:** Tracking requests are routed through API Gateway to Publisher Service.

### Live Tracking

#### Get Live Location

```http
GET http://localhost:5000/api/user/live/:plateNumber
Authorization: Bearer <token>
```

### Historical Data

#### Get Vehicle History

```http
GET http://localhost:5000/api/history/:plateNumber?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <token>
```

### Geofencing

#### Create Geofence

```http
POST http://localhost:5000/api/user/geofence
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
GET http://localhost:5000/api/user/geofence
Authorization: Bearer <token>
```

### Devices (Admin Only)

**Note**: All device management endpoints are restricted to administrators only. Regular users cannot create, update, or delete devices. Device IDs are provided to users by admins for vehicle registration.

#### Create Device

```http
POST http://localhost:5000/api/user/device
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "GPS-12345",
  "deviceType": "GPS Tracker Pro",
  "status": "active"
}
```

## 🗄️ Data Models

The system uses MongoDB with Mongoose for data persistence. Below are the main data models and their relationships.

### Database Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────>│   Vehicle   │────────>│   Device    │
│  (user DB)  │ 1:N     │  (user DB)  │ 1:1     │  (user DB)  │
└──────┬──────┘         └─────────────┘         └──────┬──────┘
       │                                               │
       │ 1:N                                           │
       │                                               │ 1:N
       ▼                                               ▼
┌─────────────┐                                 ┌─────────────┐
│  Geofence   │                                 │   Record    │
│  (user DB)  │                                 │(consumer DB)│
└─────────────┘                                 └─────────────┘
```

### User Model

**Database**: `user` (User Service)
**Collection**: `users`

Stores user account information with authentication and authorization.

| Field                    | Type    | Description                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `name`                   | String  | User's full name (required, trimmed)                                     |
| `email`                  | String  | Unique email address (required, lowercase)                               |
| `password`               | String  | Hashed password (bcrypt, min 8 chars)                                    |
| `role`                   | String  | User role: `user` or `admin` (default: `user`, admin-only modification) |
| `active`                 | Boolean | Account status (default: `true`, becomes `false` when user deactivates)  |
| `isVerified`             | Boolean | Email verification status (default: `false`)                             |
| `passwordChangedAt`      | Date    | Timestamp of last password change               |
| `passwordResetToken`     | String  | Hashed token for password reset                 |
| `passwordResetExpires`   | Date    | Password reset token expiration                 |
| `emailVerificationToken` | String  | Hashed token for email verification             |
| `emailTokenExpires`      | Date    | Email verification token expiration             |

**Methods**:

- `isPasswordCorrect()` - Verify password with bcrypt
- `passwordChangedAfter()` - Check if password changed after JWT issued
- `generateResetToken()` - Create password reset token
- `generateVerificationToken()` - Create email verification token

**Security Notes**:

- Registration filters request body to only accept: `name`, `email`, `password`, `passwordConfirm`
- `role` field can only be modified by administrators
- `active` is `true` by default on registration and becomes `false` when user deactivates their account

**Relationships**:

- One user can have many vehicles
- One user can have many devices (Admin only)
- One user can have many geofences

### Vehicle Model

**Database**: `user` (User Service)
**Collection**: `vehicles`

Represents physical vehicles being tracked.

| Field          | Type     | Description                                         |
| -------------- | -------- | --------------------------------------------------- |
| `brand`        | String   | Vehicle manufacturer (required)                     |
| `model`        | String   | Vehicle model name (required)                       |
| `year`         | Number   | Manufacturing year (required)                       |
| `plateNumber`  | String   | Unique license plate (required, indexed)            |
| `type`         | String   | Vehicle type: `Motorcycle`, `Car`, or `Truck`       |
| `status`       | String   | Current status: `Parking`, `Moving`, `On`, or `Off` |
| `deviceId`     | ObjectId | Reference to Device (required, unique)              |
| `user`         | ObjectId | Reference to User (required)                        |
| `lastLocation` | GeoJSON  | Last known location (Point with coordinates)        |

**Relationships**:

- Belongs to one User
- Has one Device (one-to-one)

### Device Model

**Database**: `user` (User Service)
**Collection**: `devices`

Represents GPS tracking devices.

| Field        | Type     | Description                           |
| ------------ | -------- | ------------------------------------- |
| `deviceId`   | String   | Unique device identifier (required)   |
| `deviceType` | String   | Device model/type (required)          |
| `status`     | String   | Device status: `active` or `inactive` |
| `user`       | ObjectId | Reference to User (required)          |
| `vehicleId`  | ObjectId | Reference to Vehicle (optional)       |

**Access Control**:

- All device management operations (create, update, delete) are restricted to administrators
- Regular users receive device IDs from admins to register their vehicles

**Relationships**:

- Belongs to one User
- Can be assigned to one Vehicle (optional)
- Has many GPS Records

### Geofence Model

**Database**: `user` (User Service)
**Collection**: `geofences`

Defines geographic boundaries for alerts and monitoring.

| Field       | Type       | Description                                 |
| ----------- | ---------- | ------------------------------------------- |
| `name`      | String     | Geofence name (required)                    |
| `type`      | String     | Geofence type: `Circle` or `Polygon`        |
| `geofence`  | GeoJSON    | Geographic data (Point/Polygon with coords) |
| `radius`    | Number     | Radius in meters (for Circle type)          |
| `color`     | String     | Display color for UI                        |
| `active`    | Boolean    | Geofence active status (default: `true`)    |
| `user`      | ObjectId   | Reference to User (required)                |
| `devices`   | ObjectId[] | Array of Device references                  |
| `createdAt` | Date       | Creation timestamp (auto)                   |
| `updatedAt` | Date       | Last update timestamp (auto)                |

**Indexes**:

- `2dsphere` index on `geofence` for geospatial queries

**Relationships**:

- Belongs to one User
- Can monitor multiple Devices

### Record Model

**Database**: `consumer` (Consumer Service)
**Collection**: `records`

Stores historical GPS tracking data.

| Field       | Type     | Description                       |
| ----------- | -------- | --------------------------------- |
| `deviceId`  | ObjectId | Reference to Device (required)    |
| `lat`       | Number   | Latitude (-90 to 90, required)    |
| `lng`       | Number   | Longitude (-180 to 180, required) |
| `speed`     | Number   | Speed in km/h (required)          |
| `timestamp` | Date     | Record timestamp (default: now)   |

**Relationships**:

- Belongs to one Device

**Note**: Records are stored in a separate database for scalability and are managed by the Consumer Service.

### Data Flow

1. **User Registration**: Creates `User` document in user database
2. **Device Creation**: Admin creates `Device`, assigned to a `User`
3. **Vehicle Setup**: User creates `Vehicle`, linked to a `Device` and `User`
4. **Geofence Configuration**: User creates `Geofence` for specific `Devices`
5. **GPS Tracking**: Device sends data → Publisher validates → RabbitMQ → Consumer stores as `Record`
6. **Live Updates**: Consumer publishes to Redis → User Service streams via WebSocket

## 📁 Project Structure

```
Vehicle-Tracker/
├── api-gateway/                # API Gateway (Port 5000)
│   ├── src/
│   │   ├── controllers/       # Request forwarding logic
│   │   ├── middlewares/       # Error handling
│   │   ├── routes/            # Route definitions
│   │   │   ├── userRoutes.js
│   │   │   ├── publisherRoutes.js
│   │   │   └── consumerRoutes.js
│   │   └── util/              # Utility functions
│   ├── app.js                 # Express app configuration
│   ├── server.js              # API Gateway entry point
│   ├── package.json           # API Gateway dependencies
│   ├── config.env             # API Gateway configuration
│   └── Dockerfile             # API Gateway container image
│
├── user/                       # User Microservice (Port 3000)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── deviceController.js
│   │   │   ├── geofenceController.js
│   │   │   ├── liveController.js
│   │   │   ├── userController.js
│   │   │   └── vehicleController.js
│   │   ├── models/            # Mongoose database models (MongoDB schemas)
│   │   │   ├── deviceModel.js      # GPS device model with user/vehicle refs
│   │   │   ├── geofenceModel.js    # Geographic boundary model with 2dsphere index
│   │   │   ├── userModel.js        # User auth model with bcrypt & JWT methods
│   │   │   └── vehicleModel.js     # Vehicle model with device/user relationships
│   │   ├── routes/            # API routes
│   │   │   ├── deviceRoutes.js
│   │   │   ├── geofenceRoutes.js
│   │   │   ├── liveRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── vehicleRoutes.js
│   │   ├── services/          # Business logic
│   │   │   ├── redisCache.js        # Redis caching
│   │   │   ├── redisChannelSubscribe.js  # Redis pub/sub
│   │   │   └── websocket.js         # WebSocket handling
│   │   ├── middlewares/       # Middleware functions
│   │   │   ├── authenticate.js      # JWT authentication
│   │   │   ├── authorize.js         # Role-based authorization
│   │   │   ├── cleanCache.js        # Cache invalidation
│   │   │   └── errorController.js   # Error handling
│   │   └── util/              # Utility functions
│   ├── app.js                 # Express app configuration
│   ├── server.js              # User service entry point
│   ├── live-tracking.html     # Live tracking demo page
│   ├── package.json           # User service dependencies
│   ├── config.env             # User service configuration
│   └── Dockerfile             # User service container image
│
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
│   │   ├── models/           # Mongoose database models
│   │   │   └── recordModel.js      # GPS tracking record model (historical data)
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

├── docs/
│   └── GPS_SIMULATOR.md      # GPS simulator documentation
├── docker-compose.yml         # Docker Compose configuration for all services
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
