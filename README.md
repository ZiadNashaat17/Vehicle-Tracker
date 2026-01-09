# 🚗 Vehicle Tracker

A real-time vehicle tracking and messaging system built with Node.js, featuring live location updates, geofencing, historical route playback, and a full-featured real-time chat system. The system uses a microservices architecture with an API Gateway as a single entry point, RabbitMQ for message queuing, Redis for caching and pub/sub, Socket.IO for real-time communication, and Cloudinary for media storage.

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

- **Real-time Vehicle Tracking**: Live location updates via WebSocket connections with rotation/bearing support
- **Historical Route Playback**: View and analyze past vehicle routes
- **Geofencing**: Create, manage, and monitor Circle or Polygon geographic boundaries
- **Device Management**: Register and manage GPS tracking devices with image uploads
- **User Authentication**: Secure JWT-based authentication with email verification and phone number validation
- **Role-based Access Control**: Admin and user roles with different permissions
- **Real-time Chat System**: Full-featured private and group messaging with media support

### Chat & Messaging Features

- **Private Chats**: One-on-one conversations between users
- **Group Chats**: Create groups with admin controls (add/remove users)
- **Media Messages**: Support for images, videos, audio, and file attachments
- **Message Management**: Edit and delete messages with real-time updates
- **Read Receipts**: Track message seen status with timestamps
- **Online Status**: Real-time user presence indicators (Online/Offline)
- **Cloudinary Integration**: Secure media storage and processing

### Technical Features

- **Microservices Architecture**: Separated API Gateway, User Service, and Publisher Service
- **API Gateway Pattern**: Single entry point for all client requests with WebSocket proxy support
- **Message Queue**: RabbitMQ for reliable asynchronous GPS data processing
- **Real-time Communication**: Socket.IO with Redis adapter for horizontal scalability
- **Caching Layer**: Redis for improved performance and pub/sub messaging
- **Data Validation**: Joi and Zod schema validation for GPS records and API inputs
- **Image Processing**: Sharp for image resizing and optimization
- **Media Storage**: Cloudinary for cloud-based media management
- **Phone Validation**: libphonenumber-js for international phone number validation
- **Security**: Helmet, rate limiting, CORS protection, bcrypt password hashing, and JWT authentication
- **Structured Logging**: Pino for high-performance JSON logging
- **Containerization**: Full Docker Compose deployment with health checks and dependency management
- **Service Discovery**: Docker networking for inter-service communication
- **GPS Data Simulator**: Built-in script with real road routes using OpenRouteService API

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
           │  ┌──────────────┐  ┌──────────────┐                                │
           │  │ Auth/User    │  │ Track Routes │                                │
           │  │ Routes       │  │   Proxy to   │                                │
           │  └──────┬───────┘  └──────┬───────┘                                │
           │         │    WebSocket Proxy (Socket.IO)                           │
           └─────────┼─────────────────┼────────────────────────────────────────┘
                     │                 │
                     ▼                 ▼
              ┌─────────────┐    ┌─────────────┐
              │    User     │    │  Publisher  │
              │   Service   │    │   Service   │
              │ (Port 3000) │    │ (Port 3001) │
              │             │    │             │
              │ - Auth/JWT  │    │ - Validate  │
              │ - Devices   │    │ - Publish   │
              │ - Geofence  │    │   to Queue  │
              │ - Chat/Msg  │    └──────┬──────┘
              │ - WebSocket │           │
              │ - Cloudinary│           ▼
              └──────┬──────┘    ┌──────────────┐
                     │           │   RabbitMQ   │
                     │           │ Message Queue│
                     │           │ (Port 5672)  │
                     │           └──────┬───────┘
                     │                  │
                     ▼                  ▼
              ┌──────────────┐   (User Service consumes
              │   MongoDB    │    GPS data from queue)
              │ (Port 27017) │
              │ - Users      │
              │ - Devices    │
              │ - Chats      │
              │ - Messages   │
              │ - Geofences  │
              │ - Records    │
              └──────────────┘

                     ┌──────────────────────────┐
                     │        Redis             │
                     │     (Port 6379)          │
                     │  - Caching               │
                     │  - Socket.IO Adapter     │
                     │  - Pub/Sub for real-time │
                     └──────────────────────────┘
                                 ▲
                                 │
                           User Service

              ┌──────────────────────────┐
              │       Cloudinary         │
              │   - Profile Pictures     │
              │   - Device Images        │
              │   - Chat Media Files     │
              └──────────────────────────┘

                     Docker Network: app-network
              ┌─────────────────────────────────────────────────┐
              │  All services communicate via Docker networking │
              │  Health checks ensure proper startup order      │
              └─────────────────────────────────────────────────┘
```

### Component Responsibilities

- **API Gateway** (Port 5000): Single entry point for all client requests, WebSocket proxy to User Service, routes requests to appropriate backend services, handles rate limiting, serves static frontend files (Chat App UI)
- **User Service** (Port 3000): Manages user authentication (JWT), device management, geofencing, chat/messaging, live tracking, real-time WebSocket connections, RabbitMQ consumer for GPS data, and Cloudinary media uploads
- **Publisher Service** (Port 3001): Receives GPS tracking data from IoT devices, validates it using Joi schemas, and publishes to RabbitMQ queue
- **RabbitMQ** (Ports 5672, 15672): Message broker for asynchronous GPS data processing with management UI
- **Redis** (Port 6379): Socket.IO adapter for scalability, caching layer, and pub/sub messaging for real-time updates
- **MongoDB** (Port 27017): Persistent data storage for users, devices, chats, messages, geofences, and GPS tracking records
- **Cloudinary**: Cloud-based media storage for profile pictures, device images, and chat media files
- **Docker Network**: All services communicate via the `app-network` bridge network with DNS-based service discovery
- **Health Checks**: Ensures services start only when dependencies (MongoDB, Redis, RabbitMQ) are fully ready

## 🛠 Tech Stack

### Backend

- **Node.js** (v22+) & **Express.js** (v5.1.0) - Server framework
- **Socket.IO** (v4.8.1) - Real-time bidirectional communication
- **MongoDB** & **Mongoose** (v9.0.0) - Database and ODM
- **Redis** (v5.10.0) - Caching and pub/sub messaging
- **RabbitMQ** & **amqplib** (v0.10.9) - Message queuing

### Security & Validation

- **JWT** (jsonwebtoken v9.0.2) - Authentication tokens
- **bcrypt** (v6.0.0) - Password hashing
- **Joi** (v18.0.2) - GPS data validation (Publisher Service)
- **Zod** (v4.3.5) - API input validation (User Service)
- **Helmet** (v8.1.0) - Security headers
- **express-rate-limit** (v8.2.1) - Rate limiting
- **CORS** - Cross-Origin Resource Sharing
- **libphonenumber-js** (v1.12.33) - Phone number validation

### Media & Image Processing

- **Cloudinary** (v2.8.0) - Cloud media storage
- **Sharp** (v0.34.5) - Image resizing and optimization
- **Multer** (v2.0.2) - File upload handling

### Logging & Monitoring

- **Pino** (v10.1.0) - High-performance JSON logging
- **Morgan** - HTTP request logging

### DevOps

- **Docker** & **Docker Compose** - Containerization
- **Nodemon** - Development auto-reload

### Email

- **Nodemailer** (v7.0.12) - Email sending
- **SendGrid** (@sendgrid/mail v8.1.6) - Email service for verification

### Geospatial

- **@turf/turf** (v7.3.1) - Geospatial analysis and calculations

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

### External Services

- **Cloudinary Account** - For media storage (profile pictures, device images, chat files)
- **OpenRouteService API Key** (optional) - For GPS simulator real road routes
- **SendGrid Account** or SMTP server - For email verification

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
   ```

   **Or use the automated setup script:**

   ```bash
   bash setupApp.sh
   ```

   This script will automatically install all dependencies for all services.

3. **Set up environment variables**

   Create `.env` files in each service directory (see [Configuration](#-configuration) section).

4. **Start required infrastructure services**

   ```bash
   # Start MongoDB, Redis, and RabbitMQ using Docker Compose
   docker-compose up -d mongo redis rabbitmq
   ```

5. **Run each microservice**

   **Option A: Start all services with one command (Recommended)**

   ```bash
   bash startApp.sh
   ```

   This script will:

   - Start all services in the background
   - Display each service's Process ID (PID)
   - Show you the command to stop all services

   To stop all services, use the kill command shown in the output, or press `Ctrl+C`.

   **Option B: Run each service manually**

   Open separate terminal windows for each service:

   ```bash
   # Terminal 1 - User Service (Port 3000)
   cd user
   npm run start:dev  # or npm start for production

   # Terminal 2 - Publisher Service (Port 3001)
   cd publisher
   npm run start:dev  # or npm start for production

   # Terminal 3 - API Gateway (Port 5000)
   cd api-gateway
   npm run start:dev  # or npm start for production
   ```

### Option 2: Docker Deployment (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/ZiadNashaat17/Vehicle-Tracker.git
   cd Vehicle-Tracker
   ```

2. **Set up environment variables**

   Create `.env` files for each service (see [Configuration](#-configuration) section).

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
   - API Gateway (waits for all backend services to be ready)

4. **View logs**

   ```bash
   # View logs for all services
   docker-compose logs -f

   # View logs for specific services
   docker-compose logs -f user-service
   docker-compose logs -f publisher-service
   docker-compose logs -f apigateway-service
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

Each microservice requires its own `.env` file. Create the following configuration files:

### API Gateway (`api-gateway/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Backend Service URLs (use service names for Docker, localhost for local)
USER_SERVICE_URL=http://user-service:3000
PUBLISHER_SERVICE_URL=http://publisher-service:3001

# JWT Secret (must match User Service)
JWT_SECRET=your-super-secret-jwt-key
```

### Publisher Service (`publisher/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672
```

### User Service (`user/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database (use service name for Docker, localhost for local)
DATABASE=mongodb://mongo:27017/vehicletracker

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30d

# Redis (use service name for Docker, localhost for local)
REDIS_URL=redis://redis:6379

# RabbitMQ (use service name for Docker, localhost for local)
RABBITMQ_URL=amqp://rabbitmq:5672

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password

# SendGrid (alternative email service)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=yoursendgridemail@example.com

# Base URL for email links
BASE_URL=http://localhost:5000/
```

**Note for Local Development**: Replace Docker service names (`mongo`, `redis`, `rabbitmq`, `user-service`, `publisher-service`) with `localhost` when running services outside of Docker.

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

**Quick Start:**

```bash
# 1. Install dependencies (first time only)
bash setupApp.sh

# 2. Start all services
bash startApp.sh
```

Each microservice runs on its own port:

- **API Gateway**: `http://localhost:5000` - Single entry point for all client requests
- **User Service**: `http://localhost:3000` - Authentication, devices, geofencing, chat/messaging
- **Publisher Service**: `http://localhost:3001` - Receives GPS data from IoT devices

**Access Points**:

- **Chat App UI**: `http://localhost:5000/` - Built-in chat application interface
- **Live Tracking Page**: `http://localhost:5000/live-tracking.html` - Real-time tracking demo
- **Password Reset Page**: `http://localhost:5000/reset-password.html` - Password reset interface

### Testing Real-time Tracking

#### Option 1: Using the GPS Simulator (Recommended)

The easiest way to test the system is using the built-in GPS data simulator:

```bash
# Make sure all services are running first

# For Docker:
docker-compose up -d

# For Local Development:
bash startApp.sh

# Then run the GPS simulator in a new terminal:
node publisher/src/simulateGPS.js
```

The simulator will:

- Fetch real road routes from OpenRouteService API
- Generate realistic GPS data with traffic simulation
- Support smooth acceleration/deceleration
- Send data to your API automatically
- Show live updates in the console
- Stop automatically when vehicles reach their destinations

For detailed configuration options, see [GPS Simulator Documentation](docs/GPS_SIMULATOR.md).

#### Option 2: Manual Testing

1. Open `http://localhost:5000/live-tracking.html` in a browser
2. Connect to the Socket.IO server with authentication
3. Send GPS coordinates via the `/api/track` endpoint
4. Watch real-time updates on the map

### Testing Chat Features

1. Open `http://localhost:5000/` in a browser
2. Register a new account or login
3. Start private or group conversations
4. Send text messages or media files
5. View real-time message delivery and read receipts

### API Testing

Use tools like Postman to test API endpoints.

## 🛰️ GPS Data Simulator

The project includes a built-in GPS data simulator for testing without physical GPS devices.

### Quick Start

```bash
# Start the simulator with default settings
node ./publisher/src/simulateGPS.js
```

### Features

- ✅ Real road routes using OpenRouteService API
- ✅ Fallback to interpolated routes if API unavailable
- ✅ Realistic traffic simulation (stops, idling)
- ✅ Smooth acceleration and deceleration
- ✅ Speed variations for realism (±3 km/h)
- ✅ Vehicle rotation/bearing calculation
- ✅ Multiple vehicle support
- ✅ Auto-completion when destination reached
- ✅ Customizable update intervals

### Configuration

Edit `publisher/src/simulateGPS.js` to customize:

```javascript
const DEVICES = [
  {
    deviceId: "your-device-id-here",
    start: { lat: 30.036953, lng: 31.205739 },
    end: { lat: 30.057834, lng: 31.217332 },
    status: "Moving",
    speed: 80, // Maximum speed in km/h
  },
  // Add more devices for multi-vehicle simulation
];

const UPDATE_INTERVAL = 300; // milliseconds
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
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123",
  "profilePicture": <file> (optional)
}
```

**Note**: Registration accepts `name`, `email`, `phoneNumber`, `password`, `passwordConfirm`, and optional `profilePicture`. Phone numbers are validated using libphonenumber-js. New users are created with `role: 'user'` and `active: true` by default.

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

#### Update User Profile

```http
PATCH http://localhost:5000/api/user/update-user
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Updated Name",
  "profilePicture": <file> (optional)
}
```

### Devices

#### Get All Devices

```http
GET http://localhost:5000/api/user/device
Authorization: Bearer <token>
```

#### Create Device

```http
POST http://localhost:5000/api/user/device
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "brand": "Toyota",
  "model": "Camry",
  "year": 2025,
  "plateNumber": "ABC-1234",
  "type": "Car",
  "status": "Idling",
  "image": <file> (optional)
}
```

**Note**: Device types include: `Motorcycle`, `Car`, or `Truck`. Status can be: `Parking`, `Moving`, `Idling`, or `Towed`.

#### Get Device History

```http
GET http://localhost:5000/api/user/device/:deviceId/history?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <token>
```

### Tracking

#### Submit GPS Record

```http
POST http://localhost:5000/api/track
Content-Type: application/json

{
  "deviceId": "device-object-id",
  "lat": 30.0444,
  "lng": 31.2357,
  "speed": 60,
  "status": "Moving",
  "rotation": 45,
  "timestamp": "2025-11-23T10:30:00Z"
}
```

**Note:** Tracking requests are routed through API Gateway to Publisher Service, then processed via RabbitMQ.

### Live Tracking

#### Get Live Location

```http
GET http://localhost:5000/api/user/live/:deviceId
Authorization: Bearer <token>
```

### Geofencing

#### Create Geofence (Circle)

```http
POST http://localhost:5000/api/user/geofence
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Office Area",
  "type": "Circle",
  "geofence": {
    "type": "Point",
    "coordinates": [31.2357, 30.0444],
    "radius": 500
  },
  "color": "#FF5733",
  "devices": ["deviceId123"]
}
```

#### Create Geofence (Polygon)

```http
POST http://localhost:5000/api/user/geofence
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Area",
  "type": "Polygon",
  "geofence": {
    "type": "Polygon",
    "coordinates": [[
      [31.2357, 30.0444],
      [31.2400, 30.0500],
      [31.2450, 30.0450],
      [31.2357, 30.0444]
    ]]
  },
  "devices": ["deviceId123"]
}
```

#### Check Point in Geofence

```http
POST http://localhost:5000/api/user/geofence/check-point
Authorization: Bearer <token>
Content-Type: application/json

{
  "lat": 30.0444,
  "lng": 31.2357
}
```

#### Get All Geofences

```http
GET http://localhost:5000/api/user/geofence
Authorization: Bearer <token>
```

### Chat & Messaging

#### Create Private Chat

```http
POST http://localhost:5000/api/chat/private-chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-object-id",
  "chatType": "Private"
}
```

#### Create Group Chat

```http
POST http://localhost:5000/api/chat/group-chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["userId1", "userId2"],
  "chatType": "Group",
  "groupName": "Team Chat"
}
```

#### Get All Chats

```http
GET http://localhost:5000/api/chat
Authorization: Bearer <token>
```

#### Send Text Message

```http
POST http://localhost:5000/api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat-object-id",
  "text": "Hello, world!",
  "messageType": "text"
}
```

#### Send Media Message

```http
POST http://localhost:5000/api/chat/message/media
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "chatId": "chat-object-id",
  "file": <file>
}
```

**Supported media types**: `image`, `video`, `audio`, `file`

#### Get Messages

```http
GET http://localhost:5000/api/chat/message/:chatId
Authorization: Bearer <token>
```

#### Edit Message

```http
PATCH http://localhost:5000/api/chat/message/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated message text"
}
```

#### Delete Message

```http
DELETE http://localhost:5000/api/chat/message/:messageId
Authorization: Bearer <token>
```

### WebSocket Events

Connect to Socket.IO at `http://localhost:5000` with authentication token:

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "your-jwt-token" },
});
```

#### Events to Listen

| Event                 | Description                     | Payload                                           |
| --------------------- | ------------------------------- | ------------------------------------------------- |
| `new-message`         | New message received            | `{ chatId, message }`                             |
| `lastMessage-updated` | Chat's last message updated     | `{ chatId, lastMessage }`                         |
| `message-edited`      | Message was edited              | `{ messageId, chatId, text, editedAt }`           |
| `message-deleted`     | Message was deleted             | `{ messageId, chatId }`                           |
| `messages-read`       | Messages marked as read         | `{ chatId, readerId, count, seenAt }`             |
| `user-status-changed` | User online/offline status      | `{ userId, status }`                              |
| `gps-update`          | Real-time GPS location update   | `{ deviceId, lat, lng, speed, status, rotation }` |
| `joined-chat`         | Successfully joined a chat room | `{ chatId, success }`                             |
| `error`               | Error occurred                  | `{ message }`                                     |

#### Events to Emit

| Event        | Description       | Payload  |
| ------------ | ----------------- | -------- |
| `join-chat`  | Join a chat room  | `chatId` |
| `leave-chat` | Leave a chat room | `chatId` |

## 🗄️ Data Models

The system uses MongoDB with Mongoose for data persistence. Below are the main data models and their relationships.

### Database Architecture

```
┌─────────────┐         ┌─────────────┐
│    User     │────────>│   Device    │
│             │ 1:N     │             │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  Geofence   │         │   Record    │
│             │         │             │
└─────────────┘         └─────────────┘

┌─────────────┐         ┌─────────────┐
│    User     │────────>│    Chat     │
│             │ N:M     │             │
└─────────────┘         └──────┬──────┘
                               │
                               │ 1:N
                               │
                               ▼
                        ┌─────────────┐
                        │   Message   │
                        │             │
                        └─────────────┘
```

### User Model

**Collection**: `users`

Stores user account information with authentication and authorization.

| Field                    | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| `name`                   | String  | User's full name (required, trimmed)                        |
| `email`                  | String  | Unique email address (required, lowercase)                  |
| `phoneNumber`            | String  | Unique phone number (required, validated)                   |
| `password`               | String  | Hashed password (bcrypt, min 8 chars)                       |
| `role`                   | String  | User role: `user` or `admin` (default: `user`)              |
| `active`                 | Boolean | Account status (default: `true`)                            |
| `status`                 | String  | Online presence: `Online` or `Offline` (default: `Offline`) |
| `profilePicture`         | String  | Cloudinary URL for profile image                            |
| `isVerified`             | Boolean | Email verification status (default: `false`)                |
| `passwordChangedAt`      | Date    | Timestamp of last password change                           |
| `passwordResetToken`     | String  | Hashed token for password reset                             |
| `passwordResetExpires`   | Date    | Password reset token expiration                             |
| `emailVerificationToken` | String  | Hashed token for email verification                         |
| `emailTokenExpires`      | Date    | Email verification token expiration                         |

**Indexes**: `name`, `role`

**Methods**:

- `isPasswordCorrect()` - Verify password with bcrypt
- `passwordChangedAfter()` - Check if password changed after JWT issued
- `generateResetToken()` - Create password reset token
- `generateVerificationToken()` - Create email verification token

### Device Model

**Collection**: `devices`

Represents physical vehicles/devices being tracked.

| Field         | Type     | Description                                                                    |
| ------------- | -------- | ------------------------------------------------------------------------------ |
| `brand`       | String   | Vehicle manufacturer (required)                                                |
| `model`       | String   | Vehicle model name (required)                                                  |
| `year`        | Number   | Manufacturing year (required)                                                  |
| `plateNumber` | String   | Unique license plate (required, indexed, unique)                               |
| `type`        | String   | Vehicle type: `Motorcycle`, `Car`, or `Truck` (required)                       |
| `image`       | String   | Cloudinary URL for device image                                                |
| `status`      | String   | Current status: `Parking`, `Moving`, `Idling`, or `Towed` (default: `Parking`) |
| `user`        | ObjectId | Reference to User (required)                                                   |
| `lastRecord`  | ObjectId | Reference to most recent Record                                                |

### Geofence Model

**Collection**: `geofences`

Defines geographic boundaries for alerts and monitoring.

| Field       | Type       | Description                                      |
| ----------- | ---------- | ------------------------------------------------ |
| `name`      | String     | Geofence name (required)                         |
| `type`      | String     | Geofence type: `Circle` or `Polygon` (required)  |
| `geofence`  | GeoJSON    | Geographic data (Point/Polygon with coordinates) |
| `color`     | String     | Display color for UI                             |
| `active`    | Boolean    | Geofence active status (default: `true`)         |
| `user`      | ObjectId   | Reference to User (required)                     |
| `devices`   | ObjectId[] | Array of Device references                       |
| `createdAt` | Date       | Creation timestamp (auto)                        |
| `updatedAt` | Date       | Last update timestamp (auto)                     |

**Indexes**: `2dsphere` index on `geofence` for geospatial queries

### Record Model

**Collection**: `records`

Stores historical GPS tracking data.

| Field       | Type     | Description                                       |
| ----------- | -------- | ------------------------------------------------- |
| `deviceId`  | ObjectId | Reference to Device (required)                    |
| `lat`       | Number   | Latitude (-90 to 90, required)                    |
| `lng`       | Number   | Longitude (-180 to 180, required)                 |
| `speed`     | Number   | Speed in km/h (required)                          |
| `status`    | String   | Status: `Parking`, `Moving`, `Idling`, or `Towed` |
| `rotation`  | Number   | Bearing/heading in degrees (0 to 360)             |
| `timestamp` | Date     | Record timestamp (default: now)                   |

### Chat Model

**Collection**: `chats`

Represents conversations between users.

| Field         | Type       | Description                               |
| ------------- | ---------- | ----------------------------------------- |
| `userIds`     | ObjectId[] | Array of User references (participants)   |
| `chatType`    | String     | Chat type: `Private` or `Group`           |
| `lastMessage` | ObjectId   | Reference to most recent Message          |
| `groupAdmin`  | ObjectId   | Reference to User (admin for group chats) |
| `groupName`   | String     | Group name (for group chats)              |
| `createdAt`   | Date       | Creation timestamp (auto)                 |
| `updatedAt`   | Date       | Last update timestamp (auto)              |

**Indexes**: `userIds` + `chatType` compound index

### Message Model

**Collection**: `messages`

Stores chat messages with media support.

| Field           | Type     | Description                                                          |
| --------------- | -------- | -------------------------------------------------------------------- |
| `senderId`      | ObjectId | Reference to sending User (required)                                 |
| `receiverId`    | ObjectId | Reference to receiving User                                          |
| `chatId`        | ObjectId | Reference to Chat (required)                                         |
| `text`          | String   | Message text content                                                 |
| `mediaUrl`      | String   | Cloudinary URL for media file                                        |
| `fileName`      | String   | Original filename                                                    |
| `messageType`   | String   | Type: `text`, `image`, `video`, `file`, or `audio` (default: `text`) |
| `fileSize`      | Number   | File size in bytes                                                   |
| `mimeType`      | String   | MIME type of the file                                                |
| `fileExtension` | String   | File extension                                                       |
| `seen`          | Boolean  | Read status (default: `false`)                                       |
| `seenAt`        | Date     | Timestamp when message was read                                      |
| `isEdited`      | Boolean  | Edit status (default: `false`)                                       |
| `editedAt`      | Date     | Timestamp when message was edited                                    |
| `createdAt`     | Date     | Creation timestamp (auto)                                            |

**Indexes**:

- `chatId` + `seen` + `senderId` compound index
- `chatId` + `createdAt` (descending) for pagination

### Data Flow

1. **User Registration**: Creates `User` document with email verification
2. **Device Creation**: User creates `Device` with optional image upload to Cloudinary
3. **Geofence Configuration**: User creates `Geofence` for specific `Devices`
4. **GPS Tracking**: Device sends data → Publisher validates → RabbitMQ → User Service consumes and stores as `Record`
5. **Live Updates**: User Service emits GPS updates via Socket.IO
6. **Chat Flow**: Users create `Chat` → Send `Message` → Real-time delivery via Socket.IO

## 📁 Project Structure

```
Vehicle-Tracker/
├── api-gateway/                # API Gateway (Port 5000)
│   ├── src/
│   │   ├── controllers/       # Request forwarding logic
│   │   │   ├── userController.js      # User/Device/Geofence proxy
│   │   │   ├── chatController.js      # Chat/Message proxy
│   │   │   └── publisherController.js # GPS tracking proxy
│   │   ├── middlewares/
│   │   │   ├── authenticate.js        # JWT verification
│   │   │   └── errorController.js     # Error handling
│   │   ├── routes/
│   │   │   ├── userRoutes.js          # User, device, geofence routes
│   │   │   ├── chatRoutes.js          # Chat and message routes
│   │   │   └── publisherRoutes.js     # GPS tracking routes
│   │   ├── util/
│   │   │   └── appError.js
│   │   ├── app.js             # Express app with WebSocket proxy
│   │   └── server.js          # Gateway entry point
│   ├── public/                # Static frontend files
│   │   ├── index.html         # Chat App UI
│   │   ├── live-tracking.html # Live tracking demo
│   │   ├── reset-password.html
│   │   ├── main.js            # Frontend JavaScript
│   │   └── styles.css
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── user/                       # User Microservice (Port 3000)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js      # Auth: register, login, verify, reset
│   │   │   ├── userController.js      # User profile management
│   │   │   ├── deviceController.js    # Device CRUD operations
│   │   │   ├── geofenceController.js  # Geofence management
│   │   │   ├── chatController.js      # Chat creation and management
│   │   │   ├── messagesController.js  # Message CRUD operations
│   │   │   ├── liveController.js      # Live tracking endpoints
│   │   │   └── recordController.js    # Historical data queries
│   │   ├── models/
│   │   │   ├── userModel.js           # User schema with auth methods
│   │   │   ├── deviceModel.js         # Device/vehicle schema
│   │   │   ├── geofenceModel.js       # Geofence with 2dsphere index
│   │   │   ├── recordModel.js         # GPS record schema
│   │   │   ├── chatModel.js           # Chat schema (private/group)
│   │   │   └── messageModel.js        # Message schema with media
│   │   ├── routes/
│   │   │   ├── userRoutes.js          # Auth and user routes
│   │   │   ├── deviceRoutes.js        # Device CRUD routes
│   │   │   ├── geofenceRoutes.js      # Geofence routes
│   │   │   ├── chatRoutes.js          # Chat management routes
│   │   │   ├── messageRoutes.js       # Message routes
│   │   │   └── liveRoutes.js          # Live tracking routes
│   │   ├── services/
│   │   │   ├── socket.js              # Socket.IO with Redis adapter
│   │   │   ├── consumeRabbitMQ.js     # RabbitMQ consumer for GPS
│   │   │   ├── redisCache.js          # Redis caching service
│   │   │   ├── redisChannelSubscribe.js
│   │   │   ├── uploadController.js    # Cloudinary upload service
│   │   │   └── email.js               # Email service (Nodemailer)
│   │   ├── middlewares/
│   │   │   ├── authenticate.js        # JWT authentication
│   │   │   ├── authorize.js           # Role-based authorization
│   │   │   ├── validateGeofence.js    # Geofence validation
│   │   │   ├── chatValidator.js       # Chat input validation
│   │   │   ├── messageValidator.js    # Message validation (Zod)
│   │   │   ├── validateMessages.js    # Message validation middleware
│   │   │   ├── cleanCache.js          # Cache invalidation
│   │   │   └── errorController.js
│   │   ├── util/
│   │   │   ├── appError.js
│   │   │   ├── catchAsync.js
│   │   │   ├── filterObj.js
│   │   │   ├── apiFeatures.js
│   │   │   └── generateEmailTemplate.js
│   │   ├── app.js
│   │   ├── server.js
│   │   └── logging.js         # Pino logger configuration
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── publisher/                  # Publisher Microservice (Port 3001)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── trackController.js     # GPS data handler
│   │   ├── middlewares/
│   │   │   ├── validateRecord.js      # Joi validation
│   │   │   └── errorController.js
│   │   ├── routes/
│   │   │   └── trackRoutes.js
│   │   ├── services/
│   │   │   └── publishToRabbitMQ.js   # RabbitMQ publisher
│   │   ├── util/
│   │   │   └── appError.js
│   │   ├── app.js
│   │   ├── server.js
│   │   └── simulateGPS.js     # GPS data simulator
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── docs/
│   └── GPS_SIMULATOR.md       # GPS simulator documentation
│
├── docker-compose.yml         # Docker Compose configuration
├── setupApp.sh                # Install all dependencies
├── startApp.sh                # Start all services
├── formatAll.sh               # Format all code (Prettier)
└── README.md
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
- Run `bash formatAll.sh` to format code with Prettier before committing
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Quality Tools

```bash
# Format all code
bash formatAll.sh

# Lint individual service
cd user && npm run lint

# Fix lint issues
cd user && npm run lint:fix
```

## 👤 Author

**Ziad Nashaat**

- GitHub: [@ZiadNashaat17](https://github.com/ZiadNashaat17)

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
