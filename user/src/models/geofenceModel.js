import { Schema, model } from "mongoose";

const geofenceSchema = new Schema(
  {
    name: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Circle", "Polygon"],
      required: true,
    },
    geofence: {
      type: {
        type: String,
        enum: ["Point", "Polygon"],
        required: true,
      },
      coordinates: {
        type: Schema.Types.Array,
        required: true,
      },
      radius: Number,
    },
    color: String,
    active: { type: Boolean, default: true },
    devices: {
      type: [{ type: Schema.Types.ObjectId, ref: "Device" }],
    },
  },
  {
    timestamps: true,
  }
);

geofenceSchema.index({ geofence: "2dsphere" });

const Geofence = model("Geofence", geofenceSchema);

export default Geofence;
