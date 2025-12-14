import axios from "axios";

const API_URL = "http://localhost:5000/api/track";
const UPDATE_INTERVAL = 500; // 3 seconds

// Define multiple devices with different routes
const DEVICES = [
	{
		deviceId: "6935e24af7d01a39910bd5d7",
		route: [
			{ lat: 30.0444, lng: 31.2357 },
			{ lat: 30.05, lng: 31.24 },
			{ lat: 30.055, lng: 31.245 },
			{ lat: 30.06, lng: 31.25 },
		],
		speed: 60,
	},
	// {
	//   deviceId: '691ebd94603e9c69e7e80c22',
	//   route: [
	//     { lat: 30.08, lng: 31.27 },
	//     { lat: 30.075, lng: 31.265 },
	//     { lat: 30.07, lng: 31.26 },
	//     { lat: 30.065, lng: 31.255 },
	//   ],
	//   speed: 45,
	// },
];

class DeviceSimulator {
	constructor(device) {
		this.deviceId = device.deviceId;
		this.route = device.route;
		this.speed = device.speed;
		this.status = device.status;
		this.timestamp = device.timestamp;
		this.currentIndex = 0;
		this.progress = 0;
	}

	generateSpeed() {
		const variation = (Math.random() - 0.5) * 15;
		return Math.max(0, this.speed + variation);
	}

	getNextPosition() {
		const current = this.route[this.currentIndex];
		const nextIndex = (this.currentIndex + 1) % this.route.length;
		const next = this.route[nextIndex];

		this.progress += 0.15;

		if (this.progress >= 1) {
			this.progress = 0;
			this.currentIndex = nextIndex;
		}

		return {
			lat: current.lat + (next.lat - current.lat) * this.progress,
			lng: current.lng + (next.lng - current.lng) * this.progress,
		};
	}

	generateGPSRecord() {
		const position = this.getNextPosition();
		return {
			deviceId: this.deviceId,
			lat: parseFloat(position.lat.toFixed(6)),
			lng: parseFloat(position.lng.toFixed(6)),
			speed: parseFloat(this.generateSpeed().toFixed(2)),
			status: this.status,
			timestamp: this.timestamp || Date.now(),
		};
	}

	async send() {
		const data = this.generateGPSRecord();
		try {
			await axios.post(API_URL, data, { headers: { Authorization: `Bearer` } });
			console.log(
				`✅ ${this.deviceId}: Lat ${data.lat}, Lng ${data.lng}, Speed ${data.speed} km/h`,
			);
		} catch (error) {
			console.error(`❌ ${this.deviceId}: Error -`, error.response?.data?.message || error.message);
		}
	}
}

// Create simulators for all devices
const simulators = DEVICES.map(device => new DeviceSimulator(device));

console.log("🚀 Starting Multi-Device GPS Simulator...");
console.log(`📡 Simulating ${DEVICES.length} devices`);
console.log(`🎯 API Endpoint: ${API_URL}`);
console.log(`⏱️  Update Interval: ${UPDATE_INTERVAL}ms`);
console.log("");

// Send data for all devices
const sendAllData = async () => {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`\n⏰ [${timestamp}]`);

	for (const simulator of simulators) {
		await simulator.send();
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
