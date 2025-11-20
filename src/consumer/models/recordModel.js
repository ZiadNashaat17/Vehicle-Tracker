import { Schema, model } from 'mongoose';

const recordSchema = new Schema({
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  speed: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now() },
});

const Record = model('Record', recordSchema);

export default Record;
