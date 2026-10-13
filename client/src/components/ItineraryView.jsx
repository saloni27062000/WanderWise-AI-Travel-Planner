import { useState } from 'react';
import React from 'react';
import { MapPin, Clock3, Utensils, Sparkles, Copy, Check, RotateCcw, Bookmark, Sun, Moon, Coffee } from 'lucide-react';

const timeIcon = { Morning: Sun, Afternoon: Coffee, Evening: Moon };
export default function ItineraryView({ result, onReset, onSave, saving, saved }) {
  const [activeDay, setActiveDay] = useState(0);
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const itinerary = result.itinerary || {};
  const days = itinerary.days || [];

  async function copyPlan() {
    const text = `${itinerary.title || 'My trip'}\n\n${days.map((day) => `${day.title}\n${(day.activities || []).map((a) => `${a.time}: ${a.title} — ${a.description}`).join('\n')}`).join('\n\n')}\n\nTravel tips:\n${(itinerary.travelTips || []).join('\n')}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.prompt('Copy your itinerary:', text); }
  }

  return (
    <section className="results-section" id="itinerary">
      <div className="results-topline"><span className="eyebrow"><Sparkles size={14} /> YOUR PERSONALIZED PLAN</span><div className="results-actions"><button className="icon-action" onClick={copyPlan} title="Copy itinerary">{copied ? <Check size={16} /> : <Copy size={16} />}<span>{copied ? 'Copied' : 'Copy'}</span></button><button className="icon-action" onClick={onReset}><RotateCcw size={16} /><span>New trip</span></button></div></div>
      {result.notice && <div className="demo-notice"><i className="bi bi-info-circle me-2" />{result.notice}</div>}
      <div className="itinerary-hero">
        <div className="itinerary-hero-content">
          <span className="pill-label"><i className="bi bi-stars me-1"></i> Made for your kind of travel</span>
          <h2>{itinerary.title || `Your ${result.trip?.destination || ''} escape`}</h2>
          <p>{itinerary.overview || 'A thoughtful itinerary built around your interests.'}</p>
          <div className="itinerary-meta"><span><CalendarDaysIcon /> {days.length || result.trip?.days} {Number(days.length || result.trip?.days) === 1 ? 'day' : 'days'}</span><span><MapPin size={15} /> {result.trip?.destination}</span><span><i className="bi bi-wallet2"></i> {result.trip?.budget}</span></div>
        </div>
        <div className="hero-stamp"><Sparkles size={25} /><span>your trip,<br />your way</span></div>
      </div>
      <div className="day-tabs" role="tablist" aria-label="Itinerary days">
        {days.map((day, index) => <button role="tab" aria-selected={activeDay === index} className={`day-tab ${activeDay === index ? 'active' : ''}`} key={`${day.day}-${index}`} onClick={() => setActiveDay(index)}><span>DAY {day.day || index + 1}</span><strong>{day.shortTitle || day.title || `Explore day ${index + 1}`}</strong></button>)}
      </div>
      {days.length > 0 && <div className="day-content">
        <div className="day-heading"><div><span className="eyebrow">DAY {days[activeDay]?.day || activeDay + 1} AT A GLANCE</span><h3>{days[activeDay]?.title}</h3><p>{days[activeDay]?.summary}</p></div><span className="day-date">{days[activeDay]?.date || 'A day to remember'}</span></div>
        <div className="activities-list">
          {(days[activeDay]?.activities || []).map((activity, i) => { const Icon = timeIcon[activity.time] || Clock3; return <article className="activity-row" key={`${activity.title}-${i}`}><div className="activity-time"><span className="time-icon"><Icon size={17} /></span><span>{activity.time || 'Explore'}</span></div><div className="activity-marker"><span /></div><div className="activity-card"><div className="activity-card-top"><div><h4>{activity.title}</h4><p className="activity-location"><MapPin size={13} />{activity.location || result.trip?.destination}</p></div>{activity.estimatedCost && <span className="cost-tag">{activity.estimatedCost}</span>}</div><p>{activity.description}</p>{activity.tip && <div className="local-tip"><Sparkles size={14} /><span>{activity.tip}</span></div>}</div></article>; })}
        </div>
        {days[activeDay]?.foodSuggestion && <div className="food-note"><Utensils size={18} /><div><strong>A taste of the place</strong><p>{days[activeDay].foodSuggestion}</p></div></div>}
        <div className="day-nav"><button className="btn btn-outline-soft" disabled={activeDay === 0} onClick={() => setActiveDay((d) => d - 1)}><i className="bi bi-arrow-left me-2"></i>Previous day</button><span>{activeDay + 1} of {days.length}</span><button className="btn btn-outline-soft" disabled={activeDay === days.length - 1} onClick={() => setActiveDay((d) => d + 1)}>Next day<i className="bi bi-arrow-right ms-2"></i></button></div>
      </div>}
      <div className="below-grid">
        <div className="info-card budget-card"><div className="info-card-icon"><i className="bi bi-wallet2"></i></div><span className="eyebrow">BUDGET SNAPSHOT</span><h3>{itinerary.budgetEstimate || result.trip?.budget || 'Flexible budget'}</h3><p>{itinerary.budgetNote || 'Treat this as a planning estimate; actual costs vary by season and availability.'}</p></div>
        <div className="info-card"><div className="info-card-icon"><i className="bi bi-lightbulb"></i></div><span className="eyebrow">LOCAL KNOW-HOW</span><ul className="tips-list">{(itinerary.travelTips || []).slice(0, 4).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>
      </div>
      {itinerary.packingSuggestions?.length > 0 && <div className="packing-strip"><div className="packing-icon"><i className="bi bi-backpack"></i></div><div><strong>Pack a little smarter</strong><p>{itinerary.packingSuggestions.join(' · ')}</p></div></div>}
      <div className="save-strip"><div><h4>Keep this trip close</h4><p>Save your plan to revisit it later.</p></div><button className="btn btn-save" onClick={onSave} disabled={saving || saved}>{saved ? <><Check size={16} /> Saved to trips</> : saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><Bookmark size={16} /> Save this trip</>}</button></div>
      <p className="disclaimer"><i className="bi bi-info-circle me-1"></i>AI-generated suggestions may be inaccurate. Confirm opening hours, prices, transport, and local guidance before travelling.</p>
    </section>
  );
}
function CalendarDaysIcon() { return <i className="bi bi-calendar3" /> }