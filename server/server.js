import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import itineraryRoutes from './routes/itinerary.js';
import tripRoutes from './routes/trips.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  aiConfigured: Boolean(process.env.GEMINI_API_KEY)
}));
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/trips', tripRoutes);
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  console.error('[API error]', error.message);
  const status = Number(error.status) || 500;
  res.status(status).json({ message: status >= 500 && status === 500 ? 'Something went wrong on the server. Check the backend terminal and try again.' : error.message });
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected.');
    } catch (error) {
      console.warn(`MongoDB not connected: ${error.message}`);
      console.warn('The AI planner can still generate itineraries. Saved trips require MongoDB.');
    }
  } else {
    console.warn('MONGODB_URI is empty. Saved trips are disabled until MongoDB is configured.');
  }
  app.listen(port, () => console.log(`WanderWise API running at http://localhost:${port}`));
}
start();