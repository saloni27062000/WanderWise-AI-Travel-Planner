import { useEffect, useState } from 'react';
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, CalendarDays, MapPin, RefreshCw } from 'lucide-react';
import { getSavedTrips, deleteTrip } from '../api';

export default function SavedTrips({ refreshKey, onOpen, onBack }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getSavedTrips();
      setTrips(data.trips || []);
    } catch (e) {
      setError(e.message || 'Could not load saved trips.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshKey]);

  async function remove(id) {
    try {
      await deleteTrip(id);
      setTrips((items) => items.filter((trip) => trip._id !== id));
    } catch (e) {
      setError(e.message || 'Could not delete this trip.');
    }
  }

  return (
    <section className="saved-page-section">
      <div className="container saved-page-container">
        <button className="saved-back-link" onClick={onBack}><ArrowLeft size={15} /> Back to planner</button>
        <div className="saved-page-heading">
          <div><span className="eyebrow"><span className="eyebrow-line" /> YOUR COLLECTION</span><h1>Saved trips</h1><p>Your travel ideas, ready when you are.</p></div>
          <span className="saved-count"><Bookmark size={15} /> {trips.length} {trips.length === 1 ? 'trip' : 'trips'}</span>
        </div>

        {loading ? <div className="saved-page-state" role="status"><span className="spinner-border spinner-border-sm" /> Loading your trips…</div>
          : error ? <div className="saved-page-state saved-page-error" role="alert"><i className="bi bi-cloud-slash" /><h2>We couldn't load your trips</h2><p>{error}</p><button className="btn btn-outline-soft" onClick={load}><RefreshCw size={15} /> Try again</button></div>
            : trips.length === 0 ? <div className="saved-page-state saved-page-empty"><span className="empty-icon"><i className="bi bi-bookmark-heart" /></span><h2>Your next favourite trip starts here</h2><p>Once you create and save an itinerary, it will be waiting for you on this page.</p><button className="btn btn-hero-primary" onClick={onBack}>Plan my first trip <ArrowUpRight size={16} /></button></div>
              : <div className="saved-page-list">{trips.map((trip) => (
                <article className="saved-page-trip" key={trip._id}>
                <div className="saved-trip-card-top"><div className="saved-trip-icon"><MapPin size={19} /></div><span className="saved-trip-card-label">YOUR NEXT ESCAPE</span><span className="saved-trip-card-number"><CalendarDays size={13} /> {trip.days} {trip.days === 1 ? 'day' : 'days'}</span></div>
                <div className="saved-trip-info"><strong>{trip.itinerary?.title || trip.destination}</strong><span className="saved-trip-destination">{trip.destination}</span></div>
                <div className="saved-trip-card-actions"><button className="saved-open-button" onClick={() => onOpen(trip)}>Open itinerary <ArrowRight size={15} /></button>
                <button className="delete-trip" onClick={() => remove(trip._id)} aria-label={`Delete ${trip.destination} trip`} title="Delete trip"><i className="bi bi-trash3" /></button>
                </div>
              </article>
            ))}</div>}
      </div>
    </section>
  );
}
