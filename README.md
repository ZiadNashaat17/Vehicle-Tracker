# 🚗 Vehicle Tracker

A real-time vehicle tracking system built with Node.js, featuring live location updates, geofencing, and historical route playback. The system uses a microservices architecture with RabbitMQ for message queuing, Redis for caching and pub/sub, and WebSocket for real-time communication.

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
- **Containerization**: Docker and Docker Compose support
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
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Publisher  │────────▶│   RabbitMQ   │────────▶│  Consumer   │
│  (Validate) │         │ Message Queue│         │  (Process)  │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                        │
                                                        ▼
                                                   ┌──────────┐
                                                   │  Redis   │
                                                   │ Pub/Sub  │
                                                   └────┬─────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ WebSocket│  │   Auth   │  │ Vehicles │  │ Geofence │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        └──────────────┘
```

### Component Responsibilities

- **IoT Devices**: GPS tracking devices that send location data via HTTP
- **Publisher**: Receives GPS tracking data from IoT devices, validates it, and publishes to RabbitMQ
- **RabbitMQ**: Message broker for decoupling services and ensuring reliable message delivery
- **Consumer**: Processes messages from RabbitMQ, stores in MongoDB, and publishes to Redis
- **Redis**: Pub/sub messaging for real-time updates and caching layer for performance
- **API Gateway**: Handles HTTP requests, authentication, WebSocket connections, and serves clients
- **MongoDB**: Persistent data storage for vehicles, users, devices, and tracking records

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

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp config.env.example config.env
   # Edit config.env with your configuration
   ```

4. **Start required services**

   ```bash

   ```

# Start Redis

redis-server --daemonize yes
redis-cli

# Start RabbitMQ

docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management

````

5. **Run the application**

```bash
# Development mode with auto-reload - Requires nodemon package installed
npm run start-dev

# Production mode
npm start
````

### Option 2: Docker Deployment

1. **Clone the repository**

   ```bash
   git clone https://github.com/ZiadNashaat17/Vehicle-Tracker.git
   cd Vehicle-Tracker
   ```

2. **Set up environment variables**

   ```bash
   cp config.env.example config.env
   # Edit config.env with your configuration
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up -d --build
   ```

4. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

## ⚙ Configuration

Create a `config.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database - Update it with your DB URL
DATABASE=mongodb://localhost:27017/vehicle-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# SendGrid Email - Update it with your data
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=yoursendgridemail@example.com

```

## 💻 Usage

### Starting the Server

The server will start on `http://localhost:3000` (or your configured PORT).

### Testing Real-time Tracking

#### Option 1: Using the GPS Simulator (Recommended)

The easiest way to test the system is using the built-in GPS data simulator:

```bash
# Make sure the server is running first
npm start

# In a new terminal, run the simulator
node simulateGPS.js
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
node simulateGPS.js
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
    deviceId: 'your-device-id',
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
POST /api/v1/track
Content-Type: application/json

{
  "deviceId": "device123",
  "lat": 30.0444,
  "lng": 31.2357,
  "speed": 60,
  "timestamp": "2025-11-23T10:30:00Z"
}
```

### Live Tracking

#### Get Live Location

```http
POST /api/v1/live
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle123"
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
  "model": "GPS Tracker Pro",
  "imei": "123456789012345"
}
```

## 📁 Project Structure

```
Vehicle-Tracker/
├── src/
│   ├── api-gateway/           # API Gateway Service
│   │   ├── controllers/       # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── services/         # Business logic (WebSocket, Redis)
│   ├── publisher/            # Publisher Service
│   │   ├── controllers/      # Track data handlers
│   │   ├── routes/          # Publisher routes
│   │   └── services/        # RabbitMQ publisher, validation
│   ├── consumer/             # Consumer Service
│   │   ├── controllers/     # Record processing
│   │   ├── models/          # Record models
│   │   └── services/        # RabbitMQ consumer, Redis pub
│   ├── services/            # Shared services
│   │   ├── authenticate.js  # JWT authentication
│   │   ├── authorize.js     # Role-based authorization
│   │   └── errorController.js
│   └── util/                # Utility functions
│       ├── apiFeatures.js   # Query features
│       ├── appError.js      # Error handling
│       ├── catchAsync.js    # Async error wrapper
│       ├── email.js         # Email service
│       └── filterObj.js     # Object filtering
├── app.js                   # Express app configuration
├── server.js               # Server entry point
├── simulateGPS.js    # GPS data simulator for testing
├── docs/
│   └── GPS_SIMULATOR.md    # GPS simulator documentation
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # Container image definition
├── package.json          # Dependencies and scripts
├── config.env           # Environment variables
├── live-tracking.html   # Live tracking demo
└── test-socket-connection.html   # Socket.io testing page
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
