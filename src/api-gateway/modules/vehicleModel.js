import { Schema, model } from 'mongoose';

const vehicleSchema = new Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
    enum: ['Motorcycle', 'Car', 'Truck'],
  },
  status: { type: String, default: 'off' },
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
});

const Vehicle = model('Vehicle', vehicleSchema);

export default Vehicle;
