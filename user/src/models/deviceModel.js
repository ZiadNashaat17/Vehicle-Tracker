import { model, Schema } from "mongoose";

const deviceSchema = new Schema({
	brand: { type: String, required: true },
	model: { type: String, required: true },
	year: { type: Number, required: true },
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	plateNumber: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	type: {
		type: String,
		required: true,
		enum: ["Motorcycle", "Car", "Truck"],
	},
	status: { type: String, default: "Parking", enum: ["Parking", "Moving", "Idling", "Towed"] },
	speed: { type: Number, default: 0 },
	lastLocation: {
		type: {
			type: String,
			enum: ["Point"],
			default: "Point",
		},
		coordinates: {
			type: [Number],
			default: [0, 0],
		},
	},
});

const Device = model("Device", deviceSchema);

export default Device;
