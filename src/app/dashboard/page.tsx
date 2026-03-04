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

interface ForecastItem {
  time: string;
  temp: number;
  icon: string;
  condition: string;
}

interface Weather {
  temp: number | string;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
  feelsLike: number | string;
  forecast: ForecastItem[];
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

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = Array.from(new Set(dates)).sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = new Date(sorted[0] + 'T00:00:00');

  // Streak must include today or yesterday
  if (mostRecent < yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i] + 'T00:00:00');
    const previous = new Date(sorted[i - 1] + 'T00:00:00');
    const diffDays = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
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
  const [streak, setStreak] = useState(0);
  const [todayLogged, setTodayLogged] = useState(false);

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

        const { data: truck } = await supabase
          .from('trucks')
          .select('name')
          .eq('id', user.id)
          .single();
        if (truck) setTruckName(truck.name);

        const { data: locations } = await supabase
          .from('locations')
          .select('*')
          .eq('truck_id', user.id)
          .eq('day_of_week', dayName);

        if (locations && locations.length > 0) {
          const loc = locations[0];
          setTodayLocation(loc);

          try {
            const weatherRes = await fetch(`/api/weather?address=${encodeURIComponent(loc.address)}`);
            const weatherData = await weatherRes.json();
            setWeather(weatherData);
          } catch (err) {
            console.error('Weather fetch error:', err);
          }
        }

        // Load streak data
        const { data: feedback } = await supabase
          .from('daily_feedback')
          .select('date')
          .eq('truck_id', user.id)
          .order('date', { ascending: false })
          .limit(60);

        if (feedback && feedback.length > 0) {
          const dates = feedback.map((f: any) => f.date);
          setStreak(calculateStreak(dates));

          const today = new Date().toISOString().split('T')[0];
          setTodayLogged(dates.includes(today));
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
      setTodayLogged(true);
      setStreak((prev) => prev + 1);
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
            {weather && (
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
      {weather && (
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

      {/* HOURLY FORECAST */}
      {weather && weather.forecast && weather.forecast.length > 0 && (
        <div className={styles.forecastStrip}>
          {weather.forecast.map((item, i) => (
            <div key={i} className={styles.forecastItem}>
              <div className={styles.forecastTime}>{item.time}</div>
              <img
                className={styles.forecastIcon}
                src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                alt={item.condition}
              />
              <div className={styles.forecastTemp}>{item.temp}°</div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK STATS */}
      <div className={styles.quickStats}>
        <Link href="/dashboard/weekly-posts" className={styles.statCard} style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statValue}>{dayName.slice(0, 3)}</div>
          <div className={styles.statLabel}>Weekly Posts</div>
        </Link>
        <Link href="/dashboard/scout" className={styles.statCard} style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div className={styles.statIcon}>🗺️</div>
          <div className={styles.statValue} style={{ color: demand.color }}>{demand.level}</div>
          <div className={styles.statLabel}>Scout Spots</div>
        </Link>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{streak > 0 ? '🔥' : '⭐'}</div>
          <div className={styles.statValue} style={{ color: streak >= 7 ? '#00E89D' : streak >= 3 ? '#FFB84D' : 'var(--cream)' }}>
            {streak > 0 ? streak : todayLogged ? '1' : '0'}
          </div>
          <div className={styles.statLabel}>{streak === 1 ? 'Day' : 'Days'} Streak</div>
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
          <h3>End of Day {todayLogged && <span className={`${styles.sectionTag} ${styles.tagReady}`}>Done ✓</span>}</h3>
          <p>{todayLogged ? 'Feedback logged for today' : 'How did today go? Rate your shift'}</p>
        </div>
        <span className={styles.sectionArrow}>›</span>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <div className={styles.feedbackOverlay} onClick={() => setShowFeedback(false)}>
          <div className={styles.feedbackCard} onClick={(e) => e.stopPropagation()}>
            {feedbackSaved ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
                <h3 className={styles.feedbackTitle} style={{ marginBottom: 4 }}>Feedback Saved!</h3>
                <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>
                  {streak > 0 ? `${streak} day streak! Keep it going!` : 'Great start! Come back tomorrow to build your streak.'}
                </p>
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