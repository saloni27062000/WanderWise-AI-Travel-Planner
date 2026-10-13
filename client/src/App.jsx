import { useEffect, useState } from 'react';
import React from 'react';
import { Compass, ArrowUpRight, Globe2, Sparkles, ShieldCheck, Bookmark } from 'lucide-react';
import TripForm from './components/TripForm.jsx';
import ItineraryView from './components/ItineraryView.jsx';
import SavedTrips from './components/SavedTrips.jsx';
import { generateItinerary, saveTrip } from './api';

const inspirations = [
  { name: 'Kyoto, Japan', category: 'Culture · Slow travel', image: 'photo-1493976040374-85c8e12f0c0e', days: 5 },
  { name: 'Amalfi Coast, Italy', category: 'Coastal · Food', image: 'photo-1533105079780-92b9be482077', days: 4 },
  { name: 'Bali, Indonesia', category: 'Nature · Wellness', image: 'photo-1537996194471-e657df975ab4', days: 6 },
];

const pages = ['home', 'itinerary', 'saved-trips', 'how-it-works'];
function currentPage() {
  const page = window.location.hash.slice(1);
  return pages.includes(page) ? page : 'home';
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedRefresh, setSavedRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const syncPage = () => {
      setPage(currentPage());
      setMobileMenu(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', syncPage);
    return () => window.removeEventListener('popstate', syncPage);
  }, []);

  function navigate(nextPage) {
    if (!pages.includes(nextPage)) return;
    if (currentPage() !== nextPage) window.history.pushState(null, '', `#${nextPage}`);
    setPage(nextPage);
    setMobileMenu(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToHomeSection(section) {
    if (page !== 'home') navigate('home');
    window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  async function handleGenerate(trip) {
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    try {
      const data = await generateItinerary(trip);
      setResult(data);
      navigate('itinerary');
    } catch (e) {
      setError(e.message || 'We could not create your itinerary. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      await saveTrip({ destination: result.trip.destination, days: result.trip.days, trip: result.trip, itinerary: result.itinerary });
      setSaved(true);
      setSavedRefresh((value) => value + 1);
      notify('Your trip was saved.');
    } catch (e) {
      notify(e.message || 'Could not save this trip. Check that MongoDB is connected.');
    } finally {
      setSaving(false);
    }
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  }

  function reset() {
    setResult(null);
    setSaved(false);
    navigate('home');
  }

  function chooseDestination(name, days) {
    window.dispatchEvent(new CustomEvent('wanderwise-inspiration', { detail: { name, days } }));
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' });
    notify(`Great choice: ${name}. Your trip details are ready to personalize.`);
  }

  function openSavedTrip(trip) {
    setResult({
      trip: trip.trip || { destination: trip.destination, days: trip.days, budget: 'Saved trip' },
      itinerary: trip.itinerary
    });
    setSaved(true);
    navigate('itinerary');
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg app-navbar">
        <div className="container nav-inner">
          <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); reset(); }}>
            <span className="brand-mark"><Compass size={22} /></span>
            <span>WanderWise<span className="brand-ai"> AI</span><small>TRAVEL, THOUGHTFULLY</small></span>
          </a>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">
            <i className={`bi ${mobileMenu ? 'bi-x-lg' : 'bi-list'}`} />
          </button>
          <div className={`nav-links ${mobileMenu ? 'open' : ''}`}>
            <a href="#how-it-works" onClick={(event) => { event.preventDefault(); navigate('how-it-works'); }}>How it works</a>
            <a href="#inspiration" onClick={(event) => { event.preventDefault(); goToHomeSection('inspiration'); }}>Get inspired</a>
            <a className={`nav-saved ${page === 'saved-trips' ? 'active' : ''}`} href="#saved-trips" onClick={(event) => { event.preventDefault(); navigate('saved-trips'); }}>
              <Bookmark size={15} /> Saved trips
            </a>
            <a className="nav-cta" href="#planner" onClick={(event) => { event.preventDefault(); goToHomeSection('planner'); }}>
              Plan my trip <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </nav>

      <main>
        {page === 'home' && <>
          <section className="hero-section">
            <div className="container hero-container">
              <div className="hero-copy">
                <div className="hero-kicker"><span className="kicker-spark"><Sparkles size={13} /></span> A LITTLE MORE YOU, A LOT MORE WORLD</div>
                <h1>Your next chapter<br />starts <em>somewhere.</em></h1>
                <p className="hero-description">Thoughtful trips, made around you. Tell us what moves you and let AI turn your travel daydream into a plan worth getting excited about.</p>
                <div className="hero-buttons">
                  <button className="btn btn-hero-primary" onClick={() => goToHomeSection('planner')}>Plan my escape <ArrowUpRight size={17} /></button>
                  <button className="hero-text-link" onClick={() => navigate('how-it-works')}>See how it works <i className="bi bi-arrow-down-right" /></button>
                </div>
                <div className="hero-trust"><span><ShieldCheck size={15} /> Personalised, not packaged</span><span><Globe2 size={15} /> Anywhere you dream</span></div>
              </div>
              <div className="hero-art">
                <div className="hero-image-main">
                  <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85" alt="A peaceful alpine lake surrounded by mountains" />
                  <div className="image-caption"><span className="caption-pin"><i className="bi bi-geo-alt-fill" /></span><div><strong>The world is waiting</strong><span>Find your kind of somewhere</span></div></div>
                </div>
                <div className="floating-note"><span className="floating-note-icon"><Sparkles size={17} /></span><div><strong>Made just for you</strong><span>Every detail, considered</span></div></div>
                <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
              </div>
            </div>
            <div className="hero-bottom container"><span>MADE FOR THE WAY YOU TRAVEL</span><div><span><i className="bi bi-heart-fill" /> Personal</span><span><i className="bi bi-compass" /> Curious</span><span><i className="bi bi-flower1" /> Considered</span></div></div>
          </section>

          <section className="planner-section" id="planner">
            <div className="container planner-container">
              <div className="section-intro"><span className="eyebrow"><span className="eyebrow-line" /> THE ART OF GETTING AWAY</span><h2>Let's make a plan<br /><em>that feels like you.</em></h2><p>A few little details help us turn a destination into your kind of adventure.</p></div>
              <div className="planner-layout">
                <div className="planner-form-panel">
                  <div className="panel-top"><div><span className="eyebrow">YOUR TRIP BLUEPRINT</span><h2>Dream it. We'll map it.</h2></div><span className="form-progress"><i className="bi bi-stars" /> 4 little steps</span></div>
                  <TripForm onGenerate={handleGenerate} loading={loading} />
                </div>
                <aside className="planner-aside">
                  <div className="aside-photo"><img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85" alt="Colorful coastal village in Italy" /><div className="aside-photo-label"><span>THE FEEL-GOOD GUIDE</span><strong>Less scrolling.<br />More soul-stirring.</strong></div></div>
                  <div className="aside-note"><div className="aside-note-icon"><Sparkles size={17} /></div><div><strong>Not just a list of places.</strong><p>A considered rhythm of experiences, with room for the unexpected.</p></div></div>
                  <div className="aside-stats"><div><strong>01</strong><span>Your interests</span></div><div><strong>02</strong><span>Your own pace</span></div><div><strong>03</strong><span>Your next story</span></div></div>
                </aside>
              </div>
              {error && <div className="alert app-error mt-3" role="alert"><i className="bi bi-exclamation-circle me-2" /><div><strong>We hit a little detour.</strong><p className="mb-0">{error}</p><button className="error-retry" onClick={() => setError('')}>Dismiss</button></div></div>}
            </div>
          </section>

          <section className="inspiration-section" id="inspiration">
            <div className="container">
              <div className="inspiration-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> A LITTLE INSPIRATION</span><h2>Somewhere to <em>begin.</em></h2></div><p>Not sure where to go? Let a place find its way onto your list.</p></div>
              <div className="row g-4 inspiration-cards">{inspirations.map((place, index) => <div className="col-md-4" key={place.name}><button className="destination-card" onClick={() => chooseDestination(place.name, place.days)}><div className="destination-image"><img src={`https://images.unsplash.com/${place.image}?auto=format&fit=crop&w=800&q=80`} alt={place.name} /><span className="destination-number">0{index + 1}</span><span className="destination-arrow"><ArrowUpRight size={18} /></span></div><div className="destination-details"><div><h3>{place.name}</h3><p>{place.category}</p></div><span className="destination-days">{place.days} days</span></div></button></div>)}</div>
            </div>
          </section>
        </>}

        {page === 'itinerary' && <section className="planner-section page-section">
          <div className="container planner-container">
            {result
              ? <div className="planner-layout results-layout"><ItineraryView result={result} onReset={reset} onSave={handleSave} saving={saving} saved={saved} /></div>
              : <div className="page-empty-state"><span className="empty-icon"><i className="bi bi-map" /></span><h2>Your itinerary will appear here</h2><p>Start with a destination and a few trip details to get a personalized plan.</p><button className="btn btn-hero-primary" onClick={() => navigate('home')}>Plan a trip <ArrowUpRight size={16} /></button></div>}
          </div>
        </section>}

        {page === 'saved-trips' && <SavedTrips refreshKey={savedRefresh} onOpen={openSavedTrip} onBack={() => navigate('home')} />}

        {page === 'how-it-works' && <section className="how-page-section">
          <div className="container">
            <div className="how-heading"><span className="eyebrow"><span className="eyebrow-line" /> SIMPLE BY NATURE</span><h1>From daydream to <em>departure.</em></h1><p>Everything you need to turn a place you'd love to visit into a thoughtful, flexible plan.</p></div>
            <div className="row g-4 how-cards">
              <div className="col-md-4"><article className="how-card how-page-card"><span className="how-step-caption">THE STARTING POINT</span><span className="how-number">01</span><div className="how-icon"><i className="bi bi-chat-heart" /></div><h3>Tell us what you love</h3><p>Choose your destination, dates, budget, interests, travel companions, and preferred pace.</p></article></div>
              <div className="col-md-4"><article className="how-card how-page-card"><span className="how-step-caption">A LITTLE MORE YOU</span><span className="how-number">02</span><div className="how-icon"><i className="bi bi-stars" /></div><h3>Answer one quick question</h3><p>We ask one optional follow-up tailored to your trip, so you can add the detail that matters most.</p></article></div>
              <div className="col-md-4"><article className="how-card how-page-card"><span className="how-step-caption">READY WHEN YOU ARE</span><span className="how-number">03</span><div className="how-icon"><i className="bi bi-suitcase2" /></div><h3>Make the plan yours</h3><p>Explore the day-by-day ideas, copy the plan, save it for later, or create a new trip.</p></article></div>
            </div>
            <div className="how-page-note"><Sparkles size={18} /><p>AI suggestions are a starting point, not live travel data. Check current opening times, prices, availability, and local guidance before you go.</p></div>
            <button className="btn btn-hero-primary how-page-cta" onClick={() => goToHomeSection('planner')}>Start planning <ArrowUpRight size={16} /></button>
          </div>
        </section>}
      </main>

      <footer className="app-footer">
        <div className="container footer-inner">
          <a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); reset(); }}><span className="brand-mark"><Compass size={21} /></span><span>WanderWise<span className="brand-ai"> AI</span><small>TRAVEL, THOUGHTFULLY</small></span></a>
          <p>Made for the places that stay with you.</p>
          <div className="footer-links"><button onClick={() => navigate('how-it-works')}>How it works</button><button onClick={() => navigate('saved-trips')}>Saved trips</button></div>
          <span>© {new Date().getFullYear()} WanderWise AI</span>
        </div>
      </footer>
      {toast && <div className="toast-message" role="status"><i className="bi bi-info-circle me-2" />{toast}</div>}
      {loading && <div className="loading-overlay" role="status" aria-live="polite"><div className="loading-card"><div className="loading-orbit"><Compass size={30} /><span /></div><span className="eyebrow">PUTTING YOUR TRIP TOGETHER</span><h3>Finding your kind of magic…</h3><p>Gathering ideas around your interests, pace, and budget.</p><div className="loading-progress"><span /></div></div></div>}
    </div>
  );
}
