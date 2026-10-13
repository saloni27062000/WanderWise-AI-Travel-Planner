import { useEffect, useState } from 'react';
import React from 'react';
import { ArrowLeft, MapPin, CalendarDays, Users, Wallet, Sparkles, SlidersHorizontal } from 'lucide-react';
import { generateFollowUpQuestion } from '../api';

const initial = {
  destination: '', days: '4', startDate: '', purpose: 'Leisure', travelers: 'Couple',
  budget: '₹25,000–₹50,000', interests: ['Food & cafés', 'Nature'], pace: 'Balanced',
  requirements: ''
};
const interestOptions = ['Culture & history', 'Food & cafés', 'Nature', 'Adventure', 'Beaches', 'Shopping', 'Art & design', 'Nightlife', 'Wellness'];

export default function TripForm({ onGenerate, loading }) {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(1);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState('');
  useEffect(() => {
    const applyInspiration = (event) => {
      const { name, days } = event.detail || {};
      setForm((current) => ({ ...current, destination: name || current.destination, days: String(days || current.days) }));
    };
    window.addEventListener('wanderwise-inspiration', applyInspiration);
    return () => window.removeEventListener('wanderwise-inspiration', applyInspiration);
  }, []);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleInterest = (item) => update('interests', form.interests.includes(item)
    ? form.interests.filter((i) => i !== item) : [...form.interests, item]);

  async function submit(event) {
    event.preventDefault();
    if (step === 1) {
      setQuestionLoading(true);
      setQuestionError('');
      try {
        const { question } = await generateFollowUpQuestion(form);
        setFollowUpQuestion(question);
        setStep(2);
      } catch (error) {
        setQuestionError(error.message || 'We could not get a follow-up question. Please try again.');
      } finally {
        setQuestionLoading(false);
      }
      return;
    }
    const answer = followUpAnswer.trim();
    const followUpPreference = answer && `Trip-planning preference: ${answer}`;
    onGenerate({
      ...form,
      days: Number(form.days),
      requirements: [
        form.requirements.trim().slice(0, Math.max(0, 700 - (followUpPreference?.length || 0) - (followUpPreference ? 1 : 0))),
        followUpPreference
      ].filter(Boolean).join('\n')
    });
  }

  return (
    <form onSubmit={submit} className="trip-form" aria-busy={questionLoading}>
      <fieldset disabled={questionLoading} className="border-0 p-0 m-0">
      {step === 1 ? <>
      <div className="form-section-heading"><span className="section-number">01</span><div><h3>Where to?</h3><p>Every great trip starts somewhere.</p></div></div>
      <label className="field-label" htmlFor="destination">Destination <span>*</span></label>
      <div className="input-icon-wrap"><MapPin size={18} /><input id="destination" className="form-control custom-input" placeholder="e.g. Kyoto, Japan" value={form.destination} onChange={(e) => update('destination', e.target.value)} required maxLength={100} /></div>

      <div className="row g-3 mt-1">
        <div className="col-6">
          <label className="field-label" htmlFor="days">Trip length</label>
          <div className="input-icon-wrap"><CalendarDays size={17} /><select id="days" className="form-select custom-input" value={form.days} onChange={(e) => update('days', e.target.value)}>{Array.from({ length: 14 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'day' : 'days'}</option>)}</select></div>
        </div>
        <div className="col-6">
          <label className="field-label" htmlFor="startDate">Start date</label>
          <input id="startDate" type="date" min={new Date().toISOString().slice(0, 10)} className="form-control custom-input date-input" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
        </div>
      </div>

      <div className="form-section-heading section-gap"><span className="section-number">02</span><div><h3>Your kind of trip</h3><p>We'll shape the details around you.</p></div></div>
      <label className="field-label">What's the occasion?</label>
      <div className="choice-grid">
        {['Leisure', 'Honeymoon', 'Family holiday', 'Workation', 'Solo escape'].map((v) => <button type="button" key={v} className={`choice-chip ${form.purpose === v ? 'selected' : ''}`} onClick={() => update('purpose', v)}>{v}</button>)}
      </div>

      <div className="row g-3 mt-2">
        <div className="col-6">
          <label className="field-label" htmlFor="travelers"><Users size={14} className="me-1" />Travelling with</label>
          <select id="travelers" className="form-select custom-input" value={form.travelers} onChange={(e) => update('travelers', e.target.value)}>{['Solo', 'Couple', 'Friends', 'Family with kids', 'Group'].map(v => <option key={v}>{v}</option>)}</select>
        </div>
        <div className="col-6">
          <label className="field-label" htmlFor="budget"><Wallet size={14} className="me-1" />Total budget</label>
          <select id="budget" className="form-select custom-input" value={form.budget} onChange={(e) => update('budget', e.target.value)}>{['Under ₹10,000', '₹10,000–₹25,000', '₹25,000–₹50,000', '₹50,000–₹1,00,000', '₹1,00,000+', 'Flexible'].map(v => <option key={v}>{v}</option>)}</select>
        </div>
      </div>

      <div className="form-section-heading section-gap"><span className="section-number">03</span><div><h3>What do you love?</h3><p>Pick as many as you like.</p></div></div>
      <div className="interest-grid">
        {interestOptions.map((v) => <button type="button" key={v} onClick={() => toggleInterest(v)} className={`interest-chip ${form.interests.includes(v) ? 'selected' : ''}`}><span className="interest-dot">{form.interests.includes(v) ? '✓' : '+'}</span>{v}</button>)}
      </div>

      <div className="row g-3 mt-2">
        <div className="col-12">
          <label className="field-label" htmlFor="pace"><SlidersHorizontal size={14} className="me-1" />Preferred pace</label>
          <div className="pace-options">{['Relaxed', 'Balanced', 'Packed'].map(v => <button type="button" key={v} aria-pressed={form.pace === v} onClick={() => update('pace', v)} className={`pace-option ${form.pace === v ? 'active' : ''}`}>{v}</button>)}</div>
        </div>
        <div className="col-12">
          <label className="field-label" htmlFor="requirements">Anything else we should know? <span className="optional">(optional)</span></label>
          <textarea id="requirements" className="form-control custom-input notes-input" rows="3" maxLength={700} placeholder="Dietary needs, accessibility, must-see places, hidden gems..." value={form.requirements} onChange={(e) => update('requirements', e.target.value)} />
        </div>
      </div>
      {questionError && <p className="text-danger mt-3 mb-0" role="alert">{questionError}</p>}
      <button className="btn btn-generate w-100 mt-4" type="submit" disabled={loading || questionLoading || !form.destination.trim()}>
        {questionLoading ? <><span className="spinner-border spinner-border-sm me-2" />Finding a question for your trip…</> : loading ? <><span className="spinner-border spinner-border-sm me-2" />Getting things ready…</> : <>One quick question <i className="bi bi-arrow-right ms-2"></i></>}
      </button>
      <p className="privacy-note"><i className="bi bi-shield-check me-1"></i>Your details are only used to create your trip plan.</p>
      </> : <>
        <div className="form-section-heading"><span className="section-number">04</span><div><h3>One last little detail</h3><p>This helps us make the plan feel more like yours.</p></div></div>
        <div className="follow-up-card">
          <span className="follow-up-label"><Sparkles size={14} /> A QUICK FOLLOW-UP</span>
          <label className="follow-up-question" htmlFor="follow-up-answer">{followUpQuestion}</label>
          <textarea id="follow-up-answer" className="form-control custom-input notes-input" rows="3" maxLength={300} placeholder="Share as much or as little as you'd like..." value={followUpAnswer} onChange={(e) => setFollowUpAnswer(e.target.value)} />
          <p className="follow-up-hint">Optional — you can skip this and still get a personalized plan.</p>
        </div>
        <button className="btn btn-generate w-100 mt-4" type="submit" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Dreaming up your trip…</> : <><Sparkles size={18} /> Create my itinerary <i className="bi bi-arrow-up-right ms-2"></i></>}
        </button>
        <div className="follow-up-actions">
          <button className="follow-up-back" type="button" onClick={() => setStep(1)} disabled={loading}><ArrowLeft size={14} /> Back to trip details</button>
          <button className="follow-up-skip" type="submit" disabled={loading}>Skip and create plan</button>
        </div>
      </>}
      </fieldset>
    </form>
  );
}