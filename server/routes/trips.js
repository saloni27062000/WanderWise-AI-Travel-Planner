import { Router } from 'express';
import mongoose from 'mongoose';
import Trip from '../models/Trip.js';

const router = Router();
function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Trip saving needs a connected MongoDB database. You can still generate itineraries without it.' });
  next();
}
router.get('/', requireDatabase, async (req, res, next) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ trips });
  } catch (e) { next(e); }
});
router.post('/', requireDatabase, async (req, res, next) => {
  try {
    const { destination, days, trip, itinerary } = req.body || {};
    if (!destination || !Number.isInteger(Number(days)) || !itinerary || !trip) return res.status(400).json({ message: 'A destination, trip details, and itinerary are required.' });
    const saved = await Trip.create({ destination: String(destination).slice(0,100), days: Number(days), trip, itinerary });
    res.status(201).json({ trip: saved });
  } catch (e) { next(e); }
});
router.delete('/:id', requireDatabase, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid trip ID.' });
    const deleted = await Trip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Saved trip not found.' });
    res.json({ message: 'Trip deleted.' });
  } catch (e) { next(e); }
});
export default router;