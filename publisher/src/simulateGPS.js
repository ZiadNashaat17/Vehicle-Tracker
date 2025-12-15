import axios from "axios";

const API_URL = "http://localhost:5000/api/track";
const UPDATE_INTERVAL = 2000; // 2 seconds

// Define multiple devices with realistic routes (simulating actual roads)
const DEVICES = [
	{
		deviceId: "693693f8c8c7e61c807e0860",
		route: [
			// Route 1: Simulating a road through Cairo
			{ lat: 30.035337, lng: 31.198354 },
			{ lat: 30.037899, lng: 31.210041 },
			{ lat: 30.039821, lng: 31.219049 },
			{ lat: 30.040756, lng: 31.219826 },
			{ lat: 30.047629, lng: 31.217913 },
			{ lat: 30.05525, lng: 31.216145 },
			{ lat: 30.061622, lng: 31.214521 },
		],
		speed: 250,
	},
	// {
	// 	deviceId: "6937ead371a2a4574895a6ff",
	// 	route: [
	// 		// Route 2: Simulating another road
	// 		{ lat: 30.08, lng: 31.27 },
	// 		{ lat: 30.0793, lng: 31.2693 },
	// 		{ lat: 30.0786, lng: 31.2686 },
	// 		{ lat: 30.0779, lng: 31.2679 },
	// 		{ lat: 30.0772, lng: 31.2672 },
	// 		{ lat: 30.0765, lng: 31.2665 },
	// 		{ lat: 30.0758, lng: 31.2658 },
	// 		{ lat: 30.0751, lng: 31.2651 },
	// 		{ lat: 30.0744, lng: 31.2644 },
	// 		{ lat: 30.0737, lng: 31.2637 },
	// 		{ lat: 30.073, lng: 31.263 },
	// 	],
	// 	speed: 45,
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
		this.direction = 1; // 1 for forward, -1 for backward
	}

	generateSpeed() {
		const variation = (Math.random() - 0.5) * 15;
		return Math.max(0, this.speed + variation);
	}

	getNextPosition() {
		const current = this.route[this.currentIndex];
		const nextIndex = (this.currentIndex + 1) % this.route.length;
		const next = this.route[nextIndex];

		// Slower progression for smoother movement (was 0.15, now 0.05)
		this.progress += 0.015;

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
