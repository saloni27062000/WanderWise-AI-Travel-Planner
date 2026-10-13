const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Something went wrong. Please try again.');
  return payload;
}

export const generateItinerary = (trip) =>
  request('/itinerary/generate', { method: 'POST', body: JSON.stringify(trip) });
export const generateFollowUpQuestion = (trip) =>
  request('/itinerary/follow-up', { method: 'POST', body: JSON.stringify(trip) });
export const getSavedTrips = () => request('/trips');
export const saveTrip = (trip) => request('/trips', { method: 'POST', body: JSON.stringify(trip) });
export const deleteTrip = (id) => request(`/trips/${id}`, { method: 'DELETE' });
export const getHealth = () => request('/health');