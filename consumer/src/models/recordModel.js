import { model, Schema } from "mongoose";

const recordSchema = new Schema({
	deviceId: {
		type: Schema.Types.ObjectId,
		ref: "Device",
		required: true,
	},
	lng: {
		type: Number,
		required: true,
		min: -180,
		max: 180,
	},
	lat: {
		type: Number,
		required: true,
		min: -90,
		max: 90,
	},
	speed: { type: Number, required: true },
	timestamp: { type: Date, default: Date.now() },
});

const Record = model("Record", recordSchema);

export default Record;
