import { Schema, model } from 'mongoose';

const deviceSchema = new Schema({
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
});

const Device = model('Device', deviceSchema);

export default Device;
