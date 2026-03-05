'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import styles from './events.module.css';

interface GeneratedEvent {
  title: string;
  description: string;
  location: string;
  date_text: string;
  event_type: string;
  fit_score: number;
}

interface SavedEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date_text: string;
  event_type: string;
  status: string;
  ai_pitch: string;
  created_at: string;
}

const TYPE_STYLES: Record<string, string> = {
  market: styles.typeMarket,
  festival: styles.typeFestival,
  brewery: styles.typeBrewery,
  corporate: styles.typeCorporate,
  private: styles.typePrivate,
  community: styles.typeCommunity,
};

const STATUS_STYLES: Record<string, string> = {
  interested: styles.statusInterested,
  applied: styles.statusApplied,
  booked: styles.statusBooked,
};

export default function EventsPage() {
  const [tab, setTab] = useState<'discover' | 'saved'>('discover');
  const [generatedEvents, setGeneratedEvents] = useState<GeneratedEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [truckData, setTruckData] = useState<any>(null);
  const [todayLocation, setTodayLocation] = useState<any>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [currentPitch, setCurrentPitch] = useState('');
  const [currentPitchEvent, setCurrentPitchEvent] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [userId, setUserId] = useState('');

  const supabase = createClient();
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = DAYS[new Date().getDay()];

  useEffect(() => {
    loadTruckData();
    loadSavedEvents();
  }, []);

  async function loadTruckData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: truck, error: truckError } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', user.id)
      .single();
    if (truckError) console.error('Could not load truck profile:', truckError.message);
    if (truck) setTruckData(truck);

    const { data: locations } = await supabase
      .from('locations')
      .select('*')
      .eq('truck_id', user.id);

    if (locations && locations.length > 0) {
      setTodayLocation(locations[0]);
    }
  }

  async function loadSavedEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('truck_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setSavedEvents(data);
  }

  async function handleScout() {
    setLoading(true);
    setError('');
    setGeneratedEvents([]);

    try {
      const res = await fetch('/api/generate-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          vibe: truckData?.vibe,
          locationAddress: todayLocation?.address || '',
          userId,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedEvents(data.events || []);
      }
    } catch {
      setError('Failed to scout events. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEvent(event: GeneratedEvent, index: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSavingId(index);

    await supabase.from('events').insert({
      truck_id: user.id,
      title: event.title,
      description: event.description,
      location: event.location,
      date_text: event.date_text,
      event_type: event.event_type,
      status: 'interested',
    });

    setSavingId(null);
    loadSavedEvents();
  }

  async function handleGeneratePitch(event: GeneratedEvent | SavedEvent) {
    setPitchLoading(true);
    setCurrentPitchEvent(event.title);
    setShowPitch(true);
    setCurrentPitch('');

    try {
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;

      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          description: truckData?.description,
          signatureDishes: truckData?.signature_dishes,
          vibe: truckData?.vibe,
          eventTitle: event.title,
          eventDescription: event.description,
          eventLocation: event.location,
          userId,
        }),
      });

      const data = await res.json();
      if (data.pitch) {
        setCurrentPitch(data.pitch);
      } else {
        setCurrentPitch('Failed to generate pitch. Please try again.');
      }
    } catch {
      setCurrentPitch('Failed to generate pitch. Please try again.');
    } finally {
      setPitchLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    await supabase.from('events').update({ status: newStatus }).eq('id', id);
    loadSavedEvents();
  }

  async function handleDeleteEvent(id: string) {
    await supabase.from('events').delete().eq('id', id);
    loadSavedEvents();
  }

  function handleCopyPitch() {
    navigator.clipboard.writeText(currentPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  }

  function getFitClass(score: number) {
    if (score >= 75) return styles.fitHigh;
    if (score >= 50) return styles.fitMed;
    return styles.fitLow;
  }

  const isEventSaved = (title: string) => savedEvents.some((e) => e.title === title);

  return (
    <div className={styles.eventsPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Events & Bookings</h1>
        <p className={styles.pageSubtitle}>AI finds opportunities that match your truck</p>
      </div>

      {truckData && (!truckData.name || !truckData.cuisine_type) && (
        <div style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--cream)' }}>
          ⚠️ Your profile is incomplete — add your truck name and cuisine for better AI results. <a href="/dashboard/profile" style={{ color: 'var(--flame)', fontWeight: 600 }}>Complete Profile →</a>
        </div>
      )}

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'discover' ? styles.tabActive : ''}`}
          onClick={() => setTab('discover')}
        >
          🔍 Discover
        </button>
        <button
          className={`${styles.tab} ${tab === 'saved' ? styles.tabActive : ''}`}
          onClick={() => setTab('saved')}
        >
          📋 Saved ({savedEvents.length})
        </button>
      </div>

      {/* DISCOVER TAB */}
      {tab === 'discover' && (
        <>
          <div className={styles.scoutCard}>
            <h2 className={styles.scoutTitle}>🔍 Scout Events</h2>
            <p className={styles.scoutDesc}>
              AI will find festivals, markets, breweries, and booking opportunities near your area that fit your cuisine and vibe.
            </p>
            <button
              className={styles.scoutBtn}
              onClick={handleScout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Scouting...
                </>
              ) : (
                '🎪 Scout My Area'
              )}
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
              <p className={styles.loadingText}>Finding opportunities near you...</p>
            </div>
          )}

          {generatedEvents.map((event, i) => (
            <div key={i} className={styles.eventCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.eventHeader}>
                <span className={`${styles.eventType} ${TYPE_STYLES[event.event_type] || styles.typeCommunity}`}>
                  {event.event_type}
                </span>
                <span className={`${styles.fitScore} ${getFitClass(event.fit_score)}`}>
                  {event.fit_score}% fit
                </span>
              </div>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              <p className={styles.eventDesc}>{event.description}</p>
              <div className={styles.eventMeta}>
                <span className={styles.eventMetaItem}>📍 {event.location}</span>
                <span className={styles.eventMetaItem}>📅 {event.date_text}</span>
              </div>
              <div className={styles.eventActions}>
                {isEventSaved(event.title) ? (
                  <button className={`${styles.eventBtn} ${styles.savedBtn}`}>
                    ✓ Saved
                  </button>
                ) : (
                  <button
                    className={`${styles.eventBtn} ${styles.saveEventBtn}`}
                    onClick={() => handleSaveEvent(event, i)}
                    disabled={savingId === i}
                  >
                    {savingId === i ? 'Saving...' : '💾 Save Event'}
                  </button>
                )}
                <button
                  className={`${styles.eventBtn} ${styles.pitchBtn}`}
                  onClick={() => handleGeneratePitch(event)}
                  disabled={pitchLoading}
                >
                  ✉️ AI Pitch
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* SAVED TAB */}
      {tab === 'saved' && (
        <>
          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <div key={event.id} className={styles.savedEventCard}>
                <div className={styles.savedEventHeader}>
                  <span className={styles.savedEventTitle}>{event.title}</span>
                  <span className={`${styles.statusBadge} ${STATUS_STYLES[event.status] || styles.statusInterested}`}>
                    {event.status}
                  </span>
                </div>
                <div className={styles.savedEventMeta}>
                  📍 {event.location} · 📅 {event.date_text}
                </div>
                <div className={styles.savedEventActions}>
                  {event.status === 'interested' && (
                    <button
                      className={styles.statusBtn}
                      onClick={() => handleUpdateStatus(event.id, 'applied')}
                    >
                      Mark Applied
                    </button>
                  )}
                  {event.status === 'applied' && (
                    <button
                      className={styles.statusBtn}
                      onClick={() => handleUpdateStatus(event.id, 'booked')}
                    >
                      Mark Booked
                    </button>
                  )}
                  <button
                    className={styles.statusBtn}
                    onClick={() => handleGeneratePitch(event)}
                  >
                    ✉️ Pitch
                  </button>
                  <button
                    className={styles.deleteEventBtn}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              No saved events yet. Discover events and save the ones you like!
            </div>
          )}
        </>
      )}

      {/* PITCH MODAL */}
      {showPitch && (
        <div className={styles.pitchOverlay} onClick={() => setShowPitch(false)}>
          <div className={styles.pitchCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.pitchTitle}>✉️ AI Booking Pitch</h3>
            <p className={styles.pitchSubtitle}>For: {currentPitchEvent}</p>

            {pitchLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingDots}>
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                </div>
                <p className={styles.loadingText}>Writing your pitch...</p>
              </div>
            ) : (
              <>
                <div className={styles.pitchText}>{currentPitch}</div>
                <div className={styles.pitchActions}>
                  <button className="btn btn-primary" onClick={handleCopyPitch}>
                    {copiedPitch ? '✓ Copied!' : '📋 Copy Pitch'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowPitch(false)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}