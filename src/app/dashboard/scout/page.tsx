'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './scout.module.css';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface Recommendation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  reasoning: string;
  crowd_type: string;
  best_hours: string;
  type: string;
}

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface ScoutData {
    analysis: string;
    recommendations: Recommendation[];
    heatPoints?: HeatPoint[];
  }

const TYPE_STYLES: Record<string, string> = {
    office: styles.typeOffice,
    entertainment: styles.typeEntertainment,
    shopping: styles.typeShopping,
    campus: styles.typeCampus,
    park: styles.typePark,
    event: styles.typeEvent,
    residential: styles.typeResidential,
    superstore: styles.typeShopping,
    medical: styles.typeOffice,
    industrial: styles.typeResidential,
    brewery: styles.typeEntertainment,
  };

const RANK_STYLES = [styles.rank1, styles.rank2, styles.rank3, styles.rank4, styles.rank5];

export default function ScoutPage() {
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [truckData, setTruckData] = useState<any>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      .eq('truck_id', user.id)
      .limit(1);

    if (locations && locations.length > 0) {
      setCurrentAddress(locations[0].address);
    }
  }

  async function handleScout() {
    setLoading(true);
    setError('');
    setScoutData(null);
    setSelectedSpot(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/generate-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          vibe: truckData?.vibe,
          signatureDishes: truckData?.signature_dishes,
          priceRange: truckData?.price_range,
          currentAddress,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setScoutData(data);
        setSelectedSpot(0);
      }
    } catch {
      setError('Failed to scout locations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getScoreClass(score: number) {
    if (score >= 75) return styles.scoreHigh;
    if (score >= 50) return styles.scoreMed;
    return styles.scoreLow;
  }

  return (
    <div className={styles.scoutPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Location Scout</h1>
        <p className={styles.pageSubtitle}>AI maps demand hotspots in your area</p>
      </div>

      {truckData && (!truckData.name || !truckData.cuisine_type) && (
        <div style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--cream)' }}>
          ⚠️ Your profile is incomplete — add your truck name and cuisine for better AI results. <a href="/dashboard/profile" style={{ color: 'var(--flame)', fontWeight: 600 }}>Complete Profile →</a>
        </div>
      )}

      {/* GENERATE */}
      {!scoutData && !loading && (
        <div className={styles.generateCard}>
          <h2 className={styles.generateTitle}>🗺️ Scout Today&apos;s Hotspots</h2>
          <p className={styles.generateDesc}>
            AI generates a heat map of traffic and demand across your area, then recommends the best spots to park based on your cuisine, weather, and time of day.
          </p>
          <button
            className={styles.generateBtn}
            onClick={handleScout}
            disabled={loading || !currentAddress}
          >
            🔥 Generate Heat Map
          </button>
          {!currentAddress && (
            <p style={{ color: 'var(--slate)', fontSize: '0.82rem', marginTop: '10px' }}>
              Add a location in your profile first so AI knows your area.
            </p>
          )}
        </div>
      )}

      {error && <div className={styles.errorMsg}>{error}</div>}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
          <p className={styles.loadingText}>Mapping demand across your area...</p>
        </div>
      )}

      {scoutData && !loading && (
        <>
          {/* MAP */}
          <div className={styles.mapContainer}>
            <MapView
              recommendations={scoutData.recommendations}
              heatPoints={scoutData.heatPoints || []}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
            />
          </div>

          {/* LEGEND */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'rgba(255, 60, 0, 0.8)' }} />
              <span>Hot Zone (80+)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'rgba(255, 140, 0, 0.7)' }} />
              <span>Warm (65-79)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'rgba(255, 184, 77, 0.6)' }} />
              <span>Moderate (50-64)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'rgba(139, 143, 163, 0.5)' }} />
              <span>Cool (&lt;50)</span>
            </div>
          </div>

          {/* ANALYSIS */}
          <div className={styles.analysisCard}>
            <div className={styles.analysisLabel}>🧠 AI Analysis</div>
            <div className={styles.analysisText}>{scoutData.analysis}</div>
          </div>

          {/* SPOT CARDS */}
          {scoutData.recommendations.map((spot, i) => (
            <div
              key={i}
              className={`${styles.spotCard} ${selectedSpot === i ? styles.spotCardActive : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedSpot(i)}
            >
              <div className={styles.spotHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`${styles.spotRank} ${RANK_STYLES[i] || styles.rank5}`}>
                    {i + 1}
                  </span>
                  <span className={`${styles.spotType} ${TYPE_STYLES[spot.type] || styles.typeResidential}`}>
                    {spot.type}
                  </span>
                </div>
                <span className={`${styles.spotScore} ${getScoreClass(spot.score)}`}>
                  {spot.score}/100
                </span>
              </div>

              <h3 className={styles.spotName}>{spot.name}</h3>
              <p className={styles.spotAddress}>{spot.address}</p>

              <div className={styles.spotMeta}>
                <span className={styles.spotMetaItem}>👥 {spot.crowd_type}</span>
                <span className={styles.spotMetaItem}>⏰ {spot.best_hours}</span>
              </div>

              <div className={styles.spotReasoning}>{spot.reasoning}</div>
            </div>
          ))}

          <button
            className={styles.regenerateBtn}
            onClick={handleScout}
            disabled={loading}
          >
            🔄 Scout Again
          </button>
        </>
      )}
    </div>
  );
}