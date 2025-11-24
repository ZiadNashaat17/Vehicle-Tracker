# 🛰️ GPS Data Simulator

This document explains how to use the GPS data simulator for testing the Vehicle Tracker system.

## 📋 Overview

The GPS simulator generates realistic GPS tracking data and sends it to your Vehicle Tracker API. This is useful for:

- Testing real-time tracking features
- Demonstrating the system without physical GPS devices
- Load testing with multiple vehicles
- Development and debugging

## 🚀 GPS Simulator

### Vehicle Simulator (`simulateGPS.js`)

Simulates one or more vehicles with different routes simultaneously.

**Features:**

- Simulate single or multiple vehicles
- Different routes for each vehicle
- Different speeds per vehicle
- Smooth movement between waypoints
- Realistic speed variations (±7.5 km/h)
- Configurable update interval
- Automatic route looping

**Usage:**

```bash
node simulateGPS.js
```

**Configuration:**
Edit the `VEHICLES` array in `simulateGPS.js`:

```javascript
const VEHICLES = [
  {
    deviceId: '6923feb9477b57abb8a2239f',
    route: [
      { lat: 30.0444, lng: 31.2357 },
      { lat: 30.05, lng: 31.24 },
      { lat: 30.055, lng: 31.245 },
      { lat: 30.06, lng: 31.25 },
    ],
    speed: 60,
  },
  // Add more vehicles for multi-vehicle simulation
  // Or keep just one vehicle for single vehicle testing
];
```

**For Single Vehicle Testing:**
Simply keep only one vehicle in the array:

```javascript
const VEHICLES = [
  {
    deviceId: '6923feb9477b57abb8a2239f',
    route: [
      { lat: 30.0444, lng: 31.2357 },
      { lat: 30.05, lng: 31.24 },
      { lat: 30.055, lng: 31.245 },
      { lat: 30.06, lng: 31.25 },
    ],
    speed: 60,
  },
];
```

**Update Interval:**
Adjust how often GPS data is sent:

```javascript
const UPDATE_INTERVAL = 3000; // 3 seconds (3000ms)
```

## 🔧 Setup Instructions

### Prerequisites

Make sure your Vehicle Tracker system is running:

1. **Start MongoDB, Redis, and RabbitMQ**

   ```bash
   # Using Docker Compose
   docker-compose up -d

   # Or start services individually
   mongod
   redis-server
   rabbitmq-server
   ```

2. **Start the Vehicle Tracker**

   ```bash
   npm start
   # or
   npm run start-dev
   ```

3. **Create Device Records** (if needed)

   The simulator uses device IDs. Make sure these devices exist in your system, or create them via the API:

   ```bash
   POST /api/v1/device
   {
     "deviceId": "GPS-001",
     "model": "Simulator",
     "imei": "000000000000001"
   }
   ```

### Running the Simulator

1. **Run the simulator:**

   ```bash
   node simulateGPS.js
   ```

2. **Stop simulation:**
   Press `Ctrl+C`

## 📊 Output Examples

### Single Vehicle Output:

```
🚀 Starting Multi-Vehicle GPS Simulator...
📡 Simulating 1 vehicles
🎯 API Endpoint: http://localhost:3000/api/v1/track
⏱️  Update Interval: 3000ms

✅ Simulator running! Press Ctrl+C to stop.

⏰ [10:30:00]
✅ 6923feb9477b57abb8a2239f: Lat 30.0444, Lng 31.2357, Speed 61.23 km/h

⏰ [10:30:03]
✅ 6923feb9477b57abb8a2239f: Lat 30.0468, Lng 31.2378, Speed 58.76 km/h
```

### Multiple Vehicles Output:

```
🚀 Starting Multi-Vehicle GPS Simulator...
📡 Simulating 2 vehicles
🎯 API Endpoint: http://localhost:3000/api/v1/track
⏱️  Update Interval: 3000ms

✅ Simulator running! Press Ctrl+C to stop.

⏰ [10:30:00]
✅ 6923feb9477b57abb8a2239f: Lat 30.0444, Lng 31.2357, Speed 61.23 km/h
✅ 691ebd94603e9c69e7e80c22: Lat 30.0800, Lng 31.2700, Speed 47.89 km/h

⏰ [10:30:03]
✅ 6923feb9477b57abb8a2239f: Lat 30.0468, Lng 31.2378, Speed 58.12 km/h
✅ 691ebd94603e9c69e7e80c22: Lat 30.0788, Lng 31.2683, Speed 43.56 km/h
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

Simulate many vehicles to test system performance:

```javascript
// Add multiple vehicles to the VEHICLES array
const VEHICLES = [
  {
    deviceId: 'GPS-001',
    route: [
      /* ... */
    ],
    speed: 60,
  },
  {
    deviceId: 'GPS-002',
    route: [
      /* ... */
    ],
    speed: 55,
  },
  {
    deviceId: 'GPS-003',
    route: [
      /* ... */
    ],
    speed: 70,
  },
  {
    deviceId: 'GPS-004',
    route: [
      /* ... */
    ],
    speed: 65,
  },
  {
    deviceId: 'GPS-005',
    route: [
      /* ... */
    ],
    speed: 50,
  },
  // ... add more vehicles
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

### Adjust Speed Realism

```javascript
generateSpeed() {
  // For city driving (slower, more variation)
  const variation = (Math.random() - 0.5) * 30;
  return Math.max(0, Math.min(50, this.baseSpeed + variation));

  // For highway (faster, less variation)
  const variation = (Math.random() - 0.5) * 10;
  return Math.max(60, this.baseSpeed + variation);
}
```

### Change Update Frequency

```javascript
// For real-time testing (frequent updates)
const UPDATE_INTERVAL = 1000; // 1 second

// For realistic GPS device (less frequent)
const UPDATE_INTERVAL = 30000; // 30 seconds
```

## 🐛 Troubleshooting

### "Connection refused" Error

- **Solution:** Make sure the Vehicle Tracker server is running
- Check the `API_URL` in the configuration

### "Device not found" Error

- **Solution:** Create the device using the API first
- Or update the `deviceId` to match an existing device

### Data not appearing in live tracking

- **Solution:**
  1. Check if WebSocket is connected in `live-tracking.html`
  2. Verify Redis is running
  3. Check consumer service is processing messages

### No data in database

- **Solution:**
  1. Check RabbitMQ is running
  2. Verify consumer service is running
  3. Check MongoDB connection

## 📝 Data Format

The simulator sends data in this format:

```javascript
{
  "deviceId": "GPS-001",
  "lat": 30.0444,
  "lng": 31.2357,
  "speed": 62.45,
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

This matches the expected format for the `/api/v1/track` endpoint.

## 🔗 Related Files

- `simulateGPS.js` - GPS simulator script
- `live-tracking.html` - View simulated vehicles in real-time
- `test-socket-connection.html` - Test Socket.io connection
- `src/publisher/services/validateRecord.js` - GPS data validation logic

---

Happy Testing! 🚗💨
