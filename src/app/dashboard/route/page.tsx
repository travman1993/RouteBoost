'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import styles from './route.module.css';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' });

interface Location {
  id: string;
  day_of_week: string;
  name: string;
  address: string;
}

interface Optimization {
  status: 'good' | 'medium' | 'low';
  insight: string;
  alternative: {
    name: string;
    address: string;
    score: number;
    reasoning: string;
  } | null;
}

function getDemandLevel(day: string): { level: string; color: string } {
  const high = ['Friday', 'Saturday'];
  const mid = ['Wednesday', 'Thursday', 'Sunday'];
  if (high.includes(day)) return { level: 'High', color: '#00E89D' };
  if (mid.includes(day)) return { level: 'Medium', color: '#FFB84D' };
  return { level: 'Moderate', color: '#8B8FA3' };
}

export default function RoutePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [truckData, setTruckData] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, Optimization>>({});

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: truck } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', user.id)
      .single();
    if (truck) setTruckData(truck);

    const { data: locs } = await supabase
      .from('locations')
      .select('*')
      .eq('truck_id', user.id);
    if (locs) setLocations(locs);

    setLoading(false);
  }

  async function handleOptimize(day: string, loc: Location) {
    setOptimizing(day);

    try {
      const res = await fetch('/api/optimize-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          day,
          locationName: loc.name,
          locationAddress: loc.address,
          truckName: truckData?.name,
          businessType: truckData?.business_type,
          cuisine: truckData?.cuisine_type,
          vibe: truckData?.vibe,
        }),
      });

      const data = await res.json();

      if (!data.error) {
        setResults((prev) => ({ ...prev, [day]: data }));
      }
    } catch {
      // silently fail — button will reset
    } finally {
      setOptimizing(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.routePage}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const locByDay: Record<string, Location> = {};
  locations.forEach((l) => {
    locByDay[l.day_of_week] = l;
  });

  return (
    <div className={styles.routePage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>My Weekly Route</h1>
        <p className={styles.pageSubtitle}>Your schedule, optimized by AI</p>
      </div>

      {locations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📍</div>
          <h3>No locations set yet</h3>
          <p>Add your weekly spots in your profile to see your route here.</p>
          <a href="/dashboard/profile" className={styles.emptyLink}>Set Up Your Route →</a>
        </div>
      )}

      <div className={styles.dayList}>
        {DAY_ORDER.map((day) => {
          const loc = locByDay[day];
          const demand = getDemandLevel(day);
          const isToday = day === TODAY;
          const result = results[day];
          const isOptimizing = optimizing === day;

          return (
            <div key={day} className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ''}`}>
              <div className={styles.dayHeader}>
                <div className={styles.dayLeft}>
                  <span className={styles.dayName}>{day}</span>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                </div>
                <span className={styles.demandPill} style={{ color: demand.color, borderColor: `${demand.color}30`, background: `${demand.color}12` }}>
                  {demand.level} Demand
                </span>
              </div>

              {loc ? (
                <>
                  <div className={styles.locationInfo}>
                    <div className={styles.locationName}>📍 {loc.name}</div>
                    <div className={styles.locationAddress}>{loc.address}</div>
                  </div>

                  {/* AI Result */}
                  {result && (
                    <div className={`${styles.insightBox} ${styles[`insight_${result.status}`]}`}>
                      <div className={styles.insightHeader}>
                        <span className={styles.statusDot} />
                        <span className={styles.statusLabel}>
                          {result.status === 'good' ? 'Good Spot' : result.status === 'medium' ? 'Could Be Better' : 'Underperforming'}
                        </span>
                      </div>
                      <p className={styles.insightText}>{result.insight}</p>

                      {result.alternative && (
                        <div className={styles.alternativeBox}>
                          <div className={styles.alternativeLabel}>Suggested Alternative</div>
                          <div className={styles.alternativeName}>{result.alternative.name}</div>
                          <div className={styles.alternativeAddress}>{result.alternative.address}</div>
                          <div className={styles.alternativeScore}>Demand Score: {result.alternative.score}/100</div>
                          <p className={styles.alternativeReasoning}>{result.alternative.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optimize Button */}
                  {!result && (
                    <button
                      className={styles.optimizeBtn}
                      onClick={() => handleOptimize(day, loc)}
                      disabled={isOptimizing}
                    >
                      {isOptimizing ? (
                        <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Analyzing...</>
                      ) : (
                        '✦ Optimize This Day'
                      )}
                    </button>
                  )}

                  {result && (
                    <button
                      className={styles.reoptimizeBtn}
                      onClick={() => {
                        setResults((prev) => {
                          const next = { ...prev };
                          delete next[day];
                          return next;
                        });
                      }}
                    >
                      Refresh
                    </button>
                  )}
                </>
              ) : (
                <div className={styles.noSpot}>
                  <span>No spot set</span>
                  <a href="/dashboard/profile" className={styles.addSpotLink}>+ Add</a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
