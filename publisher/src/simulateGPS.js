import axios from "axios";

const API_URL = "http://localhost:5000/api/track";
const UPDATE_INTERVAL = 300; // 2 seconds

// Define multiple devices with realistic routes (simulating actual roads)
const DEVICES = [
	{
		deviceId: "6941c0f70547ff536edf3ec4",
		start: { lat: 30.036953, lng: 31.205739 },
		end: { lat: 30.057834, lng: 31.217332 },
		status: "Moving",
		speed: 80,
	},
	{
		deviceId: "6941e91d92c6b13bd0f13169",
		start: { lat: 29.987485, lng: 31.143126 },
		end: { lat: 30.020359, lng: 31.216163 },
		status: "Moving",
		speed: 80,
	},
	// {
	// 	deviceId: "6941eb58ead0b7bd564d9cd4",
	// 	start: { lat: 30.068954, lng: 31.195792 },
	// 	end: { lat: 30.075339, lng: 31.221846 },
	// 	status: "Moving",
	// 	speed: 80,
	// },
];

class DeviceSimulator {
	constructor(device) {
		this.deviceId = device.deviceId;
		this.start = device.start;
		this.end = device.end;
		this.maxSpeed = device.speed || 60;
		this.status = device.status || "Moving";

		// Movement state
		this.route = null; // Will be populated with real coordinates
		this.currentIndex = 0;
		this.progress = 0;
		this.direction = 1; // 1 for forward, -1 for backward
		this.currentSpeed = 0;
		this.currentRotation = 0; // Bearing/heading in degrees (0-360)
		this.hasReachedEnd = false;

		// Traffic simulation
		this.nextStopTime = null;
		this.isStopped = false;
		this.lastUpdateTime = Date.now();
		this.isInitialized = false;
	}

	async initialize() {
		if (!this.isInitialized) {
			this.route = await this.getRealRouteCoordinates(this.start, this.end);
			this.isInitialized = true;
			console.log(`✓ Route loaded for ${this.deviceId}: ${this.route.length} waypoints`);
		}
	}

	async getRealRouteCoordinates(start, end) {
		try {
			const response = await axios.get(
				`https://api.openrouteservice.org/v2/directions/driving-car`,
				{
					params: {
						start: `${start.lng},${start.lat}`,
						end: `${end.lng},${end.lat}`,
					},
					headers: {
						Authorization:
							"eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA5MzQ3MTBkMjRjOTQzMGRhMDdlNWUyNjMyMmNmZjkxIiwiaCI6Im11cm11cjY0In0=", // Replace with your key
					},
				},
			);

			// Extract coordinates from the response
			const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
				lat: coord[1],
				lng: coord[0],
			}));

			console.log(`✓ Fetched ${coordinates.length} waypoints from OpenRouteService`);
			return coordinates;
		} catch (error) {
			console.warn(
				`⚠️  Failed to fetch route from API (${error.message}), generating interpolated route...`,
			);
			// Fallback: Generate interpolated points between start and end
			return this.generateInterpolatedRoute(start, end, 50); // 50 waypoints
		}
	}

	// Generate smooth interpolated route when API fails
	generateInterpolatedRoute(start, end, numPoints = 50) {
		const route = [];
		for (let i = 0; i <= numPoints; i++) {
			const progress = i / numPoints;
			route.push({
				lat: start.lat + (end.lat - start.lat) * progress,
				lng: start.lng + (end.lng - start.lng) * progress,
			});
		}
		return route;
	}

	updateSpeed() {
		const currentTime = Date.now();
		const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
		this.lastUpdateTime = currentTime;

		if (this.isStopped) {
			// Gradually decelerate to 0
			this.currentSpeed = Math.max(0, this.currentSpeed - 10 * deltaTime);
			return;
		}

		// Gradually accelerate to max speed
		const acceleration = 5; // km/h per second
		if (this.currentSpeed < this.maxSpeed) {
			this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + acceleration * deltaTime);
		}

		// Add small random variations (±3 km/h)
		const variation = (Math.random() - 0.5) * 6;
		this.currentSpeed = Math.max(0, Math.min(this.maxSpeed, this.currentSpeed + variation));
	}

	checkForStop() {
		// If currently stopped, check if stop duration is over
		if (this.isStopped) {
			if (Date.now() >= this.nextStopTime) {
				this.isStopped = false;
				this.status = "Moving";
				// Schedule next stop (random 1-3 minutes)
				this.nextStopTime = Date.now() + 60000 + Math.random() * 120000;
			}
			return;
		}

		// Random chance to stop (simulating traffic lights, etc.)
		if (Math.random() < 0.015) {
			// 1.5% chance per update
			this.isStopped = true;
			this.status = Math.random() < 0.7 ? "Idling" : "Parking";
			// Stop for 20-40 seconds
			this.nextStopTime = Date.now() + 20000 + Math.random() * 20000;
		}
	}

	getNextPosition() {
		if (!this.route || this.route.length < 2) {
			return this.start;
		}

		// Calculate actual distance between current waypoint and next waypoint
		const nextIndex = this.currentIndex + this.direction;

		// Check if we've completed the current segment
		if (this.progress >= 1) {
			this.progress = 0;
			this.currentIndex = nextIndex;

			// Check if we've reached the end of the route
			if (this.currentIndex >= this.route.length - 1) {
				// Reached the end, stop the simulation
				this.hasReachedEnd = true;
				this.currentSpeed = 0;
				this.status = "Parking";
				return this.route[this.route.length - 1]; // Return final position
			}
		}

		// Recalculate current and next based on updated index
		const currentWaypoint = this.route[this.currentIndex];
		const nextWaypoint = this.route[this.currentIndex + this.direction];

		// Update rotation/bearing based on direction of travel
		this.currentRotation = this.calculateBearing(currentWaypoint, nextWaypoint);

		// Calculate actual distance between waypoints in meters
		const distance = this.calculateDistance(currentWaypoint, nextWaypoint);

		// Calculate how far we move based on current speed
		// Speed is in km/h, convert to m/s, then calculate distance moved in UPDATE_INTERVAL
		const speedInMetersPerSecond = (this.currentSpeed * 1000) / 3600;
		const distanceMovedInInterval = speedInMetersPerSecond * (UPDATE_INTERVAL / 1000);

		// Progress is the fraction of the segment completed
		const progressIncrement = this.isStopped ? 0 : distanceMovedInInterval / distance;
		this.progress += progressIncrement;

		return {
			lat: currentWaypoint.lat + (nextWaypoint.lat - currentWaypoint.lat) * this.progress,
			lng: currentWaypoint.lng + (nextWaypoint.lng - currentWaypoint.lng) * this.progress,
		};
	}

	// Haversine formula to calculate distance between two points (in meters)
	calculateDistance(from, to) {
		const R = 6371000; // Earth's radius in meters
		const φ1 = (from.lat * Math.PI) / 180;
		const φ2 = (to.lat * Math.PI) / 180;
		const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
		const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	// Calculate bearing/heading between two points (in degrees, 0-360)
	// 0° = North, 90° = East, 180° = South, 270° = West
	calculateBearing(from, to) {
		const φ1 = (from.lat * Math.PI) / 180;
		const φ2 = (to.lat * Math.PI) / 180;
		const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

		const y = Math.sin(Δλ) * Math.cos(φ2);
		const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
		const θ = Math.atan2(y, x);

		// Convert from radians to degrees and normalize to 0-360
		const bearing = ((θ * 180) / Math.PI + 360) % 360;
		return bearing;
	}

	generateSpeed() {
		const variation = (Math.random() - 0.5) * 5;
		return Math.max(0, this.currentSpeed + variation);
	}

	generateGPSRecord() {
		// Update traffic conditions
		this.checkForStop();
		this.updateSpeed();

		const position = this.getNextPosition();

		return {
			deviceId: this.deviceId,
			lat: parseFloat(position.lat.toFixed(6)),
			lng: parseFloat(position.lng.toFixed(6)),
			speed: parseFloat(this.currentSpeed.toFixed(2)),
			rotation: parseFloat(this.currentRotation.toFixed(2)),
			status: this.status,
			timestamp: new Date(),
		};
	}
	async send() {
		// Ensure route is loaded only once
		if (!this.isInitialized) {
			await this.initialize();
		}

		// Stop sending if reached the end
		if (this.hasReachedEnd) {
			console.log(`🏁 ${this.deviceId}: Reached destination and stopped.`);
			return;
		}

		const data = this.generateGPSRecord();
		try {
			await axios.post(API_URL, data, { headers: { Authorization: `Bearer` } });

			const statusIcon = this.status === "Moving" ? "🚗" : this.status === "Parking" ? "🅿️" : "🟡";

			console.log(
				`${statusIcon} ${this.deviceId}: ` +
					`Lat ${data.lat}, Lng ${data.lng}, ` +
					`Speed ${data.speed} km/h, ` +
					`Status: ${data.status}, ` +
					`Waypoint: ${this.currentIndex + 1}/${this.route?.length || 0}`,
			);
		} catch (error) {
			console.error(`❌ ${this.deviceId}: Error -`, error.response?.data?.message || error.message);
		}
	}
}

// Create simulators for all devices
const simulators = DEVICES.map(device => new DeviceSimulator(device));

// Initialize all simulators before starting
console.log("🚀 Starting Multi-Device GPS Simulator...");
console.log(`📡 Simulating ${DEVICES.length} devices`);
console.log(`🎯 API Endpoint: ${API_URL}`);
console.log(`⏱️  Update Interval: ${UPDATE_INTERVAL}ms`);
console.log("\n🔄 Initializing routes...\n");

// Initialize all routes first
Promise.all(simulators.map(sim => sim.initialize())).then(() => {
	console.log("\n✅ All routes initialized!\n");
	console.log("=".repeat(50));

	// Send data for all devices
	const sendAllData = async () => {
		const timestamp = new Date().toLocaleTimeString();
		console.log(`\n⏰ [${timestamp}]`);

		for (const simulator of simulators) {
			await simulator.send();
		}

		// Check if all simulators have reached their destination
		const allFinished = simulators.every(sim => sim.hasReachedEnd);
		if (allFinished) {
			clearInterval(timer);
			console.log("\n\n🎉 All vehicles have reached their destinations!");
			console.log("✅ Simulation completed successfully");
			process.exit(0);
		}
	};

	// Start simulation
	const timer = setInterval(sendAllData, UPDATE_INTERVAL);

	// Send initial data immediately
	sendAllData();

	// Handle graceful shutdown
	const shutdown = () => {
		clearInterval(timer);
		console.log("\n\n❌ Simulation stopped");
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	console.log("\n✅ Simulator running! Press Ctrl+C to stop.\n");
});
