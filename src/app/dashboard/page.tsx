'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface TodayLocation {
  id: string;
  name: string;
  address: string;
  day_of_week: string;
}

interface Weather {
  temp: number | string;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
  feelsLike: number | string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDemandLevel(day: string): { level: string; color: string } {
  const highDays = ['Friday', 'Saturday'];
  const midDays = ['Wednesday', 'Thursday', 'Sunday'];
  if (highDays.includes(day)) return { level: 'High', color: '#00E89D' };
  if (midDays.includes(day)) return { level: 'Medium', color: '#FFB84D' };
  return { level: 'Moderate', color: '#8B8FA3' };
}

export default function TodayPage() {
  const [truckName, setTruckName] = useState('');
  const [todayLocation, setTodayLocation] = useState<TodayLocation | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const supabase = createClient();
  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const hour = now.getHours();

  const greetingText = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const demand = getDemandLevel(dayName);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load truck profile
        const { data: truck } = await supabase
          .from('trucks')
          .select('name')
          .eq('id', user.id)
          .single();
        if (truck) setTruckName(truck.name);

        // Load today's location
        const { data: locations } = await supabase
          .from('locations')
          .select('*')
          .eq('truck_id', user.id)
          .eq('day_of_week', dayName);

        if (locations && locations.length > 0) {
          const loc = locations[0];
          setTodayLocation(loc);

          // Fetch weather for this location
          try {
            const weatherRes = await fetch(`/api/weather?address=${encodeURIComponent(loc.address)}`);
            const weatherData = await weatherRes.json();
            setWeather(weatherData);
          } catch (err) {
            console.error('Weather fetch error:', err);
          }
        }
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackRating) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('daily_feedback').insert({
        truck_id: user.id,
        location_id: todayLocation?.id || null,
        rating: feedbackRating,
        notes: feedbackNote || null,
        date: new Date().toISOString().split('T')[0],
      });

      setFeedbackSaved(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSaved(false);
      }, 1500);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.todayPage}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div>
          <p className={styles.greeting}>{greetingText} 👋</p>
          <h1 className={styles.truckName}>{truckName || 'Your Truck'}</h1>
        </div>
        <div className={styles.dateBadge}>
          {dayName.slice(0, 3)}
          <span className={styles.dateBadgeDay}>{dateStr}</span>
        </div>
      </div>

      {/* PLAN CARD */}
      {todayLocation ? (
        <div className={styles.planCard}>
          <div className={styles.planLabel}>Today&apos;s Plan</div>
          <div className={styles.planLocation}>📍 {todayLocation.name}</div>
          <div className={styles.planAddress}>{todayLocation.address}</div>
          <div className={styles.planMeta}>
            <span className={styles.planMetaItem}>
              🔥 <span style={{ color: demand.color }}>{demand.level} Demand</span>
            </span>
            {weather && weather.temp && weather.temp !== '--' && (
              <span className={styles.planMetaItem}>
                {weather.temp}°F · {weather.condition}
              </span>
            )}
          </div>
          <button
            className={`${styles.confirmBtn} ${confirmed ? styles.confirmedBtn : ''}`}
            onClick={handleConfirm}
          >
            {confirmed ? '✓ Location Confirmed' : 'Confirm Location'}
          </button>
        </div>
      ) : (
        <div className={styles.noPlan}>
          <div className={styles.noPlanIcon}>📍</div>
          <h3>No spot set for {dayName}</h3>
          <p>Add a location for {dayName} in your profile to see your daily plan here.</p>
        </div>
      )}

      {/* WEATHER CARD */}
      {weather && weather.temp !== '--' && (
        <div className={styles.weatherCard}>
          <div className={styles.weatherLeft}>
            <img
              className={styles.weatherIcon}
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.condition}
            />
            <div>
              <div className={styles.weatherTemp}>{weather.temp}°F</div>
              <div className={styles.weatherCondition}>{weather.description}</div>
            </div>
          </div>
          <div className={styles.weatherDetails}>
            <div className={styles.weatherDetail}>Feels like {weather.feelsLike}°F</div>
            <div className={styles.weatherDetail}>💧 {weather.humidity}%</div>
            <div className={styles.weatherDetail}>💨 {weather.wind} mph</div>
          </div>
        </div>
      )}

      {/* QUICK STATS */}
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statValue}>{dayName.slice(0, 3)}</div>
          <div className={styles.statLabel}>Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue} style={{ color: demand.color }}>{demand.level}</div>
          <div className={styles.statLabel}>Demand</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statValue}>--</div>
          <div className={styles.statLabel}>Streak</div>
        </div>
      </div>

      {/* ACTION CARDS */}
      <Link href="/dashboard/posts" className={styles.sectionCard}>
        <div className={`${styles.sectionIcon} ${styles.sectionIconPost}`}>📣</div>
        <div className={styles.sectionContent}>
          <h3>AI Post <span className={`${styles.sectionTag} ${styles.tagReady}`}>Ready</span></h3>
          <p>Your social media post is ready to go</p>
        </div>
        <span className={styles.sectionArrow}>›</span>
      </Link>

      <Link href="/dashboard/events" className={styles.sectionCard}>
        <div className={`${styles.sectionIcon} ${styles.sectionIconEvent}`}>🎪</div>
        <div className={styles.sectionContent}>
          <h3>Events <span className={`${styles.sectionTag} ${styles.tagNew}`}>New</span></h3>
          <p>Browse nearby booking opportunities</p>
        </div>
        <span className={styles.sectionArrow}>›</span>
      </Link>

      <div className={styles.sectionCard} onClick={() => setShowFeedback(true)}>
        <div className={`${styles.sectionIcon} ${styles.sectionIconFeedback}`}>📝</div>
        <div className={styles.sectionContent}>
          <h3>End of Day</h3>
          <p>How did today go? Rate your shift</p>
        </div>
        <span className={styles.sectionArrow}>›</span>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <div className={styles.feedbackOverlay} onClick={() => setShowFeedback(false)}>
          <div className={styles.feedbackCard} onClick={(e) => e.stopPropagation()}>
            {feedbackSaved ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
                <h3 className={styles.feedbackTitle} style={{ marginBottom: 0 }}>Feedback Saved!</h3>
              </div>
            ) : (
              <>
                <h3 className={styles.feedbackTitle}>How did today go?</h3>
                <div className={styles.feedbackOptions}>
                  {[
                    { id: 'great', emoji: '🔥', label: 'Great' },
                    { id: 'normal', emoji: '🙂', label: 'Normal' },
                    { id: 'slow', emoji: '😞', label: 'Slow' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      className={`${styles.feedbackOption} ${
                        feedbackRating === option.id ? styles.feedbackOptionActive : ''
                      }`}
                      onClick={() => setFeedbackRating(option.id)}
                    >
                      <span className={styles.feedbackEmoji}>{option.emoji}</span>
                      <span className={styles.feedbackLabel}>{option.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.feedbackNote}
                  placeholder="Any notes? Weather, crowd, events nearby..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                />
                <div className={styles.feedbackActions}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowFeedback(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!feedbackRating}
                    onClick={handleFeedbackSubmit}
                  >
                    Save Feedback
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