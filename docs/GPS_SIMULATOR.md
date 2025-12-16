# 🛰️ GPS Data Simulator

This document explains how to use the GPS data simulator for testing the Vehicle Tracker system.

## 📋 Overview

The GPS simulator generates realistic GPS tracking data and sends it to your Vehicle Tracker API. It uses the OpenRouteService API to generate actual road routes and simulates realistic vehicle behavior including traffic stops, speed variations, and natural acceleration/deceleration.

**Key Features:**

- Real road routes using OpenRouteService API
- Realistic traffic simulation (stops, idling, parking)
- Smooth acceleration and deceleration
- Multiple vehicle support
- Automatic simulation completion when destination is reached

**Use Cases:**

- Testing real-time tracking features
- Demonstrating the system without physical GPS devices
- Load testing with multiple vehicles
- Development and debugging

## 🚀 GPS Simulator

### Vehicle Simulator (`simulateGPS.js`)

Simulates one or more vehicles traveling along real road routes from start to destination.

**Features:**

- **Real Routes:** Uses OpenRouteService API to fetch actual driving routes
- **Fallback Mode:** Generates interpolated routes if API is unavailable
- **Traffic Simulation:** Random stops simulating traffic lights, intersections
- **Realistic Speed:** Smooth acceleration/deceleration with variations (±3 km/h)
- **Vehicle States:** Moving, Idling, Parking
- **Auto-completion:** Simulation stops when all vehicles reach their destinations
- **Configurable:** Adjustable speeds, routes, and update intervals

**Usage:**

```bash
node simulateGPS.js
```

**Configuration:**
Edit the `DEVICES` array in `simulateGPS.js`:

```javascript
const DEVICES = [
  {
    deviceId: "693daaf2a7cd544e618be7f1",
    start: { lat: 30.036953, lng: 31.205739 }, // Starting point
    end: { lat: 30.057834, lng: 31.217332 }, // Destination
    status: "Moving",
    speed: 80, // Maximum speed in km/h
  },
  // Add more devices for multi-vehicle simulation
];
```

**Configuration Parameters:**

- `deviceId`: The MongoDB ObjectId of the device (must exist in database)
- `start`: Starting coordinates (latitude, longitude)
- `end`: Destination coordinates (latitude, longitude)
- `status`: Initial status ('Moving', 'Idling', or 'Parking')
- `speed`: Maximum speed in km/h (will vary realistically during simulation)

**For Single Vehicle Testing:**
Simply keep only one device in the array:

```javascript
const DEVICES = [
  {
    deviceId: "693daaf2a7cd544e618be7f1",
    start: { lat: 30.036953, lng: 31.205739 },
    end: { lat: 30.057834, lng: 31.217332 },
    status: "Moving",
    speed: 80,
  },
];
```

**Update Interval:**
Adjust how often GPS data is sent:

```javascript
const UPDATE_INTERVAL = 300; // 300ms (default for smooth real-time tracking)
```

**API Endpoint:**
Configure the tracking API endpoint:

```javascript
const API_URL = "http://localhost:5000/api/track";
```

**OpenRouteService API Key:**
The simulator uses OpenRouteService to fetch real driving routes. Update the API key in the `getRealRouteCoordinates` method:

```javascript
headers: {
  Authorization: "YOUR_OPENROUTESERVICE_API_KEY_HERE";
}
```

Get a free API key at: https://openrouteservice.org/dev/#/signup

## 🔧 Setup Instructions

### Prerequisites

**1. System Services**

Make sure your Vehicle Tracker system is running:

```bash
# Using Docker Compose
docker-compose up -d

# Or start services individually
mongod
redis-server
rabbitmq-server
```

**2. Start the Publisher Service**

The simulator sends data to the publisher service on port 5000:

```bash
cd publisher
npm install
npm start
```

**3. Start Consumer and User Services**

For full tracking functionality:

```bash
# Terminal 1 - Consumer service
cd consumer
npm start

# Terminal 2 - User service (for live tracking)
cd user
npm start
```

**4. Create Device Records**

The simulator requires device IDs that exist in MongoDB. Create devices via the API:

```bash
POST http://localhost:7000/api/devices
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Test Vehicle 1",
  "deviceId": "693daaf2a7cd544e618be7f1",
  "imei": "123456789012345"
}
```

Note the `deviceId` from the response and use it in the `DEVICES` array.

**5. OpenRouteService API Key** (Optional but Recommended)

For real route generation:

1. Sign up at https://openrouteservice.org/dev/#/signup
2. Get your free API key
3. Update the key in `simulateGPS.js`

### Running the Simulator

1. **Navigate to the publisher directory:**

   ```bash
   cd publisher/src
   ```

2. **Run the simulator:**

   ```bash
   node simulateGPS.js
   ```

3. **The simulator will:**

   - Fetch real routes from OpenRouteService (or use interpolated routes as fallback)
   - Start sending GPS data at the configured interval
   - Display real-time status updates
   - Automatically stop when all vehicles reach their destinations

4. **Stop simulation manually:**
   Press `Ctrl+C`

## 📊 Output Examples

### Single Vehicle Output:

```
🚀 Starting Multi-Device GPS Simulator...
📡 Simulating 1 devices
🎯 API Endpoint: http://localhost:5000/api/track
⏱️  Update Interval: 300ms

🔄 Initializing routes...

✓ Fetched 245 waypoints from OpenRouteService
✓ Route loaded for 693daaf2a7cd544e618be7f1: 245 waypoints

✅ All routes initialized!

==================================================

✅ Simulator running! Press Ctrl+C to stop.

⏰ [10:30:00]
🚗 693daaf2a7cd544e618be7f1: Lat 30.0370, Lng 31.2057, Speed 15.23 km/h, Status: Moving, Waypoint: 1/245

⏰ [10:30:01]
🚗 693daaf2a7cd544e618be7f1: Lat 30.0375, Lng 31.2061, Speed 28.76 km/h, Status: Moving, Waypoint: 3/245

⏰ [10:30:05]
🟡 693daaf2a7cd544e618be7f1: Lat 30.0421, Lng 31.2089, Speed 0.00 km/h, Status: Idling, Waypoint: 12/245

⏰ [10:30:35]
🚗 693daaf2a7cd544e618be7f1: Lat 30.0488, Lng 31.2134, Speed 67.45 km/h, Status: Moving, Waypoint: 89/245

⏰ [10:35:12]
🅿️ 693daaf2a7cd544e618be7f1: Lat 30.0578, Lng 31.2173, Speed 0.00 km/h, Status: Parking, Waypoint: 245/245
🏁 693daaf2a7cd544e618be7f1: Reached destination and stopped.

🎉 All vehicles have reached their destinations!
✅ Simulation completed successfully
```

### Multiple Vehicles Output:

```
🚀 Starting Multi-Device GPS Simulator...
📡 Simulating 2 devices
🎯 API Endpoint: http://localhost:5000/api/track
⏱️  Update Interval: 300ms

🔄 Initializing routes...

✓ Fetched 245 waypoints from OpenRouteService
✓ Route loaded for 693daaf2a7cd544e618be7f1: 245 waypoints
✓ Fetched 312 waypoints from OpenRouteService
✓ Route loaded for 691ebd94603e9c69e7e80c22: 312 waypoints

✅ All routes initialized!

⏰ [10:30:00]
🚗 693daaf2a7cd544e618be7f1: Lat 30.0370, Lng 31.2057, Speed 18.45 km/h, Status: Moving, Waypoint: 2/245
🚗 691ebd94603e9c69e7e80c22: Lat 30.0800, Lng 31.2700, Speed 22.34 km/h, Status: Moving, Waypoint: 3/312

⏰ [10:30:15]
🟡 693daaf2a7cd544e618be7f1: Lat 30.0421, Lng 31.2089, Speed 0.00 km/h, Status: Idling, Waypoint: 15/245
🚗 691ebd94603e9c69e7e80c22: Lat 30.0835, Lng 31.2745, Speed 55.67 km/h, Status: Moving, Waypoint: 45/312
```

## 🎯 Use Cases

### 1. Testing Real-time WebSocket Updates

1. Open `live-tracking.html` in a browser
2. Run the simulator
3. Watch vehicles move in real-time on the map

### 2. Testing Historical Routes

1. Run simulator for a few minutes
2. Stop the simulator
3. Query the history endpoint to see the recorded route

### 3. Load Testing

Simulate many devices to test system performance:

```javascript
// Add multiple devices to the DEVICES array
const DEVICES = [
  {
    deviceId: "693daaf2a7cd544e618be7f1",
    start: { lat: 30.036953, lng: 31.205739 },
    end: { lat: 30.057834, lng: 31.217332 },
    status: "Moving",
    speed: 60,
  },
  {
    deviceId: "693daaf2a7cd544e618be7f2",
    start: { lat: 30.025, lng: 31.195 },
    end: { lat: 30.065, lng: 31.225 },
    status: "Moving",
    speed: 55,
  },
  {
    deviceId: "693daaf2a7cd544e618be7f3",
    start: { lat: 30.045, lng: 31.215 },
    end: { lat: 30.075, lng: 31.245 },
    status: "Moving",
    speed: 70,
  },
  // ... add more devices (each needs to exist in MongoDB)
];
```

### 4. Geofencing Testing

1. Create a geofence around part of the route
2. Run the simulator
3. Monitor geofence entry/exit events

## 🛠️ Customization Tips

### Create Realistic City Routes

Use Google Maps to get coordinates:

1. Right-click on map → "What's here?"
2. Copy latitude and longitude
3. Add to route array

### Adjust Speed and Traffic Behavior

**Speed Variations:**
Edit the `updateSpeed()` method to change acceleration and variation:

```javascript
updateSpeed() {
  // Adjust acceleration rate (default: 5 km/h per second)
  const acceleration = 10; // Faster acceleration

  // Adjust speed variation (default: ±3 km/h)
  const variation = (Math.random() - 0.5) * 10; // More variation
  this.currentSpeed = Math.max(0, Math.min(this.maxSpeed, this.currentSpeed + variation));
}
```

**Traffic Stop Frequency:**
Edit the `checkForStop()` method:

```javascript
checkForStop() {
  // Adjust stop probability (default: 0.015 = 1.5% chance per update)
  if (Math.random() < 0.05) {  // 5% chance = more frequent stops
    this.isStopped = true;
    this.status = Math.random() < 0.7 ? 'Idling' : 'Parking';
    // Adjust stop duration (default: 20-40 seconds)
    this.nextStopTime = Date.now() + 10000 + Math.random() * 10000; // 10-20 seconds
  }
}
```

### Change Update Frequency

```javascript
// For smooth real-time testing (default)
const UPDATE_INTERVAL = 300; // 300ms - very smooth

// For standard GPS updates
const UPDATE_INTERVAL = 1000; // 1 second

// For realistic GPS device (less frequent)
const UPDATE_INTERVAL = 5000; // 5 seconds

// For battery-saving mode
const UPDATE_INTERVAL = 30000; // 30 seconds
```

**Note:** The simulator calculates movement based on the update interval, so changing this value will maintain realistic speeds and distances.

## 🐛 Troubleshooting

### "Connection refused" Error

**Cause:** Publisher service is not running or wrong port

**Solution:**

```bash
cd publisher
npm start
```

Verify the service is running on port 5000 and update `API_URL` if needed:

```javascript
const API_URL = "http://localhost:5000/api/track";
```

### "Device not found" or "Invalid deviceId" Error

**Cause:** Device doesn't exist in MongoDB

**Solution:**

1. Create the device via User Service API:

```bash
POST http://localhost:7000/api/devices
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Test Vehicle",
  "deviceId": "693daaf2a7cd544e618be7f1",
  "imei": "123456789012345"
}
```

2. Use the returned `_id` or `deviceId` in the `DEVICES` array

3. Verify device exists:

```bash
GET http://localhost:7000/api/devices
```

### Data not appearing in live tracking

- **Solution:**
  1. Check if WebSocket is connected in `live-tracking.html`
  2. Verify Redis is running
  3. Check consumer service is processing messages

### No data in database

**Cause:** Consumer service not processing messages

**Solution:**

1. **Check RabbitMQ:**

```bash
docker ps | grep rabbitmq
# Or visit: http://localhost:15672 (guest/guest)
```

2. **Start Consumer Service:**

```bash
cd consumer
npm start
```

3. **Check MongoDB connection:**

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Verify data in MongoDB:
mongosh
use vehicleTracker
db.records.find().limit(5)
```

4. **Check Publisher logs** for successful message publishing

## 📝 Data Format

The simulator sends data in this format:

```javascript
{
  "deviceId": "693daaf2a7cd544e618be7f1",  // MongoDB ObjectId
  "lat": 30.036953,                        // Latitude (6 decimal places)
  "lng": 31.205739,                        // Longitude (6 decimal places)
  "speed": 62.45,                          // Speed in km/h (2 decimal places)
  "status": "Moving",                      // Status: "Moving", "Idling", or "Parking"
  "timestamp": "2025-12-15T10:30:00.000Z" // ISO 8601 format
}
```

**Field Descriptions:**

- `deviceId`: Must match an existing device in MongoDB
- `lat`, `lng`: GPS coordinates (WGS84 format)
- `speed`: Current speed in kilometers per hour
- `status`: Current vehicle state
- `timestamp`: UTC timestamp of the GPS reading

This data is sent to: `POST http://localhost:5000/api/track`

## 🔗 Related Files

- `publisher/src/simulateGPS.js` - Main GPS simulator script
- `publisher/src/controllers/trackController.js` - Receives GPS data
- `publisher/src/middlewares/validateRecord.js` - Validates GPS data
- `publisher/src/services/publishToRabbitMQ.js` - Publishes to message queue
- `consumer/src/services/consumeRabbitMQ.js` - Consumes GPS messages
- `consumer/src/models/recordModel.js` - MongoDB record schema
- `user/public/live-tracking.html` - Real-time tracking visualization
- `user/src/services/socket.js` - WebSocket server for live updates

## 🌐 API Endpoints

- `POST http://localhost:5000/api/track` - Submit GPS data (Publisher)
- `GET http://localhost:7000/api/devices` - List devices (User Service)
- `POST http://localhost:7000/api/devices` - Create device (User Service)
- `GET http://localhost:7000/api/live/:deviceId` - Live tracking (User Service)
- `GET http://localhost:6000/api/records` - Query historical records (Consumer)

## 🔑 OpenRouteService API

The simulator uses OpenRouteService for realistic route generation:

**Get API Key:** https://openrouteservice.org/dev/#/signup

**Features Used:**

- Directions API (driving-car profile)
- Returns actual road coordinates between two points
- Free tier: 2,000 requests/day

**Fallback:** If API is unavailable, the simulator generates interpolated straight-line routes

---

Happy Testing! 🚗💨
