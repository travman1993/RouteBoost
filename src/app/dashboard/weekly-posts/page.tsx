'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import styles from './weekly.module.css';

interface Location {
  day_of_week: string;
  name: string;
  address: string;
}

interface DayPosts {
  day: string;
  location: string;
  address: string;
  posts: {
    time_slot: string;
    caption: string;
    hashtags: string;
    saved: boolean;
  }[];
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPostsPage() {
  const [weeklyPosts, setWeeklyPosts] = useState<DayPosts[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');
  const [truckData, setTruckData] = useState<any>(null);
  const [servingDays, setServingDays] = useState<Location[]>([]);
  const [copiedId, setCopiedId] = useState('');
  const [savedId, setSavedId] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [userId, setUserId] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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

    if (locations) {
      const sorted = locations.sort(
        (a: any, b: any) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
      );
      setServingDays(sorted);
    }
  }

  async function handleGenerate() {
    if (servingDays.length === 0) {
      setError('Add serving locations in your profile first.');
      return;
    }

    setLoading(true);
    setError('');
    setWeeklyPosts([]);

    try {
      const res = await fetch('/api/generate-weekly-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          description: truckData?.description,
          signatureDishes: truckData?.signature_dishes,
          vibe: truckData?.vibe,
          priceRange: truckData?.price_range,
          instagram: truckData?.instagram,
          userId,
          servingDays: servingDays.map((l) => ({
            day: l.day_of_week,
            location: l.name,
            address: l.address,
          })),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setWeeklyPosts(data.weeklyPosts || []);
        setGenerated(true);
        if (data.weeklyPosts?.length > 0) {
          setExpandedDay(data.weeklyPosts[0].day);
        }
      }
    } catch {
      setError('Failed to generate weekly posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(dayIndex: number, postIndex: number) {
    const post = weeklyPosts[dayIndex].posts[postIndex];
    const fullText = post.hashtags
      ? `${post.caption}\n\n${post.hashtags}`
      : post.caption;
    navigator.clipboard.writeText(fullText);
    setCopiedId(`${dayIndex}-${postIndex}`);
    setTimeout(() => setCopiedId(''), 2000);
  }

  async function handleSave(dayIndex: number, postIndex: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dayData = weeklyPosts[dayIndex];
    const post = dayData.posts[postIndex];

    await supabase.from('posts').insert({
      truck_id: user.id,
      caption: post.caption,
      hashtags: post.hashtags,
      platform: 'instagram',
      location_name: dayData.location,
      post_type: 'weekly',
      time_slot: post.time_slot,
      scheduled_date: getNextDate(dayData.day),
    });

    const updated = [...weeklyPosts];
    updated[dayIndex].posts[postIndex].saved = true;
    setWeeklyPosts(updated);

    setSavedId(`${dayIndex}-${postIndex}`);
    setTimeout(() => setSavedId(''), 2000);
  }

  async function handleSaveAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const inserts = weeklyPosts.flatMap((day) =>
      day.posts
        .filter((p) => !p.saved)
        .map((post) => ({
          truck_id: user.id,
          caption: post.caption,
          hashtags: post.hashtags,
          platform: 'instagram',
          location_name: day.location,
          post_type: 'weekly',
          time_slot: post.time_slot,
          scheduled_date: getNextDate(day.day),
        }))
    );

    if (inserts.length > 0) {
      await supabase.from('posts').insert(inserts);
    }

    const updated = weeklyPosts.map((day) => ({
      ...day,
      posts: day.posts.map((p) => ({ ...p, saved: true })),
    }));
    setWeeklyPosts(updated);
  }

  function getNextDate(dayName: string): string {
    const today = new Date();
    const targetDay = DAY_ORDER.indexOf(dayName);
    const currentDay = (today.getDay() + 6) % 7; // Convert to Mon=0
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toISOString().split('T')[0];
  }

  function getTimeEmoji(slot: string): string {
    if (slot.toLowerCase().includes('morning')) return '🌅';
    if (slot.toLowerCase().includes('lunch') || slot.toLowerCase().includes('midday')) return '☀️';
    if (slot.toLowerCase().includes('evening') || slot.toLowerCase().includes('night')) return '🌙';
    return '📱';
  }

  const totalPosts = weeklyPosts.reduce((sum, day) => sum + day.posts.length, 0);
  const savedCount = weeklyPosts.reduce(
    (sum, day) => sum + day.posts.filter((p) => p.saved).length,
    0
  );

  return (
    <div className={styles.weeklyPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Weekly Posts</h1>
        <p className={styles.pageSubtitle}>
          AI generates posts for every serving day
        </p>
      </div>

      {truckData && (!truckData.name || !truckData.cuisine_type) && (
        <div style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--cream)' }}>
          ⚠️ Your profile is incomplete — add your truck name and cuisine for better AI results. <a href="/dashboard/profile" style={{ color: 'var(--flame)', fontWeight: 600 }}>Complete Profile →</a>
        </div>
      )}

      {/* SERVING DAYS PREVIEW */}
      <div className={styles.servingPreview}>
        <div className={styles.servingLabel}>Your Serving Days</div>
        <div className={styles.servingDays}>
          {DAY_ORDER.map((day) => {
            const isServing = servingDays.some((l) => l.day_of_week === day);
            return (
              <div
                key={day}
                className={`${styles.dayDot} ${isServing ? styles.dayDotActive : ''}`}
              >
                {day.slice(0, 3)}
              </div>
            );
          })}
        </div>
        {servingDays.length === 0 && (
          <p className={styles.noDays}>
            No serving days set. Add locations in your profile first.
          </p>
        )}
      </div>

      {/* GENERATE BUTTON */}
      {!generated && !loading && (
        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={loading || servingDays.length === 0}
        >
          🔥 Generate This Week&apos;s Posts
        </button>
      )}

      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
          <p className={styles.loadingText}>
            Writing {servingDays.length * 3} posts for your week...
          </p>
        </div>
      )}

      {/* RESULTS */}
      {generated && !loading && (
        <>
          {/* STATS BAR */}
          <div className={styles.statsBar}>
            <span>{totalPosts} posts generated</span>
            <span>{savedCount}/{totalPosts} saved</span>
          </div>

          {/* SAVE ALL */}
          {savedCount < totalPosts && (
            <button className={styles.saveAllBtn} onClick={handleSaveAll}>
              💾 Save All Posts to Library
            </button>
          )}

          {/* DAY SECTIONS */}
          {weeklyPosts.map((day, dayIndex) => (
            <div key={day.day} className={styles.daySection}>
              <button
                className={styles.dayHeader}
                onClick={() =>
                  setExpandedDay(expandedDay === day.day ? null : day.day)
                }
              >
                <div className={styles.dayInfo}>
                  <span className={styles.dayName}>{day.day}</span>
                  <span className={styles.dayLocation}>📍 {day.location}</span>
                </div>
                <div className={styles.dayMeta}>
                  <span className={styles.dayPostCount}>
                    {day.posts.length} posts
                  </span>
                  <span className={styles.dayArrow}>
                    {expandedDay === day.day ? '▾' : '›'}
                  </span>
                </div>
              </button>

              {expandedDay === day.day && (
                <div className={styles.dayPosts}>
                  {day.posts.map((post, postIndex) => (
                    <div key={postIndex} className={styles.postCard}>
                      <div className={styles.postSlot}>
                        <span>{getTimeEmoji(post.time_slot)}</span>
                        <span>{post.time_slot}</span>
                      </div>
                      <div className={styles.postCaption}>{post.caption}</div>
                      {post.hashtags && (
                        <div className={styles.postHashtags}>{post.hashtags}</div>
                      )}
                      <div className={styles.postActions}>
                        <button
                          className={styles.postCopyBtn}
                          onClick={() => handleCopy(dayIndex, postIndex)}
                        >
                          {copiedId === `${dayIndex}-${postIndex}`
                            ? '✓ Copied!'
                            : '📋 Copy'}
                        </button>
                        {post.saved ? (
                          <span className={styles.postSavedTag}>✓ Saved</span>
                        ) : (
                          <button
                            className={styles.postSaveBtn}
                            onClick={() => handleSave(dayIndex, postIndex)}
                          >
                            {savedId === `${dayIndex}-${postIndex}`
                              ? '✓ Saved!'
                              : '💾 Save'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* REGENERATE */}
          <button
            className={styles.regenerateBtn}
            onClick={handleGenerate}
            disabled={loading}
          >
            🔄 Regenerate All Posts
          </button>
        </>
      )}
    </div>
  );
}