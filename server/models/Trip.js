import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  time: { type: String, default: '' },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  estimatedCost: { type: String, default: '' },
  tip: { type: String, default: '' },
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: Number,
  date: String,
  title: String,
  shortTitle: String,
  summary: String,
  activities: [activitySchema],
  foodSuggestion: String,
}, { _id: false });

const tripSchema = new mongoose.Schema({
  destination: { type: String, required: true, trim: true, maxlength: 100 },
  days: { type: Number, required: true, min: 1, max: 14 },
  trip: { type: mongoose.Schema.Types.Mixed, required: true },
  itinerary: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);