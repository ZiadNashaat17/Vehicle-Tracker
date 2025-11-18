import { Schema, model } from 'mongoose';

const recordSchema = new Schema({
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
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
