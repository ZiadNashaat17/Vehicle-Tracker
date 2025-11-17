import { Schema, model } from 'mongoose';

const vehicleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  vehicleId: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Motorcycle', 'Car', 'Truck'],
  },
  status: {
    type: String,
    enum: ['on', 'off'],
    default: 'on',
  },
});

const Vehicle = model('Vehicle', vehicleSchema);

export default Vehicle;
